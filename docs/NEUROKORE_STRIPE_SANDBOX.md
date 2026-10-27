# NEUROKORE Stripe Sandbox: isolated end-to-end checkout

## Verified Stripe resources (27 October 2026)

- Stripe **NEUROKLAST Sandbox**, `acct_1UV6GBEP3z8hPITn`, test mode only.
- Test product **NEUROKORE — Sandbox Test License**: `prod_VW8ifYVUATvnhd`.
- Test one-time **EUR 1.00 (inclusive)** Price: `price_1UV6RMEP3z8hPITngA11NGBL`.
- Product, Price and empty webhook list were confirmed against the Stripe Sandbox API.
- The test amount **is not a retail price**. No live Stripe product, customer charge or production order was created.

## Incomplete external prerequisites

- Supabase project `cvxhbdmhtesnkubublar` **cannot currently be accessed through the ChatGPT Supabase connector**. Its server returns `link_id must identify an eligible linked account`. Do not assume migrations were applied.
- No isolated Supabase test project or copied plugin/release data has been verified.
- No Vercel staging URL, sandbox Stripe API key, webhook signing secret or authenticated customer test is provisioned yet.
- Live sales remain off. Keep `NEUROKORE_SALES_ENABLED=false` for Production.
- The Vercel project currently protects preview URLs with authentication (all except custom domains). Stripe cannot send events to a protected preview URL without a supported bypass. Plan a dedicated publicly reachable HTTPS staging webhook endpoint, with strong application-level signature validation.

## Provision isolated staging (do not reuse production credentials)

1. In Supabase, create a **separate project** for staging (creation may incur cost); do not use the live NEUROKLAST database. Apply the existing idempotent `supabase/schema.sql` there. Configure Supabase Auth email OTP and isolated test SMTP.
2. Set up a Vercel preview deployment on a dedicated staging branch. Configure a stable staging HTTPS origin. Restrict the staging site itself, but keep `POST /api/neurokore/webhook` externally reachable for signed Stripe deliveries.
3. Scope these variables **only to the staging branch/environment**:
   - `VERCEL_ENV=preview` (provided automatically by Vercel)
   - `NEUROKORE_SITE_URL=https://<staging-domain>`
   - `NEUROKORE_SALES_ENABLED=true`
   - `STRIPE_SECRET_KEY=sk_test_...` (NEUROKLAST Sandbox account)
   - `STRIPE_WEBHOOK_SECRET=whsec_...` (from the Sandbox webhook endpoint)
   - `NEXT_PUBLIC_SUPABASE_URL=https://<staging-ref>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=<staging-only-secret>`
   - `NEUROKORE_KEY_ENCRYPTION_SECRET=<new-32-byte-random-hex>`
   - `NEUROKORE_SIGNING_PRIVATE_KEY=<test-key-matching-a-test-plugin-build>`
   - `NEXT_PUBLIC_DEV_MODE=false`
   - Plus staging R2/SMTP and any other existing backend dependencies used by published artifacts and legal purchase emails.
4. In staging Admin > Plugins > NEUROKORE, link the sandbox Price ID `price_1UV6RMEP3z8hPITngA11NGBL`, enable per-product sales, and ensure a validated release is published. The checkout checks release readiness, legal completeness, authenticated customer, signing key and contract-confirmation email integration.
5. Create the Stripe **Sandbox** webhook pointing to `https://<staging-domain>/api/neurokore/webhook`. Enable `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Copy its signing secret into the **staging** `STRIPE_WEBHOOK_SECRET`.
6. Make a Stripe Sandbox card purchase while signed in as a customer on staging, then verify the order and exactly one license in the staging database, email confirmation, and license activation in a test build.

### Live/test key guard

`lib/neurokore/stripe.ts` now rejects `sk_live_` / `rk_live_` outside `VERCEL_ENV=production`, and rejects test credentials in Production. This covers product Price lookup, checkout creation and webhook session retrieval. A mismatch fails closed.

**Do not enable global sales in Production to try the Sandbox.** Production and preview configurations must never share the same Supabase data, Stripe API credentials, signing keys or R2 files.

### Sandbox scenarios to exercise

- Checkout succeeds using Stripe's test card `4242 4242 4242 4242`, a future expiry and any CVC.
- Declined cards and abandoned payment produce no license.
- `checkout.session.completed` with unpaid/pending payment does not fulfill.
- Duplicate and reordered webhooks do not create duplicate licenses.
- A transient email failure can retry without issuing a second license.
- The authorized buyer can view their license, other accounts cannot.
- Device activation, reactivation and seat limit function using **test-signed** licenses.
- Refund handling is reviewed separately. The current commerce documentation states **there is no automatic refund revocation**.
- Verify test and live events are separated, inspect webhook deliveries and database rows, then keep production sales disabled pending legal, tax and deliverability checks.

Run the existing Stripe unit tests from the repository:
```bash
npm run test -- src/test/neurokore-stripe.test.ts
```

This document is a configuration handoff, **not** a record of an executed end-to-end transaction.
