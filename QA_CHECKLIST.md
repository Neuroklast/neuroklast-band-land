# QA checklist

## Plugin admin API error contracts (2026-11-15)

- [ ] Missing sign-in returns 401; missing admin permission or MFA returns 403, with the existing MFA remediation text.
- [ ] Zod validation and malformed requests return 422/400, too-large body 413, rate limit 429.
- [ ] Duplicate key and blocked product deletion return 409. Missing schema/RPC or unavailable storage return 503, unexpected internal exception 500.
- [ ] Product list must fail explicitly if any secrets/release/licence-count query fails; do not display zeros for failed reads.
- [ ] Product deletion cannot ignore a failed artifact-key list; check database failures before any destructive operation.



## Server command validation contract (2026-11-15)

- [ ] Every server command descriptor has `execution: 'server'` and no executable placeholder.
- [ ] Calling `dispatchAdminAction()` for a server command returns explicit refusal, not success.
- [ ] Next.js admin actions validate schema/disclosure before their existing authorized mutation; failed writes cannot be confused with validation success.
- [ ] Local UI state commands remain executable and keep their original behavior.
- [ ] Test create, edit, delete, import, factory reset and media sync flows without changing saved data unless the actual authorized handler is invoked.



## Architecture contract fixes (2026-11-15)

- [ ] Disconnect Supabase / simulate a returned PostgREST error on Look & Feel, Sections and Bio: the editor must not mount with blank defaults; show an explicit retryable error instead.
- [ ] With a legitimately absent config/bio row, verify the editor renders true defaults, and persists the intended new entry.
- [ ] On Analytics, returned errors in counts, events or config must not render false zero metrics or editable fallback settings.
- [ ] Check both homepage and discography use one canonical release projection. A schema error must be logged and not trigger an error-text-based fallback query.
- [ ] Opening discography during backend errors must show unavailable (not an empty catalogue). Test valid empty discography separately.
- [ ] Verify strict admin MFA page-coverage contract with the full test suite and keep page registry synchronized.


## Mandatory architecture and root-cause review (all PRs, 2026-11-15)

- [ ] Demonstrate a reproduced failure and evidence for its root cause, then enumerate affected pages, APIs, jobs and other callers.
- [ ] Fix the owning abstraction rather than adding another local exception, fallback, dummy handler or silent catch. Verify the new code has no false success paths.
- [ ] Test Supabase returned errors, network outages, retries/duplicates, missing schema/configuration, authorization and recovery as applicable.
- [ ] Confirm an empty successful read is distinguishable from a failed load and cannot overwrite real saved data with defaults.
- [ ] Confirm audit logs, financial changes and media cleanup have explicit durable success/failure and retry behavior.
- [ ] Ensure the audit backlog is updated or explicitly linked, and no known defect is falsely marked resolved. Refer to [AGENTS.md](AGENTS.md#mandatory-engineering-standard-no-quick-fixes) and [the architecture audit](docs/ARCHITECTURE_DEBT_AUDIT_2026-11-15.md).
- [ ] Block merge for any dirty/quick fix even if CI is green. Report unavailable local build, browser checks and production checks honestly.


## Centralized admin MFA navigation (2026-11-15)

- [ ] With an enrolled authenticator but AAL1 session, navigate to `/admin/contact-inbox`, `/admin/contact-spam`, `/admin/orders`, `/admin/privacy`, `/admin/withdrawals`, `/admin/plugins/beta-diagnostics` and an existing `/admin/soundpacks/{id}` route. Every protected page must redirect to `/admin/mfa` rather than show the generic server error.
- [ ] Verify TOTP and return to the requested page with the full query string preserved (Inbox `q` / `show=all`, Orders `q` / `payment`).
- [ ] Confirm AAL2 sessions load directly, refreshed auth cookies and cache-control headers survive redirect, and non-admin sessions remain denied.
- [ ] Check `/admin/mfa`, `/admin/security`, unrelated admin routes, all API/form POST endpoints and `/admin/soundpacks/new` avoid accidental MFA navigation loops. Server guards and MFA enforcement must remain active.
- [ ] Verify on mobile and desktop after production deployment. Non-build CI plus local Next.js build and authenticated browser MFA test are required for end-to-end sign-off.
## Contact form URL-only bot suppression (2026-11-16)

- [ ] Same standalone HTTP(S) URL in subject and body, including `:https://neuroklast.net/:`, is silently rejected without storage or outgoing Resend email.
- [ ] URL-containing booking, artist, press and licensing enquiries are accepted; different URL subjects/bodies are not accidentally discarded.
- [ ] Previous blacklist rules, sales-pitch heuristic, Turnstile and 5/15-minute rate limiting retain their behavior.
- [ ] Confirm a fresh production test submission (without creating false business records) after deployment, and review delivery/inbox side effects. Historical spam entries are not retroactively deleted.

## Contact spam blacklist (2026-11-05)

- [ ] Set whole-word and multiword rules under /admin/contact-spam; save, reload and verify persistence across deployments. Test with enabled and disabled filtering.
- [ ] Submit mixed-case and Unicode rules in subject/body; confirm visible spam-suspicion rejection with a working Impressum link and retained form text. Ensure no Supabase contact-inbox row or Resend email exists for the rejected message.
- [ ] Verify substrings in innocent longer words are not blocked; empty blacklist permits ordinary valid enquiries. Malformed rule input and database failure must never bypass configured rules.
- [ ] Confirm `anon` and regular authenticated users cannot SELECT the `site_config.contact_spam_filter` row through Data API, while admins can edit it, and existing honeypot + rate limit still operate.
- [ ] Review privacy wording in all supported languages and test keyboard/screen-reader alert behavior.

## Background desktop/mobile video controls (2026-10-29)

- [ ] Desktop video enable switch toggles without clearing stored media. Uploading a video automatically enables it; clearing a video does not disable the switch.
- [ ] Desktop picker retains background/videos R2 prefix and desktop scrub variant. Video opacity is shown only when enabled, without resetting its previous value.
- [ ] Mobile modes Same as desktop / Different video / No video on mobile select correctly; separate mobile picker appears only in Different video mode with mobile scrub variant.
- [ ] Unsaved live preview retains selected-but-inactive mobile media; save stores mobile paths/URLs only in separate mode. Empty preview values are omitted, empty saved values are explicit null.
- [ ] Image picker, animation style, image opacity, dirty warning, error messages and save success/refresh work unchanged.
- [ ] Run build-free CI then local production build, browser E2E/responsive screenshots and Lighthouse separately for visual sign-off.

## Hero reducer and persistent draft state (2026-10-29)

- [ ] Edit tagline, alt text, CTA label/URL, boot switch and PowerGlitch controls in sequence; the live-preview broadcast and saved payload contain all recent edits without losing sibling fields.
- [ ] Upload or clear background and logo; verify path-only media resolution retains prior preview URL while reset/clear stores null URL/path in JSON.
- [ ] Check legacy wordmark widths, custom logo preview and independently sized mobile/desktop preview remain correct.
- [ ] Verify `powerGlitch` mode/duration/slices/shake/hue/pulse/continuous field order and values; switching one never resets others.
- [ ] Verify unsaved warning, saved snapshot, save failure and success-refresh exactly as before; fallback wordmark appears in draft preview only.
- [ ] CI lint/typecheck/tests/security only (no GitHub build); run production build, Playwright E2E and Lighthouse locally for manual visual sign-off.

## Hero media controls / responsive previews (2026-10-29)

- [ ] Upload a hero wordmark; confirm R2 picker still uses contain, maximum 4096px, and both desktop/mobile previews show the same custom logo at independent percentages.
- [ ] Reset to default wordmark; the preview uses the default image but saved `logoImageUrl` / `logoImageStoragePath` remain null. Verify no replacement path is invented.
- [ ] Upload/clear the hero background overlay: 16:9 cover crop, existing image preview and 0–1 opacity slider. Empty saved URL/path remain null.
- [ ] Check alt text, tagline, CTA, boot sequence, PowerGlitch fields, dirty warning, live preview, save/refresh and error responses are unchanged.
- [ ] Run build-free CI, and independently run local Playwright responsive screenshot/interaction checks, Next.js build and Lighthouse before visual sign-off.

## Hero editor extraction (2026-10-29)

- [ ] Hero wordmark desktop width and mobile width preserve their independent percentages and existing preview widths, including older stored `logoMaxHeightRem` / `logoMaxHeight` settings.
- [ ] PowerGlitch Off hides duration, slice and checkbox controls; Hover and Always show them with original labels and selections.
- [ ] PowerGlitch duration 120–8000 ms, slice count 2–16, Shake, Hue rotate, Pulse and Continuous update the same hero draft before saving.
- [ ] Verify logo and background pickers, fallback wordmark preview, boot-sequence toggle, alt text, CTA fields, unsaved warning and save success/error remain unchanged.
- [ ] Run build-free GitHub CI. Independently perform local browser, responsive screenshot and Lighthouse checks before claiming visual equivalence.

## Appearance editor reducer (2026-10-29)

- [ ] Selecting a look updates all visual settings together, while not overwriting the overlay animation pool, custom presets or favicon.
- [ ] Changing a color-theme preset changes the palette and accent only. Editing a single theme field preserves other settings, including booleans set to false and numeric values set to 0.
- [ ] Overlay animation selection supports rapid toggles and deselecting the last animation; saved JSON retains the original fallback animation.
- [ ] Custom preset names are trimmed, duplicate names replaced, and empty names ignored. Readable defaults change only section and card opacity.
- [ ] Unsaved-change warning, cross-tab live preview, successful save refresh and save error recovery remain functional; saved JSON equals last preview payload.
- [ ] GitHub CI runs lint/typecheck/test/security without any build. Run local build, Playwright and Lighthouse separately before claiming UI equivalence.

## Appearance visual effects and serialized draft (2026-10-29)

- [ ] Appearance > Visual effects stays collapsed initially and retains switches for CRT, Scanlines, Noise, Glitch and Film grain, plus the three original intensity sliders.
- [ ] Toggle each switch and update each slider: live preview changes before save, unsaved warning remains, and no field resets another value.
- [ ] Verify favicon URLs/storage paths are stored as null when blank and as entered when set; empty animation-pool falls back to the original overlayAnimation while preserving an empty array.
- [ ] Verify save success/error, unsaved-change tracking and refresh through the original `updateSiteConfig` server action; no extra API calls from child UI controls.
- [ ] Run build-free CI (lint, Typecheck, Vitest, security), and separately run local Next.js build, Playwright and Lighthouse.


## Appearance editor controlled sections (2026-10-29)

- [ ] Appearance > Quick start opens by default; switching a look, built-in preset or saved custom preset updates the same theme and preview as before.
- [ ] Selecting/deselecting overlay animations updates the same pool, including disabling the last active animation. Saving a custom theme and switching to readable defaults still work.
- [ ] Section opacity 0 disables the grid slider and shows the readability warning. Test nonzero opacity, grid and card controls.
- [ ] Colors & fonts remains initially collapsed; color-picker and HEX changes update the theme; typography and font-size controls keep their values.
- [ ] Favicon selection, clearing and error feedback work. Parent still warns for unsaved changes, broadcasts drafts, persists the unchanged JSON and refreshes on success.
- [ ] Non-build CI green; independently run local production build, E2E and mobile Lighthouse before declaring complete manual QA.

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

- [ ] Existing queued create proposals with active=false display Visible after Accept for releases, news, gigs, and other editorial collections; accepting inserts publicly visible items. Releases remain manually protected. Existing-record updates do not inadvertently change visibility.
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
- [ ] Confirm new items remain unpublished until administrator Accept, then become visible immediately without an extra admin toggle. Existing-record visibility updates still honor explicit active=false.
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

## Living documentation review

- [ ] A source-only PR without quality journal or owning docs is rejected.
- [ ] A malformed journal entry fails CI; a docs-only PR needs no fake release note.
- [ ] Documentation claims, failed reads and test evidence match the implementation.


## Billing feature acceptance (2026-11-17, UNVERIFIED)

- [ ] Verify seller legal name, address, tax identifier, tax status and previous invoice numbers before first issuance.
- [ ] Set `R2_BUCKET_BILLING` to a private bucket and confirm anonymous access is denied.
- [ ] Apply canonical billing SQL via controlled migration; verify RLS, grants and immutable-issue trigger.
- [ ] PR lint, typecheck, unit tests and living-doc checks pass.
- [ ] Open billing dashboard, customer editor, draft editor, settings and review under MFA.
- [ ] Test concurrent issuance, retry after R2 failure and identical-number idempotency.
- [ ] Test duplicate MCP approval and concurrent payment attempts without double credit.
- [ ] Check PDF rendering in a real PDF reader and FODT with LibreOffice.
- [ ] Add EN16931 XML, XRechnung/ZUGFeRD + PDF/A validation before E-Rechnung claims.
- [ ] Obtain legal/tax review and validate GoBD archive, retention and backup/restore.
