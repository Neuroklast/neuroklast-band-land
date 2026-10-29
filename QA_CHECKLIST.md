# QA checklist
## Appearance editor extraction (2026-10-29)

- [ ] Verify `/admin/site-config` appearance controls load persisted and absent/default values identically. Preserve the default classic look, surface opacity values, favicon, font settings and saved custom themes.
- [ ] Test stored `false` and `0` sliders, legacy `zardonic-industrial` look mapping and overlay animation pool selection. The site preview should continue broadcasting draft settings before save.
- [ ] Verify unsaved changes, save error handling, success refresh and unchanged `updateSiteConfig` mutation. Compare the public appearance and mobile/desktop after saving.
- [ ] Run lint, typecheck, tests and security checks through build-free GitHub CI; production build, E2E and Lighthouse remain local-only maintainer checks.


## Sitemap refactor regression (2026-10-29)

- [ ] `/sitemap.xml` and `/api/sitemap` return well-formed XML, retain the correct content type and `Cache-Control: public, max-age=300, s-maxage=300`, and refresh with 300-second ISR.
- [ ] Static and DE/EN legal URLs remain ordered as before, with booking/news index entries present and no unpublished legal locales.
- [ ] Only active news, gigs, plugin products and soundpacks appear. Plugin kind and slug validation, UUID-format soundpack IDs and encoded news slugs remain unchanged. Event date is never used for `lastmod`; the last modification timestamp of news is used when available.
- [ ] Failure of one public Supabase table query leaves the other sitemap sections intact; confirm no login cookies are needed for sitemap reads.
- [ ] Run `npm run lint`, `npm run typecheck`, and `npm run test` via non-build GitHub CI; production build and Lighthouse remain **local only**.


## Local-only build and sync-job contract (2026-10-29)

- [ ] Verify `.github/workflows/ci.yml` has no build job, the former auto-building Lighthouse workflow is absent, and `npm run check:github-builds` passes. All Next.js and Lighthouse builds must run locally, never in GitHub Actions.
- [ ] Run `npm run build` and `bash scripts/run-mobile-audit.sh` on the maintainer's machine; document failures rather than claiming CI covered these jobs.
- [ ] Admin: create every supported sync-job type, including the purge types, and verify initial phases/payloads and 201 response remain unchanged.
- [ ] Admin: `/api/sync-jobs/active?types=spotify_sync,itunes_sync` filters both types; empty/blank filter means all, invalid type yields 400, unauthenticated access 401, success `Cache-Control: no-store`.


## Legacy source mirror consolidation (2026-10-29)

- [ ] `npm run audit:legacy` reports zero identical root/`src/` source mirrors. Treat its static importer report as evidence, not proof of no dynamic use.
- [ ] Spot-check theme switching, terminal/overlays, keyboard shortcuts, locales, admin activity log and color contrast; the root canonical implementations must remain unchanged.
- [ ] Run lint, typecheck, unit tests, security audit, build and mobile Lighthouse; test public and protected admin workflows in a browser before declaring full migration complete.

## News social previews

## Refactor regression checks (2026-10-29)

- [ ] Verify legacy iTunes/Odesli HTTP 429 retry behavior and browser color conversions after deduplicating `src/lib/fetch-retry.ts` and `src/lib/contrast.ts`. Ensure no new runtime dependency on `src/` is introduced.
- [ ] Run `npm run audit:legacy` and confirm it only inventories tracked imports and does not auto-delete modules; review dynamically resolved code and asset dependencies separately.

- [ ] Verify the public glitch animations, overlay transitions, keyframes, mobile effects and reduced-motion rules after migrating `src/animations.css` byte-for-byte to `styles/animations.css`. The legacy stylesheet entrypoint and the public site must import the same canonical file.
- [ ] MCP protected-resource discovery responds identically on `/.well-known/oauth-protected-resource/api/mcp` and `/.well-known/oauth-protected-resource/mcp`, with 503 when unconfigured, no-store cache and no anonymous content access.
- [ ] Admin gallery, media, member, partner, product and release visibility buttons preserve their labels, hover styles and saved visibility. Fail the update and confirm the optimistic label reverts.
- [ ] Remote-image import from a public HTTPS URL or Google Drive still optimizes and stores the image in R2; video import still stores its original source in the expected R2 prefix before the existing background transcode workflow.
- [ ] Invalid MIME, private hosts, oversized content and timeout produce errors without changing the previously saved item. The two media types retain different limits.
- [ ] `npm run audit:architecture` reports legacy mirrors without deleting anything. The live `styles/animations.css` is imported from both entrypoints and existing legacy tests remain executable.

- [ ] Share a news post with a stored R2 cover on WhatsApp, Facebook, X and Discord: OG and Twitter metadata resolve to `/news/[slug]/social-image?v=...`, return HTTP 200 with `image/jpeg`, 1200×630, and visibly match the news photo.
- [ ] The share image is letterboxed to preserve the entire photo without stretching. Copy/share links continue pointing to the individual public article.
- [ ] After changing a news cover, the preview URL version changes and the next share shows the updated image. Hidden/unpublished posts never expose a social image.
- [ ] A post without a cover uses `/og-image.png`, and external/non-R2 URLs cannot be fetched through the JPEG converter.

## News drag-and-drop ordering

- [ ] Drag a News / Blog row by its grip. The new order appears immediately, saves automatically, and survives refresh. Hidden rows may also be moved without changing visibility.
- [ ] On the public homepage the News cards follow `display_order` even when publication dates differ; dates and slugs remain unchanged.
- [ ] Space + arrow-key sorting and keyboard focus work. The grip is the only drag target, so View, Copy Link, Edit and visibility buttons still work.
- [ ] Simulate a failed or concurrent reorder: the UI shows an error and restores the previous order. No partial positions are committed.
- [ ] Newly created news appear first. Editing a news item without changing its order leaves the manually saved order intact.

## Private MCP editorial integration

- [ ] Existing queued release create proposals with active=false display Visible after Accept; accepting them inserts publicly visible and manually protected releases. Other new content remains drafts; approved existing release updates do not inadvertently change visibility.
- [ ] Accept/Reject immediately moves to the next card before the server returns. Multiple rapid decisions persist independently, an in-flight counter stays visible, double submissions are prevented, and server failures restore the proposal with a review shortcut.
- [ ] Do not leave the page while operations are in flight; navigation/reload warning appears. A missing response must never be shown as a successful approval.

- [ ] At typical desktop and mobile viewport sizes, AI Content Review shows Back, Reject, Accept and Skip without scrolling the admin page, including when the proposal has many tracks, streaming links or long text.
- [ ] Compact preview shows a limited set of highlights, explains that full information is in Review all, and the full changes/technical JSON are accessible in a separate scrollable dialog; opening it never submits a decision.
- [ ] At high browser zoom and on narrow screens, action footer stays reachable; deletion confirmation and errors do not push the actions below the viewport. Other admin pages retain native scrolling.

- [ ] Admin sidebar has a single AI section with Content Review and Integrations; neither remains buried under Content/System.
- [ ] AI review shows one proposal at a time, correct before/after fields (including config), navigation position, optional JSON, and recent decisions; responsive on narrow screens.
- [ ] Skip, Back, left/right keyboard navigation and horizontal touch swipes never submit changes. Accept/Reject submit exactly once, advance only on success and keep the current item visible on MFA/conflict/network failures.
- [ ] Approved proposals disappear from the pending queue after refresh. Back/Skip do not pretend to undo applied database changes. Old reviewed entries remain in the decision history.
- [ ] Deletion always requires a second, explicit click and its cancel action prevents submission. Rejection of deletion does not delete content.

- [ ] Release types Song, Single, EP, Album, Remix and Compilation can be proposed over MCP and reviewed in the admin; the site shows distinct Single/EP/Song filters.

- [ ] Reviewed MCP removal queues a pending request; approval with MFA deletes exactly one editorial record, rejection leaves it unchanged.
- [ ] Stale removal requests conflict, repeated approval does nothing, and commerce records are excluded.

- [ ] Supabase OAuth JWT AAL1 with real OAuth session, active OAuth consent, current 30-day MFA attestation and admin profile is accepted for discovery; same JWT without attestation is rejected with 403.
- [ ] Direct anonymous/authenticated access to `mcp_oauth_mfa_grants` and `mcp_verify_oauth_mfa_grant` is denied. Expired, revoked or forged OAuth sessions and disabled clients fail closed.
- [ ] Existing client can use admin **Confirm MFA for OAuth** without rotating keys; server action requires current browser MFA AAL2.

- [ ] ChatGPT OAuth callback followed by `server/discover` (2026-07-28), `tools/list` and a read-only tool call returns valid complete results. Inspect `[MCP_AUTH_DENIED]` only for sanitized reason codes.
- [ ] Legacy 2025-06-18 `initialize` and `tools/list` still work, anonymous requests fail, and revoked clients fail with previously issued tokens.

- [ ] Supabase OAuth Authorization Path `/oauth/consent` redirects (303) to `/admin/oauth/consent`, preserving the exact opaque `authorization_id`; malformed IDs get 400 with no external redirect.
- [ ] Protected admin login round-trip, MFA challenge, consent decision and callback preserve the original authorization request. Verify non-hex characters in Supabase-generated IDs.

- [ ] Empty OAuth client allowlist: MCP rejects all bearer tokens; no anonymous reads.
- [ ] Each registered client ID must be separately enabled by an MFA-backed admin; disabled clients are rejected on the next request.
- [ ] Direct anon/authenticated database access to `mcp_oauth_clients` is denied.
- [ ] OAuth login requires an allowlisted client ID, real administrator account and AAL2 MFA at consent / separate current admin re-attestation; bearer request requires validated grant.
- [ ] Verify no access to legal content, orders, personal information, plugin keys or payment pricing.
- [ ] Check content read, paginated collections, draft proposal, admin approval/rejection and audit history.
- [ ] Run PostgreSQL integration test `supabase/tests/mcp-content.sql`; verify atomic update, draft visibility, stale conflicts, replay prevention, restricted RPC grants.
- [ ] Verify stale edit conflicts, double-click approvals, failed database writes and bot-shield compatibility.
- [ ] Confirm new items remain unpublished until explicitly activated from native admin.
- [ ] Confirm MCP OAuth provider metadata and ChatGPT connector setup in a staging environment.

## YouTube embeds

- [ ] On the homepage Music Highlights section, confirm YouTube is not contacted until the consent button is clicked.
- [ ] After consenting, verify the video plays without error 153 in Chrome and Firefox and sends the site origin in the iframe request `Referer` header.
- [ ] Repeat for a YouTube item in the media overlay; confirm the external YouTube playback option remains available if playback is blocked by the browser or YouTube.

## NEUROKORE licensing and sales

- [ ] Publish a newer NEUROKORE GitHub beta with Setup/ZIP and SHA-256 sidecars; after cache revalidation, confirm its version, notes, checksums and separate installer/ZIP links on `/plugins/neurokore/download`.
- [ ] Disable public downloads or hide NEUROKORE: GitHub-backed links must remain unavailable. Confirm existing macOS/R2 downloads and other plugins are unaffected.
- [ ] Simulate GitHub failure/incomplete assets: retain CMS downloads and never advertise a partial installer or claim its signature is verified.

See [commerce setup and launch checks](docs/NEUROKORE_COMMERCE.md). All launch checks are pending until the configured staging environment, native plugin build and Stripe test flow have passed. Do not enable live sales based only on unit tests.

- [ ] `supabase/schema.sql` has been applied (products + NEUROKORE license tables). `/admin/neurokore` issues an alpha key, copies it, and the NeuroCore plugin activates against `POST /api/license/v1/activate` while the Products section is still off.
- [ ] `/admin/products` section toggle off: homepage has no Products block, `/neurokore` is 404, plugin activate still returns a signed v2 license.
- [ ] `/admin/products` section toggle on: homepage Products section appears, `/neurokore` and `/neurokore/account` load.
- [ ] Create/edit/hide/delete a product with R2 image, description, `/neurokore` path or https URL, optional price label.

- [ ] In Admin → Look & Feel → Background, upload MP4/MOV/WebM on desktop and separate-mobile. Confirm encode/upload progress and scroll seeking at top/middle/bottom.
- [ ] Import a public video URL and a Google Drive video. Confirm temporary R2 source cleanup and only encoded MP4 is selected.
- [ ] Test an unsupported/oversized/corrupt video. Existing live background must remain unchanged, errors must be visible.

### Release Manager product sync

- [ ] A manager beta release creates one new NEUROKORE product version with Installer and Bundle downloads.
- [ ] R2 file hashes and displayed versions match GitHub; public/admin views refresh.
- [ ] Interrupted transfer can retry without duplicate versions or replacing published assets.
- [ ] Missing/wrong sync credentials deny import; withdrawn releases stay withdrawn.
