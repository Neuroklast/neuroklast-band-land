# Stripe Managed Payments launch configuration (NEUROKLAST)

Status (2026-10-27): **Managed Payments live account verified**, checkout code prepared, live storefront sales still closed. NEUROKLAST is currently treated as a German small business under § 19 UStG according to the operator. The seller must verify that status and any international or B2B obligations with a tax professional. Stripe's merchant-of-record coverage does not replace the seller's income-tax and accounting obligations.

## Required manual Stripe Dashboard action

1. Select the **NEUROKLAST live account**, not Promptbase or NEUROKLAST Sandbox.
2. Open https://dashboard.stripe.com/settings/managed-payments and complete Stripe's eligibility review and legal onboarding. Accept the terms yourself. The API integration cannot accept the merchant agreement for you.
3. Configure the public terms and privacy links under https://dashboard.stripe.com/settings/checkout and verify the customer support address. Managed Payments invoices and receipts are issued by Stripe/Link, not the seller's optional Checkout invoice_creation integration.
4. Confirm downloadable software NEUROKORE has an eligible product tax code. The present product is classified `txcd_10202000` and the 59.00 EUR one-off Price has inclusive tax behavior, but **the category should still be confirmed for the intended customer base**. Only use Stripe-eligible downloadable-digital product tax codes.
5. Completed 2026-10-27: confirmed Managed Payments in the live NEUROKLAST account with an unpaid EUR 59.00 Checkout Session (`managed_payments.enabled=true`) and configured `STRIPE_MANAGED_PAYMENTS_ENABLED=true` in Vercel Production. No real charge was made.

## Website integration

- Two production Checkout routes support Managed Payments: plugin license and digital pack. Both set `managed_payments[enabled]=true` using Stripe API `2026-04-22.dahlia`.
- Managed Payments forbids `automatic_tax`, `invoice_creation`, and `tax_id_collection` parameters, so these are not sent. Site-controlled Checkout custom submit text and Stripe-native terms collection are also omitted. On-site terms acknowledgement remains and Stripe checkout terms/privacy links must be configured in the dashboard.
- An unset `STRIPE_MANAGED_PAYMENTS_ENABLED` fails closed with 503 on production before any order is created. Production sales flags `NEUROKORE_SALES_ENABLED` and `DIGITAL_PACK_SALES_ENABLED` remain separately required and should stay false until all release and compliance checks pass.
- The previous NEUROKLAST sandbox path remains non-Merchant-of-Record for continuity of its existing EUR 1 test. It does not verify Managed Payments end to end.
- Verified 2026-10-27: a separate un-paid Stripe Sandbox Checkout Session **was successfully created** with `managed_payments.enabled=true`, test amount EUR 1, an eligible software tax code, and `livemode=false`. This proves Checkout Session creation, **not** a paid transaction, receipt, webhook, or licence fulfilment. Complete a separate **Stripe sandbox Managed Payments** checkout test against an isolated Preview database before live launch.
- Pack code: `sample_pack` uses eligible downloaded digital-audio tax code `txcd_10401100`; `preset_pack` uses eligible generic electronically-supplied digital-services code `txcd_10000000`. Confirm both product classifications with the tax adviser, especially if different licensing, subscription, or usage rights apply.
- This PR does not toggle production sales flags, modify Stripe tax registrations or process payments. The production Managed Payments Vercel environment variable was separately configured after independent live API verification.

## Accounting and pricing implications

Stripe acts as Merchant of Record to the final buyer for eligible Managed Payments sales in supported territories. It calculates and remits relevant indirect taxes and sends customer receipts/invoices. The seller must still reconcile gross sales, withheld taxes, Stripe processing/Managed Payments fees and payouts, according to their actual contractual relationship with Stripe and German tax status. Whether cross-border services/Stripe fees give rise to specific reverse-charge or reporting requirements for a small business requires individual professional review.

Managed Payments has an **additional 3.5% fee on the total transaction (including tax), on top of the Stripe payment processing fee**. At a 59.00 EUR sticker price this additional fee alone is 2.065 EUR before rounding. Actual disbursement also depends on indirect taxes, payment fees, refunds and customer location.

## Release checklist

- [x] Stripe live Dashboard: Managed Payments activation reported by operator and independently confirmed by an unpaid live Checkout Session
- [ ] Dashboard: checkout Terms/Privacy URLs, product classification, merchant/contact details checked
- [x] Vercel production: `STRIPE_MANAGED_PAYMENTS_ENABLED=true` configured; live Checkout Session confirmed. Verify live credentials continue to point to the NEUROKLAST account during website E2E.
- [ ] Dedicated isolated Stripe test/Preview environment: actual Managed Payments session and payment, tax, generated receipt and correct entitlement tested
- [ ] Website: valid legal/withdrawal content, no conflicting promises about who issues invoices, fulfilment email explicitly distinguishable from Stripe invoice
- [ ] Reconcile: Webhook paid/refunded/disputed handling and licence/download revocation with Managed Payments
- [ ] Tax professional: § 19 status, revenue recognition, fees and possible § 13b issues
- [ ] Only then enable production `NEUROKORE_SALES_ENABLED` / `DIGITAL_PACK_SALES_ENABLED`

Official references:
- https://docs.stripe.com/payments/managed-payments/update-checkout
- https://docs.stripe.com/payments/managed-payments/eligibility
- https://docs.stripe.com/payments/managed-payments/how-it-works
- https://support.stripe.com/questions/managed-payments-pricing?locale=de-DE
