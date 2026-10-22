# Plugin commerce and licensing

Multi-product catalogue for NEUROKLAST audio plugins. NEUROKORE is the first product; more plugins can be added without code changes. Sales are disabled by default and no production payment was executed.

## Routes

- `/plugins`: public catalogue of active plugins.
- `/plugins/<slug>`: product page (description, features, requirements, media, price, CTAs).
- `/plugins/<slug>/download`: anonymous downloads for published builds.
- `/neurokore`, `/neurokore/download`: permanent redirects to the NEUROKORE plugin pages.
- `/neurokore/account`: email-code sign-in, all owned licences, per-plugin downloads.
- `/admin/plugins`: every plugin product (list, create).
- `/admin/plugins/<id>`: product page settings, pricing, visibility, signing key, versions, licences.
- `/admin/products`: public "Products" section cards; plugin products are excluded and redirect to `/admin/plugins/<id>`.
- `GET /api/plugins/<slug>/download?platform=windows-x64&channel=stable`: resolves the newest published build, records an anonymous counter, redirects to a 120-second R2 URL.
- `POST /api/license/v1/activate`: key + device + optional `product` slug (default `neurokore`). Always available.
- `POST /api/plugins/<slug>/checkout`: Stripe Checkout for that product.
- `POST /api/neurokore/webhook`: Stripe raw-body HMAC verification, transactional fulfilment.
- `/api/neurokore/download` and `/api/neurokore/checkout`: compatibility aliases.

## Product model

`public.products` is the single product entity. Plugin rows use `kind = 'plugin'` and add:

- `slug` (unique, lowercase), `short_description`, `description`, `features`, `system_requirements`, `media`
- `default_channel`, `demo_downloads_enabled`, `sales_enabled`, `pricing_mode` (`paid`/`free`)
- `license_required`, `license_format` (`v2` for NEUROKORE, `v3` for new plugins)
- `active` (public visibility), `display_order`

Product secrets live in `plugin_product_secrets` (service-role only): `stripe_price_id`, encrypted per-product signing key, public key hex. They are never readable through the public Data API.

**Free plugins** use `pricing_mode = 'free'` and `license_required = false`: public download, no checkout, no licence. The download route never checks a licence, only `demo_downloads_enabled` and the published release.

## Release management

`plugin_releases` is scoped by `product_id`; `plugin_release_artifacts` keeps one row per platform/package. `plugin_download_events` stores anonymous counters. `plugin_admin_audit` records admin mutations.

- Publishing requires at least one artifact and every artifact must be validated with a 64-hex checksum and positive size (`plugin_publish_release`).
- Only `status = published` with `withdrawn_at IS NULL` is downloadable.
- Withdrawal keeps rows and files; publishing the same row again restores it.
- Storage keys are derived as `releases/<slug>/v<version>/<platform>/<filename>`; admins never type a path.
- The public RPC `plugin_public_catalog()` returns product fields, published releases and checksums only.
- The download route redirects to an R2 signed URL; binaries never stream through Vercel.

Legacy `neurokore_*` tables are renamed in place to `plugin_*` by the idempotent `schema.sql`; existing licences, orders and releases are preserved and backfilled to the NEUROKORE product.

## Signing keys and licence formats

Each plugin has its own Ed25519 key. The private key is encrypted with `NEUROKORE_KEY_ENCRYPTION_SECRET` and the product-specific AAD `plugin-signing-key-v1:<slug>`; the public key hex is shown in the admin for the plugin build.

- NEUROKORE keeps the existing v2 document (`NEUROKORE LICENSE`, product `NEUROKORE`) and falls back to `NEUROKORE_SIGNING_PRIVATE_KEY` until a key is imported. Random key generation is blocked for NEUROKORE; import the existing key if you want it stored in the database.
- New plugins use v3: envelope `format = "NEUROKLAST LICENSE"`, `version = 3`, payload `{version:3, product: slug, licenseId, device, tier, email, issuedAt, expiresAt}`, signed over `NEUROKLAST-LICENSE-V3\n` + the base64 payload.

Activation is product-scoped: a key issued for one plugin cannot activate another. NEUROKORE's v2 payload and public key are unchanged, so existing activations keep working.

## Setup order

1. Apply `supabase/schema.sql` (single idempotent file, applied by the production deploy). It renames legacy tables, adds product scoping and backfills NEUROKORE.
2. Supabase Auth: enable email sign-in, configure SMTP; the Magic Link template must show `{{ .Token }}`. Never auto-promote customers to admins.
3. `NEUROKORE_SITE_URL=https://neuroklast.net` (exact origin for CSRF checks). `NEXT_PUBLIC_DEV_MODE=false` in production.
4. `NEUROKORE_KEY_ENCRYPTION_SECRET` (64 hex chars) for licence keys and per-product signing keys. Back it up; rotation requires re-encryption.
5. `NEUROKORE_SIGNING_PRIVATE_KEY` for NEUROKORE's existing v2 key. New products get their key in Admin → Plugins → Signing key.
6. R2: `R2_BUCKET_MEDIA` (default `neuroklast-media`). Upload builds to the derived key shown in the admin.
7. Stripe TEST mode: create one Price per paid plugin, store its `price_…` ID in the product settings, set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Register the webhook for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
8. Deploy with `NEUROKORE_SALES_ENABLED=false`. Add plugins, upload and validate builds, publish, then test purchase in an isolated deployment before enabling the global switch.

## Launch checks (not executed in a live environment)

- [ ] `schema.sql` applied to a copy of production; legacy NEUROKORE rows preserved and backfilled.
- [ ] Two products coexist; a key from product A is refused by product B.
- [ ] Free product downloads without a licence; paid demo downloads without a licence.
- [ ] Draft/withdrawn/unvalidated builds are refused.
- [ ] Per-product key import/generation; plugin embeds the shown public key.
- [ ] Stripe test purchase per product, duplicate/delayed webhooks, refund procedure.
- [ ] Email sign-in, customer isolation, MFA for admin.
- [ ] R2 signed downloads in production.
- [ ] Legal/tax/privacy review for software sales.

## Operational limits

Two device seats per licence, locked atomically. Admin reset frees server seats; offline certificates remain usable until expiry/reload. There is no automatic refund revocation, self-service device transfer, background renewal or machine-authenticated build registration yet. The build pipeline must register releases through an admin session until a machine-token endpoint exists.

No secrets were created or deployed by this change. Unit/route tests cover release readiness, product scoping, public catalogue parsing, download refusal paths and licence crypto; no live database, R2 bucket, Stripe account or DAW was exercised.
