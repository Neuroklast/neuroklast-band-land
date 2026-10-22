# NEUROKLAST AUDIO: legal and commerce launch gate

Engineering checklist, October 22, 2026. This is not legal certification.

## Implemented

- 48 server-rendered, separately indexable legal documents: six documents in eight site languages.
- Self-referencing canonicals, reciprocal hreflang and x-default for legal routes.
- Localized legal links in the footer and in the purchase panel.
- Each localized withdrawal notice includes a reusable model withdrawal form.
- Withdrawal is recorded with UUID and server receipt time before any email call.
- Admin/MFA-only retry endpoint for Resend notifications that have not been accepted.
- Stripe checkout metadata records buyer language and terms version.

## Go-live checklist

1. Apply and VERIFY the Supabase migration at supabase/migrations/20261022194500_withdrawal_notices.sql before publishing the new withdrawal form.
2. Configure verified CONTACT_FROM_EMAIL and the actual operator contact email. Test Resend delivery to buyer and operator.
3. Verify receipt timestamps, idempotent retries, invalid input handling, database RLS and accessibility of withdrawal without login.
4. Alert an administrator to pending email receipts. An endpoint alone does not satisfy the need for prompt confirmation.
5. Configure Stripe public terms/privacy links, accepted payments, tax-inclusive prices, the final payment button and receipts. Check the actual hosted checkout.
6. Verify all German company details (legal name, address, tax and registry data when required) and actual data processors and transfer mechanisms.
7. Compare the distributed LICENSE/EULA files and actual software activation restrictions against the public terms.
8. Review withdrawal guidance and cancellation rights for the specific software product and territory.
9. Have the documents and all eight translations reviewed before selling to consumers internationally. Applicable mandatory laws differ.
10. Confirm invoices, update obligations, customer support, refund handling, BFSG applicability and data retention/deletion.
11. Test canonical/hreflang in generated HTML, 48 route HTTP responses, the sitemap, build, keyboard and screen-reader navigation.
12. Retain an immutable copy/version of contractual terms provided to customers at the time of sale.

## Privacy

Withdrawal records include names, emails and order details. The table is RLS-protected and service-role-only. Implement and verify a retention/deletion schedule grounded in applicable legal obligations. Keep the service role secret.

## References

- BGB 356a, 356, 312j, 312f: https://www.gesetze-im-internet.de/bgb/
- GDPR Art. 13: https://eur-lex.europa.eu/
- Google localized pages: https://developers.google.com/search/docs/specialty/international/localized-versions

Keep sales disabled until operational and legal checks are completed.