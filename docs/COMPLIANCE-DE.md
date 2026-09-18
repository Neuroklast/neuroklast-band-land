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
