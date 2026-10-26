# DE / EU launch compliance — Band Land

Agent contract. **Not legal advice.** NEVER invent operator identity.

Runtime fields: `site_config.legal.*`. Templates: `lib/legal-templates.ts`. Editor: `/admin/legal`.

Root `GDPR_COMPLIANCE.md` is historical (pre-App-Router / KV). When it conflicts with this file or the code, **this file and the code win**.

## DDG — Impressum

- Route: `/legal-notice`
- Heading MUST be `Angaben gemäß § 5 DDG`.
- NEVER generate `§ 5 TMG` (TMG replaced 14 May 2024).
- MUST render operator name, service-of-process street address (no PO box), and email from `site_config.legal`.
- If fields are empty, flag `/admin/legal` — NEVER hallucinate a GmbH or a city.
- `§ 18 Abs. 2 MStV` only if the site is journalistic-editorial. Default band promo: do not invent a Rundfunk-Verantwortlichen.

## TDDDG + DSGVO

- Consent banner before non-essential storage (`CookieConsent` + `lib/consent.ts`).
- Cite Art. 6 Abs. 1 DSGVO for personal data and § 25 TDDDG for non-essential cookies / similar tech.
- NEVER auto-load Spotify / YouTube / SoundCloud iframes.
- Functional prefs (theme, locale, sound) may run without analytics consent.
- Analytics opt-in is mirrored in a signed HttpOnly SameSite=Lax first-party cookie via /api/analytics/consent. The cookie is a gate, not a complete legal consent audit trail.
- /api/analytics requires that signed opt-in, valid event schema and IP rate limiting, then inserts server-side. Direct anon/authenticated Data API INSERT privileges and the old permissive anon policy are REVOKEd in supabase/schema.sql.
- Runtime Google Fonts requests are disabled. Five next/font families are bundled at build time; legacy non-bundled theme selections gracefully fall back to system/bundled fonts. Never reintroduce dynamic Google Fonts CDN links.
- Analytics referrers exclude query/fragment; interaction targets exclude button text and URL query strings. Account/admin/withdrawal pages are not tracked.
- Contact: honeypot `_hp` + Zod + Resend. Prefer honeypot over a cookie-heavy CAPTCHA.

## BFSG (since 28 June 2025)

If the public site is a consumer-facing service in scope: keyboard, focus, contrast, alt, labels, reduced motion must hold. NEVER write "BFSG-zertifiziert". Flag gaps for a human.

## Launch gate

- [x] Footer links to `/legal-notice` and `/privacy-policy`
- [x] Impressum says § 5 DDG, not TMG (cookie banner + setup copy cite TDDDG, never TTDSG)
- [ ] Operator fields filled by a human in admin
- [x] Banner blocks non-essential embeds until opt-in (Spotify / YouTube two-click; analytics gated by `lib/consent.ts`)
- [x] Production is HTTPS-only (Vercel TLS + HSTS + `proxy.ts` 308 on `x-forwarded-proto: http`)
- [ ] No secrets in the client bundle
- [x] Contact form does not log PII
- [x] `robots.txt` + dynamic `/sitemap.xml` (`/api/sitemap`; do not restore `public/sitemap.xml`)
- [x] Custom 404 (`app/not-found.tsx`); root metadata title/description/favicon/OG

## Outstanding production checks (not automatically certified)

- [ ] Confirm the live database applied the current schema, including analytics INSERT revocation, RLS on every exposed table and least-privilege role grants. Database apply may run automatically on production deploy only when SUPABASE_DB_URL/DATABASE_URL, admin access and VERCEL commit metadata are configured.
- [ ] In a clean browser, confirm no fonts.googleapis.com / fonts.gstatic.com or other unconsented analytics requests appear in Network before or after clicking Reject.
- [ ] Check every uploaded photo, release cover, logo, screenshot, font and graphic for a documented origin, author, license or permission and any required attribution. Code cannot independently establish ownership.
- [ ] Conduct human keyboard, screen-reader, mobile and contrast checks and confirm BFSG applicability for the actual seller and service.
- [ ] Verify correct operator data and privacy policy disclosures for all actual data flows, processors and retention periods.
- [ ] Complete Stripe test-mode orders and signed-webhook/idempotent-fulfillment tests with delivery emails and generated license.
