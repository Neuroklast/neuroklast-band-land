# MCP OAuth activation

Implementation status (October 28, 2026): The production Supabase content-approval migration is applied; Vercel has NEXT_PUBLIC_SITE_URL=https://neuroklast.net. OAuth clients must be explicitly registered in Supabase OAuth Apps and authorized in /admin/integrations; no client is automatically trusted.

## Supabase Dashboard

Project: cvxhbdmhtesnkubublar.

1. Authentication > URL Configuration: confirm Site URL https://neuroklast.net.
2. Authentication > OAuth Server: enable OAuth 2.1. Set Authorization Path to `/admin/oauth/consent` (the canonical protected consent page). During the October 28 OAuth test Supabase was still redirecting to `/oauth/consent`. A same-origin compatibility redirect now accepts that old path and forwards the opaque `authorization_id` to the protected admin page. Prefer a dedicated pre-registered OAuth client; keep dynamic registration off when possible.
3. Authentication > OAuth Apps: register a client named NEUROKLAST Content. Use the exact ChatGPT callback URI shown during the client connection workflow. Choose public/confidential according to the ChatGPT configuration; do not guess the callback.
4. Use /admin/security > Two-factor authentication to enroll a TOTP factor and confirm a six-digit code (this promotes the admin session to AAL2). The OAuth consent page redirects to /admin/mfa when the session has not reached AAL2. Enable breached-password protection in Authentication security settings.

## Provider access in NEUROKLAST Admin

Open /admin/integrations. After verifying MFA, add each provider's pre-registered Supabase OAuth client ID to the private allowlist. The page permits immediate per-client block, re-enable, edit-by-registering-the-same-ID, and permanent removal from the NEUROKLAST allowlist, without redeployment. Removing the allowlist entry does not delete the OAuth app registered with Supabase Auth; delete/revoke that separately. Duplicate client registration now returns a correct Already registered status. An OAuth application must still be installed once in the provider account, unless the provider supports one-click installation. Do not copy client secrets into the admin form.

## OAuth AAL1 session and MFA attestation

The administrator's web session must be AAL2 to approve a client. Supabase creates a **separate OAuth client session at AAL1**, even after browser MFA. The MCP API therefore must not require the OAuth JWT itself to claim AAL2, and must never grant access based solely on an OAuth token's AAL1. Instead, a server-only 30-day MFA attestation is recorded after verified administrator approval, and the MCP API checks both the attestation and the actual `auth.sessions.oauth_client_id` / active `auth.oauth_consents` record through a restricted database RPC. Revoking client access or OAuth consent still denies access.

If an OAuth client already has consent, open `/admin/integrations`, verify your administrator MFA (AAL2), and click **Confirm MFA for OAuth** for that client. Reconnect the existing ChatGPT plugin; do **not** create another Supabase OAuth application. No client secret belongs on the admin page. If the attestation expires after 30 days, repeat the MFA confirmation.

## ChatGPT action discovery

OAuth success does not prove MCP tool discovery works. The server supports modern `server/discover` (2026-07-28) and legacy `initialize` (2025-06-18), followed by `tools/list`. All three require a valid bearer token from a real Supabase OAuth session, an enabled registered OAuth client, a verified administrator and a live server-recorded MFA attestation. The OAuth token itself may contain AAL1 even when browser approval was AAL2. Modern MCP responses include `resultType: "complete"`, while legacy initialization remains backward compatible. If ChatGPT reports "Authentication succeeded, action discovery failed", inspect Vercel production `POST /api/mcp` logs and the sanitized `[MCP_AUTH_DENIED]` reason; never paste access tokens or client secrets into logs. Reconnect the existing ChatGPT integration after deployment. A real-token end-to-end test is still required.

## Validate

Discovery: https://neuroklast.net/.well-known/oauth-protected-resource/api/mcp

MCP: https://neuroklast.net/api/mcp

Supabase issuer: https://cvxhbdmhtesnkubublar.supabase.co/auth/v1

Confirm unauthenticated, nonadmin, non-MFA and wrong-client requests fail; use a valid admin login to test reading content, proposing a draft and separately reviewing it at /admin/ai-content. Check that the OAuth token cannot use Supabase's Data API or exposed functions to bypass restrictions. Test refresh and revocation. Stop if any check fails.

Every new OAuth client must be registered with Supabase Auth and allowlisted under `/admin/integrations`; no legacy `NEUROKLAST_MCP_CLIENT_ID` environment setting is required. The test callback and full authenticated MCP operations still require a live end-to-end smoke test. See docs/MCP_CONTENT_INTEGRATION.md.


## Editorial deletion proposals

The MCP tool `content_propose_delete` queues a single-record removal for admin review. It does **not** delete during the tool call. `/admin/ai-content` requires AAL2 and a second explicit confirmation before the atomic database transaction deletes the record. Each proposal stores its previous snapshot and a reason; stale proposals must conflict, and approved proposals cannot be applied again. The allowed editorial collections exclude `products` and `soundpacks` to protect orders and licensing. Deleting a database record does not delete R2 media assets. Keep an export/backup before approving irreversible removals.
