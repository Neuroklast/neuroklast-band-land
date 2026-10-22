
-- Electronically submitted withdrawal declarations are business records, not
-- anonymous analytics. Only the server's service-role credential may access them.
CREATE TABLE IF NOT EXISTS public.plugin_withdrawal_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) BETWEEN 2 AND 160),
  email text NOT NULL,
  contract_details text NOT NULL CHECK (length(contract_details) BETWEEN 3 AND 500),
  locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en','de','uk','it','es','pt','ja','ko')),
  received_at timestamptz NOT NULL DEFAULT now(),
  customer_receipt_at timestamptz,
  provider_notice_at timestamptz
);
CREATE INDEX IF NOT EXISTS plugin_withdrawal_receipts_pending_idx
  ON public.plugin_withdrawal_notices (received_at)
  WHERE customer_receipt_at IS NULL OR provider_notice_at IS NULL;
ALTER TABLE public.plugin_withdrawal_notices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.plugin_withdrawal_notices FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.plugin_withdrawal_notices TO service_role;
