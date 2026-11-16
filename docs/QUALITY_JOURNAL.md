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
