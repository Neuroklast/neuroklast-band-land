-- Atomic, security-conscious mutation journal. This is an AFTER ROW trigger
-- in the *same database transaction* as the change: if audit storage fails,
-- the original database write fails as well. No secret/plaintext values logged.
CREATE OR REPLACE FUNCTION public.plugin_durable_audit_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $audit$
DECLARE
  item jsonb;
  request_headers jsonb := '{}'::jsonb;
  raw_headers text;
  actor_id uuid;
  product_id_value uuid;
  target_value text;
  changed_fields text[] := '{}'::text[];
BEGIN
  IF TG_OP = 'UPDATE' AND to_jsonb(NEW) = to_jsonb(OLD) THEN
    RETURN NULL;
  END IF;

  IF TG_OP = 'DELETE' THEN
    item := to_jsonb(OLD);
  ELSE
    item := to_jsonb(NEW);
  END IF;

  raw_headers := current_setting('request.headers', true);
  IF raw_headers IS NOT NULL AND btrim(raw_headers) <> '' THEN
    request_headers := raw_headers::jsonb;
  END IF;
  actor_id := NULLIF(request_headers ->> 'x-neuroklast-audit-actor', '')::uuid;
  IF actor_id IS NULL THEN
    actor_id := auth.uid();
  END IF;
  -- The creator/publisher is a verified UUID from auth.users. Do not
  -- falsely attribute later updates to the original creator.
  IF actor_id IS NULL AND TG_OP = 'INSERT' AND TG_TABLE_NAME = 'plugin_licenses' THEN
    actor_id := NULLIF(item ->> 'created_by', '')::uuid;
  END IF;

  target_value := coalesce(item ->> 'id', item ->> 'product_id', item ->> 'license_id');
  IF TG_TABLE_NAME = 'products' THEN
    product_id_value := NULLIF(item ->> 'id', '')::uuid;
  ELSIF TG_TABLE_NAME = 'plugin_product_secrets' THEN
    product_id_value := NULLIF(item ->> 'product_id', '')::uuid;
  ELSIF TG_TABLE_NAME = 'plugin_release_artifacts' THEN
    SELECT r.product_id INTO product_id_value
      FROM public.plugin_releases AS r
     WHERE r.id = (item ->> 'release_id')::uuid;
  ELSIF TG_TABLE_NAME = 'plugin_devices' THEN
    SELECT l.product_id INTO product_id_value
      FROM public.plugin_licenses AS l
     WHERE l.id = (item ->> 'license_id')::uuid;
  ELSIF item ? 'product_id' THEN
    product_id_value := NULLIF(item ->> 'product_id', '')::uuid;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT coalesce(array_agg(n.key ORDER BY n.key), '{}'::text[])
      INTO changed_fields
      FROM jsonb_each(to_jsonb(NEW)) AS n
      LEFT JOIN jsonb_each(to_jsonb(OLD)) AS o USING (key)
     WHERE n.value IS DISTINCT FROM o.value;
  END IF;

  INSERT INTO public.plugin_admin_audit(product_id, actor, action, target, detail)
  VALUES (product_id_value, actor_id,
    'row.' || TG_TABLE_NAME || '.' || lower(TG_OP),
    target_value,
    jsonb_build_object('table', TG_TABLE_NAME, 'operation', lower(TG_OP),
      'changed_fields', to_jsonb(changed_fields)));

  RETURN NULL;
END;
$audit$;

DROP TRIGGER IF EXISTS plugin_durable_audit ON public.products;
CREATE TRIGGER plugin_durable_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.plugin_durable_audit_row();

DROP TRIGGER IF EXISTS plugin_durable_audit ON public.plugin_product_secrets;
CREATE TRIGGER plugin_durable_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.plugin_product_secrets
  FOR EACH ROW EXECUTE FUNCTION public.plugin_durable_audit_row();

DROP TRIGGER IF EXISTS plugin_durable_audit ON public.plugin_releases;
CREATE TRIGGER plugin_durable_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.plugin_releases
  FOR EACH ROW EXECUTE FUNCTION public.plugin_durable_audit_row();

DROP TRIGGER IF EXISTS plugin_durable_audit ON public.plugin_release_artifacts;
CREATE TRIGGER plugin_durable_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.plugin_release_artifacts
  FOR EACH ROW EXECUTE FUNCTION public.plugin_durable_audit_row();

DROP TRIGGER IF EXISTS plugin_durable_audit ON public.plugin_licenses;
CREATE TRIGGER plugin_durable_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.plugin_licenses
  FOR EACH ROW EXECUTE FUNCTION public.plugin_durable_audit_row();

DROP TRIGGER IF EXISTS plugin_durable_audit ON public.plugin_devices;
CREATE TRIGGER plugin_durable_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.plugin_devices
  FOR EACH ROW EXECUTE FUNCTION public.plugin_durable_audit_row();

DROP TRIGGER IF EXISTS plugin_durable_audit ON public.plugin_orders;
CREATE TRIGGER plugin_durable_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.plugin_orders
  FOR EACH ROW EXECUTE FUNCTION public.plugin_durable_audit_row();

DROP TRIGGER IF EXISTS plugin_durable_audit ON public.plugin_contact_requests;
CREATE TRIGGER plugin_durable_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.plugin_contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.plugin_durable_audit_row();

-- Checked by admin POST handlers before mutation so an unapplied migration
-- fails closed rather than silently giving an unaudited success.
CREATE OR REPLACE FUNCTION public.plugin_durable_audit_ready()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $ready$
  SELECT count(DISTINCT c.relname) = 8
    FROM pg_catalog.pg_trigger AS tg
    JOIN pg_catalog.pg_class AS c ON c.oid = tg.tgrelid
    JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname = ANY (ARRAY[
       'products','plugin_product_secrets','plugin_releases',
       'plugin_release_artifacts','plugin_licenses','plugin_devices',
       'plugin_orders','plugin_contact_requests'
     ])
     AND tg.tgname = 'plugin_durable_audit'
     AND NOT tg.tgisinternal
     AND tg.tgenabled <> 'D';
$ready$;

REVOKE ALL ON FUNCTION public.plugin_durable_audit_ready()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.plugin_durable_audit_ready() TO service_role;


-- Existing production function must also be redefined to preserve history.
CREATE OR REPLACE FUNCTION public.plugin_delete_product(p_product uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  is_public boolean;
BEGIN
  SELECT active INTO is_public FROM public.products WHERE id = p_product;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  IF COALESCE(is_public, false) THEN
    RAISE EXCEPTION 'Hide the product before deleting it';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.plugin_orders
    WHERE product_id = p_product AND license_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Product has paid orders';
  END IF;

  DELETE FROM public.plugin_download_events WHERE product_id = p_product;
  DELETE FROM public.plugin_release_artifacts
    WHERE release_id IN (SELECT id FROM public.plugin_releases WHERE product_id = p_product);
  DELETE FROM public.plugin_releases WHERE product_id = p_product;
  DELETE FROM public.plugin_devices
    WHERE license_id IN (SELECT id FROM public.plugin_licenses WHERE product_id = p_product);
  DELETE FROM public.plugin_licenses WHERE product_id = p_product;
  DELETE FROM public.plugin_orders WHERE product_id = p_product;
  DELETE FROM public.plugin_product_secrets WHERE product_id = p_product;
  -- Preserve audit history; FK ON DELETE SET NULL detaches the product.
  DELETE FROM public.products WHERE id = p_product;
END;
$$;
