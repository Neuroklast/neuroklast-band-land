# Development Log

Entries are in **reverse chronological order** (newest first).

## Session: 2026-10-28 — Supabase OAuth consent 404 and opaque authorization ID

**Agent:** ChatGPT
**Branch:** `fix/oauth-consent-redirect-and-opaque-authorization-id`

Added a same-origin 303 redirect from the live Supabase Authorization Path `/oauth/consent` to the canonical, admin-protected `/admin/oauth/consent`. Preserves the OAuth `authorization_id` but discards unrelated query parameters. Fixed consent page and approve/deny action validation to accept URL-safe opaque IDs instead of UUID/hex-only values. Added route/validation regression tests; no changes to MFA, roles, allowlist, tokens, or Supabase schema.

**Validation:** CI lint, typecheck, tests, security audit and production build, followed by Vercel production SHA verification; manual OAuth approval still needs browser login and a fresh authorization request.

---

## Session: 2026-10-28 — OAuth client duplicate-handling and deletion

**Agent:** ChatGPT
**Branch:** `fix/mcp-client-management-duplicate-delete`

Fixed misleading admin MFA error for duplicate OAuth client registrations: existing entries are now idempotent and editable by client ID. Added explicit permanent client removal with a two-step confirmation, preserved MFA checks and server-side service-role restrictions, updated database DELETE grant, SQL contract and unit tests. Removing an allowlist record revokes MCP access, but does not delete Supabase Auth OAuth applications or their sessions.

**Validation:** GitHub CI and PostgreSQL contract must pass before merge; OAuth handshakes need a real connected ChatGPT plugin to verify.

---

## Session: 2026-10-28 — Multi-provider editorial AI integration hub

**Agent:** ChatGPT
**Branch:** `feat/ai-integrations-hub`

Introduced a private `mcp_oauth_clients` allowlist and live per-request client checks. Added admin MFA-gated registration, disabling and re-enabling at `/admin/integrations`, with official setup instructions for Claude and OpenCode. Supabase OAuth application registration remains a separate administrative action and providers may require one-time client-side setup. Client disabling blocks future MCP requests even when the token is still valid. Added SQL privilege and revocation tests and an allowlist unit test.

**Validation:** GitHub CI, disposable PostgreSQL contract, OAuth handshake and a live registered client still require verification. Existing edit approvals and AAL2 checks remain unchanged.

---


## Session: 2026-10-28 — Admin OAuth TOTP challenge

**Agent:** ChatGPT
**Branch:** `feat/admin-oauth-mfa`

Implemented admin-only Supabase TOTP enrolment, a six-digit challenge/verify page, MFA security-settings access, and redirect back to the original OAuth consent request after reaching AAL2. Added unit tests for administrative authorization, malformed code rejection and AAL2. The feature does not automatically enable a new OAuth client or store TOTP secrets in the database.

**Validation:** GitHub CI run to confirm test, lint, typecheck and build. Live enrollment remains an explicit browser action by the administrator.

---

## Session: 2026-10-28 — Secure NEUROKLAST content MCP hardening

**Agent:** ChatGPT
**Branch:** `feat/secure-ai-content-mcp`

Added strict content-specific MCP tools with OAuth client allowlisting and an administrator approval UI. Fixed Postgres contract CI incompatibility in the OAuth token RLS restriction. Replaced non-atomic approval with a single privileged PostgreSQL function, including proposal/row locking, change snapshot verification, independent SQL field allowlists and audit status in one transaction. Added SQL contract tests in the existing disposable database workflow, and before/after review details.

**Verification:** Existing PR CI earlier passed lint, typecheck, tests and build. Re-run CI and contract workflow for the last schema/test changes. Live OAuth configuration and end-to-end connectivity are not yet verified. No production OAuth client or credentials were created.

---


## Session: 2026-10-26 — Automatic NEUROKORE download releases

**Agent:** Codex
**Branch:** `codex/automatic-neurokore-releases`

Added server-cached discovery of the fixed public NEUROKORE GitHub feed to the existing catalogue and gated download route. Preserved other plugins, CMS controls and R2 platform builds; corrected distinct installer/ZIP selection and legacy numeric beta ordering. No database, licence, media or payment mutations are introduced. Checks and production verification are recorded in the delivery summary.

---

## Session: 2026-10-21 — Products CMS + section toggle (NEUROKORE)

**Agent:** grok-4.6
**Branch:** `codex/neurokore-licensing`

### Done
- Admin `/admin/products`: section on/off (`site_config.sections` id `products`, default hidden) plus CRUD for product cards (R2 image, description, site path or http(s) href, price label, per-item visibility).
- Homepage Products section; `/neurokore` and `/neurokore/account` follow that toggle.
- Plugin licensing unchanged: NeuroCore still activates at `POST /api/license/v1/activate` (Ed25519 v2). Admin can issue keys with the public section off. `NEUROKORE_SALES_ENABLED` remains the Stripe-only env flag.

---

## Session: 2026-09-18 — Overlay close, click embeds, frame glow

**Agent:** grok-4.6

### Done
- Overlay close: hold snapshot, reverse boot, then clip exit
- EmbedConsentGate is one HUD click (no LatchRail)
- Spotify IFrame height from box pixels (232/352)
- Classic overlay: translucent panel + pulsing frame glow
- OverlayHost title uses hero artist name

---

## Session: 2026-09-18 — Hatch motion kit + seamless handoffs

**Agent:** grok-4.6
**Branch:** current

### Objectives
1. Shared latch physics + HUD primitives
2. Terminal arm → hatch → live without unmount
3. Overlay boot → content PhaseCrossfade
4. YouTube/Spotify jack-in (explicit consent kept)

### What Was Done
Motion kit (`lib/latch-physics.ts`, `LatchRail`, `PhaseCrossfade`, `HudReadout`). `/nk-sec` keeps one shell. Overlay interiors share ProgressMeter. Embeds: compact rail + load button. Cookie banner unchanged.

### What Was Tested
`npm run lint` (0 errors), `npm run typecheck`, `npm run build`, `npm run test` (1091 passed).

---

## Session: 2026-09-08 — UI/UX P2/P3 + Secret Terminal revival

**Branch:** `feat/hero-legal-overlay`

### Done
- Gig/release cards: overlay button + sibling links (no nested `role=button`)
- Unsaved-changes hook on Look & Feel, gigs, members, partners, bio, simple text
- Admin `htmlFor` via `AdminField` on those forms
- Reduced-motion: Classic nav/hero/footer/loader, overlays, cookie banner, overlay clip-path
- Safe-area: overlay close, hero caret, admin mobile nav
- Footer contrast: `text-xs` instead of `text-[10px]`
- Secret Terminal migrated to Next: `CyberpunkOverlay` type `terminal`, `POST /api/terminal`, Look & Feel → Terminal, Konami + Morse + cheat URL

---

## Session: 2026-04-02 — Comprehensive Performance Optimization

**Agent:** GitHub Copilot Coding Agent
**Branch:** `copilot/performance-optimization-band-land-project`

### Objectives
1. Code-splitting: make more components lazy in App.tsx
2. Three.js lazy loading: verify Logo3D is already lazy (no changes needed)
3. manualChunks: configure vendor chunk splitting in vite.config.ts
4. Remove duplicate icon library: replace lucide-react with @phosphor-icons/react
5. CSS splitting: break index.css into base.css + animations.css
6. Compression: add vite-plugin-compression2 for gzip + brotli

### What Was Done

#### Prio 1 — Code-Splitting (App.tsx)
- Converted 7 additional imports from static to `React.lazy()`:
  `AdminButton`, `AdminLoginDialog`, `AudioVisualizer`, `OverlayEffectsLayer`,
  `MovingScanline` (named export), `SystemMonitorHUD` (named export), `LicenseStatusBadge`
- All new lazy components wrapped in `<Suspense fallback={null}>` (invisible elements)
  or `<Suspense fallback={<CyberSpinner />}>` (blocking admin UI)
- Named exports handled via `.then(m => ({ default: m.ComponentName }))` pattern

#### Prio 2 — Three.js Lazy Loading
- No changes required: `Logo3D` was already lazy-loaded in `Hero.tsx` and
  `CyberpunkLoader.tsx` via `React.lazy()`. Three.js is not in the initial bundle.

#### Prio 3 — manualChunks in Vite
- Added `output.manualChunks` to `vite.config.ts` with 6 vendor groups:
  `vendor-react`, `vendor-radix`, `vendor-three`, `vendor-motion`,
  `vendor-charts`, `vendor-i18n`

#### Prio 4 — Remove Duplicate Icon Library
- `@phosphor-icons/react` is used in 90 files; `lucide-react` in only 1 file
- Replaced `AlertTriangleIcon` → `Warning` and `RefreshCwIcon` → `ArrowsClockwise`
  in `src/ErrorFallback.tsx`
- `lucide-react` remains in `package.json` (only 1 file used it; not removed to avoid
  breaking any indirect peer-dep)

#### Prio 5 — CSS Splitting
- Created `src/base.css` (328 lines): @layer base, :root variables, @theme, base
  element styles (html, body, scrollbar, dialogs, headings, utility classes)
- Created `src/animations.css` (1698 lines): all @keyframes and animation classes
- `src/index.css` reduced to 4 `@import` lines; rule order + specificity preserved

#### Prio 6 — Brotli/Gzip Compression
- Installed `vite-plugin-compression2` (v2.5.3) as dev dependency
- Configured both `gzip` and `brotliCompress` algorithms in `vite.config.ts`
- Compression only active for production builds; `.gz` and `.br` files excluded from
  being re-compressed to avoid double-compression

### What Was Tested
- Full test suite: 1291 tests across 68 files — all pass
- TypeScript: `tsc --noEmit` exits with code 0 (no errors)

### Results
- ✅ All 6 priorities implemented
- ✅ No regressions in test suite
- ✅ All existing UI features preserved (Terminal, Admin, Theme System, all Sections)
- ✅ TypeScript strict: no `any` types, no `@ts-ignore`

---



**Agent:** GitHub Copilot Coding Agent  
**Branch:** `copilot/create-documentation-system`

### Objectives
1. Create comprehensive documentation system (`docs/` directory)
2. Replace hero logo glow effect with chromatic aberration on hover
3. OWASP security audit and targeted hardening

### What Was Done

#### Part 1 — Documentation System
- Created `docs/` directory with five structured markdown files:
  - `PROJECT_STATUS.md` — feature checklist, architecture overview, known issues
  - `DEVELOPMENT_LOG.md` — this file; session-based change log
  - `LESSONS_LEARNED.md` — technical decisions and what to avoid in future sessions
  - `AGENT_PROTOCOL.md` — mandatory plan→implement→test cycle for all future agent sessions
  - `SECURITY_AUDIT.md` — OWASP audit findings and fix status
- Updated `README.md` to link to all new docs

#### Part 2 — Hero Logo Chromatic Aberration
- **Removed** static `drop-shadow` glow from hero logo wrapper div (`src/components/Hero.tsx` line ~202)
- **Added** CSS class `hero-logo-chromatic-hover` in `src/index.css`:
  - No glow at rest
  - On hover: subtle 2px RGB channel split (red left, cyan/blue right)
  - `transition: filter 0.2s ease-out` for smooth in/out
  - Only applies on devices with a true hover pointer (`@media (hover: hover)`)
- Updated comment in `Hero.tsx` to document the new approach

#### Part 3 — OWASP Security Audit & Hardening
- **CSP improvements** (`vercel.json`):
  - Added `upgrade-insecure-requests` directive
  - Added `https://nominatim.openstreetmap.org` to `connect-src` (admin gig geocoding in `GigEditDialog.tsx` makes direct fetch calls to this host — previously blocked by CSP)
- **CORS hardening** (`api/contact.ts`, `api/newsletter.ts`):
  - Replaced hardcoded `Access-Control-Allow-Origin: *` with `process.env.ALLOWED_ORIGIN || '*'`
  - Consistent with existing pattern in `api/image-proxy.ts` and `api/image-proxy-protected.ts`
  - Set `ALLOWED_ORIGIN=https://yourdomain.com` in production env to restrict cross-origin POST

### What Was Tested
- Verified `src/components/Hero.tsx` no longer contains inline glow filter
- Verified `src/index.css` contains new `hero-logo-chromatic-hover` class with correct `@media (hover: hover)` scoping
- Verified `vercel.json` CSP includes `upgrade-insecure-requests` and Nominatim in `connect-src`
- Verified `api/contact.ts` and `api/newsletter.ts` use `ALLOWED_ORIGIN` env var
- Ran full test suite: 1005 tests across 61 files — all pass

### Results
- ✅ All planned changes implemented
- ✅ No regressions in test suite
- ✅ Hero logo: glow removed, chromatic aberration on hover
- ✅ Security headers: CSP strengthened
- ✅ CORS: restricted from wildcard to configurable origin

---

*Add new sessions above this line.*
