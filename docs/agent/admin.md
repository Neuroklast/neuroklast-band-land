# Admin Patterns
## Appearance editor storage boundary (2026-10-29)
## Appearance editor presentation sections (2026-10-29)

The parent `AppearanceEditor.tsx` owns all React state, `payload`, dirty tracking, `broadcastAdminDraft('appearance', payload)`, existing `updateSiteConfig` submission and save/refresh notifications. Controlled children in the same `site-config` folder render the original controls with identical labels, CSS classes, accordion defaults and handlers:

- `AppearanceQuickStart.tsx`: looks, overlay animation pool, built-in/user presets, section surfaces.
- `AppearanceColorsFonts.tsx`: color fields, font settings, font-size controls, Favicon `MediaSourcePicker`.
- `AppearanceOpacitySlider.tsx`: shared original Radix slider markup, also used by Visual effects in the parent.

State setters and domain callbacks are passed down; **do not** move saving, Supabase mutations, transient errors or public draft broadcasts to the child components. Tests in `src/test/appearance-editor-sections.test.tsx` cover interactions, overlay pool toggles, favicon callbacks and editor layout contracts. This is a structural extraction, not a redesign.



The appearance admin screen at `app/admin/(protected)/site-config/AppearanceEditor.tsx` renders the controls, tracks unsaved changes, broadcasts preview drafts and invokes the unchanged `updateSiteConfig` server action. Its persisted storage defaults and theme/overlay parsing now live in the pure `lib/admin-appearance-config.ts` module; use `parseConfig()` when initializing the editor. Preserve all previously accepted fields, defaults, user presets, the `zardonic-industrial` legacy look alias and fallback clip animation pool. `lib/admin-appearance-config.test.ts` verifies backwards compatibility. **Do not** add Supabase writes, revalidation or browser side effects to the pure parser.


## Shared admin visibility and remote media imports (2026-10-29)

Six protected list toggles (gallery, media, members, partners, products, releases) delegate only their visual state and optimistic rollback to `app/admin/_components/AdminVisibilityToggle.tsx`. Each wrapper still calls its original server action. Preserve the distinct accessibility labels and hover behavior. Do not move authorization, database mutations or revalidation into the UI.

Image/video URL imports share `lib/remote-media-download.ts` for the **SSRF-guarded** fetch, timeout and content-size check. Media-specific URL validation, MIME allowlists, image optimization, prefixes and R2 writes stay in `cacheRemoteImage.ts` and `cacheRemoteVideo.ts`. Tests validate header parity, HTTP/content-type errors and abort behavior.

## News ordering

`/admin/news` renders `NewsSortableTable` using existing `@dnd-kit` sortable sensors; only the grip initiates drag. The full list, including inactive posts, is submitted to `reorderNewsPosts(orderedIds, expectedIds)`. The server action validates UUID sets, requires the current admin session and calls the service-role-only `reorder_news_posts` RPC. The RPC locks the table, compares its current sorted IDs to the previous order and updates all `display_order` values in one transaction. A mismatch aborts without partial writes. The list rolls back and shows a message if saving fails. The public homepage orders by `display_order`, then `published_at` and ID. New posts are inserted before the first existing post; editing a post does not overwrite ordering. Numeric sort controls have been removed from the news forms.

## AI content review

New MCP release creation is published only upon MFA-backed admin approval, including older pending requests that have `active=false`. Other content creation remains draft-only. The review slider immediately advances on Accept/Reject while server actions complete, tracks pending writes and restores an item with an actionable failure notice if approval fails. Do not show optimistic success before the RPC confirms it. An unload warning protects in-flight operations from accidental page closure. Release create approval sets `manually_edited=true` to prevent subsequent sync overwrites.


**Viewport-fit exception:** `/admin/ai-content` opts out of the shell's ordinary main-page scrolling. The page and ReviewSlider use a bounded `h-full min-h-0` flex layout. The queue and the proposal header are compact; the action footer is `shrink-0` so Back/Reject/Accept/Skip remain visible without page scrolling. At most four short field highlights appear on the card (only the first two on narrow screens). Full fields, previous snapshots, technical JSON and recent decisions open as separate scrollable dialogs, never as tall content below the footer. Keep the review server action, MFA checks and deletion-confirmation semantics unchanged. All other admin routes continue using regular main scrolling.


The protected admin sidebar puts AI Content Review (`/admin/ai-content`) and AI Integrations (`/admin/integrations`) in the dedicated AI group. The review page renders only one proposal at a time through `ReviewSlider`, including field-wise before/after comparisons and a collapsed raw JSON view. Skip/Back, arrow keys and touch swipes never mutate state. Accept/Reject use the existing `reviewMcpContent` server action with AAL2 MFA and PostgreSQL atomic approvals; successful decisions advance the queue. Permanent deletion keeps a second confirmation. Back does not roll back an already committed decision. Review history remains available in a disclosure below the card.

## Two admin layers

| Layer | Storage | UI |
|-------|---------|-----|
| **Next.js admin** (primary) | Supabase tables + `site_config` | `app/admin/**` |
| Legacy AdminPanel / CMS | KV `admin:settings`, `zd-cms:*` | `AdminPanel.tsx`, `cms/AdminShell.tsx` |

New public-facing config → **Supabase `site_config`**, not KV.

Look & Feel tabs: Theme, Background, Hero, Loader, Sections, Site Text, **Terminal**. Terminal JSON key: `terminal` (`commands`, `secretCode`, `morseCode`) via `lib/terminal-config.ts`. Command files upload to R2 (`fileStoragePath`); included in full `site_config` backups and legacy `site-config-content` import (`terminalCommands` / `secretCode` / `terminalMorseCode`).

## Auto-optimized scroll background videos

The desktop and separate-mobile selectors in Background use VideoSourcePicker(scrubVariant).
The admin browser transcodes MP4/WebM/MOV with @ffmpeg/ffmpeg (single-threaded
@ffmpeg/core 0.12.10) to 30 fps H.264/yuv420p MP4 with a 6-frame GOP, no B-frames
and faststart. The build-time prebuild/predev script copies core assets into
public/vendor/ffmpeg-core (UMD wrapper, worker and core) so neither third-party scripts nor FFmpeg services
run on the public site. This works on Vercel without invoking FFmpeg server-side.
Maximum input/output is 50 MB. Encoding can consume significant browser CPU
and memory. On failure the old video remains selected and raw input is NOT published.

URL/Drive imports are fetched by the existing SSRF-guarded cache action into a
random temporary R2 key, read through an admin-authenticated same-origin streaming
route, then optimized and uploaded; the temporary object is deleted in finally.
Regular product video uploads are NOT transcoded. A separate manual Save background
is still required to persist the selected URL in site_config.

@ffmpeg/core is GPL-2.0-or-later. See docs/FFMPEG_CORE_LICENSE.md and comply with
the source/license distribution requirements before deploying.

## Shared editor navigation and scroll layout

The protected admin shell uses one scroll container for the content area and a separately
scrollable sidebar, sized to the viewport. Do not add nested page-height containers
(`min-h-screen`, `h-screen`) to editor pages.

Shared editor components:

- `AdminEditorLayout`: section navigation. The regular layout has a sticky local
  sidebar on wide screens, and a horizontal navigator on smaller screens. Use
  `compact` for a wrapping, sticky navigation bar in constrained contexts such
  as split preview editors.
- `useAdminEditorTab`: stores the selected section in `?tab=`, supports
  back/forward, and changes sections without a server-side navigation.
- `AdminSaveBar`: viewport-bottom action area with `formId`, dirty state,
  busy state and save status.

The plugin detail editor is the reference implementation. **Keep core form
sections mounted while hidden**: the product page, media, and pricing are saved
by a single `FormData` request, so conditional unmounting would drop values
from other sections. Signing keys, releases, and licences retain their own
actions and are not submitted by that form. Media/feature reorder and uploads
must set the dirty flag, not only native input change events. A refresh caused
by a key or visibility action must preserve an unsaved product draft.

Keep editor navigation and save status usable at narrow widths and at high
browser/Windows zoom. Each editor may supply its own saved-data mutation.
Do not replace the existing site-config editor actions with plugin actions.

## Site config mutations

`updateSiteConfig` in `app/admin/_actions/siteConfig.ts` dispatches `update_site_config` via `lib/admin-action-registry.ts`.

Revalidate paths include `/`, `/legal-notice`, `/privacy-policy` after saves.

## Image uploads (hero / media)

Crop → `encodeCanvasForUpload` (WebP, size-capped) → Server Action `uploadOptimizedImage` → R2.

**Object keys are content-addressed** (`lib/r2-object-key.ts`): the key is the sha256 of the exact stored bytes, `${prefix}/${HASH}.${ext}` — not `Date.now()`. Same content → same key, so after an R2 bucket move the DB reference stays valid and only the host changes (`canonicalizeR2MediaUrl` rewrites it at render time). Different content → different key, so the "replace deletes the previous R2 object" logic still works. Browser-signed PUT and multipart uploads hash client-side via Web Crypto; server actions hash the optimized buffer. `createSignedUploadUrl` no longer appends a timestamp — the caller supplies the full content key.

**The target bucket is resolved server-side, never by the client.** `createSignedUploadUrl(objectKey)` (`app/admin/_actions/r2Upload.ts`) ignores any client bucket and always signs against `MEDIA_BUCKET` (= runtime `process.env.R2_BUCKET_MEDIA`). Do not add a client-supplied `bucket` param back: client components read `MEDIA_BUCKET` from `lib/constants.ts`, where `process.env` is unavailable in the browser bundle, so it falls back to the hardcoded default (`neuroklast-media`) — which typically has no CORS rule, silently breaking presigned PUT uploads while the env var points at a correctly-configured bucket.

**Downloadable media** (`/admin/media`) is the exception: `FileSourcePicker` uploads **originals** (JPEG/PNG/WebP/GIF, PDF, ZIP, MP3/WAV) via signed PUT or multipart. Do not run press-kit files through the crop→WebP path.

EU-jurisdiction buckets (this project) must use `{accountId}.eu.r2.cloudflarestorage.com`. `createR2S3Client()` / `r2S3Endpoint()` in `lib/r2-s3-client.ts` default to `eu`; set `R2_JURISDICTION=global` only for a non-jurisdiction bucket. `R2_BUCKET_MEDIA` is the bucket **name** (`neuroklast-media`), not `eu_neuroklast-media`.

Always pass `requestChecksumCalculation: 'WHEN_REQUIRED'` to every R2 `S3Client`. `@aws-sdk/client-s3` ≥ v3.609 appends a flexible CRC32 checksum (`x-amz-checksum-crc32` / `x-amz-sdk-checksum-algorithm`) to presigned `PutObject` URLs by default; Cloudflare R2 does not accept it, so browser PUTs fail with `net::ERR_FAILED` / "failed to fetch" *even after* the bucket CORS preflight passes. The flag only suppresses the checksum — set it on `r2Upload.ts`, `lib/storage/r2.ts`, `r2-multipart.ts`, `r2-inventory.ts` and `/admin/health`. The R2 bucket CORS policy must still allow `PUT` + `Content-Type` (and expose `ETag`) from the admin origin or the preflight `OPTIONS` is blocked before R2 is ever reached.

- Next `experimental.serverActions.bodySizeLimit` = **4mb** (default is **1mb** — full-res PNG crops hit this and show production **React #441** / 413).
- Client guard: `SERVER_ACTION_IMAGE_UPLOAD_MAX_BYTES` (~3.5 MB) in `lib/optimize-image-constants.ts`.
- Do **not** export crop as raw full-res PNG for upload.

### Replace → auto-delete previous R2 object

`MediaSourcePicker` / `VideoSourcePicker` call `deletePreviousR2ObjectIfReplaced` **only after** a successful new upload or remote cache. The new path is committed first; delete failures do not roll back the new media (status warns). Manual **Delete upload** still available. **Clear selection** never deletes storage.

## AdminActionRegistry

Mutations register in `lib/admin-action-registry.ts` with Zod schemas + tests in `src/test/admin-action-registry.test.ts`.

### Release & data maintenance actions

| ID | Disclosure | Purpose |
|----|------------|---------|
| `enrich_release_tracks` | basic | Single-release tracklist + Odesli enrichment |
| `enrich_all_release_tracks` | basic | Batch enrichment (limit param) |
| `purge_releases` | expert | Delete **all** releases, including manually edited (hard reset) |
| `purge_gigs` | expert | Delete all gigs |
| `factory_reset` | expert | Hard wipe of all editorial tables + restore default `site_config`; requires echoing `neuroklast-factory-reset` (client) and optional R2 media wipe (`lib/factory-reset.ts`) |
| `reset_release_tracklists` | expert | Clear tracks on auto-synced releases |
| `purge_and_sync_releases` | expert | **Hard reset**: delete **all** releases (incl. manual), Spotify sync + enrichment |
| `purge_and_sync_gigs` | expert | Purge + Bandsintown sync |
| `rewrite_media_hosts` | expert | Rewrite stored R2 / `wsrv.nl` URLs onto current `R2_PUBLIC_HOST` (host-only; keys unchanged) |
| `reconcile_r2_media` | expert | List live R2 objects and rewrite DB URLs when the **filename** or **content hash** uniquely matches (re-uploads / prefix changes); backfills `content_hash` columns |
| `spotify_sync` / `discogs_sync` / `itunes_sync` | basic | Catalogue bulk import |
| `release_external_sync` | basic | Per-release ID sync |

Server actions: `app/admin/_actions/releaseTrackEnrichment.ts`, `dataMaintenance.ts`, `releaseExternalSync.ts`.

Authenticated admin dispatches use `dispatchAdminActionAsAdmin()` (`expert` disclosure). Real auth is `requireAdmin()`.

## Data import / export (`/admin/data`)

Full-site JSON backup of **editorial** tables via `lib/site-data-backup.ts`:

- **Included:** `releases` (all rows, including `manually_edited` and inactive), `news_posts`, `gigs`, `gallery`, `media_downloads`, `bio`, `partners`, `social_links`, `music_highlights`, `merchandise`, `soundpacks`, `products`, every `site_config` key.
- **Excluded:** `api_secrets`, `profiles`, `analytics_events`, `sync_jobs`, `newsletter_subscribers` (PII). R2 media is referenced by URL, not packed into the JSON.
- **Export:** `GET /admin/data/export` (admin session). Service-role client + paginated `select('*')` so the dump is not capped at 1000 rows and is **not** inlined into the admin HTML (old `data-export-json` embedding truncated large catalogues).
- **Import:** upsert by `id` / `site_config.key`. Accepts v1 aliases (`social`, `config`, `musicHighlights`, lone `bio` object). Empty unique IDs (`itunes_id`, …) are stored as `NULL`. Does **not** delete rows missing from the file.

Do not add a second backup format; extend `SITE_BACKUP_SECTIONS` when a new content table appears.

### R2 host rewrite + bucket reconcile (migration)

JSON import copies `storage_path` + leftover `*_url` values — not R2 objects. After a re-upload, **keys often change** (dropped prefixes, new timestamps), so swapping only the `pub-….r2.dev` host still 404s.

`/admin/data` → **Match files in current R2 bucket** lists the live bucket, then updates rows when the filename **or content hash** uniquely matches (exact key → suffix → unique basename → content hash). Content-hash matching reconnects rows that changed prefix **and** basename; ambiguous names are skipped. Host-only rewrite remains as a fallback when keys did not change. The reconcile also **backfills the `content_hash` columns** on media tables so future lookups are O(1) by hash.

Runs **automatically on each Vercel Production deploy** (once per git SHA) via `instrumentation.ts` + `lib/r2-reconcile-on-deploy.ts`. Preview / local / CI builds skip it. Manual: `/admin/data` → Match files. Confirm `R2_PUBLIC_HOST` is the new origin on `/admin/health` first.

**No cron required (Vercel free tier).** Deploys run the reconcile at serverless boot. `/api/media-fix` no longer lists the bucket; it returns no replacement. The old `*/20 * * * *` cron was removed because Vercel Cron Jobs require Pro. `CRON_SECRET` only matters if you keep the optional GitHub `deployment_status` → `POST /api/r2-reconcile` hook.

Logic: `lib/r2-inventory.ts`, `lib/r2-reconcile.ts`, `lib/media-fallback.ts`, `app/api/media-fix/route.ts`.

`runProductionDeployR2Reconcile` needs `R2_PUBLIC_HOST`, `R2_BUCKET_MEDIA`, `R2_ACCOUNT_ID` **and** `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` as **server** env vars (not `NEXT_PUBLIC_*`, which are baked at build).

### Async sync jobs

Long catalogue / maintenance syncs use `sync_jobs` (Supabase) + API workers:

| Route | Purpose |
|-------|---------|
| `POST /api/sync-jobs` | Start job (`discogs_sync`, `spotify_sync`, `purge_and_sync_*`) |
| `GET /api/sync-jobs/[id]` | Poll status |
| `POST /api/sync-jobs/[id]/tick` | Process one chunk (cron self-chain + reap cron) |

UI: `CatalogueSyncClient`, `DataMaintenanceClient` + `hooks/useSyncJobPoll.ts`.

## Data maintenance UI

`/admin/data` → `DataMaintenanceClient.tsx` — AlertDialog confirmations, progress for batch enrichment.

## Look & Feel live preview

`AdminPreviewPane` (`app/admin/_components/AdminPreviewPane.tsx`) wraps site-config tabs:

| Control | Behaviour |
|---------|-----------|
| Editor only / Split preview | Hide or show the public iframe |
| **Desktop / Mobile** | Constrains iframe width (mobile = 390px) so CSS media queries fire — hero `logoWidthPercentMobile`, mobile nav, etc. |
| Refresh | Reload iframe + draft broadcast |
| New tab | Open `/?adminPreview=1` |

Drafts: `broadcastAdminDraft` → public `AdminDraftListener` in the iframe. Save still required for production.

## Legal editor

`/admin/legal` — `LegalConfigEditor.tsx`. Draft preview: `broadcastAdminDraft('legal', ...)`.

Footer URL fields: Site Config → Footer & Legal tab.

## Undo / analytics (legacy)

`AdminPanel.tsx`: undo stack (max 50). Analytics gated by `adminSettings.analytics.*` + cookie consent.

## Catalogue import — idempotency (2026-09-01)

- The async job runner seeds `existingIds` from the DB every import tick and reuses the mutated Set, so re-imported `itunes_id`/`spotify_id`/`discogs_id` never re-`INSERT` (`lib/sync-job-runner.ts`). An `INSERT` that still hits the unique constraint is resolved as a backfill in `importCatalogueBatch`, never an error (`lib/catalogue-import.ts`).
- The job lock is an atomic conditional UPDATE (15 min stale window), so a long tick or a redundant tick cannot run the import twice.
- Track backfill is skipped for `manually_edited` releases.
- Every catalogue import's enrichment phase also backfills missing cover art (iTunes → Spotify → Discogs) onto R2 automatically — no separate backfill button/job exists (`lib/release-enrichment.ts` + `lib/release-cover-r2.ts`). The manual "Enrich / Consolidate / Reset / Backfill" repair buttons were removed from the Catalogue Sync screen; imports now self-heal.