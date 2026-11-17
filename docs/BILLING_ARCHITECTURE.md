# Billing architecture (NEUROKLAST Band Land)

Status: feature branch implementation, NOT production-approved. Applies to direct seller-issued invoices, not Stripe Managed Payments (Merchant of Record) customer invoices.

## Domain boundaries

- Canonical service: `lib/billing/service.ts`. Browser/server actions and MCP MUST go through this module, never SQL from the UI.
- Validation and integer-cent arithmetic: `lib/billing/domain.ts`, quantities measured in thousandths. Group VAT by tax rate before tax rounding.
- Documents: `lib/billing/documents.ts`. Current PDF 1.4 and editable OpenDocument formats (.odt and .fodt). These are **not EN 16931 e-invoices, XRechnung, ZUGFeRD or PDF/A-3**; do not advertise them as such.
- Database: canonical `supabase/schema.sql`; additive tables prefixed `billing_`. RLS enabled with no authenticated/anon policies. Service-role access is confined to server-side authenticated routes/actions.
- Admin: `/admin/billing`, `/admin/billing/new`, `/admin/billing/:id`, `/admin/billing/customers`, `/admin/billing/settings`, `/admin/billing/review`. Every page calls `admin()` and the MFA proxy page policy covers this path.
- MCP: existing OAuth endpoint with client allowlist, MFA attestation and finance allowlist. Issue/payment actions require review.
- Archive: dedicated **private** Cloudflare R2 bucket `R2_BUCKET_BILLING`, never `R2_BUCKET_MEDIA`, short-lived signed downloads. Provision bucket and verify no public/anonymous permissions before release.

## States / invariants

1. Draft: user can edit with optimistic revision CAS; no invoice number.
2. Preparing: PostgreSQL RPC atomically allocates a unique `RE-YYYY-000001` number and freezes seller, recipient, positions, dates and totals. A unique year sequence row is locked by its UPDATE. Do not create a second invoice when preparation fails.
3. The renderer computes PDF, Flat ODF (FODT), and packed ODT from the frozen snapshot. Each object is uploaded with atomic `If-None-Match: *` and fully verified with SHA-256, including on retries; existing keys are never overwritten.
4. A second PostgreSQL RPC advances to issued only when all three artifact hashes and canonical object keys have been recorded. An identical repeated finalization returns the issued row. Failure leaves invoice preparing for same-ID retry. The immutable-issue trigger blocks subsequent invoice changes.
5. Payments are stored separately and checked against remaining balance under invoice row locks. Issued document snapshots do not mutate when payments arrive.

No silent fallback from a failed DB read to an empty customer/invoice list. Do not automatically apply schema at build/cold start. SQL is installed via explicit operator-controlled process.

## MCP finance boundaries

- Read tools expose private data only after existing OAuth/MFA administrator authentication.
- Create/update tools are limited to customer and invoice **draft** operations.
- `billing_invoice_request_issue` queues a separate human decision; MCP cannot allocate a number itself.
- `billing_invoice_request_payment` queues a financial record; acceptance calls a single DB function that locks the request and invoice and atomically approves the request/creates the payment.
- MCP approval requests are separate from editorial content approval. Do not expose generic SQL execution or direct access to the private R2 bucket.
- Any untrusted customer text remains data, not instructions.

## Deployment checklist (not yet complete)

1. Have the responsible business owner and accountant verify tax mode, legal seller and address, tax identifier and existing invoice number sequence.
2. Provision a new private R2 billing bucket, grant least-privilege server credentials, configure `R2_BUCKET_BILLING`; verify signed download and public 403.
3. Apply canonical schema explicitly in a controlled maintenance window and verify grants/RLS.
4. Run lint, typecheck and unit tests in PR CI, then controlled integration with a disposable Postgres database and private test bucket.
5. Exercise two simultaneous issue attempts, fault after number reservation, partial R2 write, same-ID retries, payment races, repeat MCP requests, and out-of-date draft revisions.
6. Verify PDF rendering in several readers, FODT and compressed ODT in LibreOffice. Current PDF is **not PDF/A**; ODT/FODT are not machine-readable e-invoices.
7. Add standardized validated EN 16931 XML/Factur-X before representing the system as German E-Rechnung-capable. Formal GoBD/retention/backup evaluation with accountant required.
8. Test signed downloads and storage lifecycle including restore before production.

## Not yet implemented

- XRechnung/ZUGFeRD, EN 16931 validators, PDF/A, packed ODT, correction/credit notes, dunning, mail dispatch, DATEV, foreign VAT/reverse-charge, discounts, multi-currency, customer address history table (issued invoice snapshots ARE retained), recurring invoice automation, complete pagination and search, externally authored Stripe/MoR document import.
- Real tax compliance must be verified for the actual invoicing entity. This feature is **not** accounting/legal sign-off.

## R2 retention and immutability

Configure Cloudflare R2 Bucket Lock for the dedicated private billing bucket, scoped to `billing/`, after agreeing a legally appropriate retention period and restoration/backup plan with the responsible accountant. The application implements conditional create-only writes, but IAM administrators may still change bucket configuration. Bucket Lock is an additional technical control, **not itself a complete GoBD certification**. Documentation: https://developers.cloudflare.com/r2/buckets/bucket-locks/ and https://developers.cloudflare.com/r2/api/s3/conditional-operations/. Archive access is checked with HeadBucket before allocating an invoice number; if temporarily unavailable, the number is not newly reserved. A later object-upload failure leaves the already reserved number attached to the same invoice.
