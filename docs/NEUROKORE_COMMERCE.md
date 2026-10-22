# NEUROKORE commerce and licensing

Implementation branch; sales are disabled by default. This does not publish a tested plugin or enable production payments.

## Routes

- /admin/products: CMS for product cards and the public Products section toggle (`site_config.sections` id `products`, default hidden). Items can link to `/neurokore` or an http(s) URL.
- /admin/neurokore/releases: register builds, checksums and publish/withdraw versions. Only published releases are downloadable; files are kept after withdrawal.
- /neurokore: product page. 404 while the Products section is off.
- /neurokore/download: anonymous demo downloads. 404 while the Products section is off.
- /neurokore/account: email-code sign-in, owned keys and download, Stripe Checkout. 404 while the Products section is off.
- /admin/neurokore: existing admin authentication/MFA; issue free expiring alpha keys, revoke, reset seats. Works with the Products section off.
- GET /api/neurokore/download?platform=windows-x64&channel=stable: resolves the newest published release for the platform, records an anonymous counter and redirects to a 120-second R2 URL. Binary bytes do not pass through Vercel.
- POST /api/license/v1/activate: key + device; signed v2 activation document, two seats, idempotent per device. **Always available** �?" NeuroCore (`D:\Git\NeuroCore`, `LICENSE_ACTIVATE_URL`) calls this URL. Do not gate it on the Products section or sales flag.
- POST /api/neurokore/webhook: Stripe raw-body HMAC verification, payment and line-item lookup, transactionally idempotent fulfillment.

Alpha issuance never calls Stripe. Customers sign in with the same verified email used for the alpha key or purchase. Admin lists show the most recent 100 licenses. Keys are SHA-256 indexed and encrypted with a separate AES-256-GCM key for owner retrieval.

## Setup order

1. Apply the single idempotent `supabase/schema.sql` (Production deploy already does this). It includes products and NEUROKORE license tables/RPCs. Existing rate-limit schema and RATE_LIMIT_SALT are required.
2. In Supabase Auth, enable email sign-in and configure transactional SMTP. The Magic Link email template must show {{ .Token }} for this code-entry flow. Configure the site's URL and allowed redirects. Never auto-promote customers to admins.
3. Generate an Ed25519 key pair in a trusted operator environment. Store the PKCS8 PEM private key as NEUROKORE_SIGNING_PRIVATE_KEY in Vercel; literal escaped newlines are supported. Export the raw 32-byte public key as 64 hex characters for the plugin CMake option NEUROKORE_LICENSE_PUBLIC_KEY_HEX. Never put the private key in GitHub, browser bundles, downloads or the plugin.
4. Generate an independent random 32-byte encryption secret (64 hex characters) for NEUROKORE_KEY_ENCRYPTION_SECRET. Back it up securely: rotating it requires re-encrypting stored keys. Keep staging and production Supabase/Stripe/signing material separate.
5. Set NEUROKORE_SITE_URL=https://neuroklast.net (exact canonical origin; POST CSRF checks use it). NEXT_PUBLIC_DEV_MODE must be false in production. Public downloads come from published release records and the media R2 bucket (`R2_BUCKET_MEDIA`, default `neuroklast-media`); no download URL env var is needed.
6. Build and test the matching NeuroCore licensing branch with the public key above. Current beta accepts alpha keys; stable releases must set NEUROKORE_ALLOW_ALPHA_LICENSES=OFF. Old RSA .lic files are not accepted by v2 builds; reissue keys for existing testers.
7. Configure Stripe in TEST mode first: one-time Price, STRIPE_SECRET_KEY, STRIPE_NEUROKORE_PRICE_ID. Enable/configure automatic tax and the business terms URL in Stripe; checkout requires acceptance. Price, currency and tax presentation come from Stripe, not client input.
8. Register https://neuroklast.net/api/neurokore/webhook for checkout.session.completed and checkout.session.async_payment_succeeded. Set that endpoint's STRIPE_WEBHOOK_SECRET. Use the API version pinned in lib/neurokore/stripe.ts. Failed fulfillment returns 500 for Stripe retries.
9. Deploy with NEUROKORE_SALES_ENABLED=false. Issue and activate alpha keys first. Test purchase flow in an isolated deployment with test credentials and sales enabled, then test webhook retries and account download.
10. Complete the launch checks below before enabling production sales. Add a product in Admin → Products (link `/neurokore`) and turn the Products section on when the public page should go live.

## Release and download management

`neurokore_releases` stores version, channel (`stable`, `beta`, `alpha`), status (`draft`, `validated`, `published`, `withdrawn`), changelog, release notes and the git commit. `neurokore_release_artifacts` stores one row per platform/package with filename, server-derived R2 key, size, SHA-256, signing and validation status. `neurokore_download_events` stores anonymous counters (release, artifact, platform, channel); `neurokore_admin_audit` stores who published, withdrew or validated.

Rules enforced in code and SQL:

- Publishing requires at least one artifact and every artifact must be validated with a 64-hex checksum and a positive size (`neurokore_publish_release`).
- Only `status = published` with `withdrawn_at IS NULL` is downloadable. Drafts, validated-but-unpublished and withdrawn versions are refused.
- Withdrawal keeps rows and files for support/restoration; publishing the same row again restores it.
- Admins never type storage paths. Keys are derived as `releases/neurokore/v<version>/<platform>/<filename>`; the download route re-checks the key shape before signing.
- The public catalogue RPC `neurokore_public_releases()` returns metadata and checksums only. Storage keys never leave the server.
- The download route redirects to a 120-second R2 signed URL; it never streams binaries through the app server.
- The public page shows only platforms that have a published artifact. It does not claim OS versions or host formats that no release contains.

Unsigned artifacts are allowed for internal testing and are labelled. The admin UI warns when macOS builds in the stable channel are not notarized; notarization remains a release-operator responsibility.

### Build hand-off (not implemented)

The native pipeline is expected to produce one manifest per release:

```json
{
  "version": "1.4.0",
  "channel": "stable",
  "git_commit_sha": "<40 hex>",
  "artifacts": [
    {
      "platform": "windows-x64",
      "architecture": "x64",
      "package_type": "installer",
      "filename": "NEUROKORE-1.4.0-Windows.exe",
      "filesize_bytes": 123456789,
      "sha256": "<64 hex>",
      "signing_status": "signed"
    }
  ]
}
```

The build must upload each file to the derived key `releases/neurokore/v<version>/<platform>/<filename>` and then register the release. Registration currently requires an admin session (`POST /api/neurokore/releases`), so a CI job cannot post directly. A machine-authenticated endpoint with a shared secret, replay protection and per-channel restrictions is still required before PR 4 can be completed; no such secret exists yet.

## Signed license protocol

Ed25519 signs the exact UTF-8 bytes of:
NEUROKORE-LICENSE-V2 followed by a newline, then the standard base64 payload string.

Envelope fields: format="NEUROKORE LICENSE", version=2, payload, signature (64 signature bytes, base64).
Payload: version=2, product="NEUROKORE", licenseId UUID, device ("v2:" + SHA-256 hex), tier ("alpha" or "full"), email, issuedAt and expiresAt (Unix seconds).

The plugin verifies before writing the .lic file and on plugin load. The fingerprint hashes JUCE's device identifier with a domain separator; changing hostname/network adapters does not consume another seat. No raw hardware identifier is transmitted. Local license files contain the buyer's email and device hash.

Each activation has a maximum 30-day offline lease, capped by the alpha license expiry. Renew manually with Activate and the same key (same device consumes no extra slot). Full licenses have no entitlement expiry, but their activation files still expire. An already loaded instance retains its current authorization until it is reloaded; do not promise instant revocation or change audio mid-session. No silent background network requests are made.

Activation uses the plugin WebView's HTTPS fetch with no cookies, no redirects and a timeout. CORS is wildcard on this bearer-key endpoint only; customer/admin endpoints use session authentication and same-origin mutation checks. Offline installations can use a signed .lic obtained by submitting their displayed device ID and key to the same endpoint from a connected computer.

## Launch checks (not yet executed in a live environment)

- [ ] All repository CI gates green; native Windows/macOS binaries and embedded web UI tested.
- [ ] `supabase/schema.sql` applied; concurrent requests cannot allocate a third seat.
- [ ] Valid alpha activation, repeated activation, third device refusal, wrong device, tamper, expired and revoked key tested.
- [ ] Email code delivery, customer A/B isolation, no anonymous/admin bypass, MFA enforcement.
- [ ] Stripe test success, cancellation, delayed payment, invalid signature, duplicate and out-of-order events.
- [ ] Paid order produces one full key, customer can retrieve it, key unlocks the shipped binary.
- [ ] Failed webhook can be retried; monitor Stripe delivery failures and pending orders.
- [ ] A published release with validated artifacts downloads anonymously; a draft or withdrawn release does not. R2 signed URLs work with the production bucket.
- [ ] Product price, terms/EULA, seller details, tax, privacy information and digital-delivery/withdrawal requirements reviewed for the actual selling jurisdiction. Existing band legal pages are not automatically a software-sales policy.
- [ ] Refund/dispute operational procedure: revoke the corresponding license in the admin panel. Refunds/disputes are NOT automatically revoked in this first implementation.
- [ ] Switch to live Stripe credentials and live Price, add live webhook secret, then enable sales.

No secrets were created or deployed by this change. SQL and cryptographic tests are included; browser, DAW and payment end-to-end checks require configured environments.

## Operational limits

Two device seats are locked atomically per license. Admin reset frees server seats, but existing offline certificates remain usable until expiry/reload. This inherent offline window also applies to revoked keys and refunds. Customer self-service transfers, automatic renewals, automated refund handling, receipts beyond Stripe, key rotation and pagination are future extensions.

License ownership follows verified email rather than anonymous checkout. An email change needs an operator-assisted transfer. Preserve accounting/fulfillment records according to the applicable retention policy; document Supabase/Stripe and device hash processing in the site's privacy notice before launch.

## Implementation validation

Focused website contracts passed in GitHub Actions, including PostgreSQL seat allocation under concurrent requests and payment retry idempotency. Native Ed25519 and Node interoperability contracts passed in the companion repository. The release/download additions are covered by unit tests for artifact readiness, platform selection, storage-path rejection, public-catalogue parsing and the download route (published vs missing vs unvalidated vs unsafe path). These tests mock the database and R2; no deployed environment, real R2 bucket, Stripe account, DAW or signed macOS build was exercised while writing them. Full final-commit CI and configured launch checks remain separate gates.
