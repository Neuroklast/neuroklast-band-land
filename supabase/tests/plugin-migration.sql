-- Runs AFTER supabase/schema.sql (twice) on the legacy fixture.
do $$
declare
  nk uuid;
  lic public.plugin_licenses;
  rel public.plugin_releases;
begin
  select id into nk from public.products where slug = 'neurokore';
  if nk is null then raise exception 'TEST FAILED: NEUROKORE product not created'; end if;

  select * into lic from public.plugin_licenses where key_hash = 'legacy-hash';
  if not found then raise exception 'TEST FAILED: legacy licence lost'; end if;
  if lic.product_id <> nk then raise exception 'TEST FAILED: licence not backfilled'; end if;
  if lic.license_format <> 'v2' then raise exception 'TEST FAILED: legacy licence must be v2'; end if;
  if (select count(*) from public.plugin_devices where license_id = lic.id) <> 1 then
    raise exception 'TEST FAILED: legacy device lost';
  end if;

  if (select count(*) from public.plugin_orders where stripe_session = 'cs_legacy') <> 1 then
    raise exception 'TEST FAILED: legacy order lost';
  end if;
  if (select product_id from public.plugin_orders where stripe_session = 'cs_legacy') is null then
    raise exception 'TEST FAILED: legacy order not backfilled';
  end if;

  select * into rel from public.plugin_releases where id = '44444444-4444-4444-8444-444444444444';
  if not found then raise exception 'TEST FAILED: legacy release lost'; end if;
  if rel.product_id <> nk then raise exception 'TEST FAILED: legacy release not backfilled'; end if;
  if rel.status <> 'published' then raise exception 'TEST FAILED: release status changed'; end if;
  if (select count(*) from public.plugin_release_artifacts where release_id = rel.id) <> 1 then
    raise exception 'TEST FAILED: legacy artifact lost';
  end if;
  if (select count(*) from public.plugin_download_events where product_id = nk) <> 1 then
    raise exception 'TEST FAILED: legacy download event not backfilled';
  end if;

  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name like 'neurokore_%') then
    raise exception 'TEST FAILED: legacy tables still present';
  end if;
  if not exists (select 1 from information_schema.tables
                 where table_schema = 'public' and table_name = 'plugin_licenses') then
    raise exception 'TEST FAILED: plugin tables missing';
  end if;
end $$;
