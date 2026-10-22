# Consumer checkout and privacy launch checks (Germany / EU, October 2026)

This checklist is a technical readiness aid, not a declaration of legal compliance.

## Implemented

- Public, account-free **Vertrag widerrufen** entry in footer and two-step withdrawal form at /withdrawal.
- After submission, the Resend batch API accepts a provider notification and a customer acknowledgement with timestamp, reference ID and verbatim declaration.
- /withdrawal-policy includes a plain-language consumer cancellation notice and example form.
- /purchase-info explains seller, one-time checkout, digital delivery, taxes, support and consumer rights.
- /plugins/[slug] shows product info and links before redirect to Stripe-hosted checkout. The final binding payment action remains with Stripe.
- Backend checks operator details and refuses recurring Stripe prices on the one-time-payment flow.
- /privacy-policy covers account, licence, payments and withdrawal data, including a notice if a custom base policy is used.

## Before enabling NEUROKORE_SALES_ENABLED=true

- [ ] Verify Admin → Legal & Privacy actual full legal name, serviceable address, contact email, editorial responsibility (where necessary) and VAT information if applicable.
- [ ] Verify how personal, device and order data is really processed; hosting location and actual processors / data transfer safeguards / DPAs (Vercel, Supabase, Resend, R2, Stripe, remote fonts/CDN).
- [ ] Enable Resend with a verified sender domain; verify CONTACT_FROM_EMAIL and WITHDRAWAL_EMAIL/CONTACT_EMAIL in Vercel.
- [ ] Configure Stripe public business info, terms-of-service URL, statement descriptor, tax registrations and receipts in dashboard.
- [ ] Check EU consumer tax handling (including reverse-charge and location rules) with an accountant; automatic tax does not replace registrations.
- [ ] Confirm descriptions, system requirements, price type, licence limitations, demo restrictions, licence updates and support promises against each shipping build and applicable EULA.
- [ ] Test full checkout and both Stripe webhooks in **test mode**, including retries, emails, duplicates and withdrawal requests without login.
- [ ] Verify the contract confirmation sent after payment and inspect its content on a durable medium.
- [ ] Check the legally required withdrawal function and notice under § 356a BGB (in force since 19 June 2026).
- [ ] Confirm BFSG applicability, including the microenterprise service exception if claimed, and test keyboard/mobile accessibility.
- [ ] Review GDPR deletion and retention jobs, data subject requests and backup retention. Prose must match actual execution.
- [ ] Have the actual EULA, B2C contract notices and withdrawal text reviewed for the seller's business structure and jurisdictions.
- [ ] Test footer links, checkout on mobile, Stripe final total and its payment obligation label.
- [ ] Verify any local laws and translated notices for non-German buyers.

## Legal references

- § 312j BGB: ordering UX, total information immediately before payment and unambiguous payment button.
- § 356 Abs. 6 BGB: expiry of withdrawal right for non-tangible digital content requires all statutory conditions, including acknowledgement and § 312f confirmation.
- § 356a BGB: always-available two-step electronic withdrawal function for eligible online contracts.
- Art. 13 GDPR: up-front transparency on purposes, recipients, retention, international transfer safeguards.

Never claim automatic loss of withdrawal rights merely because a checkout or download began.
