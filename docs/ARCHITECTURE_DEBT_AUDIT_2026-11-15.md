# Architecture debt audit — 2026-11-15

**Repository:** `Neuroklast/neuroklast-band-land`  
**Snapshot:** `main` @ `d9d0e66c1db17a59d884f7179e0e5476326ecfeb`  
**Purpose:** locate concrete shortcuts, misplaced responsibilities and error-masking patterns, then prioritize root-cause remediation. **This is an audit and remediation backlog, not a claim that the issues have already been fixed.**

## Method and limits

- Enumerated the complete Git tree: **1,517 tracked blobs**, including **462 TS/JS/CSS files under `src/`**, with a non-truncated tree response.
- Searched the indexed codebase for `TODO`, no-op handlers, silent catches, best-effort auditing, duplicated fallbacks, forced type casts, temporary branches and environment-specific behavior.
- Inspected the actual current contents of the files listed below, not only search snippets. Compared important claims with current project documentation and the production runtime errors observed on 2026-11-15.
- Reviewed representative risk hotspots across admin/auth, commerce/licensing, data access, R2/background jobs, public rendering, frontend legacy code and CI/docs. **This is not a line-by-line assessment of every file.** Tests and real browser production journeys were not executed as part of this inspection. Re-evaluate each finding against current `main` immediately before changing code.
- A legitimate intentional fallback is not automatically a shortcut. A finding requires a concrete loss of correctness, visibility, auditability, ownership or contractual clarity.

## Confirmed findings

### A-01 — P0: licence, release and product audit failures can disappear

**Remediation in PR (2026-11-15):** PostgreSQL AFTER ROW triggers on eight relevant tables write sanitized metadata into `plugin_admin_audit` *within the same transaction*, failing the parent write if the audit insert fails. Authenticated server calls forward the verified actor through a request header, with RLS-restricted service-role access; missing trigger readiness blocks plugin mutations. Product deletion no longer deletes historical audit rows. The disposable PostgreSQL contract injects a journal insert failure and verifies rollback and no secret-value exposure. This requires applying the explicit `supabase/migrations/202611150935_atomic_plugin_audit.sql` migration **before** merging/deploying changed routes. No claim of success until schema tests, live migration and deployment verification all pass.

**Files:** `app/api/plugins/route.ts:50-62`, `app/api/plugins/[slug]/licenses/route.ts:33-46`, `app/api/plugins/[slug]/releases/route.ts:71-84`, `app/api/admin/contact-inbox/status/route.ts:15-22`.

Three `audit()` helpers call `await client.from('plugin_admin_audit').insert(...)` inside a `try/catch` but do **not inspect the returned `error`**. Supabase PostgREST returns ordinary database errors as `{ data, error }`, without necessarily throwing. Those helpers can therefore return success even if the audit insert failed. The contact-case status endpoint also ignores the insert result. This affects the verifiability of product, licence, release and contact-case operations.

**Root-cause remediation:** one typed, server-only audit service with mandatory checked results, an explicit decision on transaction coupling for security-sensitive mutations, and a durable retry/outbox for deliberately asynchronous noncritical events. Include failed-insert tests and operational alerts. Never describe a change as audited merely because `insert()` was called.

**Acceptance:** failed audit storage is observable and classified; high-risk actions cannot silently report an audited success; relevant database mutation and audit behavior are exercised by tests.

### A-02 — P1: the admin registry advertises success for no-op command handlers

**Remediation (refactor branch, 2026-11-15):** Distinct `execution: 'server'` descriptors replace the 54 no-op handlers. A pure validator is used by all authorized Next.js server actions; the local dispatcher refuses to execute server commands; forged Supabase contexts have been deleted. CI and production validation are required before closing this finding.

**Files:** `lib/admin-action-registry.ts:780-888` and other registry entries; `app/admin/_actions/context.ts:20-32`.

Multiple registered commands, including `merge_releases`, `purge_releases`, `purge_gigs`, `factory_reset` and media reconciliation, check that `supabaseAdmin` exists and then return `{ ok: true }` without performing the named operation. This may be used as a validation/disclosure registry today, but the contract is `dispatchAdminAction()` / `execute()`: a caller cannot infer that a reported success means the operation happened. The Supabase action context itself supplies type-cast empty settings/data and no-op setter callbacks, explicitly annotated `temp for migration`.

**Root-cause remediation:** separate a pure **authorization/validation command catalogue** from a real **execution service**, or implement typed handlers with verified results. Replace the fake context with a Supabase-specific discriminated context/interface. Do not report `ok: true` for unimplemented actions.

**Acceptance:** every advertised command has a tested real executor, or is explicitly named and typed as validation-only. No dummy setters or forged data context remains in production paths.

### A-03 — P1: R2 and legacy media maintenance is launched from application startup

**Remediation update (PR #631, 2026-11-15):** Obsolete legacy migration and automatic R2 reconcile have been deleted, together with the server startup hook. Explicit authenticated R2 dry-run/apply remains in `/admin/data`, and GET cannot write. CI passed before rebasing onto the architecture policy change. Confirm new production runtime logs after deploy; this entry documents the historical failure, not a currently active startup job.

**Files:** `instrumentation.ts:11-19`, `lib/r2-reconcile-on-deploy.ts:66-116`, `lib/legacy-url-migration-on-deploy.ts:100-150`.

The production startup hook triggers two asynchronous jobs with `void runProduction...`. These jobs perform database/state reads and potentially full R2 inventory/migration work as a side effect of new server instances. The R2 reconcile path has a claim guard, but transient read failures abort the work; the legacy migration uses a different progress/claim approach. Vercel runtime error groups observed on 2026-11-15 repeatedly logged `[legacy-url-migration] could not read deploy state: TypeError: fetch failed` and `[r2-reconcile] could not read deploy state: TypeError: fetch failed`.

**Root-cause remediation:** move heavy maintenance to a deliberately triggered, idempotent operations job (not general runtime startup); centralize durable job state/lease/retry/backoff, distinguish transient infrastructure failures, provide bounded batches, observability and operator recovery. Don't merely suppress the logs.

**Acceptance:** ordinary HTTP cold starts do not spawn migrations; retries are bounded, concurrent workers are safe, and an operator can see/repair failed runs.

### A-04 — P1: admin database failures are shown as valid empty configuration

**Files:** `app/admin/(protected)/site-config/page.tsx:8-15`, `app/admin/(protected)/sections/page.tsx:8-21`, `app/admin/(protected)/bio/page.tsx:7-22`, `app/admin/(protected)/analytics/page.tsx:30-58`.

The Look & Feel page ignores query `error` and catches thrown failures, then renders an empty `rows` array. Sections fall back to default sections after a failed request; other admin pages use blank/default data or zero counts on failure. For editing pages this conflates **not configured** with **failed to load**, which can confuse users and create a risk of overwriting real configuration with defaults.

**Root-cause remediation:** a reusable typed admin loader result with explicit `loading | ready | empty | error` states, proper error messages and disabled mutations until actual values are loaded. Use true defaults only when an *authoritative successful read* establishes absence.

**Acceptance:** error injection never produces a normal-looking editable blank state; a genuine empty database still renders a supported empty state.

### A-05 — P1: homepage and public release data contain duplicate, schema-error-driven fallbacks

**Files:** `app/page.tsx:158-194`, `lib/public-fetch.ts:23-65`.

Both paths repeat full, legacy and minimal `releases` SELECT lists. When the initial query fails, fallback selection is chosen based on whether a human-readable error string includes `manually_edited`. This couples production data behavior to error-message text and duplicates migration compatibility logic. If all queries fail, the code returns an empty release list.

**Root-cause remediation:** one typed public-release repository/adapter, canonical projection and schema contract with explicit migration/feature-version handling. Failures must be observable and testable; do not infer schema capabilities from natural-language error text.

**Acceptance:** a single tested source of release projection and mapping; schema mismatch surfaces as a distinct error, not silently as missing releases.

### A-06 — P1: a local browser activity log is described as an audit log

**Remediation (2026-11-15):** The browser-side log is explicitly classified in code and its visible dialog as optional, user-modifiable local history, *not* durable audit evidence. This correction does not replace server-side mutation auditing; A-01 remains separate and blocking for compliance/security guarantees.

**File:** `lib/activity-log.ts:1-76`.

Admin activity and login-related entries are stored only in localStorage, capped at 200 and silently ignored if storage fails. Browser storage is user-modifiable and cleared independently from server-side history. This can be acceptable for a **personal UI history**, but cannot serve as a durable, tamper-resistant administrative audit trail.

**Root-cause remediation:** explicitly reclassify this as local UI history or replace its audit role with a server-side append-only journal with retention, access controls and tests. Align all UI labels/documentation with the true assurance level.

**Acceptance:** no security/compliance claims rely on browser-only history; sensitive mutations have durable records where required.

### A-07 — P1: environment isolation is documented as incomplete

**File:** `docs/NEUROKORE_LIVE_LAUNCH_CHECKLIST.md:29-39, 67`.

The launch checklist states that Preview and Production share a Supabase database and NEUROKORE cryptographic keys, and describes temporary webhook protection bypass and branch exceptions. **This is a documented risk, not an independently revalidated statement about current secrets.**

**Root-cause remediation:** verify the actual project configurations, then isolate staging/prod database, credentials, webhook endpoints and license-signing trust. Verify no test artifact is trusted as a live purchase.

**Acceptance:** documented test evidence of environment isolation before real-money launch. Never assume an old checklist proves that current settings are safe.

### A-08 — P2: licence/plugin API error classes collapse to HTTP 400

**Remediation in progress (2026-11-15):** shared `adminFailureStatus` classifies Zod, auth, MFA, conflicts, size/rate limits and backend failures; the three plugin routes return these codes. The product list also fails explicitly when related-table reads fail. CI and production verification are required before marking this complete.


**Files:** `app/api/plugins/route.ts`, `app/api/plugins/[slug]/releases/route.ts`, `app/api/plugins/[slug]/licenses/route.ts`.

Their outer `catch` generally returns status `400` using `adminFailureMessage(error)` for many different failures (authentication/MFA, validation, network and backend/database failures). Clients and monitoring cannot reliably differentiate invalid input, denied access or temporary infrastructure faults.

**Root-cause remediation:** shared typed domain errors and a centralized HTTP mapper: e.g. `400/422` invalid input, `401/403` denied access, `409` conflict, `429` throttling, `503` transient upstream failures; avoid exposing secrets.

**Acceptance:** contract tests for each error class and consistent UI behavior (including an MFA remediation path).

### A-09 — P2: outdated debug/maintenance paths and contradictory project documentation

**Files:** `next.config.mjs:16-33`, `README.md:30-39`, `instrumentation.ts:1-19`, `docs/PROJECT_STATUS.md:3-10`.

`next.config.mjs` still includes a preflight console branch keyed to a specific October 2026 preview branch. README claims database schema is applied automatically during production deployment; `instrumentation.ts` explicitly says to run `npm run db:schema` externally and **never run DDL during function startup**. The status file is dated 2026-10-28 and includes assumptions that have changed.

**Root-cause remediation:** remove obsolete branch-only diagnostics after confirming they are unused, keep schema deployment procedures in one authoritative document and link to them, and review project-status claims for freshness. The **incorrect README schema claim is corrected as part of this documentation PR**.

**Acceptance:** onboarding and deployment instructions match executable code; no defunct branch conditions remain after cleanup.

### A-10 — P2: media cleanup errors can leave untracked R2 orphans

**Files:** `app/admin/_actions/siteConfig.ts:93-105`, `app/api/plugins/[slug]/releases/route.ts:210-249`.

Media replacement/deletion paths catch failed R2 deletes after database writes and intentionally continue, without a visible durable cleanup job for the failure in these paths. A deletion that does not run can leave stale media objects. Swallowing an incidental cleanup failure may preserve the primary transaction, but silently forgetting it is a lifecycle gap.

**Root-cause remediation:** durable deletion outbox with safe retry, idempotent object keys, monitoring and a reconciliation job. Preserve the rule that a completed primary DB write must not be falsely rolled back.

**Acceptance:** simulated R2 failures generate retryable cleanup records; reconciliation eventually completes or explicitly escalates.

### A-11 — P2: the shared MFA route registry is still manually synchronized

**Files:** `lib/admin-mfa-policy.ts`, `proxy.ts`, `lib/neurokore/server.ts`.

The recently centralized MFA navigation fixes several known routes, but its explicit route set must be manually extended whenever a new page adopts the strict `admin()` guard. Server-side enforcement remains independent, which is good; the remaining concern is that **new routes can regress to a generic Server Component error** if the registry is forgotten.

**Root-cause remediation:** derive navigation scope from a protected layout/route group or add a static contract test that cross-checks every page using the strict guard against the policy registry. Keep APIs and login/MFA setup outside navigation redirects.

**Acceptance:** adding a protected page without the matching MFA navigation cannot pass CI.

### A-12 — P2: remaining legacy/public component duplication is tracked but unfinished

**Files:** `components/BackgroundStack.tsx`, `app/_components/public/BackgroundStack.tsx`, `docs/REFACTOR_AUDIT_2026-10-29.md`, `docs/agent/architecture.md`.

Two BackgroundStack implementations remain, and the former explicitly notes a future single-source preference. The 2026-10-29 refactor audit documents legacy `src/` modules and a staged migration, rather than proving they are safe to delete. This is a maintainability backlog, **not proof of a current runtime defect**.

**Root-cause remediation:** map current runtime imports and distinct responsibilities, consolidate only genuinely shared behavior, keep contracts and visual regression tests, and remove old copies only with evidence.

**Acceptance:** ownership of the public background stack is explicit; remaining duplicates are either intentionally separate or removed after tested parity.

## Not classified as dirty shortcuts

- Intended default UI states for **verified absent** data.
- Error-tolerant browser preference storage, where functionality clearly remains optional and is never misrepresented as server persistence.
- SSRF rejection, explicit validation fallback, and a user-visible retry for external APIs.
- Intentional migrations or compatibility adapters **with documented versioning, bounded lifespan and tests**. Those are not a substitute for a permanent domain model.

## Required remediation order

1. **P0:** A-01 audit event durability and error handling.
2. **P1:** A-02 command registry semantics and fake context; A-04 admin editable load states; A-03 scheduled/observable R2 maintenance.
3. **P1:** A-05 canonical public release adapter; A-06 activity log assurance contract; verify A-07 environment isolation.
4. **P2:** A-08 error mapping; A-10 R2 deletion outbox; A-11 MFA policy completeness test; A-09 obsolete diagnostics/docs; A-12 legacy component ownership.

Do not combine unrelated fixes into one rushed rewrite. For each finding: root-cause analysis, design boundary, tests that fail before the fix, implementation, review, documented remaining risk, green non-build CI, and deployment verification when applicable. The [non-negotiable engineering standard](../AGENTS.md#mandatory-engineering-standard-no-quick-fixes) applies to every item.
