# Contact form bot protection

The public contact forms use one shared server action: `app/_actions/contact.ts`.
Blocked submissions return an ordinary success response to avoid revealing exact
spam-detection criteria. They are **not** saved in `plugin_contact_requests`
and **not** delivered via Resend.

## Layers (cheapest checks first)

1. Two hidden input decoys (`_hp` and `website`).
2. Conservative filter for obvious unsolicited B2B lead-generation pitches.
3. Existing distributed Supabase IP rate limit (5 requests / 15 minutes), fail-closed.
4. Optional Cloudflare Turnstile, verified through Siteverify on the server **before** any contact inbox insert or email.
5. A three-page, static, cacheable crawler decoy under `/crawl-decoy/`. It is deliberately fixed and does not create unbounded URLs, database entries, jobs, or server-side delays. Compliant search crawlers should ignore the nofollow/noindex links.

These layers reduce ordinary form-filling spam, but do not guarantee blocking
a human adversary or an advanced bot with valid challenge tokens.

## Activate Turnstile in production

Create a **Managed** Cloudflare Turnstile widget for `neuroklast.net`
(and `www.neuroklast.net` if used) and configure the following Vercel
environment variables, then redeploy:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: the widget's public site key
- `TURNSTILE_SECRET_KEY`: the widget's **secret** key, server-side only
- `TURNSTILE_ALLOWED_HOSTNAMES`: comma-delimited exact hostnames allowed on the verification result. Defaults to `neuroklast.net,www.neuroklast.net`.

Both keys must be present to enable verification. If only one is configured,
the server refuses delivery instead of silently turning verification off.
With neither key present, the honeypots, spam filter and rate limit still run,
but the stronger Turnstile gate is **not active**.

For preview deployments use a separate widget and hostname allowlist, not the
production secrets. The widget action must stay `contact`, as checked by
the server. Siteverify tokens are single-use and expire after five minutes.
The UI refreshes the token after each submission result. Challenge-network
failures deny sending, rather than bypassing verification.

Before enabling Turnstile on the live site, ensure the privacy notice covers
the provider's bot-protection data processing and any required disclosures.

## Verification

- `npx vitest run src/test/contact-spam.test.ts src/test/contact-turnstile.test.ts`
- `npm run typecheck`
- `npm run lint`
- Check a real test submission on the deployed domain, then verify the admin
  inbox receives it and the email provider accepts it.
- Verify the screenshot's promotional examples do not create contact rows or email.
- Check that disabled JavaScript users have an alternative email address and
  that a Turnstile failure gives an understandable retry path.
