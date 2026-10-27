# NEUROKORE Stripe Sandbox test on Vercel Preview

Verified 27 October 2026. This is a controlled payment simulation, not a production launch.

## Connected services

- Stripe account: **NEUROKLAST Sandbox** `acct_1UV6GBEP3z8hPITn`.
- Stripe product: `prod_VW8ifYVUATvnhd`.
- Stripe Price: `price_1UV6RMEP3z8hPITngA11NGBL`, EUR 1.00 one-time and tax-inclusive, **test mode**.
- Production Stripe account **NEUROKLAST** is not changed.
- Vercel project: `neuroklast-band-land` (`prj_c9w3i0A1Mc8CrzQxvsFjGlkAbgXD`).
- Preview Git branch: `chore/neurokore-sandbox-preflight-20261027`, Draft PR #515.
- Preview URL: `https://neuroklast-band-land-git-chore-neur-cb3e37-neuroklasts-projects.vercel.app`.
- Supabase project: `cvxhbdmhtesnkubublar` (**existing production licensing database**, used by explicit owner request). No separate database or charge was created.

The Vercel Ignored Build Step was narrowed to permit `main` and this preview branch, leaving all other branches ignored. The preview is protected by Vercel Authentication and is not served on `neuroklast.net`.

## Configured in Vercel Preview, scoped to this branch only

- `NEUROKORE_SANDBOX_CHECKOUT=true`
- `NEUROKORE_SALES_ENABLED=true`
- `STRIPE_SANDBOX_PRICE_ID=price_1UV6RMEP3z8hPITngA11NGBL`
- `NEXT_PUBLIC_DEV_MODE=false`
- `NEUROKORE_SITE_URL`, `SITE_URL`, `NEXT_PUBLIC_SITE_URL`: branch-specific preview origin
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL`: existing Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public keys of existing Supabase project

The source code enables a sandbox purchase only when **all** of `VERCEL_ENV=preview`, `NEUROKORE_SANDBOX_CHECKOUT=true`, `NEUROKORE_SALES_ENABLED=true`, a `sk_test_...` secret and a `price_...` sandbox Price ID are present. Only product slug `neurokore` may bypass the product's `sales_enabled=false` in the Preview. Production still honours the database kill switch. The Product's production Stripe Price ID is never overwritten.

## Still required before a complete test purchase

**Do not put secrets in Git or a chat message.** In Vercel Project Settings > Environment Variables, configure these keys as secrets for this exact Preview branch only:

- `STRIPE_SECRET_KEY`: generated in **NEUROKLAST Sandbox**, `sk_test_...`.
- `STRIPE_WEBHOOK_SECRET`: `whsec_...` for the NEUROKLAST Sandbox webhook registered below.
- `SUPABASE_SERVICE_ROLE_KEY`: the existing licensing backend service key.
- `NEUROKORE_KEY_ENCRYPTION_SECRET`: the **same** encryption secret already used by production licensing.
- `NEUROKORE_SIGNING_PRIVATE_KEY`: the **same** NEUROKORE v2 private signing key already used by the released plugin, if no encrypted per-product private key exists.
- `SECRETS_ENCRYPTION_KEY`: existing key used to decrypt the stored Resend API key from `api_secrets`.

These are powerful production credentials, so do not expose this Preview to untrusted users or unreviewed commits. The branch is restricted by Vercel Authentication. A Preview with production credentials is **not** a fully isolated staging environment. After tests, remove these Preview-scoped secrets.

Check Supabase Auth redirect allowlist for the exact Preview origin. Ensure the customer can sign in using email and the Resend confirmation API key configured in `api_secrets` is usable.

### Stripe webhook and Vercel protection

Register a webhook in **NEUROKLAST Sandbox** for `checkout.session.completed` and `checkout.session.async_payment_succeeded` pointing to:

`https://neuroklast-band-land-git-chore-neur-cb3e37-neuroklasts-projects.vercel.app/api/neurokore/webhook`

However, Vercel Authentication blocks external Stripe deliveries. Vercel's documented workaround is a project-specific **Protection Bypass for Automation** token as the URL query parameter `x-vercel-protection-bypass`. It grants broad bypass privileges for the Vercel project, not just that route, so treat it as a highly sensitive credential and revoke it when tests finish. If no acceptable restricted webhook access path is available, do not register an unreachable URL. Only after the endpoint is genuinely reachable should the Stripe test webhook be created and its signing secret stored in the branch's Vercel Preview environment.

### Important test lifecycle

1. Sign in on the Preview as a real Supabase test user. Complete legal configuration and check that NEUROKORE has a validated published plugin release.
2. Start checkout from `/plugins/neurokore`. Confirm the displayed amount is **EUR 1.00**. Pay with Stripe's standard test card.
3. Confirm `checkout.session.completed` was delivered and the purchased key appears at `/neurokore/account`. Test plugin activation and device limits.
4. Check duplicate webhook deliveries: exactly one licence per test order.
5. Go to **Admin > Plugins > NEUROKORE > Licences**, select the sandbox-purchased key and choose **Delete test key**. Type `DELETE TEST` to confirm.
6. The key and its device rows are deleted; the order is retained as a tombstone (`test_deleted_at`) to block webhook replays. Normal paid orders and manually issued keys cannot be deleted through this action.
7. Already-issued offline activation documents cannot be remotely erased and may remain usable until their expiry. Key deletion prevents reactivation and renewal.
8. Keep `NEUROKORE_SALES_ENABLED=false` on Production. Remove temporary Preview secrets and restore the original Ignored Build Step rule after the test campaign.

### Database migration status

The narrow additive migration `neurokore_sandbox_test_license_cleanup` was successfully applied to Supabase `cvxhbdmhtesnkubublar`. It adds `plugin_orders.test_deleted_at`, prevents replay fulfilment in `plugin_fulfill`, and creates `plugin_delete_sandbox_license` for authenticated service-role calls only.

Verification after applying: four pre-existing licences, zero orders, the new column exists, `anon` and `authenticated` cannot invoke the delete RPC, `service_role` can.

**No Stripe sandbox checkout or real plugin activation has yet been executed end-to-end.**
