# Private MCP Editorial API

**Status:** Code on a feature branch. Not live until merged, deployed, configured and tested end to end. Do not connect ChatGPT before reviewing CI and database permissions.

## ChatGPT plan availability

As of October 2026, full custom MCP write / modify actions in ChatGPT are available to Business and Enterprise/Edu customers; Plus does not provide full custom MCP write access. Pro custom MCP is restricted to read/fetch. Check [OpenAI's current requirements](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt) before setup. Other compatible MCP clients may support write proposals independent of ChatGPT account tier.

## Purpose

A private, OAuth 2.1 authenticated, **approval-only** Model Context Protocol endpoint at `https://neuroklast.net/api/mcp`. ChatGPT can read editorial content and propose changes. Every change requires a separate logged-in administrator to apply it using `/admin/ai-content`. There is **no MCP delete operation**, no automatic publishing, and no direct SQL or file upload.

### Coverage

- News articles (`news_posts`)
- Events/shows (`gigs`)
- Discography (`releases`)
- Biography, members, partners, social links
- Gallery metadata and media download descriptions
- Music highlights, merchandise, products and soundpack descriptions
- Public-facing hero copy, merchandise footer copy, translations
- Read-only section configuration

Not exposed: orders, customers, license keys, private download assets, product pricing, payments, API secrets, users, analytics, tracking, security settings, the legal notice and privacy policy. Digital soundpacks cannot be created or priced via MCP; the existing admin flow verifies archives and pricing separately. Media uploads also remain in the admin UI.

## Security model

1. Supabase Auth OAuth 2.1 authorization code with PKCE. Only the explicitly registered OAuth client in `NEUROKLAST_MCP_CLIENT_ID` is accepted.
2. The access token must pass a live `supabase.auth.getUser(token)` check. Its **verified** claims must match the exact configured OAuth `client_id`, the user ID, and `aal2` (MFA).
3. The authenticated user must still have a server-confirmed `profiles.role = admin`.
4. Every authenticated request uses the existing durable PostgreSQL rate limiter, failing closed on errors. Payloads and result sizes are bounded.
5. A hardcoded table/column registry and per-field Zod validation prevent arbitrary table access, SQL execution or writes to sensitive fields.
6. A database-level restrictive RLS policy denies OAuth access tokens with a `client_id` direct table access, including access normally granted by the administrator's ordinary session. MCP uses its own server-side checks and privileges. This protects against attempts to bypass the content API via Supabase PostgREST. Audit existing privileged database functions and any other exposed schemas separately.
7. Proposals go to `mcp_content_requests` (RLS, no anon/authenticated database privileges). The existing privileged Supabase client is used only on the server after authorization.
8. Human review claims each request atomically; content snapshots are checked before applying to reject stale proposals. A server-side review history records creator, reviewer, time, operation, status and proposed values; it is not append-only or cryptographically tamper-proof.
9. New records remain inactive until separately published using the existing admin UI. Existing changes only apply after explicit review. There is no delete tool.

**Remaining review risks:** The conflict check and actual content UPDATE are separate DB operations. OAuth tokens are also not automatically isolated from existing privileged RPC functions; audit their grants before production. A concurrent human edit between them is a narrow race; serializable stored procedures or row locking would close it. Approval and operation are not one database transaction. Any deployment must treat this as an open hardening item. Review all public content renderers for stored XSS separately, including rich text and JSON.

## Setup (never commit real values)

1. Verify `supabase/schema.sql` is applied and `public.mcp_content_requests` exists with RLS enabled and **no** grants to `anon` or `authenticated`.
2. Supabase dashboard > Authentication > OAuth Server: enable OAuth 2.1, set Authorization Path to `/admin/oauth/consent`. Enable a signing configuration supported by your OAuth client. Confirm MFA/TOTP for the admin account.
3. Register a **dedicated production OAuth client** with only the exact callback URI required by your ChatGPT plugin. Avoid dynamic client registration unless you need it. Confirm the registered client ID is visible to the consent page.
4. Set the server-only Vercel environment variable `NEUROKLAST_MCP_CLIENT_ID` to that OAuth client ID. Do not expose it as `NEXT_PUBLIC_*`. Do not put a service-role key into ChatGPT or any plugin configuration.
5. Deploy after the CI gates pass. Check `/.well-known/oauth-protected-resource/api/mcp`, then verify anonymous and invalid OAuth tokens cannot read or propose content.
6. Confirm OAuth token cannot query any public table using the Supabase Data API, not just that MCP rejects forbidden requests. Confirm an ordinary admin cookie session still works.
7. In ChatGPT Plugins, use **Add custom MCP server**, server URL `https://neuroklast.net/api/mcp`, and connect using OAuth. You must be allowed to create custom MCP plugins on your plan/workspace.
8. Log in through `/admin/oauth/consent`, inspect client and scopes, complete MFA, then approve. Try `content_capabilities`, `content_list` and a harmless test proposal.
9. Open `/admin/ai-content`; compare the proposal with live content, approve or reject it, and verify the live page. Confirm approvals cannot be replayed, secrets are excluded, revoked clients fail, and publish/delete remains blocked.
10. When disabling access, unset `NEUROKLAST_MCP_CLIENT_ID` and redeploy; revoke the OAuth client and refresh sessions from Supabase as appropriate.

## Model tools

- `content_capabilities`
- `content_list` / `content_get`
- `content_propose_create` / `content_propose_update`
- `content_my_requests`
- `site_text_capabilities` / `site_text_get` / `site_text_propose_update`

Content proposal tools do not directly apply edits. An admin must approve every proposal, independently of any tool-call confirmation shown by ChatGPT. No API endpoint accepts a raw table name that is not in the fixed registry.

## Operational checks

- Confirm CI: lint, typecheck, tests, build.
- Run full MCP protocol/OAuth conformance tests in production-like staging.
- Run API penetration tests for IDOR, client-token substitution, unauthorized admin session, missing MFA, user-agent variations, CSRF, request floods, HTML injection, stale revisions, concurrent approvals and database downtime.
- Restrict and regularly inspect OAuth clients. Review audit logs and data retention, then document this integration in the privacy disclosures if relevant personal data is processed.
- The `/api/mcp` endpoint is **not ready for production access** simply because the code exists. No security can be guaranteed as absolute.
