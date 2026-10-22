-- Execute only in the disposable CI database AFTER supabase/schema.sql.
do $$
declare
  nk uuid;
  other uuid;
  v_license_id uuid;
  v_order_id uuid;
  v_user_id uuid;
  fulfilled uuid;
  again uuid;
  tmp uuid;
  tmp_release uuid;
  tmp_license uuid;
  paid uuid;
  paid_license uuid;
begin
  select id into nk from public.products where slug = 'neurokore';
  if nk is null then raise exception 'TEST FAILED: NEUROKORE product missing'; end if;
  if (select license_format from public.products where id = nk) <> 'v2' then
    raise exception 'TEST FAILED: NEUROKORE must keep the v2 licence format';
  end if;

  insert into public.plugin_licenses(product_id,email,key_hash,key_cipher,tier,max_devices,license_format)
  values (nk,'alpha@example.com','test-hash','test-cipher','alpha',2,'v2')
  returning id into v_license_id;

  perform public.plugin_activate('test-hash','v2:'||repeat('a',64),'neurokore');
  perform public.plugin_activate('test-hash','v2:'||repeat('a',64),'neurokore');
  if (select count(*) from public.plugin_devices where license_id=v_license_id) <> 1 then
    raise exception 'TEST FAILED: retry consumed a seat';
  end if;

  perform public.plugin_activate('test-hash','v2:'||repeat('b',64),'neurokore');
  begin
    perform public.plugin_activate('test-hash','v2:'||repeat('c',64),'neurokore');
    raise exception 'TEST FAILED: third device accepted';
  exception when others then
    if sqlerrm <> 'Device limit reached' then raise; end if;
  end;

  update public.plugin_licenses set revoked_at=now() where id=v_license_id;
  begin
    perform public.plugin_activate('test-hash','v2:'||repeat('a',64),'neurokore');
    raise exception 'TEST FAILED: revoked key accepted';
  exception when others then
    if sqlerrm <> 'License unavailable' then raise; end if;
  end;

  -- A key issued for one plugin must never activate another.
  insert into public.products(title,slug,kind,license_format)
  values ('NeuroMeter','neurometer','plugin','v3') returning id into other;
  begin
    perform public.plugin_activate('test-hash','v2:'||repeat('d',64),'neurometer');
    raise exception 'TEST FAILED: cross-product activation accepted';
  exception when others then
    if sqlerrm <> 'License unavailable' then raise; end if;
  end;

  insert into public.plugin_licenses(product_id,email,key_hash,key_cipher,tier,max_devices,license_format)
  values (other,'meter@example.com','meter-hash','test-cipher','full',2,'v3');
  perform public.plugin_activate('meter-hash','v2:'||repeat('e',64),'neurometer');

  v_user_id := gen_random_uuid();
  insert into auth.users(id) values (v_user_id);
  insert into public.plugin_orders(product_id,user_id,email,price_id,stripe_session)
  values (nk,v_user_id,'buyer@example.com','price_test','cs_test') returning id into v_order_id;
  fulfilled := public.plugin_fulfill(v_order_id,'cs_test','pi_test','paid-hash','cipher');
  again := public.plugin_fulfill(v_order_id,'cs_test','pi_test','other-hash','cipher');
  if fulfilled <> again then raise exception 'TEST FAILED: duplicate fulfillment'; end if;
  if (select count(*) from public.plugin_licenses where stripe_session='cs_test') <> 1 then
    raise exception 'TEST FAILED: duplicate key';
  end if;
  if (select license_format from public.plugin_licenses where stripe_session='cs_test') <> 'v2' then
    raise exception 'TEST FAILED: paid NEUROKORE licence must be v2';
  end if;

  if has_table_privilege('anon','public.plugin_licenses','SELECT') then
    raise exception 'TEST FAILED: anon can read keys';
  end if;
  if has_table_privilege('anon','public.plugin_product_secrets','SELECT') then
    raise exception 'TEST FAILED: anon can read product secrets';
  end if;
  if has_function_privilege('authenticated','public.plugin_activate(text,text,text)','EXECUTE') then
    raise exception 'TEST FAILED: public RPC access';
  end if;
  if has_function_privilege('anon','public.plugin_public_catalog()','EXECUTE') is not true then
    raise exception 'TEST FAILED: public catalogue must be readable';
  end if;
  -- Hidden product with an alpha licence, audit rows, a release and an abandoned
  -- checkout: everything goes, including the audit rows and the licence.
  insert into public.products(title,slug,kind,active)
  values ('Temp Plugin','temp-plugin','plugin',false) returning id into tmp;
  insert into public.plugin_releases(product_id,version,channel,status)
  values (tmp,'1.0.0','stable','draft') returning id into tmp_release;
  insert into public.plugin_release_artifacts(release_id,platform,architecture,package_type,filename,storage_key,filesize_bytes,sha256,validation_status)
  values (tmp_release,'windows-x64','x64','installer','temp.exe',
          'releases/temp-plugin/v1.0.0/windows-x64/temp.exe',1024,repeat('b',64),'validated');
  insert into public.plugin_download_events(product_id,release_id,platform,channel)
  values (tmp,tmp_release,'windows-x64','stable');
  insert into public.plugin_licenses(product_id,email,key_hash,key_cipher,tier,license_format)
  values (tmp,'temp@example.com','temp-hash','cipher','alpha','v3') returning id into tmp_license;
  insert into public.plugin_devices(license_id,device)
  values (tmp_license,'v2:'||repeat('c',64));
  insert into public.plugin_orders(product_id,user_id,email,price_id,stripe_session)
  values (tmp,v_user_id,'temp@example.com','price_temp','cs_temp');
  insert into public.plugin_admin_audit(product_id,action) values (tmp,'test.audit');

  perform public.plugin_delete_product(tmp);
  if exists (select 1 from public.products where id = tmp) then
    raise exception 'TEST FAILED: product not deleted';
  end if;
  if exists (select 1 from public.plugin_releases where id = tmp_release) then
    raise exception 'TEST FAILED: releases not deleted';
  end if;
  if exists (select 1 from public.plugin_licenses where id = tmp_license) then
    raise exception 'TEST FAILED: licences not deleted';
  end if;
  if exists (select 1 from public.plugin_orders where stripe_session = 'cs_temp') then
    raise exception 'TEST FAILED: abandoned order not deleted';
  end if;
  if exists (select 1 from public.plugin_admin_audit where product_id = tmp) then
    raise exception 'TEST FAILED: audit rows not deleted';
  end if;

  -- A public product cannot be deleted.
  update public.products set active = true where id = other;
  begin
    perform public.plugin_delete_product(other);
    raise exception 'TEST FAILED: public product deleted';
  exception when others then
    if sqlerrm <> 'Hide the product before deleting it' then raise; end if;
  end;
  update public.products set active = false where id = other;

  -- A product with a paid (fulfilled) order cannot be deleted.
  insert into public.products(title,slug,kind,active)
  values ('Paid Plugin','paid-plugin','plugin',false) returning id into paid;
  insert into public.plugin_licenses(product_id,email,key_hash,key_cipher,tier,license_format)
  values (paid,'paid@example.com','paid-hash','cipher','full','v3') returning id into paid_license;
  insert into public.plugin_orders(product_id,user_id,email,price_id,stripe_session,license_id)
  values (paid,v_user_id,'paid@example.com','price_paid','cs_paid',paid_license);
  begin
    perform public.plugin_delete_product(paid);
    raise exception 'TEST FAILED: paid product deleted';
  exception when others then
    if sqlerrm <> 'Product has paid orders' then raise; end if;
  end;
end $$;



