# Lessons Learned
## Session: 2026-10-29 — atomically update theme state, not several React hooks

A selected look modifies the theme, accent, chromatic strength, grain, vignette, CRT, scanlines and noise together. A pure reducer avoids spreading this transition across independent setters and makes invariants directly testable. Keep `useReducer` field updates typed, honor functional overlay update callbacks against the **latest** draft, and leave save-state and user input concerns outside the persisted draft. Confirm that the exact serialized payload and cross-tab preview broadcast are unchanged. Never run builds in GitHub Actions.

---

## Session 2026-10-29 — centralize editor payloads without changing JSON semantics

A controlled React editor can safely delegate the final visual-effects accordion, but the parent must still own all state and save/draft side effects. When extracting the form payload into a pure helper, preserve exact serialized key order (used by unsaved-change comparisons), null handling for blank media and the fallback animation when the pool is empty. Test the data mapping separately from Radix UI. jsdom requires a local ResizeObserver stub for slider component tests. GitHub workflows must remain build-free.

---


## Session: 2026-10-29 — extract stateful admin UI as controlled sections

A large React editor can be reduced safely by first extracting **controlled visual sections**, not moving its form state or server action. Keep accordion default-open behavior, all Radix props, current selection styling, callback order and the exact serialized `payload` unchanged. For shared visual controls, preserve one source of markup and use interaction-focused tests. The parent remains the sole owner of the `updateSiteConfig` call, dirty tracking and live preview broadcasts. Do not run Next.js builds in GitHub Actions.

---

## Session: 2026-10-29 — parse appearance storage outside the React editor

The `AppearanceEditor` combined UI rendering and state with pure compatibility parsing for stored site settings. Extract the latter **without altering its default values or validation behavior**. Contract tests must pin boolean `false`, numeric `0`, legacy look aliases, custom presets and clip animation fallbacks. UI draft broadcasts, unsaved-change prompts and the `updateSiteConfig` action stay in the component. Keep the refactor separate from design changes and check non-build GitHub CI; local production build/E2E still requires the maintainer.

---


## Session: 2026-10-29 — extract pure sitemap mapping without changing ISR

Sitemap XML, published URL mapping, and public Supabase selection were combined in a single route handler. Move deterministic XML serialization and mapping into `lib/sitemap-entries.ts`, but leave auth-free cookie-less Supabase reads, `active=true` filters, publication limits, domain-level fallbacks, response headers and revalidation in `app/api/sitemap/route.ts`. Guard exact static URL order, XML escaping, locale coverage and query filters with pure and adapter-level regression tests. Do not replace `createPublicClient()` with cookie-based clients; this would disable ISR. GitHub Actions must remain free of build steps.

---

## Session 2026-10-29 — avoid costly GitHub build jobs

Both the general CI and Lighthouse workflows contained `npm run build`, contrary to the explicit local-build-only requirement. Remove the build job and the auto-building Lighthouse workflow, then enforce the restriction with a script that scans the remaining workflows. Keep non-build tests, typechecking and security audit. A green CI means **no** GitHub production build was attempted; local build and browser/Lighthouse checks must be reported separately. Consolidate duplicated API domain contracts as pure functions with regression cases before editing route adapters.

---


## Session: 2026-10-29 — remove exact mirrors only after dependency classification

The import inventory reported 16 remaining exact `src/` mirrors with no literal importers. Each file's SHA was compared to its canonical counterpart before deleting the legacy copy. A zero-exact-mirrors regression test protects the structure, but zero literal imports does not establish runtime dead code in the presence of dynamic names, asset URLs or conventions. Other legacy modules require a separate dependency review.

---

## Session: 2026-10-29 — separate exact duplication from static reachability

A duplicate Git blob is safe to consolidate only after updating every known importer to the canonical implementation. `src/lib/fetch-retry.ts` and `src/lib/contrast.ts` were identical to root counterparts but still used by legacy relative imports. Preserve behavior by changing those imports first. For remaining modules, `npm run audit:legacy` gives **static import evidence**, not authorization to delete files with zero static importers; assets and dynamic resolution can escape that graph.

---

This file captures technical decisions, pitfalls, and actionable lessons from each development session. Future agents and developers should read this before starting a new session.

---

## Session: 2026-10-29 — refactor by contracts, not filenames

`src/` contains 486 files, including 216 tests and a CSS file imported by the live app. 106 files have a same-named root counterpart, but many have diverged. A filename overlap or identical blob is not evidence that a file can be removed. Preserve known entrypoints and server-action permissions, add behavior-parity tests before consolidating implementations, and keep legacy discovery as a read-only audit until a dependency graph and UI tests prove removal safe. See `docs/REFACTOR_AUDIT_2026-10-29.md`.

---

## Session: 2026-10-28 — OAuth MFA assurance does not propagate to tokens

Supabase creates a distinct OAuth session with AAL1 when the browser's admin consent session is AAL2. Requiring JWT `aal2` on the MCP API guarantees 403 `action discovery failed` even after successful OAuth. Keep MFA as a verified condition of the server-side approval and record a private, expiring user/client attestation. MCP bearer requests must verify both the genuine `auth.sessions.oauth_client_id` and nonrevoked `auth.oauth_consents` using a service-role-only function. Never silently accept arbitrary AAL1 tokens and never grant a client access merely because it is in the allowlist. Existing already-approved clients need a secure admin MFA re-attestation path.

---

## Session: 2026-10-28 — ChatGPT action discovery after OAuth

OAuth success only validates client identity and the authorization grant. ChatGPT then performs a separate MCP tool-discovery handshake. The manually implemented MCP server only supported legacy `initialize`/`tools/list`; modern MCP clients can request `server/discover` and require `resultType`, `cacheScope`, `ttlMs`, and supported protocol versions. Implement both modern and legacy paths, preserve authorization on every method, and add tests with representative wire-format requests. Only log sanitized reasons for server-side bearer rejections; never log credentials.

---

## Session: 2026-10-28 — OAuth authorization redirect and opaque request IDs

Supabase's OAuth Server Authorization Path is independently configured in its dashboard and is concatenated with Auth Site URL. The live setting pointed at `/oauth/consent`, while our only UI lived at `/admin/oauth/consent`, resulting in 404 before login. Always provide a compatible redirect or verify the exact dashboard setting before connecting a client. `authorization_id` is an opaque token, **not necessarily a UUID or hex**, so reject only invalid URL-safe formats and delegate authentication to Supabase. Never insert the token into a client-controlled external redirect.

---

## Session: 2026-10-27

YouTube embeds need a non-empty HTTP `Referer` to identify the embedding site. `referrerPolicy="no-referrer"` on an iframe overrides the correct global `Referrer-Policy` header and can trigger YouTube error 153. Use `strict-origin-when-cross-origin` on all YouTube iframes so only the site origin is shared cross-site. Preserve two-click consent so no YouTube request occurs before the visitor opts in.

## Session: 2026-10-26

GitHub asset SHA-256 digests establish download identity, not Authenticode signing. Public release imports must keep signature status unverified, validate exact repository asset URLs and retain the existing product visibility/download gates. Legacy CMS beta versions can omit their suffix; compare them using their declared channel before selecting a newer external release.

## Session: 2026-10-25

### What to Avoid

**Do not load Spotify `embed/iframe-api/v1` under production CSP.**  
That script (`iframe_api.*.js` on `embed-cdn.spotifycdn.com`) calls `eval()`. Production `script-src` has no `unsafe-eval` (dev-only for React Refresh). Use a static `https://open.spotify.com/embed/{type}/{id}` iframe after two-click consent (`SpotifyEmbed` + `spotifyEmbedUrl`). Adding `'unsafe-eval'` to production CSP would re-open the Next-runtime hole this policy closed.

---

## Session: 2026-09-18

### What Worked

**One progress value, many channels.** Hatch quality comes from coupling handle/fill/ticks/servos/HUD to the same 0–1 physics tick — not extra CSS animations.

**PhaseCrossfade instead of XOR unmount.** `loading | glitch | revealed` as exclusive trees is the hard cut. Keep outgoing mounted while incoming clips in on the same progress.

### What to Avoid

**Do not unmount the terminal gate on grant.** `if (!unlocked) return Gate` drops chrome and kills continuity. Keep one shell: arm → hatch → live.

**Cookie consent is not a hatch.** Accept/Reject must stay equally prominent. Two-click embeds may use LatchRail plus an explicit load button.

---

## Session: 2026-09-14

### What Worked

**Static `public/sitemap.xml` shadows rewrites.** Next/Vercel serve files in `public/` before `rewrites()`. A one-URL placeholder sitemap hid `/api/sitemap` (releases, gigs, legal, news). Delete the static file; keep the rewrite in both `next.config.mjs` and `vercel.json`.

**TTDSG vs TDDDG.** The cookie banner `essentialDesc` still said TTDSG after the privacy templates moved to TDDDG. Grep both `TTDSG` and `TMG` in i18n + locales, not only `lib/legal-i18n.ts`.

### What to Avoid

**Do not add GSAP alongside Lenis.** Smooth scroll is owned by `LenisProvider` in root `Providers`. Scroll-linked video uses `attachScrollVideoSync`. A second scroller (ScrollTrigger without `scrollerProxy`) fights Lenis. Circuit parallax stays on Framer `useScroll`.

---

## Session: 2026-04-01

### What Worked

**Alpha-channel-aware CSS filters on image wrappers**  
The existing codebase already had the correct pattern: `filter: drop-shadow()` must sit on a _wrapper div_, not directly on `<img>`. This is because `drop-shadow` respects the alpha channel of the image (follows the silhouette), but only when there is no `overflow: hidden` on the wrapper. This pattern should be preserved for any future logo/image effects.

**Using existing CSS class patterns**  
The codebase had `.chromatic-aberration-hover` and `.hover-chromatic-image` already established. When adding the new `hero-logo-chromatic-hover` class, following the same pattern (transition on the base class, effect inside `@media (hover: hover)`) kept the CSS consistent and touch-device-safe.

**CORS pattern already existed in image-proxy**  
`api/image-proxy.ts` already used `const CORS_ORIGIN = process.env.ALLOWED_ORIGIN || '*'`. Reusing this exact pattern in `contact.ts` and `newsletter.ts` was the right approach — no new env vars, no breaking changes.

**Zod validation coverage is comprehensive**  
`api/_schemas.ts` already validates every API endpoint. No injection risks found. The existing approach (validate → reject early → process) is solid and should be maintained.

### What to Avoid

**Do not remove the `drop-shadow` wrapper comment**  
The German comment `ALPHA-KANAL-GLOW: filter: drop-shadow() MUSS auf dem Wrapper-<div> sitzen` exists for a reason. Future agents might misread this and try to apply the filter directly on `<img>`, breaking the effect. The comment was updated to reflect the new "chromatic hover" approach but the underlying principle remains.

**Do not remove the `chromatic-aberration-hover` class from the title image**  
The hero title (`src/components/Hero.tsx` lines ~241-284) still uses `chromatic-aberration-hover` for the band name title image. This is intentional and separate from the logo hover effect.

**Do not wildcard `Access-Control-Allow-Origin` on state-mutating endpoints**  
Using `*` on POST/DELETE endpoints that write to KV (contact messages, newsletter subscriptions) allows cross-origin forgery by malicious sites. Always use `ALLOWED_ORIGIN` env var or `'self'`-equivalent pattern.

**Do not tighten `img-src 'self' data: https:` without understanding consequences**  
The admin allows arbitrary image URLs (cover art, member photos, band logos). Restricting `img-src` to specific domains would break admin functionality. Any CSP tightening here requires auditing all places where user-provided image URLs are rendered.

**Do not add `script-src 'unsafe-inline'`**  
The current CSP correctly uses `script-src 'self'` with no unsafe-inline. Adding unsafe-inline would defeat XSS protection. If inline scripts are ever needed, use a nonce-based approach.

**Do not merge Jules AI PRs blindly**  
PRs #322, #332, #341, #344 all have "OMNI-PROTOCOL" in the title. They make overlapping/conflicting changes and were all generated by Jules AI without proper review. Close them rather than merging.

### Technical Decisions

**Why `ALLOWED_ORIGIN || '*'` instead of hardcoded origin?**  
The site can be deployed by different teams to different domains (as it was originally a template). Using an env var allows each deployment to configure its own origin without code changes. The `'*'` fallback preserves backward compatibility for existing deployments that don't set the variable.

**Why `@media (hover: hover)` wrapper for chromatic aberration?**  
On touch devices, `:hover` stays activated after a tap (sticky hover). Without the media query guard, users on mobile would see the chromatic effect permanently after tapping the logo. The `@media (hover: hover)` guard limits hover effects to devices with a true pointing device.

**Why `upgrade-insecure-requests` in CSP?**  
This directive instructs browsers to upgrade any HTTP sub-resource requests to HTTPS automatically, providing a defense-in-depth layer against accidental mixed content. It does not replace HSTS but complements it.

**Why add Nominatim to `connect-src`?**  
`src/components/GigEditDialog.tsx` makes a direct `fetch()` call to `https://nominatim.openstreetmap.org/search` for geocoding gig venues. Without this entry in `connect-src`, the fetch would fail silently with a CSP violation, breaking venue coordinate lookup in the admin.
