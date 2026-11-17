# Quality journal

Chronological and append-only record of source changes. The CI check validates newly added lines, not historical entries.

## 2026-11-15 | Introduce enforceable living document requirements
- Scope: Band Land repository quality policy, source-diff CI check and document owner map.
- Root cause: Existing agent documentation rules were not required by CI and could be skipped.
- Owner: Repository maintainers review source changes and the matching documentation.
- Tests: Added Node tests for path classification and invalid journal entries, executed in PR CI.
- Failure path: Missing documents or inaccessible git base fail closed, not with silent success.
- Docs updated: Architectural baseline, agent guidelines, operations workflow, QA checklist and changelog.
- Residual risk: A human must still validate semantic accuracy and independently check production.

## 2026-11-16 | Reject duplicate URL-only contact form bot probes
- Scope: Shared NEUROKLAST public contact form and its dedicated spam screening module, with tests and inbox evidence review.
- Root cause: The existing lead-generation classifier and admin keyword blacklist did not identify content-free submissions repeating the same URL in both subject and message.
- Owner: `lib/contact-spam.ts` owns pure spam classification; `app/_actions/contact.ts` controls the single persistence and outbound email path.
- Tests: Added two unit cases for positive and negative URL-only patterns and one server-action test for no database insertion or email; full CI and controlled production smoke verification remain required.
- Failure path: Exact mirrored URL-only submissions are acknowledged but never stored or emailed; normal booking and licensing enquiries with embedded URLs continue through the existing configured checks.
- Docs updated: ADR in .github/ARCHITECTURE.md, contact protection guide, QA checklist, development log, lessons learned and changelog.
- Residual risk: Sophisticated spam may contain plausible text; keyword widening could reject legitimate contacts, and a real production submission test is required after deployment.


## 2026-11-17 | Introduce seller invoice domain, private archive and MCP finance review
- Scope: Direct NEUROKLAST invoice drafts, customer address book, issuance numbers, payment records, Flat ODF/PDF exports, admin and MCP access.
- Root cause: Existing CMS supported checkout orders but had no independent issuer-controlled invoicing workflow or customer registry.
- Owner: `lib/billing/service.ts` controls billing mutations; `lib/billing/domain.ts` owns money validation; PostgreSQL RPCs own number/payment concurrency; `lib/mcp/billing.ts` owns finance tool definitions.
- Tests: Added deterministic monetary arithmetic and document structure unit tests. PR CI, database transaction isolation, R2 integration and human review remain outstanding pending independent execution evidence.
- Failure path: When document upload fails, reserved number remains with `preparing` invoice to retry using same UUID. Database read failures are errors, not empty lists. All MCP financial requests require a separate MFA-approved action.
- Docs updated: Billing architecture, tax compliance and MCP guides; architecture, security, data, QA, changelog, development log and journal.
- Residual risk: NO production sign-off; E-Rechnung, PDF/A, real legal review, complete GoBD archival validation, new private R2 bucket setup and live concurrency tests are still outstanding.

## 2026-11-17 | Harden PDF/ODF archive and retry semantics
- Scope: Direct invoices, immutable Cloudflare R2 objects, three document formats and PostgreSQL issuance finalization.
- Root cause: Initial version overwrote deterministic R2 object keys during retries and checked only object length, not content integrity; packed ODT was unavailable.
- Owner: `lib/billing/archive.ts` owns create-only writes and checksum validation; `lib/billing/documents.ts` owns renderers; PostgreSQL `billing_finalize_issue` owns finalization.
- Tests: Added archive overwrite/tampering and OpenDocument packaging tests; full CI, SQL contract and real LibreOffice/PDF validation remain independent release gates.
- Failure path: `If-None-Match: *` prevents overwrites; byte-for-byte verification is required for retries. Archived hashes are checked before issuing a short-lived URL. Conflicting finalization fails and an identical one is idempotent.
- Docs updated: Billing architecture, MCP, tax compliance, changelog and QA checklist.
- Residual risk: R2 private bucket lock and real-world recovery tests remain unverified, as do EN 16931/PDF-A and full GoBD compliance.

## 2026-11-17 | Billing number-series confirmation and payment-ledger verification
- Scope: Confirmed annual numbering sequences, searchable invoices/customers, aggregated payment totals, read-only CSV export and PostgreSQL contract tests.
- Root cause: An unconfirmed fresh year could allocate number 000001 despite externally issued invoices; the first listing lacked payment balances and only exposed the first page of customer records.
- Owner: PostgreSQL `billing_prepare_issue`, `billing_seed_sequence` and `billing_invoice_balances` govern integrity; the billing domain service mediates reads; admin and MCP use shared filters.
- Tests: Added `supabase/tests/billing.sql` to disposable PostgreSQL CI and unit tests for payment state and CSV safety. Independent integration/real-bank verification is still pending.
- Failure path: Unconfirmed year fails before allocating any number; paid amounts are aggregated from append-only payment records, and invalid overpayments are flagged. CSV refuses inconsistent balances and escapes untrusted spreadsheet cells.
- Docs updated: Billing architecture, tax compliance, operations runbook, MCP, agent workflow, QA checklist, development log and changelog.
- Residual risk: A real R2 bucket lock, tax sign-off, high-concurrency DB/R2 tests, E-Rechnung and live PDF/LibreOffice checks are still outstanding.

## 2026-11-17 | Make manual payment submission retries idempotent
- Scope: Manual billing payment form, shared payment service and PostgreSQL recording RPC.
- Root cause: Double-clicks and retried form submissions previously had no stable operation identifier and could create two payment entries when the outstanding balance allowed it.
- Owner: `public.billing_record_payment` in canonical schema serializes payments and validates the unique payment request ID; the admin form supplies that ID to `lib/billing/service.ts`.
- Tests: Extended the disposable PostgreSQL billing contract to assert that identical payment retries return one record and that overpayment remains rejected. GitHub plugin contract passed at the latest inspected commit; browser E2E remains outstanding.
- Failure path: A same-key replay with identical details returns the original row; mismatched reused keys fail closed; invoice-row locking protects the outstanding balance.
- Docs updated: Billing architecture, operations, MCP, QA checklist, changelog and quality journal.
- Residual risk: This only prevents duplicate CMS posting, not duplicate external transfers or false manual claims of payment. Production financial reconciliation and accountant review remain necessary.

## 2026-11-17 | Optional XRechnung and independent validator gate
- Scope: XRechnung 3.0 UBL generator, admin/MCP preflight, seller/buyer metadata, immutable XML archive.
- Root cause: Existing printable PDF and editable ODF formats cannot satisfy structured B2B e-invoice requirements.
- Owner: `lib/billing/einvoice.ts` maps frozen integer-cent invoice data into standardized UBL; `lib/billing/service.ts` preflights before legal number allocation; PostgreSQL finalization enforces XML archive/hash when selected.
- Tests: Added local XML regression fixture and a dedicated GitHub KoSIT workflow using pinned official validator/configuration. Official run acceptance has not been independently confirmed yet.
- Failure path: Missing buyer reference or contact data stops local generation; XML checksum is committed with the immutable invoice; KoSIT rejection must block release.
- Docs updated: Billing architecture, tax compliance, operations, MCP, development log, QA and changelog.
- Residual risk: No XRechnung production approval until official KoSIT conformance and accountant review; PDF/A-3 and ZUGFeRD not implemented; §19 XML categorization not implemented.


## 2026-11-17 | Provision dedicated EU R2 bucket and billing-only Supabase migrations
- Scope: Existing Cloudflare account, Vercel production environment and connected NEUROKLAST Supabase database.
- Root cause: Billing artifact archival could not proceed until a dedicated bucket was configured. Existing R2 uses EU jurisdiction, so default Cloudflare REST bucket listings did not see the existing `neuroklast-media` bucket without jurisdiction headers.
- Implementation: Created `neuroklast-billing-private` via the EU S3 endpoint using existing private R2 credentials. Verified create-only writes, HEAD/GET and object cleanup. Set `R2_BUCKET_BILLING` and explicit XRechnung feature-off flag in Vercel production settings.
- Database: Committed and applied billing-only migration `20261117125004`, then explicit direct-privilege lockdown `20261117125509`. No existing shop tables were modified. The Supabase client-role privilege checks are negative and service-role checks positive.
- Tests: CI PostgreSQL tests apply the isolated migrations repeatedly and check payment/number security. Infrastructure smoke test used a disposable R2 object; no real invoice data.
- Residual risk: PR not merged, no end-to-end production admin use, no retention lock, backup/restore, complete GoBD process validation or tax owner approval. Real invoices and number-series activation remain deliberately unperformed.
