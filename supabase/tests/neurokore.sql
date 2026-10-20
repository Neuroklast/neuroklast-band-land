
-- Execute only in the disposable CI database AFTER the migration.
do $$
declare v_license_id uuid; fulfilled uuid; again uuid; v_order_id uuid; v_user_id uuid;
begin
 insert into public.neurokore_licenses(email,key_hash,key_cipher,tier,max_devices)
 values ('alpha@example.com','test-hash','test-cipher','alpha',2) returning neurokore_licenses.id into v_license_id;
 perform public.neurokore_activate('test-hash','v2:'||repeat('a',64));
 perform public.neurokore_activate('test-hash','v2:'||repeat('a',64));
 if (select count(*) from public.neurokore_devices where license_id=v_license_id) <> 1 then raise exception 'Retry consumed a seat'; end if;
 perform public.neurokore_activate('test-hash','v2:'||repeat('b',64));
 begin
   perform public.neurokore_activate('test-hash','v2:'||repeat('c',64));
   raise exception 'TEST FAILED: third device accepted';
 exception when others then
   if sqlerrm <> 'Device limit reached' then raise; end if;
 end;
 update public.neurokore_licenses set revoked_at=now() where neurokore_licenses.id=v_license_id;
 begin
   perform public.neurokore_activate('test-hash','v2:'||repeat('a',64));
   raise exception 'TEST FAILED: revoked key accepted';
 exception when others then
   if sqlerrm <> 'License unavailable' then raise; end if;
 end;
 v_user_id := gen_random_uuid();
 insert into auth.users(id) values (v_user_id);
 insert into public.neurokore_orders(user_id,email,price_id,stripe_session)
 values(v_user_id,'buyer@example.com','price_test','cs_test') returning neurokore_orders.id into v_order_id;
 fulfilled := public.neurokore_fulfill(v_order_id,'cs_test','pi_test','paid-hash','cipher');
 again := public.neurokore_fulfill(v_order_id,'cs_test','pi_test','other-hash','cipher');
 if fulfilled <> again then raise exception 'Duplicate fulfillment'; end if;
 if (select count(*) from public.neurokore_licenses where stripe_session='cs_test') <> 1 then raise exception 'Duplicate key'; end if;
 if has_table_privilege('anon','public.neurokore_licenses','SELECT') then raise exception 'Anon can read keys'; end if;
 if has_function_privilege('authenticated','public.neurokore_activate(text,text)','EXECUTE') then raise exception 'Public RPC access'; end if;
end $$;
