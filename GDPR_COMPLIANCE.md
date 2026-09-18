# GDPR Compliance Review - NEUROKLAST Band Website

## Date: 2026-09-14

### Overview
This document reviews the GDPR compliance status of the NEUROKLAST band website.

**Canonical stack (do not describe Vite, Vercel KV, or Google Drive as runtime hosting):** Next.js App Router, React, Supabase (PostgreSQL + Auth), Cloudflare R2 (all public media), Resend (contact form only). Human reference for agents: `docs/agent/security.md`.

Public legal routes: `/legal-notice`, `/privacy-policy`. Editor: `/admin/legal`. Templates: `lib/legal-i18n.ts`, `lib/legal-templates.ts`. Operator fields live in `site_config.legal` — do not invent a GmbH or fill Stammdaten from training data.

### Data Collection & Processing

#### ✅ Compliant Features

1. **Cookie Banner**
   - `CookieConsent` + `lib/consent.ts` (`zd-cookie-consent`)
   - Users can accept or reject optional analytics
   - Functional prefs (locale, theme, sound) do not require analytics consent
   - Footer link to `/privacy-policy` sits outside the banner

2. **First-party storage**
   - Consent and functional prefs in localStorage
   - Optional analytics events in Supabase `analytics_events` only after explicit consent (retention described in the privacy template: up to 90 days)
   - No third-party advertising or tracking cookies
   - No Meta / Google Analytics pixel in the public bundle

3. **Transparent Data Usage**
   - Public privacy policy at `/privacy-policy` (Art. 6 GDPR + § 25 TDDDG)
   - Public legal notice at `/legal-notice` (§ 5 DDG, Haftung §§ 7–10 DDG)
   - Multi-language templates; German custom override only if `privacyPolicyCustom` / `legalNoticeCustom` is set

4. **User Rights**
   - Consent can be withdrawn via Cookie Preferences in the footer
   - Contact is Resend email delivery only — no inbox, no newsletter list
   - Admin content is edited in `/admin/*` (Supabase Auth, `profiles.role = admin`)

5. **Legal Pages**
   - `/legal-notice`, `/privacy-policy`
   - Structured operator fields injected into templates
   - Optional full-text override in `/admin/legal` (German locale only)

#### 📋 Data Processing Activities

**Browser storage:**
- `zd-cookie-consent`: consent choice
- `zd-locale`: language preference
- Theme / sound mute and similar functional prefs
- IndexedDB image cache (performance; no profiles)

**Server-side (Supabase Postgres, not Vercel KV / Redis):**
- Site content and `site_config`
- Admin sessions via Supabase Auth cookies
- Optional consented analytics events
- Rate-limit state: SHA-256 hashed IP + `RATE_LIMIT_SALT`, fail-closed (`lib/rate-limit.ts`)
- Contact submissions are emailed via Resend and are not stored in the database

**External services:**
- Vercel: hosting
- Cloudflare R2: media files (never Supabase Storage)
- Resend: transactional contact email
- wsrv.nl: optional image proxy
- iTunes / Odesli / Spotify / YouTube APIs: public catalogue and two-click embeds (players load only after explicit click)
- Google Drive appears only as an **admin import helper**; files are cached to R2. Drive is not public image hosting.

#### ⚠️ Privacy Considerations

1. **Third-Party Services**
   - Privacy policy covers Vercel, Supabase, R2, Resend, wsrv.nl, and two-click Spotify/YouTube
   - Legal basis for hosting/CDN: Art. 6(1)(f) GDPR
   - Embeds: Art. 6(1)(a) GDPR (explicit two-click)

2. **Analytics**
   - First-party only, after cookie-banner opt-in
   - No advertising network
   - Do not document Meta/GA if they are not in the bundle

3. **Admin Features**
   - Supabase Auth (`/admin/login`), not a local scrypt password hash
   - `profiles.role = admin`

4. **Rate Limiting & Attack Defense (Art. 6(1)(f) GDPR)**
   - IP addresses are pseudonymised using SHA-256 + secret salt before processing
   - Hashed IP is used solely for rate-limit enforcement
   - No plaintext IP addresses are stored or logged
   - Legal basis: legitimate interest in protecting the website (Art. 6(1)(f) GDPR)

5. **Public forms**
   - Honeypot (`_hp`), Zod validation, Resend delivery
   - No newsletter product on the public site

### GDPR Rights Implementation

✅ **Right to Access**: contact via Legal Notice email; browser storage is user-controlled
✅ **Right to Erasure**: users can clear browser data; rate-limit hashes are short-lived
✅ **Right to Rectification**: admin can update content
✅ **Right to Object**: users can reject analytics consent
✅ **Transparency**: `/privacy-policy` and `/legal-notice`

### Security Measures (Art. 32 GDPR)

| Measure | Implementation |
|---|---|
| Admin authentication | Supabase Auth + HttpOnly cookies; optional TOTP MFA in the dashboard |
| Input validation | Zod schemas on public and admin actions |
| Rate limiting | Postgres sliding window, hashed IPs (`lib/rate-limit.ts`) |
| SSRF protection | `lib/ssrf-guard.ts` on remote fetch |
| XSS prevention | Sanitised hrefs, two-click iframe sandboxing |
| Media | Cloudflare R2 only |

### Compliance Status

**Overall GDPR Compliance: ✅ Good** (runtime described by `docs/agent/security.md` and the legal templates — not by the former Vite/KV stack)

### Action Items

Priority | Item | Status
---------|------|-------
High | ✅ Cookie consent banner | Complete
High | ✅ Privacy policy (Art. 6 GDPR / § 25 TDDDG) | Complete
High | ✅ Legal notice (§ 5 DDG) | Complete
High | ✅ Rate limiting with IP hashing | Complete
High | ✅ Two-click Spotify/YouTube | Complete
Medium | ⚠️ Review processor DPAs in each provider dashboard | Operator
Low | — BFSG certificate / extra a11y statement | Out of scope unless a concrete bug is named

### Contact

For GDPR-related questions, use the email in `/legal-notice`.
