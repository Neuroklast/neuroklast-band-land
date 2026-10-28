# Private MCP Editorial API

**Status:** MCP API deployed. Each OAuth client remains denied until registered in Supabase Auth and separately authorized in `/admin/integrations`; OAuth end-to-end testing is still required.

## ChatGPT plan availability

As of October 2026, full custom MCP write / modify actions in ChatGPT are available to Business and Enterprise/Edu customers; Plus does not provide full custom MCP write access. Pro custom MCP is restricted to read/fetch. Check [OpenAI's current requirements](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt) before setup. Other compatible MCP clients may support write proposals independent of ChatGPT account tier.

## Purpose

A private, OAuth 2.1 authenticated, **approval-only** Model Context Protocol endpoint at `https://neuroklast.net/api/mcp`. ChatGPT can read editorial content and propose changes. Every change requires a separate logged-in administrator to apply it using `/admin/ai-content`. New music releases become publicly visible only **after** the administrator approves them; they are also marked as manually edited to protect them from subsequent sync. Other newly created editorial records stay unpublished drafts. Older queued release-create requests with `active=false` are normalized to visible upon approval. Review navigation advances optimistically while the server action finishes and displays errors if saving fails. An MCP deletion proposal is available for editorial records; a separate MFA-authenticated administrator must explicitly approve permanent removal. Products and soundpacks are excluded because they have commerce relations. There is no automatic publishing and no direct SQL or file upload.

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

1. Supabase Auth OAuth 2.1 authorization code with PKCE. Each OAuth client must exist in the private `mcp_oauth_clients` database allowlist and be enabled by an MFA-verified administrator.
2. The access token must pass a live `supabase.auth.getUser(token)` check. Its verified claims must match the enabled OAuth `client_id` and user ID. OAuth sessions can report `aal1`; a separate server-only MFA attestation created by the AAL2 admin approval must also be valid.
3. The authenticated user must still have a server-confirmed `profiles.role = admin`.
4. Every authenticated request uses the existing durable PostgreSQL rate limiter, failing closed on errors. Payloads and result sizes are bounded.
5. A hardcoded table/column registry and per-field Zod validation prevent arbitrary table access, SQL execution or writes to sensitive fields.
6. A database-level restrictive RLS policy denies OAuth access tokens with a `client_id` direct table access, including access normally granted by the administrator's ordinary session. MCP uses its own server-side checks and privileges. This protects against attempts to bypass the content API via Supabase PostgREST. Audit existing privileged database functions and any other exposed schemas separately.
7. Proposals go to `mcp_content_requests` (RLS, no anon/authenticated database privileges). The existing privileged Supabase client is used only on the server after authorization.
8. Human review executes a single `mcp_apply_content_request` PostgreSQL function under a transaction. The function locks the proposal and content row, compares the saved content snapshot, validates an independent SQL allowlist, commits the edit and its review status together, and prevents replay. Failures roll back completely. See `supabase/tests/mcp-content.sql`. A server-side review history records creator, reviewer, time, operation, status and proposed values; it is not append-only or cryptographically tamper-proof.
9. New records remain inactive until separately published using the existing admin UI. Existing changes only apply after explicit review. Deletion is supported only for explicitly allowlisted editorial collections, requires separate AAL2 admin review, checks the full saved record for conflicting changes, and does not remove stored R2 media assets.

**Remaining review risks:** OAuth tokens are not automatically isolated from existing privileged RPC functions. Inspect grants and audit all exposed functions before production. The review/audit table is not append-only. Review public content renderers for stored XSS, including rich text and JSON. Live OAuth+MFA handshakes and user permissions must be tested end to end before enabling any client.

## Setup (never commit real values)

1. Verify `supabase/schema.sql` is applied and `public.mcp_content_requests` exists with RLS enabled and **no** grants to `anon` or `authenticated`.
2. Supabase dashboard > Authentication > OAuth Server: enable OAuth 2.1, set Authorization Path to `/admin/oauth/consent`. Enable a signing configuration supported by your OAuth client. Confirm MFA/TOTP for the admin account.
3. Register a dedicated OAuth client per AI provider in Supabase OAuth Apps using its verified callback URI; keep dynamic client registration disabled by default. 
4. Visit `/admin/integrations`, complete MFA (AAL2), and explicitly allowlist the registered client ID. This is separate from OAuth registration and does not install the connector in the provider app. No client secret is needed in the NEUROKLAST admin panel.
5. Deploy after the CI gates pass. Check `/.well-known/oauth-protected-resource/api/mcp`, then verify anonymous and invalid OAuth tokens cannot read or propose content.
6. Confirm OAuth token cannot query any public table using the Supabase Data API, not just that MCP rejects forbidden requests. Confirm an ordinary admin cookie session still works.
7. In ChatGPT Plugins, use **Add custom MCP server**, server URL `https://neuroklast.net/api/mcp`, and connect using OAuth. You must be allowed to create custom MCP plugins on your plan/workspace.
8. Log in through `/admin/oauth/consent`, inspect client and scopes, complete MFA, then approve. Try `content_capabilities`, `content_list` and a harmless test proposal.
9. Open `/admin/ai-content`; compare the proposal with live content, approve or reject it, and verify the live page. Confirm approvals cannot be replayed, secrets are excluded, revoked clients fail, publishing stays blocked, and deletion requires explicit admin confirmation. Never test destructive approvals on production content.
10. When disabling access, unset `NEUROKLAST_MCP_CLIENT_ID` and redeploy; revoke the OAuth client and refresh sessions from Supabase as appropriate.

## Model tools

- `content_capabilities`
- `content_list` / `content_get`
- `content_propose_create` / `content_propose_update` / `content_propose_delete`
- `content_my_requests`
- `site_text_capabilities` / `site_text_get` / `site_text_propose_update`

Content proposal tools do not directly apply edits. An admin must approve every proposal, independently of any tool-call confirmation shown by ChatGPT. The admin review screen uses a single-proposal slider with field-level before/after values, Accept/Reject, Back/Skip, keyboard and swipe navigation, optional JSON and a recent-decision history. Back/Skip only change the viewed proposal; they do not reverse already committed decisions. Deletions still require a second explicit confirmation. No API endpoint accepts a raw table name that is not in the fixed registry.

## Operational checks

- Confirm CI: lint, typecheck, tests, build.
- Run the database SQL contract via `psql -v ON_ERROR_STOP=1 -f supabase/tests/mcp-content.sql` in disposable CI only, then full MCP protocol/OAuth conformance tests in production-like staging.
- Run API penetration tests for IDOR, client-token substitution, unauthorized admin session, missing MFA, user-agent variations, CSRF, request floods, HTML injection, stale revisions, concurrent approvals and database downtime.
- Restrict and regularly inspect OAuth clients. Review audit logs and data retention, then document this integration in the privacy disclosures if relevant personal data is processed.
- Production readiness cannot be inferred from deployment alone; verify each newly added MCP operation with authenticated and negative tests. No security can be guaranteed as absolute.
