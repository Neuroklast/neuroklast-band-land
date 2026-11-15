# Security & GDPR

## Security and audit completeness: never use dirty fixes

The [mandatory root-cause engineering standard](../../AGENTS.md#mandatory-engineering-standard-no-quick-fixes) applies especially to auth, MFA, financial transactions, licences, customer data and auditing. **No silent security or audit failures, fake success responses, disabled guards, local-only security evidence or ad hoc bypasses.** Check returned Supabase `error` objects, not just thrown exceptions. Design atomic, audited mutations or a durable, monitored outbox when events cannot be committed together.

Differentiate unauthenticated, forbidden, invalid, conflicting and unavailable responses. Refuse to claim a protected operation succeeded without evidence. Never sacrifice these guarantees to make a page load. See [A-01, A-06 and A-08 in the audit](../ARCHITECTURE_DEBT_AUDIT_2026-11-15.md).

## Embeds (TDDDG / GDPR)

Spotify, YouTube, SoundCloud: **never** auto-load. Two-click consent before `<iframe>`. Spotify must be a static `open.spotify.com/embed` iframe. Do **not** load `https://open.spotify.com/embed/iframe-api/v1` — that script eval()s and production CSP forbids `unsafe-eval`.

YouTube iframes must use `referrerPolicy="strict-origin-when-cross-origin"` because YouTube requires the embedding site's origin in the `Referer` request header (otherwise player error 153). This shares the origin, not the full URL path, with YouTube only after the visitor has consented.

## Public forms

- Contact + newsletter: honeypot (`_hp`), Zod validation, Resend delivery
- Contact subject/body word blacklist: admin-only `/admin/contact-spam` (`site_config.contact_spam_filter`), Unicode whole-word/phrase matching before DB insertion or Resend; the sender sees an explicit spam-suspicion rejection with Impressum fallback. Malformed or unreadable config fails closed. The `site_config` RLS public-read policy excludes `contact_spam_filter`; admin/service-role access remains available. Do not expose rule lists publicly or log rejected message content.
- Rate limits via `lib/rate-limit.ts` (Supabase Postgres, hashed IP + `RATE_LIMIT_SALT`, fail-closed)

## Rate limiting (no Redis)

Distributed, durable rate limiting runs on the **existing Supabase Postgres** (`lib/rate-limit.ts` → `public.rate_limits` + `consume_rate_limit()` in `supabase/schema.sql`).
- Keys are SHA-256(`RATE_LIMIT_SALT` + IP) — never raw IPs (GDPR).
- **Fail-closed** on infra errors. Callers deny the request when Postgres is down. A per-process memory counter would reset on every cold start.
- Set `RATE_LIMIT_SALT` in production — `lib/rate-limit.ts` throws if missing.
- Throttled: admin login, analytics POST, contact, `/api/media-fix`, `/api/partner-logo`, `/api/bandsintown`.

## Storage & consent

- Analytics / tracking localStorage: gated by `CookieConsent` + `lib/consent.ts`
- Functional prefs (theme, locale, sound): permitted without analytics consent
- Import consent helpers from `@/lib/consent`, not from `CookieConsent` in non-UI modules

## Data minimization

Never log plaintext IPs — use hashed IPs (`lib/rate-limit.ts`) where server-side identification is needed. Contact form must not log email/name in production.

## Legal content (Supabase only)

| Field path | Purpose |
|------------|---------|
| `site_config.legal.operatorName` | Legal name |
| `site_config.legal.street` | Street + number (service of process) |
| `site_config.legal.zipCity` | Postal code + city |
| `site_config.legal.email` | Contact |
| `site_config.legal.privacyPolicyCustom` | Full policy override (optional) |

Templates: `lib/legal-templates.ts`. Human reference: [GDPR_COMPLIANCE.md](../GDPR_COMPLIANCE.md).

## Admin auth (canonical)

**Only** native form `POST` → `app/admin/login/submit/route.ts` → `signInWithPassword` via server client → cookies on **same 303 response**.

Never browser `signInWithPassword` + `router.push` (cookie race / redirect loops).

`setAll` must pass Supabase `options` unchanged. Forward `@supabase/ssr` ≥ 0.12 cache headers on all `setAll` sites.

`proxy.ts` copies refreshed cookies onto **every** redirect branch.

**Central MFA navigation:** `lib/admin-mfa-policy.ts` is the single route registry and AAL2 decision predicate for strict admin pages. `proxy.ts` checks those *GET/HEAD page routes* only after authentication and the admin-role check and redirects AAL1 administrators to `/admin/mfa?returnTo=...` with original same-origin path, query string and refreshed cookies. `/admin/mfa`, unrelated pages, API endpoints and form submissions are excluded to avoid loops or surprising HTML responses. `lib/neurokore/server.ts` reuses the predicate in `admin()` as an independent security gate. Keep the route registry in sync with any new strict admin page; never use the proxy as a substitute for server-side authorization.

**Login hardening:** the submit route is rate-limited per-IP (fail-closed) and adds a small delay on failed sign-in. It does **not** modify `profiles.role` — admin rows are created in Supabase, never auto-promoted.

**Form gotcha:** Do not `disabled` email/password inputs during submit — only disable the submit button.

Enable Supabase **Auth MFA (TOTP)** for the admin account in the dashboard.

**Change-password** (`/admin/security`): the admin can change their own password in-app. Server action `app/admin/_actions/changePassword.ts` → `requireAdmin()` → verifies `current` via `signInWithPassword` (session email/phone) → `auth.updateUser({ password: next })`. Enforces min-8 chars, match, and new≠current. **MFA-lenient:** if verification fails with an MFA/TOTP error, we proceed anyway because the signed-in session already passed the MFA challenge — an MFA-enabled admin is not blocked. For a change-password from a non-session context (e.g. forgotten password), use the Supabase dashboard (Auth → Users).

## Environment

Document and fail fast on missing security-critical env vars (`RATE_LIMIT_SALT`, Supabase keys, `SECRETS_ENCRYPTION_KEY`).

> This project does **not** use Vercel cron triggers (Vercel Free — no `crons` block in `vercel.json`). `CRON_SECRET` is optional, used only by the internal async sync-job continuation (`lib/sync-job-chain.ts`) bearer fallback, not by any Vercel scheduler.

## CSP (`unsafe-inline` styles)

Production CSP lives in `security-headers.mjs` (imported by `next.config.mjs`), not `vercel.json`. `style-src` includes `'unsafe-inline'` for Tailwind runtime classes and inline theme CSS variables. **Accepted risk** (TD-004). `script-src 'unsafe-eval'` is **development-only** (React Refresh / Turbopack). Production must not allow eval; third-party players that eval (Spotify iframe-api) are replaced with static iframes.

## SSRF

## Shared remote media download (2026-10-29)

Admin image/video cache actions use `lib/remote-media-download.ts` for guarded GET, AbortController timeout, MIME validation and byte-size assertion. The helper **always** calls `fetchUrlWithResolvedCheck`; do not replace it with ordinary `fetch` or move it outside `runAdminAction`. Image imports retain their 20-second/10 MB limits, videos 60-second/50 MB limits and each type's MIME policy.

`app/api/partner-logo/route.ts` and the admin media-fetch actions use `lib/ssrf-guard.ts` (`assertSafeRemoteUrl`): block private/metadata hosts, resolve DNS before fetch, protocol allowlist. `lib/remote-image-url.ts` shares the host blocklist for client-side URL validation.

## URLs — scheme hardening

User/admin-supplied URLs are constrained to `http`/`https`:
- Write-time: a shared `safeExternalUrl`/`safeExternalUrlOptional` guard (`lib/safe-external-url.ts`) on all external-URL schemas/actions (social, partners, gigs, merchandise, soundpacks, media downloads, music highlights, release streaming/custom links, visuals, footer legal).
- Render-time: `sanitizeExternalHref` (`lib/sanitize-href.ts`) on every DB-backed `<a href>`/download link as defense-in-depth.
- This blocks `javascript:`/`data:`/`vbscript:` click-to-XSS.

## Config

`env.mjs` validates server env vars and fails fast in production.
