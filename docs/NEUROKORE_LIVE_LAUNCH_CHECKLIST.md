# NEUROKORE commerce: production readiness & incident runbook

Status 2026-10-27: **Stripe Sandbox E2E purchase succeeded. Not cleared for live sales.**

## Evidence: one real sandbox checkout completed

- Stripe NEUROKLAST Sandbox: one **paid** Checkout Session for EUR 1.00 with `livemode=false`, metadata `environment=neurokore-sandbox` and a matching order reference.
- Supabase project `cvxhbdmhtesnkubublar`: exactly **one** of five test orders was linked to a Stripe session, fulfilled with a licence and marked `confirmation_sent_at`. Four earlier orders are incomplete attempts, not purchases.
- Critical functions `plugin_fulfill` and `plugin_delete_sandbox_license` are executable by `service_role`, not `anon` or `authenticated`.
- Stripe success URL does **not** grant a key: the webhook independently retrieves the paid Checkout Session, checks amount-bearing Price ID and buyer e-mail, then calls the transactional DB function.
- The Vercel Preview branch is deployed behind authentication; the live site and production sales switch remain untouched.

**Do not interpret a delivered e-mail or successful Checkout redirect alone as proof that the plugin accepted a newly signed activation file.** Test offline activation and seat/revocation separately.

## Hardened in current draft PR

- Fail-closed live/test credential check on every Stripe request.
- Signed raw-body webhook, bounded payload, timestamp freshness check.
- **Live/test isolation:** webhook event and fetched Checkout Session must match each other and `VERCEL_ENV`; Checkout metadata must identify the order and deployment environment.
- **Crash recovery:** a verified paid session can attach to an order if the Stripe Session ID was not saved after Checkout creation; conflicting and tombstoned orders are never overwritten.
- Transactional, idempotent `plugin_fulfill` with row locks and unique Stripe Session and PaymentIntent references.
- Delete **only** sandbox licences via a service-only RPC; keep a tombstoned order to prevent webhook replay from reissuing a key.
- Build- and unit-level checks for the schema quoting, function privileges, Stripe signature and environment rules.
- Sanitized failure stages for Preview checkout and webhook, without copying secrets or customer PII into logs.
- Branded Resend transactional purchase e-mail includes the legal text as HTML **and** plain text; stable order-level Resend idempotency key.
- Preview-specific exceptions for sandbox Stripe settings are deliberately excluded from Production.

## P0 — mandatory before accepting any real payments

1. **Separate environments.** Current Preview and Production access the **same Supabase database** and share live NEUROKORE cryptographic keys. Before untrusted testers, isolate data, authentication and signing credentials. A new staging DB must not be allowed to issue an activation file accepted as a real purchased licence unless explicitly intended.
2. **Contain Preview bypass.** The temporary Stripe webhook relies on a Vercel Protection Bypass credential that can bypass the **whole Vercel project**, not just the webhook route. Restrict branch access to trusted reviewers; store the bypass in the Stripe endpoint URL only, avoid logs, and revoke/rotate it after test. Ideally move the sandbox to a separate Vercel project with a dedicated webhook endpoint.
3. **Restore normal deployment controls.** The Vercel Ignored Build Step currently permits both `main` and the sandbox branch. Remove the temporary exception after QA.
4. **Resolve live Stripe product, public business data, tax and Terms configuration.** The Sandbox deliberately disables `automatic_tax`, Stripe-hosted TOS consent and Managed Payments. This is **only** for the €1 simulation. Select the correct tax code, jurisdiction, registrations, merchant-of-record approach, public Terms URL, test invoicing and VAT treatment before launch. A live-priced product and enabled production sales flag require explicit review.
5. **Fix Production database migration access.** Vercel Production has repeatedly logged `[schema-apply] failed: password authentication failed for user "postgres"` when using its `DATABASE_URL`. Verify the connection string **privately** in Vercel and align it with the active Supabase Postgres credentials (possibly pooler/direct connection details); do not paste it into issues, commits or chat. The deploy must not silently run stale schema.
6. **Review paid order lifecycle:** retries, abandoned checkouts, duplicate webhook deliveries, asynchronous-payment failure, refunds, disputes/chargebacks, paid-but-not-fulfilled reconciliation, and how/when a licence is revoked. Define who can re-send confirmation e-mails without duplicating them.
7. **Review German/EU digital-content commerce obligations** with an appropriately qualified professional: seller identity, total price/VAT, digital fulfilment, withdrawal policy and consent where applicable, AGB, invoice/receipt, retention and data privacy. The Sandbox's own terms checkbox does not automatically make the legal process sufficient.
8. **Release access control.** Test that buyers only see their own orders and licences. Test all account recovery paths, device limits, offline activation expiry, revocation and downloads, including a fully deleted sandbox key.
9. **Review restricted DB functions.** `handle_new_user()` currently has mutable `search_path` and PUBLIC EXECUTE on the shared Supabase DB. The PR pins its path and revokes public access, but the change has **not** been applied to the live DB. Verify signup regression before applying. The `plugin_public_catalog()` SECURITY DEFINER call intentionally exposes a strictly filtered public catalogue; review any future fields before exposing them.
10. **Webhook observability**: alarm for repeated 5xx/Stripe failed deliveries, outstanding paid orders without licence, failed transactional mail, unusual activation traffic and API rate-limit anomalies. Exclude personal info, licence keys and tokens from observability payloads.

## P1 — service operations

- Admin orders: show state `created / checkout-open / paid / fulfilled / confirmation-sent / refunded / disputed`, Stripe Session ID and retry history, not the raw keys.
- Reconcile with Stripe by querying completed but unfulfilled sessions and recovering idempotently. Avoid replaying arbitrary unsigned browser requests as paid events.
- Transactional e-mail outbox/claim to coordinate concurrent webhook retries; a Resend idempotency key helps but is not an indefinitely durable event ledger.
- Device activation dashboard, audited revoke/reset, optional grace periods and self-service seat recovery.
- Billing receipts and secure download links with expiration, abuse detection and meaningful customer support instructions.
- Dependable test suite: signed event replays, duplicate webhook in parallel, delayed payments, email failure, DB failure after Stripe Session creation, cross-account access, deleted-key replay and test/live confusion. Run it automatically before releases.
- Backup and **restore drill** for database + signing material. Losing an encryption key permanently breaks access to stored plaintext licences; losing the signing key or changing its public counterpart affects client validation. Plan crypto versioning and rotation.

## Incident playbooks

**Customer says payment succeeded but no licence:** verify Stripe environment/payment status, look up the locally linked order, inspect the sanitized webhook stage, replay **only** the authentic Stripe event or the verified Stripe Checkout Session through a reviewed idempotent recovery path. Do not issue a manual second full licence before checking duplicate sessions.

**Paid licence exists but confirmation missing:** check `confirmation_sent_at`, Resend delivery and suppression status, then retry with the **same order-level idempotency key**. If manual retries are supported later, track them in an audit log.

**A buyer wants a refund:** follow a documented refund and withdrawal policy, preserve order/tax history, audit any license state change and tell the buyer what offline activation documents can still do before expiry.

**Suspicious sign-in or activation:** invalidate affected sessions and credentials where applicable, rotate compromised tokens, inspect rate limits and audit records, and separate key or password recovery from customer identity verification.

**Sandbox cleanup:** use Admin > Plugins > NEUROKORE > Licences > Delete test key. This deletes the licence and its device rows but intentionally retains the payment audit/tombstone. Do not directly delete the paid order record.

## Security and performance checks performed

- Supabase linter: plugin-private tables are RLS-protected with no anonymous policies (intentional when accessed exclusively through server APIs). WARN on `handle_new_user()` search_path/PUBLIC EXECUTE, and on intentional public-catalogue SECURITY DEFINER RPC.
- Supabase performance linter flagged multiple unrelated foreign keys without indexes and some per-row auth function evaluation in policies; tune based on real query patterns rather than blindly changing every table.
- Production and Preview DB data is **not isolated yet**.
- **CI/unit test execution and final plugin activation test are still required.** A Vercel successful TypeScript build is not a substitute for functional integration tests.
