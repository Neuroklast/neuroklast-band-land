# Billing architecture (NEUROKLAST Band Land)

Status: feature branch implementation, NOT production-approved. Applies to direct seller-issued invoices, not Stripe Managed Payments (Merchant of Record) customer invoices.

## Domain boundaries

- Canonical service: `lib/billing/service.ts`. Browser/server actions and MCP MUST go through this module, never SQL from the UI.
- Validation and integer-cent arithmetic: `lib/billing/domain.ts`, quantities measured in thousandths. Group VAT by tax rate before tax rounding.
- Documents: `lib/billing/documents.ts`. Current PDF 1.4 and editable OpenDocument formats (.odt and .fodt). The optional XRechnung UBL XML is generated separately by `lib/billing/einvoice.ts` using `@e-invoice-eu/core`. PDF/ODT/FODT are **not** EN 16931 e-invoices, ZUGFeRD or PDF/A-3.
- Database: canonical `supabase/schema.sql`; additive tables prefixed `billing_`. RLS enabled with no authenticated/anon policies. Service-role access is confined to server-side authenticated routes/actions.
- Admin: `/admin/billing`, `/admin/billing/new`, `/admin/billing/:id`, `/admin/billing/customers`, `/admin/billing/settings`, `/admin/billing/review`. Every page calls `admin()` and the MFA proxy page policy covers this path.
- MCP: existing OAuth endpoint with client allowlist, MFA attestation and finance allowlist. Issue/payment actions require review.
- Archive: dedicated **private** Cloudflare R2 bucket `R2_BUCKET_BILLING`, never `R2_BUCKET_MEDIA`, short-lived signed downloads. Provision bucket and verify no public/anonymous permissions before release.

## States / invariants

1. Draft: user can edit with optimistic revision CAS; no invoice number. Each year must have a manually confirmed starting sequence before any number allocation.
2. Preparing: PostgreSQL RPC atomically allocates a unique `RE-YYYY-000001` number and freezes seller, recipient, positions, dates and totals. A unique year sequence row is locked by its UPDATE. Do not create a second invoice when preparation fails.
3. The renderer computes PDF, Flat ODF (FODT), and packed ODT from the frozen snapshot, plus XRechnung UBL XML for explicitly selected, reviewed domestic German VAT invoices. Each object is uploaded with atomic `If-None-Match: *` and fully verified with SHA-256, including on retries; existing keys are never overwritten.
4. A second PostgreSQL RPC advances to issued only when all three core artifact hashes and canonical object keys have been recorded. For XRechnung, the canonical XML key and SHA-256 are mandatory too. An identical repeated finalization returns the issued row. Failure leaves invoice preparing for same-ID retry. The immutable-issue trigger blocks subsequent invoice changes.
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
7. Run the pinned official KoSIT 1.6.3 + XRechnung configuration 2026-08-31 validation in CI for generated UBL before claiming EN 16931 compliance. Factur-X/PDF-A remain unavailable. Formal GoBD/retention/backup evaluation with accountant required.
8. Test signed downloads and storage lifecycle including restore before production.

## Not yet implemented

- ZUGFeRD/Factur-X, PDF/A-3, live external KoSIT verification and approval, credit/correction notes, dunning, outbound mail dispatch, DATEV, foreign VAT/reverse-charge, discounts, multi-currency, customer address history (issued invoice snapshots ARE retained), recurring invoices, externally authored Stripe/MoR invoice import.
- Real tax compliance must be verified for the actual invoicing entity. This feature is **not** accounting/legal sign-off.

## R2 retention and immutability

Configure Cloudflare R2 Bucket Lock for the dedicated private billing bucket, scoped to `billing/`, after agreeing a legally appropriate retention period and restoration/backup plan with the responsible accountant. The application implements conditional create-only writes, but IAM administrators may still change bucket configuration. Bucket Lock is an additional technical control, **not itself a complete GoBD certification**. Documentation: https://developers.cloudflare.com/r2/buckets/bucket-locks/ and https://developers.cloudflare.com/r2/api/s3/conditional-operations/. Archive access is checked with HeadBucket before allocating an invoice number; if temporarily unavailable, the number is not newly reserved. A later object-upload failure leaves the already reserved number attached to the same invoice.

## Admin ledger and exports

The admin overview supports number/year/status filters, open/partial/paid/overdue payment states calculated from immutable payment records, searchable paginated customers, and a year-scoped, formula-injection-safe UTF-8 CSV reconciliation export. The CSV is **not** a DATEV or certified tax export. MCP invoice/customer list tools support pagination and the same invoice filters. See `docs/BILLING_OPERATIONS.md` for the release steps and numbering confirmation procedure.

## Manual payment retry safety (2026-11-17)

A manually recorded payment must have a unique UUID supplied with the form, sent to the canonical `recordBillingPayment` service and to the six-parameter `billing_record_payment` SQL RPC. A repeated request with the same UUID and identical invoice, date, amount and reference returns the original payment unchanged. Reusing the UUID for different data fails closed. This handles browser resubmissions but does not prove an incoming bank transfer occurred. The aggregate payment view and invoice row lock still protect against recording more than the outstanding amount.

## Optional XRechnung UBL path (2026-11-17)

An invoice draft can opt into `e_invoice_profile=xrechnung` only with the reviewed `vat_registered` tax mode and German seller/buyer. Buyer reference (BT-10), actual seller contact name/phone/email, buyer email, IBAN, complete addresses and seller tax identifier are mandatory; arbitrary `n/a` values are not generated automatically. `previewBillingXRechnung` validates without allocating any invoice number; the issuing service repeats validation before and after number allocation. An issued XRechnung archives an immutable `.xml` object alongside PDF/ODT/FODT and commits its SHA-256 + key transactionally.

The generator uses maintained `@e-invoice-eu/core` and its JSON Schema checks. An **independent** official KoSIT XRechnung 3.0.2 XSD/Schematron workflow is recorded under `.github/workflows/billing-kosit.yml`. Its outcome is a hard acceptance criterion. A successful local JSON Schema run alone is not evidence of legal/technical conformance; no production feature flag should be switched on until the official independent validator and accounting review both pass.


## Branded invoice PDF (2026-11-17)

The single PDF renderer is `lib/billing/pdf.ts`, invoked by the existing `renderPdf` contract in `lib/billing/documents.ts`. The red-and-black NK vector mark matches `public/brand/nk-mark.svg`, drawn directly as a PDF path. It does not require raster assets, headless browsers, network access or external font downloads at invoice-issue time. Layout includes A4 margins, legal seller and buyer details, dates, line-item table with pagination, gross total, § 19 UStG note where applicable, payment instructions, and page counters. Financial values still come exclusively from `calculateInvoice`, based on frozen integer-cent snapshots.

The resulting file remains an ordinary PDF 1.4, **not** PDF/A-3, ZUGFeRD or an EN16931 e-invoice. Customers with characters outside the built-in WinAnsi font repertoire are not fully supported; issuance for those customers requires a separate embedded Unicode font follow-up. Verify every issued PDF in a reader and never regenerate an already-issued document with a changed renderer or logo.
