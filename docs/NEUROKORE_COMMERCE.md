# Plugin commerce and licensing

Multi-product catalogue for NEUROKLAST audio plugins. NEUROKORE is the first product; more plugins can be added without code changes. Sales are disabled by default and no production payment was executed.

## Routes

- `/plugins`: public catalogue of active plugins.
- `/plugins/<slug>`: product page (description, features, requirements, media, price, CTAs).
- `/plugins/<slug>/download`: anonymous downloads for published builds.
- `/neurokore`, `/neurokore/download`: permanent redirects to the NEUROKORE plugin pages.
- `/neurokore/account`: email-code sign-in, all owned licences, per-plugin downloads.
- `/admin/plugins`: **Products & Plugins** — one list for every product (plugins and legacy cards).
- `/admin/plugins/<id>`: product page settings, pricing, visibility, signing key, versions, licences.
- `/admin/products` and `/admin/products/new`: redirect to `/admin/plugins`; the old card editor is retired.
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
- Withdrawal keeps rows and files. After withdraw you can change the version number or replace a download, then mark as ready and publish again.
- Storage keys are derived as `releases/<slug>/v<version>/<platform>/<filename>`; admins never type a path.
- The public RPC `plugin_public_catalog()` returns product fields, published releases and checksums only.
- CMS downloads redirect to an R2 signed URL; binaries never stream through Vercel.

### Automatic NEUROKORE releases

Published Windows releases from the fixed public repository `Neuroklast/NeuroCore` are discovered server-side. The GitHub response is cached for five minutes; public page revalidation can add a short delay. Publishing with NeuroCore's local `publish_release.bat` updates the public download catalogue without another website deployment, webhook or scheduled job. No GitHub token or visitor-side API request is needed.

Only published, non-draft versions with the expected installer, matching checksum asset, positive bounded sizes, GitHub SHA-256 digests and exact official download URLs are accepted. A ZIP is shown only with its own checksum asset. Stable, beta and alpha channels remain separate; RC tags use the beta channel. Legacy numeric-only CMS betas are compared using their channel, so `0.8.0` in beta does not hide a newer `0.8.0-beta.1`.

The newest download is selected per channel/platform/package. CMS artifacts win at an identical version, and existing R2 macOS downloads retain their own version labels. Other products keep their CMS release policy. Hidden products and disabled public downloads remain blocked. Installer and ZIP links include an explicit `package` parameter so they cannot resolve to the same file accidentally.

GitHub downloads redirect directly to the allowlisted release asset and are not copied into R2 or written as synthetic CMS releases. Their SHA-256 and size are public metadata; signature status is shown as **Not independently verified**, since GitHub asset metadata does not prove Authenticode signing. GitHub redirects do not create `plugin_download_events` rows for nonexistent CMS artifact IDs. Licences and checkout are unchanged. A GitHub outage falls back to existing CMS/R2 downloads. To withdraw a GitHub-provided version, withdraw/delete that release on GitHub as well; CMS withdrawal alone affects only its R2 copy.

Legacy `neurokore_*` tables are renamed in place to `plugin_*` by the idempotent `schema.sql`; existing licences, orders and releases are preserved and backfilled to the NEUROKORE product.

### Uploading a build

Admin → Products & Plugins → product → Versions & downloads → **Upload or replace a build**:

1. Choose platform, file type, file and signature status. Same platform + file type replaces the existing download.
2. The browser computes SHA-256 for files up to 256 MB. Larger files need the checksum pasted (`sha256sum <file>`).
3. The file goes directly to R2 under `releases/<slug>/v<version>/<platform>/<filename>` (single PUT below 8 MB, multipart above, hard cap 2 GB). Binaries never pass through Vercel.
4. Registration re-derives the key, verifies the object size with an R2 HEAD and stores name, size and checksum. A replaced file with a new name deletes the previous R2 object.
5. **Mark as ready** → **Publish**. Published versions appear on `/plugins/<slug>/download`.

`Delete` removes the database row and the R2 object. Published versions must be withdrawn before their downloads or version number can be edited. After a replace, mark as ready again, then publish.

### Deleting a product

Deletion is allowed only while the product is hidden (`active = false`) and has **no paid orders** (`plugin_orders.license_id IS NULL`). It removes the product, releases, artifacts, download events, licences, devices, abandoned checkouts, the encrypted signing key and all audit rows for that product, then deletes the R2 files. No audit row is written for the deletion itself. A public product must be hidden first; a product with a fulfilled order stays for accounting.

### Visibility, downloads and sales are separate

- **Public page** (`products.active`): controls whether `/plugins/<slug>` exists at all. A hidden product returns 404. New products start hidden; use **Make public** on the product page.
- **Downloads** (`demo_downloads_enabled`): controls whether the download route serves the published build.
- **Sales** (`sales_enabled` + global `NEUROKORE_SALES_ENABLED`): controls only the checkout. Turning sales off never hides the page or demo downloads.

`/neurokore` permanently redirects to `/plugins/neurokore`; another plugin lives at its own slug.

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

Two device seats per licence, locked atomically. Admin reset frees server seats; offline certificates remain usable until expiry/reload. There is no automatic refund revocation, self-service device transfer, background renewal or background renewal. Machine-authenticated NEUROKORE release registration is available through the fixed release-sync endpoint below. Other products continue using Admin → Plugins.

No secrets were created or deployed by this change. Unit/route tests cover release readiness, product scoping, public catalogue parsing, download refusal paths and licence crypto; no live database, R2 bucket, Stripe account or DAW was exercised.

## Release Manager product sync

The same server-only 64-hex `NEUROKORE_RELEASE_SYNC_TOKEN` is configured in Vercel Production and locally in the manager (`build/release-manager/website-sync.json`, token field, ignored by Git; alternatively its environment variable). `/api/plugins/neurokore/release-sync` imports only an official, complete, published GitHub release. All four files are hashed and copied to immutable, version-specific R2 keys before Installer/Bundle artifacts are registered and the version is published under the existing active NEUROKORE product. Existing published/withdrawn versions cannot be replaced. Authenticated GET with a version query checks readiness; POST with a version imports or retries. The manager completes only after the website confirms the product version. The homepage, product/download pages and admin version views are revalidated. No database migration is required.

## Perpetual offline activation policy

For NEUROKORE v2, a `full` entitlement with `expires_at = NULL` is signed as the native `perpetual` tier with the representable expiry 9999-12-31T23:59:59Z. This avoids forcing paid customers online every 30 days. Time-limited full grants and alpha keys retain 30-day maximum activation leases. Other v3 products keep their own existing lease policy.

**Important tradeoff:** A permanent offline certificate cannot be remotely revoked after issuance. Admin-side device resets and refunds only affect future activations, not an already installed perpetual certificate. Do not claim instant revocation of purchased offline licences. Consider time-limited leases only if the product terms expressly promise that behavior and reliable automatic renewal exists. Existing v2 full certificates can be upgraded by reactivating the same key in the current build. Validate these paths before enabling checkout.
