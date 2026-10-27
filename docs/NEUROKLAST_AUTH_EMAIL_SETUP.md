# NEUROKLAST customer login email — activation steps

The branded email lives in `supabase/templates/neuroklast-magic-link.html` and is kept in source control. Supabase hosted Auth does **not** automatically pick up repository HTML files.

## 1. Fix Auth redirect URLs

Open [Supabase Auth URL Configuration](https://supabase.com/dashboard/project/cvxhbdmhtesnkubublar/auth/url-configuration).

- **Site URL:** `https://neuroklast.net`, never `http://localhost:3000` on the hosted project.
- **Additional Redirect URLs:** add
  `https://neuroklast-band-land-git-chore-neur-cb3e37-neuroklasts-projects.vercel.app/neurokore/auth/callback`
  (the stable Preview branch alias).
- Add `https://neuroklast.net/neurokore/auth/callback` **only after** the corresponding callback code is deployed on Production.
- The sign-in route uses `emailRedirectTo` explicitly and redirects only to `/neurokore/auth/callback`. The callback exchanges the Supabase PKCE code for a cookie-backed customer session.
- Old Magic Links sent before these changes, especially URLs using localhost, must not be reused. Request a new email.

## 2. Install the branded login email

Go to [Supabase Auth Email Templates](https://supabase.com/dashboard/project/cvxhbdmhtesnkubublar/auth/templates), edit **Magic Link / OTP**:

- Subject: `NEUROKLAST | Your sign-in link`
- HTML: paste the complete source of `supabase/templates/neuroklast-magic-link.html`.
- **Keep `{{ .ConfirmationURL }}` unchanged** — Supabase generates this link with its one-time verification token and `redirect_to`.
- Save and send a fresh email. Other Auth email templates (Confirm Signup, Recovery, Invite) are separate; adapt them if those flows are enabled for customers.
- Avoid link tracking or rewriting verification URLs. Email link prefetch can consume one-time links; if users report an already-used link, consider a manual confirmation page or switch to an emailed OTP.

This template uses inline CSS, no remote images, no open tracking pixels and no external fonts.

## 3. Deliver Supabase Auth mails via the verified Resend domain

Resend confirmation mails sent directly by the webshop are separate from Supabase Auth messages. If Auth is still using `noreply@mail.app.supabase.io`, configure **Custom SMTP** in [Supabase Authentication SMTP Settings](https://supabase.com/dashboard/project/cvxhbdmhtesnkubublar/auth/smtp).

- Host: `smtp.resend.com`
- Port: `465` (SSL)
- Username: `resend`
- Password: a **Resend API key** (enter directly in the Supabase dashboard; do not send in chat)
- Sender address: `noreply@neuroklast.net` (verified domain)
- Sender name: `NEUROKLAST`

The Resend key already configured in **Vercel Preview** makes the **purchase confirmation** work; it does **not** change Supabase Auth's SMTP sender. SMTP settings apply to the shared Supabase project (including Production), so validate the provider and sender before saving.

## 4. End-to-end verification

1. Open the protected Vercel Preview as an authorized test customer.
2. On `/plugins/neurokore`, use the new **email sign-in form** in the Buy Licence section.
3. Verify the new Auth email has the branded HTML, correct sender and a link to the Preview callback instead of localhost.
4. Open the link. It should navigate to `/neurokore/account` with an authenticated session.
5. Return to `/plugins/neurokore#purchase`; the purchase button should now be active.
6. After the remaining licence encryption and signing secrets are set for Preview, complete the €1 Stripe Sandbox purchase, verify the webhook, and inspect the branded Resend receipt.
7. Test invalid and expired links, duplicate webhook delivery and optional deletion of sandbox keys.

Production `NEUROKORE_SALES_ENABLED` stays disabled during this test.
