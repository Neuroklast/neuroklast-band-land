# Safe refactor inventory and migration plan (2026-10-29)

This is a read-only architecture inventory plus a sequence for a full, staged refactor. It is **not** proof that the entire application is already refactored. Base: `main` at `951ea85bf3ab0d2749a4b5fc6d9033a9553cc223`.

## Verified inventory at baseline

| Area | Files |
| --- | ---: |
| Entire tracked repository | 1,466 |
| `app/` | 346 |
| `components/` | 151 |
| `lib/` | 261 |
| `src/` | 486 |
| Legacy `src/` tests | 216 |
| Other `src/` files | 270 |
| `src/` files with a matching filename outside `src/` | 106 |
| Groups of files with byte-identical Git blobs | 25 |

**Important:** matching names do **not** imply identical functionality. Some legacy modules have diverged, and tests under `src/test` are still executed by Vitest. `app/globals.css` previously imported `src/animations.css`, now moved byte-for-byte to `styles/animations.css`. The legacy `src/index.css` entrypoint and affected overlay test now resolve the canonical stylesheet. `src/` is excluded from application TypeScript checks and ESLint, not from test execution or asset references. Do not delete or re-export it wholesale.

`npm run audit:architecture` produces a current read-only inventory and fails if runtime JS/TS imports legacy `src/` modules directly. The exception for legacy CSS is intentional. A `--json` invocation emits machine-readable counts. Byte duplicates are candidates for inspection, **not** automatic deletion.

## Completed in the initial consolidation branch

1. Shared RFC 9728 protected-resource metadata handler for the two OAuth discovery paths, tested for identical responses and unavailable-issuer behavior.
2. Shared SSRF-guarded media download transport for remote image/video imports, with existing authorization, MIME allowlists, per-media limits, image optimization and R2 storage left intact. Tests cover headers, errors, limits and timeouts.
3. Shared optimistic visibility button for six protected admin lists; all domain actions retain their own authorization and invalidation behavior. Tests cover state changes and rollback.
4. A read-only legacy inventory and CI guard against new runtime JS/TS dependencies on `src/`.

## Phase 1 progress (2026-10-29)

- Moved the live 40 KB animation stylesheet from `src/animations.css` to `styles/animations.css`, preserving its Git blob SHA and updating all known imports/tests. The legacy stylesheet entrypoint remains compatible without a second copy.
- The architecture audit additionally guards against new runtime CSS imports into the legacy `src/` tree.
- The remaining legacy files are not presumed unused. Continue dependency classification before further removals.

## Phase 1 progress — shared legacy utilities (2026-10-29)

- Migrated two byte-identical legacy utilities to their canonical root modules: `src/lib/fetch-retry.ts` and `src/lib/contrast.ts`. The three former relative consumers in `src/lib/{odesli,itunes,color-utils}.ts` now import the existing `lib/` implementations. No retry, color or API behavior was changed.
- Added `npm run audit:legacy` for a read-only, tracked-source inventory of **literal static import references**. Reports identical mirrors, their static importers and directly referenced legacy files. This is NOT proof of dead code: dynamically computed imports, asset paths, framework conventions and runtime string lookups require separate validation.
- Remaining legacy files and tests are retained until cross-entrypoint usage is understood and CI/E2E coverage is available.

## Phase 1 progress — eliminate identical source mirrors (2026-10-29)

- The static tracked-import inventory identified 16 byte-identical root/`src/` source mirrors with no literal importers of their legacy paths. Targeted code searches found no explicit legacy-path references for the sampled modules.
- Removed the 16 legacy copies only after each Git blob SHA matched its retained canonical counterpart. Root implementations in `components/`, `hooks/` and `lib/` were not modified.
- Added a test requiring `exactMirrors === 0` in the read-only inventory to prevent reintroduction of redundant copies.
- **Limitation:** literal import reachability cannot detect constructed paths, framework conventions or runtime assets. CI success reduces risk but does not prove other non-identical legacy source is dead. Do not mass-delete the remaining `src/` tree.

## Phase 2 progress — sync-job contracts and build execution policy (2026-10-29)

- Centralized the seven allowed sync-job types, admin read-only filter parser, initial phase and payload defaults in `lib/sync-job-types.ts`. Both `/api/sync-jobs` creation and `/api/sync-jobs/active` polling reuse the same contract; existing admin authorization, database queries, query semantics, error responses and cache headers are retained. Added pure unit tests for valid/invalid queries and defaults.
- Removed Next.js builds from GitHub Actions CI and removed the auto-building Lighthouse workflow. Added `npm run check:github-builds`, enforced in CI, to prevent reintroduction. GitHub still runs lint, tests, typecheck and security audit. Production build and Lighthouse are **local maintainer tasks**; Vercel Production deployment from `main` remains an independent platform step.
- **Verification limitation:** without access to the maintainer's local build environment, a green GitHub test/typecheck does not establish local build, Lighthouse or manual E2E success.

## Phase 2 progress — public sitemap adapter separation (2026-10-29)

- Extracted exact XML serialization (escaping, headers and element order), static and localized legal entries and pure mapping functions for news, gigs, plugins and soundpacks to `lib/sitemap-entries.ts`. `app/api/sitemap/route.ts` now only queries public Supabase and composes the XML response.
- Kept the site origin, all existing public URL paths including booking/news, status filters (`active=true`, plugins `kind=plugin`), query limits, ISR revalidation, browser/cache response headers and per-domain failure isolation unchanged.
- Added tests for XML escaping, optional `lastmod`, localized language coverage, invalid slugs/IDs, gig slug collisions, public filter queries and output ordering.
- The prior `src/` legacy migration remains separate; no broad cleanup or edits to commerce, license, MCP or authentication were made. **Local** production build, browser E2E and Lighthouse must still be run by the maintainer; never run builds in GitHub Actions.

## Remaining staged refactor work## Phase 2 progress — appearance editor config contract (2026-10-29)

- Extracted the exact persisted appearance configuration type, default theme, default settings and stored-value parsers from the large `AppearanceEditor` into `lib/admin-appearance-config.ts`. This reduces the component by over 120 source lines without changing layout, preview, browser state transitions, server actions or stored JSON representation.
- Added direct regression tests for defaults, typed field fallback, false/zero inputs, extended theme settings, saved custom presets, overlay pool handling and legacy look identifiers.
- No CSS, public site content, admin MFA, Supabase schema or API contracts changed. CI remains build-free; local maintainer build, E2E and Lighthouse remain unverified until actually run.



### Phase 1: resolve the legacy root and test boundaries

- Collect import and asset dependency graphs for each of the 270 non-test `src/` files, including the CSS entrypoint, theme selectors, public files and E2E fixtures.
- Classify each candidate as active runtime dependency, test fixture, retained compatibility layer, replaceable mirror or genuinely unused.
- Move live CSS/assets to canonical locations *only* with screenshot and production build comparisons. Move tests separately, preserving their path-based fixtures and setup.
- Delete only modules proven unreferenced by static analysis **and** all functional/snapshot/E2E checks. Never bulk-delete the 106 filename mirrors.

### Phase 2: boundaries and module ownership

- Separate `app/api` route adapters from pure validators and services, starting with non-payment read-only endpoints.
- Standardize server/client boundaries and data transfer contracts without altering public URLs or cached response semantics.
- Reduce high-complexity modules in `app/page.tsx`, the protected admin editors, `lib/i18n.ts` and `lib/legal-i18n.ts` with snapshot/locale regression tests before and after each extraction.
- Consolidate exact duplicate small UI components only when props, accessibility and optimistic error behavior are equivalent.

### Phase 3: high-risk workflows, *after* integration coverage exists

- Commerce: Stripe checkout/webhook idempotency, invoices, withdrawals, licences and digital fulfilment. Freeze deployed behavior before any module extraction.
- MCP: OAuth identity, MFA attestation, tool schemas, permissions and approval flow. Preserve both discovery paths and accepted protocol versions.
- Supabase migrations, R2 URL/object-key handling, scheduled jobs and rate limiting: validate schema/backups and rollback paths before changes.
- Never make a cleanup commit that changes sale readiness, license gates, login security, consent, legal copy or data retention semantics.

### Phase 4: regression and rollout

- Run `npm ci`, `npm run audit:architecture`, `npm run check:github-builds`, `npm run lint`, `npm run typecheck`, `npm run test` in GitHub CI as configured. **Do not build in GitHub.** Run `npm run build`, Playwright E2E and mobile Lighthouse only on the maintainer's local machine and report unverified checks distinctly; Vercel builds automatically for production deploys.
- Verify public home, releases, gig and news routes, login, editor toggles, remote-media import, MCP discovery, download routes, legal and cookie screens.
- Each independent domain gets a small PR; merge only green checks and verify the Vercel production SHA. New behavior needs its own rollback plan.
- Do not close unrelated pending PRs as part of cleanup. Rebase on the newest `main` and re-run checks when concurrent branches land.

## Non-goals for the initial PR

No database schema migration, dependency upgrade, checkout/licence changes, destructive bulk deletion, UI redesign, or production data write.
