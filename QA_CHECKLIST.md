# QA checklist

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
