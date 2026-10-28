# MCP OAuth activation

Implementation status (October 28, 2026): The production Supabase content-approval migration is applied; Vercel has NEXT_PUBLIC_SITE_URL=https://neuroklast.net. OAuth clients must be explicitly registered in Supabase OAuth Apps and authorized in /admin/integrations; no client is automatically trusted.

## Supabase Dashboard

Project: cvxhbdmhtesnkubublar.

1. Authentication > URL Configuration: confirm Site URL https://neuroklast.net.
2. Authentication > OAuth Server: enable OAuth 2.1. Authorization Path: /admin/oauth/consent. Prefer a dedicated pre-registered OAuth client; keep dynamic registration off if supported by your ChatGPT integration.
3. Authentication > OAuth Apps: register a client named NEUROKLAST Content. Use the exact ChatGPT callback URI shown during the client connection workflow. Choose public/confidential according to the ChatGPT configuration; do not guess the callback.
4. Use /admin/security > Two-factor authentication to enroll a TOTP factor and confirm a six-digit code (this promotes the admin session to AAL2). The OAuth consent page redirects to /admin/mfa when the session has not reached AAL2. Enable breached-password protection in Authentication security settings.

## Provider access in NEUROKLAST Admin

Open /admin/integrations. After verifying MFA, add each provider's pre-registered Supabase OAuth client ID to the private allowlist. The page permits immediate per-client block and re-enable, without redeployment. An OAuth application must still be installed once in the provider account, unless the provider supports one-click installation. Do not copy client secrets into the admin form.

## Validate

Discovery: https://neuroklast.net/.well-known/oauth-protected-resource/api/mcp

MCP: https://neuroklast.net/api/mcp

Supabase issuer: https://cvxhbdmhtesnkubublar.supabase.co/auth/v1

Confirm unauthenticated, nonadmin, non-MFA and wrong-client requests fail; use a valid admin login to test reading content, proposing a draft and separately reviewing it at /admin/ai-content. Check that the OAuth token cannot use Supabase's Data API or exposed functions to bypass restrictions. Test refresh and revocation. Stop if any check fails.

This integration remains disabled until a real OAuth client ID is configured. See docs/MCP_CONTENT_INTEGRATION.md.
