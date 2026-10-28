# MCP OAuth activation

Implementation status (October 28, 2026): The production Supabase content-approval migration is applied; Vercel has NEXT_PUBLIC_SITE_URL=https://neuroklast.net. No OAuth client has been registered or activated by this change.

## Supabase Dashboard

Project: cvxhbdmhtesnkubublar.

1. Authentication > URL Configuration: confirm Site URL https://neuroklast.net.
2. Authentication > OAuth Server: enable OAuth 2.1. Authorization Path: /admin/oauth/consent. Prefer a dedicated pre-registered OAuth client; keep dynamic registration off if supported by your ChatGPT integration.
3. Authentication > OAuth Apps: register a client named NEUROKLAST Content. Use the exact ChatGPT callback URI shown during the client connection workflow. Choose public/confidential according to the ChatGPT configuration; do not guess the callback.
4. Use /admin/security > Two-factor authentication to enroll a TOTP factor and confirm a six-digit code (this promotes the admin session to AAL2). The OAuth consent page redirects to /admin/mfa when the session has not reached AAL2. Enable breached-password protection in Authentication security settings.

## Vercel

In project neuroklast-band-land set a production-only server-side variable NEUROKLAST_MCP_CLIENT_ID to the registered Supabase OAuth client ID, then redeploy the production app. No other credential should be sent to ChatGPT.

## Validate

Discovery: https://neuroklast.net/.well-known/oauth-protected-resource/api/mcp

MCP: https://neuroklast.net/api/mcp

Supabase issuer: https://cvxhbdmhtesnkubublar.supabase.co/auth/v1

Confirm unauthenticated, nonadmin, non-MFA and wrong-client requests fail; use a valid admin login to test reading content, proposing a draft and separately reviewing it at /admin/ai-content. Check that the OAuth token cannot use Supabase's Data API or exposed functions to bypass restrictions. Test refresh and revocation. Stop if any check fails.

This integration remains disabled until a real OAuth client ID is configured. See docs/MCP_CONTENT_INTEGRATION.md.
