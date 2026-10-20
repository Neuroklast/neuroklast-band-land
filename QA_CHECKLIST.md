# QA checklist

## NEUROKORE licensing and sales

See [commerce setup and launch checks](docs/NEUROKORE_COMMERCE.md). All launch checks are pending until the configured staging environment, native plugin build and Stripe test flow have passed. Do not enable live sales based only on unit tests.

- [ ] `supabase/schema.sql` has been applied (products + NEUROKORE license tables). `/admin/neurokore` issues an alpha key, copies it, and the NeuroCore plugin activates against `POST /api/license/v1/activate` while the Products section is still off.
- [ ] `/admin/products` section toggle off: homepage has no Products block, `/neurokore` is 404, plugin activate still returns a signed v2 license.
- [ ] `/admin/products` section toggle on: homepage Products section appears, `/neurokore` and `/neurokore/account` load.
- [ ] Create/edit/hide/delete a product with R2 image, description, `/neurokore` path or https URL, optional price label.
