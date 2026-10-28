# Legal commerce launch checks (2026-10-28)

Repository controls for data processing, consumer contracts and access are not
a legal certificate. Keep this checklist synchronized with production.

- Vercel Pro deployment: daily /api/cron/privacy-retention and every 15 minutes
  /api/cron/withdrawal-receipts via vercel.json. Verify CRON_SECRET, deployment
  schedule and execution; configure alerts for non-2xx results and failed mail.
- CONTACT_FROM_EMAIL must be available in production and verified with Resend.
  Test a real withdrawal acknowledgement without disclosing customer data.
- Plugin checkout requires on-site terms acknowledgement with
  terms_accepted_at stored server-side. Apply the updated supabase/schema.sql
  before merging/deploying. This is distinct from consent to waive withdrawal rights.
- Actual checkout and receipt must accurately disclose Managed Payments merchant
  of record and licensor. Verify Stripe-controlled terms/privacy links.
- Public legal documents are DE and EN. Check exact legal identity, postal
  address, any required editorial responsible person, actual tax identifiers
  and registered legal form with the operator.
- Data protection statement includes actual support-inbox database storage,
  practical retention periods, order-match triage and plugin beta diagnostics.
- Schedule mandatory support/withdrawal retention, back-up retention, incident
  response, and test both primary and recovery flows.
- DPA index: docs/DPA_REGISTER_20261028.md. Contract inclusion must be
  verified for each legal entity. Do not post private signed copies publicly.
- Check the specific distributed installer/EULA against checkout, statutory
  warranties, update obligations and two-device/offline activation promises.
- Confirm external media rights, contact form, hosted fonts, iframe consents,
  security headers, keyboard interaction, responsive legal links and BFSG
  scope in a real browser.
- Separate repository-source license from consumer plugin contracts.
- Soundpack and preset licensing is intentionally out of scope.
- FFmpeg licensing is intentionally out of scope.

Do not claim compliance merely because files exist. Complete the production
verification and obtain legal professional review before a legal release sign-off.
