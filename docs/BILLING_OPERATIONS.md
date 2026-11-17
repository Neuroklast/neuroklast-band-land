# Billing operations runbook

Feature branch: `feature/billing-invoices-mcp`. This guide is for a controlled release after legal review; the branch is not production-approved.

## Before first invoice

1. Verify the actual legal issuer, required German tax identifier, § 19 UStG eligibility (or regular taxable status), address, banking details and the legacy invoice series with the accountant.
2. Provision a **dedicated private** Cloudflare R2 bucket. Do not reuse `R2_BUCKET_MEDIA` or expose a public domain / public `r2.dev` endpoint. Configure `R2_BUCKET_BILLING` only on the server.
3. Apply a Cloudflare R2 Bucket Lock retention rule to the `billing/` prefix following an accountant-approved retention schedule. Configure recovery copies and verify access/key rotation. R2 Bucket Lock is a technical safeguard, not by itself GoBD certification.
4. Apply `supabase/schema.sql` in a controlled operation, **not** in the Vercel build or cold start. The SQL is intended to be additive/idempotent; test it first against a restored disposable database.
5. Visit `/admin/billing/settings` under administrator MFA. Save the legal seller identity and verified tax mode. For every invoice year, confirm the starting number, considering legacy paper or externally generated invoices. An unconfirmed year cannot allocate a number.
6. Run a full invoice creation -> PDF/ODT/FODT download -> partial payment -> remaining payment test in an isolated environment with non-real customer data.

## Failure handling

- `draft`: editable, no legal invoice number yet.
- `preparing`: number is already permanently reserved; the attached document generation/verification did not fully finish. **Retry the same invoice ID**. Never create a replacement to evade the error. Review R2 availability and the stored file checksum.
- `issued`: row is immutable. Corrections require separately linked correction/credit note logic, not yet available.
- An R2 bucket preflight failure occurs before number allocation. A later upload outage leaves `preparing` with the original number and frozen invoice data.
- Payment entries are append-only. A failed payment review is not the same as confirmed bank settlement.

## Verification

- `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`
- Plugin commerce contract workflow also runs `supabase/tests/billing.sql` in disposable PostgreSQL.
- Test simultaneous issue requests and retry after R2 failure with a disposable bucket. Confirm an existing invoice key is never overwritten and a different object under the same key is rejected.
- Use real PDF and LibreOffice readers to verify display/layout. Perform complete restore and retention tests.
- A CSV export is available from the invoice overview for accounting reconciliation. This is **not** DATEV export, a tax filing or E-Rechnung.
- No e-invoice claims are permitted until actual KoSIT/EN16931 validation and PDF/A are implemented and independently tested.

## Financial and personal data

- Financial documents are stored only under a private bucket and accessed with MFA-protected signed URLs.
- Never log customer identities, invoice bytes, OAuth bearer tokens or signed document links.
- Do not expose billing data in public API/cache or contact-form processing.
- For Stripe Managed Payments, retain Stripe's own Merchant-of-Record customer documents; do not generate duplicate NEUROKLAST end-customer tax invoices.

References:
- https://developers.cloudflare.com/r2/buckets/bucket-locks/
- https://developers.cloudflare.com/r2/api/s3/conditional-operations/
- https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html

## Payment submission idempotency

Every manual payment form renders a unique `idempotency_key` UUID. The same form submission and retry must return the same existing payment entry. For a separate real transfer, start a new submission rather than reusing a previous key. SQL rejects a reused key containing a different invoice, amount, date or reference. The database contract in `supabase/tests/billing.sql` covers identical retries and excess payments. Do not confuse this with bank payment reconciliation.

## Optional XRechnung test gate

The extra `billing-kosit.yml` GitHub workflow generates an XRechnung from the actual TypeScript service, downloads the official KoSIT Validator 1.6.3 JAR and XRechnung 3.0.2 rules published 2026-08-31, checks their SHA-256 digests and runs XSD/Schematron validation. A generated document rejected by KoSIT is a release blocker. A locally accepted JSON Schema is not a substitute. Until KoSIT and tax-owner approval, treat `e_invoice_profile=xrechnung` as an experimental branch-only capability and do not deploy it or issue real invoices. ZUGFeRD/PDF/A-3 is not yet available.

**Fail-closed issuance flag:** `BILLING_XRECHNUNG_ENABLE_ISSUANCE=false` by default. XRechnung preview is available without the flag, but final issuance fails before allocating a legal number until it is explicitly set to `true` after KoSIT CI and accountant approval. The flag does not override R2, tax or other existing issuance checks.


## Verified environment setup on 2026-11-17

- **Cloudflare R2:** `neuroklast-billing-private` created in the `eu` jurisdiction using the jurisdiction-specific S3 endpoint. The existing NEUROKLAST production R2 credentials successfully completed a signed HeadBucket, conditional PutObject, GetObject and DeleteObject smoke test. The disposable probe object was deleted. No public R2 domain was configured. The existing `neuroklast-media` bucket was not changed.
- **Vercel:** `R2_BUCKET_BILLING=neuroklast-billing-private` is set in production environment settings. Existing R2 credentials and `R2_JURISDICTION=eu` were reused without changing their values. `BILLING_XRECHNUNG_ENABLE_ISSUANCE=false` is explicitly configured in production.
- **Supabase:** The `neuroklast-band-land` database received only two billing-specific schema changes, recorded remotely as versions `20261117125004_neuroklast_billing_setup` and `20261117125509_neuroklast_billing_role_lockdown`. Both succeeded. The repository intentionally has **no `supabase/migrations` directory**: the existing architecture enforces a single canonical `supabase/schema.sql` with idempotent changes. Read-only live verification confirmed that `anon` and `authenticated` lack direct billing table permissions, while `service_role` can read invoices and execute issuance RPCs. All seven billing tables have RLS enabled.
- **Not yet released:** PR #645 is still a draft and has not been merged or deployed in production. An environment-variable change becomes available to new deployments, not automatically to an existing deployment. No customer invoices were issued as part of this setup. Issuer details, tax status and each year's first legal invoice number still require explicit administrator review before use.
- **Retention:** R2 Bucket Lock/retention policy was not set, pending a verified retention and recovery plan. Do not imply that this alone certifies GoBD compliance.



## 2026-11-17 branded PDF update

Before the first 120 EUR Four Runners Club DJ invoice is issued, deploy and validate the branded PDF renderer. Existing numbered or archived invoices are not retroactively changed. Use the same draft ID `26354dad-1098-4d08-97c7-fbb52e46d63a` for issuance, never create a duplicate. Verify the exact total, line, bank details, § 19 note and A4 layout with a PDF renderer. Only then allocate the first confirmed sequence number. This is an operational release of ordinary PDF; it is **not** a declaration of GoBD/e-invoice certification.
