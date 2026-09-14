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

- [ ] Footer links to `/legal-notice` and `/privacy-policy`
- [ ] Impressum says § 5 DDG, not TMG
- [ ] Operator fields filled by a human in admin
- [ ] Banner blocks non-essential embeds until opt-in
- [ ] Production is HTTPS-only
- [ ] No secrets in the client bundle
- [ ] Contact form does not log PII
