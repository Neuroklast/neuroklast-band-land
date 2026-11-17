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
