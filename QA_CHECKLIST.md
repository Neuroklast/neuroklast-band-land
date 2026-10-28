# QA checklist

## Private MCP editorial integration

- [ ] Empty OAuth client allowlist: MCP rejects all bearer tokens; no anonymous reads.
- [ ] Each registered client ID must be separately enabled by an MFA-backed admin; disabled clients are rejected on the next request.
- [ ] Direct anon/authenticated database access to `mcp_oauth_clients` is denied.
- [ ] OAuth login requires an allowlisted client ID, real administrator account and AAL2 MFA.
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
