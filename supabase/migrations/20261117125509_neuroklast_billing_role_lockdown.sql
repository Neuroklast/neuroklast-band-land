-- Apply after migration 20261117125004_neuroklast_billing_setup.
-- Billing tables are service-role-only. RLS denies all application-user access
-- even when Supabase grants default table permissions to PUBLIC/anon/authenticated.
-- Explicit revocation avoids relying solely on RLS as a security boundary.
REVOKE ALL PRIVILEGES ON TABLE
  public.billing_settings,
  public.billing_customers,
  public.billing_sequences,
  public.billing_invoices,
  public.billing_payments,
  public.billing_events,
  public.billing_mcp_requests
FROM PUBLIC, anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE
  public.billing_settings,
  public.billing_customers,
  public.billing_sequences,
  public.billing_invoices,
  public.billing_payments,
  public.billing_events,
  public.billing_mcp_requests
TO service_role;

REVOKE ALL PRIVILEGES ON TABLE public.billing_invoice_balances
FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.billing_invoice_balances TO service_role;
