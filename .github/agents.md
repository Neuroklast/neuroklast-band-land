# Copilot Agent Instructions — Band Land Refactor

This document describes the 10-step refactoring plan that turns the project into a
clean, standalone band website with a proper URL-based admin panel.  Every step is
implemented **test-driven**: a failing test is written first, then the production code
is changed to make it pass, then all 1 300+ existing tests are re-run.

---

## Context

The codebase is a **Vite 7 + React 19 SPA** (no Next.js, no router).

Problems identified before this refactor:
- Activation/licensing system hard-wired to `neuroklast.net` blocks the app entirely
  when `VITE_ACTIVATION_KEY` is not set, making the template unusable out-of-the-box.
- Admin panel is a deeply nested dialog stack overlaid on the public band site —
  no dedicated URL, no shareable link, impossible to deep-link.
- Hardcoded hostnames (`neuroklast.net`, `neuroklast-band-land.vercel.app`) in both
  client (`src/lib/primary-check.ts`) and server code (`api/_primary-check.ts`).
- `KeyManagerPanel` (SaaS key-issuance UI) is bundled into every deployment even
  though it only makes sense on the original Neuroklast production instance.
- JS obfuscator in `vite.config.ts` bloats the bundle by up to 100 % and slows
  mobile evaluation; it was disabled by default but cluttered the config.

---

## 10-Step Refactoring Plan

### Step 1 — Add `react-router-dom` routing infrastructure
- Install `react-router-dom` v7 (already zero-vulnerability per advisory DB check).
- Wrap the React root in `<BrowserRouter>` inside `src/main.tsx`.
- Create `src/AppRouter.tsx` that owns the `<Routes>` tree.
- **Tests:** `AppRouter` renders without crashing; navigating to `/admin` does not
  fall through to the band site.

### Step 2 — Create route structure
- `<Route path="/" element={<App />}>` — public band site (unchanged except admin
  overlay is removed).
- `<Route path="/admin/*" element={<AdminRoute />}>` — standalone admin page.
- `<Route path="*">` — 404 redirect to `/`.
- **Tests:** each route renders the correct top-level component.

### Step 3 — Remove `ActivationLockScreen` gate from `App.tsx`
- Delete the `if (!activationResult?.valid) return <ActivationLockScreen …>` guard.
- Delete the `useEffect` that calls `validateActivationKey()`.
- Delete the lazy import of `ActivationLockScreen` and `LicenseStatusBadge` from
  `App.tsx` (badge moves to the admin page).
- **Tests:** `App` renders site content without requiring a valid activation result.

### Step 4 — Generalise primary-hostname list
- `src/lib/primary-check.ts`: read hostnames from `VITE_PRIMARY_HOSTNAMES` env var
  (comma-separated).  When the env var is empty the list is empty — **no hostname is
  treated as primary by default**.
- `api/_primary-check.ts`: same change using `PRIMARY_HOSTNAMES` env var (server-side).
- Keep the old hardcoded list as the **default** only when the env var is not set, so
  existing deployments do not break.
- **Tests:** `isPrimaryInstance()` returns `false` when env var is empty and hostname
  is `neuroklast.net`; returns `true` when env var contains the current hostname.

### Step 5 — Make activation key optional
- `src/lib/activation.ts`: when `VITE_ACTIVATION_KEY` is not set, return
  `{ valid: true, tier: 'free', features: [] }` instead of `{ valid: false }`.
  Deployments that do not set the key get a valid free-tier result automatically.
- `src/hooks/use-activation-key.ts`: same: if no key is configured, set status to
  `'valid'` immediately (no API call, no lock screen).
- **Tests:** update "returns invalid when key not set" → "returns valid (free) when
  key not set".

### Step 6 — Remove `KeyManagerPanel`
- Delete `src/components/KeyManagerPanel.tsx`.
- Remove the `key-manager` case from `AdminDialogManager.tsx`.
- Remove the `Key` icon shortcut from `AdminHubDialog.tsx` (primary-only item).
- The server-side `api/admin/keys.ts` endpoint is retained — it can still be used via
  the Vercel dashboard or curl on the official deployment.
- **Tests:** `AdminDialogManager` no longer imports or renders `KeyManagerPanel`.

### Step 7 — Simplify activation caching in `use-activation-key.ts`
- Remove the parallel `sessionStorage` cache (`activation_status_cache`) that
  duplicates what `src/lib/activation.ts` already caches under `nk-activation-result`.
  A single cache in `activation.ts` is sufficient.
- **Tests:** cache is read/written only through the canonical `nk-activation-result`
  key; the old `activation_status_cache` key is never written.

### Step 8 — Standalone `/admin` page with route-level auth guard
- Create `src/pages/AdminPage.tsx`:
  - Uses `useAdminAuth()` to determine authentication state.
  - Renders `<AdminLoginDialog>` when not authenticated.
  - Renders `<AdminHubDialog open>` when authenticated.
  - Uses `useSiteConfig()` to read/write site data (same hook as the band site).
- Create `src/components/AdminRoute.tsx` — wraps `AdminPage` and handles the
  redirect to `/` if the user is not an owner and tries to deep-link.
- Remove `AdminButton`, `AdminDialogManager`, and login dialogs from `App.tsx`.
- **Tests:** `AdminPage` renders the login form when `isOwner` is false; renders the
  admin hub when `isOwner` is true.

### Step 9 — Make `middleware.ts` generic
- Remove the hardcoded `neuroklast.net` references in log messages.
- Replace string literals with generic labels (`[SECURITY]`, `[MIDDLEWARE]`) so any
  operator can use the middleware without Neuroklast branding in their logs.
- **Tests:** no dedicated test needed; covered by security tests in
  `src/test/security-hardening.test.ts`.

### Step 10 — Remove JS obfuscator from `vite.config.ts`
- Delete the `javascript-obfuscator` plugin block and the `vite:obfuscatefiles` plugin.
- Remove `javascript-obfuscator` from `devDependencies` in `package.json`.
- Remove the `VITE_OBFUSCATE` environment variable reference.
- **Tests:** not applicable (build-config change); covered by `npm run build` smoke
  test in CI.

---

## Working Rules for This Repository

1. **Test-driven always** — every behaviour change gets a test that fails before the
   code change and passes after.
2. **All 1 300 existing tests must keep passing** after each step.
3. **No new `any`** — TypeScript strict mode; use `unknown` + type guards instead.
4. **No secrets in source** — all credentials via environment variables.
5. **Commit after each step** — one commit per step so the history is bisectable.
6. **Build must succeed** — run `npm run build` before the final commit.

---

## Environment Variables Reference

| Variable | Used by | Purpose |
|---|---|---|
| `VITE_PRIMARY_HOSTNAMES` | `src/lib/primary-check.ts` | Comma-separated list of hostnames that bypass activation (default: hardcoded Neuroklast list for backward-compat) |
| `PRIMARY_HOSTNAMES` | `api/_primary-check.ts` | Same, server-side |
| `VITE_ACTIVATION_KEY` | `src/lib/activation.ts` | Deployment key; optional — free tier when absent |
| `VITE_ACTIVATION_API_URL` | `src/lib/activation.ts` | Override validation endpoint URL |
| `KV_REST_API_URL` | middleware, API routes | Upstash Redis REST URL |
| `KV_REST_API_TOKEN` | middleware, API routes | Upstash Redis REST token |
| `ADMIN_SETUP_TOKEN` | `api/auth.ts` | One-time token for first admin setup |
| `RATE_LIMIT_SALT` | middleware, `api/_ratelimit.ts` | Hex salt for IP hashing |
