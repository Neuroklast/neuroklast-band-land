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

## Remaining staged refactor work

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

- Run `npm ci`, `npm run audit:architecture`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e` where a runnable environment exists; also check `npm audit` and the mobile Lighthouse budget.
- Verify public home, releases, gig and news routes, login, editor toggles, remote-media import, MCP discovery, download routes, legal and cookie screens.
- Each independent domain gets a small PR; merge only green checks and verify the Vercel production SHA. New behavior needs its own rollback plan.
- Do not close unrelated pending PRs as part of cleanup. Rebase on the newest `main` and re-run checks when concurrent branches land.

## Non-goals for the initial PR

No database schema migration, dependency upgrade, checkout/licence changes, destructive bulk deletion, UI redesign, or production data write.
