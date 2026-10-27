# NEUROKLAST AUDIO — Digital Sound Packs and NEUROKORE Preset Packs

Status: Implementation in Preflight; no digital pack sales enabled in Vercel; paid E2E unverified until a private R2 bucket and test pack exist.

## Customer journey

- /soundpacks: catalogue of complete published packs (WAV sample libraries or NEUROKORE presets).
- /soundpacks/{id}: details, licence, formats, count, product image, price. Free → Download ZIP. Paid → logged-in customer accepts terms → Stripe Checkout.
- /soundpacks/library: authenticated customer's paid pack entitlements and ZIP downloads. Refresh if Stripe payment is still processing.
- Purchased ZIP key and filename snapshot to the order so replacing a public pack never silently changes what a buyer owns.
- Full refunds and disputes disable paid download entitlement pending review. The file already downloaded cannot be recalled, so seller policy must clarify this.

## Admin workflow

Admin → Soundpacks → New digital pack. Choose **Preset pack** or **Sound/sample pack**. Upload cover using public media storage. Upload **ZIP into separate private R2 bucket** via signed PUT. Enter accurate content description, format compatibility, count, and specific licensed use conditions. Choose Free or EUR price and save. The public page only shows active products with verified ZIP reference, nonempty licence and valid price.

This extends legacy soundpacks; external purchase links from previous records are not used for paid fulfilment.

Recommended product catalogue:
- Free: NEUROKORE Distortion Essentials — 20 presets; Hard Techno Kicks — 20 presets; Industrial Guitars — 15 presets; Glitch & Chaos — 15 presets.
- Paid WAV pack examples (draft prices only): Hard Techno Drum Arsenal 19 €, Dystopian Impacts 15 €, Dark Industrial Loops 25 €. These are suggestions, not products created or content uploaded.

## Mandatory Cloudflare R2 setup

1. Create an **R2 bucket with public URL access disabled**, e.g. `neuroklast-digital-downloads`, in the correct Cloudflare account and jurisdiction. **Do not point at `R2_BUCKET_MEDIA`**. Cloudflare R2 private buckets are the default, but verify neither `r2.dev` nor a public custom domain is enabled.
2. Give the existing server-side R2 S3 credentials access to this bucket with minimum required GetObject, PutObject and HeadObject permissions. Do not expose credentials to the browser.
3. Set `R2_BUCKET_DIGITAL_PRODUCTS` in Vercel Preview and Production to the private bucket name. Deployment required.
4. Set private bucket CORS to permit `PUT` from the selected admin Preview and Production origins, with `Content-Type` request header. Do not enable public GET to fix browser failures. Customer downloads use signed URLs with 60-second expiry.
5. Upload a harmless sample ZIP through Admin, verify its HEAD/object size, and test the free file retrieval using an unauthenticated browser.

Docs: https://developers.cloudflare.com/r2/buckets/create-buckets/ and https://developers.cloudflare.com/r2/buckets/public-buckets/

## Paid sale controls

- `DIGITAL_PACK_SALES_ENABLED` is **absent/false by default**. Preview requires `VERCEL_ENV=preview`, `NEUROKORE_SANDBOX_CHECKOUT=true`, a valid Stripe test key and explicit `DIGITAL_PACK_SALES_ENABLED=true`.
- Production requires an explicitly set `DIGITAL_PACK_SALES_ENABLED=true` and a live Stripe API key. **Do not set this until sales tax, contract, buyer email, R2, webhook and refund QA pass.**
- Paid price always comes from the database, never the browser. Minimum 1 EUR, upper bound 1,000 EUR.
- Stripe Checkout issues no entitlement. Signature-verified webhooks retrieve the paid session from Stripe; order ID, environment, account email, paid amount, currency, PaymentIntent and session are checked before setting paid.
- Receipt sent via Resend with stable order idempotency; licence terms and title are snapshotted when checkout is initiated.
- On retries, the purchase is idempotent. Test concurrent webhook delivery, abandoned checkout, delayed payment and failed email. Manually verify live tax/invoice configuration.
- No live amount, price or sellable ZIP was added by this work.

## Licensing and rights

Differentiate (a) commercial use of produced music and (b) redistribution of original samples/presets as a pack. Describe whether credit is required, royalty status, sublicensing and AI-training use explicitly. Ensure every included audio sample is owned or appropriately cleared. Uploaded third-party sounds must have a reselling licence. Presets should identify compatible NEUROKORE version and not imply the plugin itself is included.

Review the legal treatment of immediate digital delivery, EU withdrawal rights, invoice/receipt and privacy with professional assistance before activation.

## Acceptance criteria before merging a live storefront

- Database: `soundpacks` constraints accept real .zip names and reject other files; `digital_pack_orders` RLS protected against anon/authenticated.
- Web build: Next.js + TypeScript green; Vitest tests pass; responsive admin and catalog checked.
- Free download: public ZIP only via signed private R2 URL with 60-second TTL, archive absent → 404.
- Paid download: unsigned browser calls never grant access, unpaid user and another account get 403/401; valid purchaser receives ZIP; refund disables further downloads.
- Payment: test-mode Stripe €1 purchase, single entitlement and purchase email; duplicate events don't create duplicate entitlements.
- Production: explicit seller/consumer law review and environment separation. Production DB migration connection must work.
