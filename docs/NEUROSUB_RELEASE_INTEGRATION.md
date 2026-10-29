# NeuroSub public binary releases

The existing website supports generic product-scoped v3 license issuance through the admin Plugins system. This PR adds **neurosub** to the same official public binary release parser used by NeuroKore and NeuroMeter.

## Distribution contract

- Private source: `Neuroklast/NeuroSub`.
- Public binary-only feed: `Neuroklast/vst-releases`.
- Tag `neurosub-v<version>`.
- Windows installer `NEUROSUB-<version>-Setup.exe`, bundle `NEUROSUB-<version>-win64.zip`.
- Every binary requires corresponding `.sha256` sidecar, GitHub asset SHA256 digest, official URL and uploaded state.
- Product page/download route shows an official GitHub release only if the `neurosub` plugin record is active with demo downloads enabled. Existing NEUROKORE/NEUROMETER semantics stay unchanged.
- This integration does **not** import NeuroSub files into R2. The existing automatic R2 release importer is still NeuroKore-only.

## Licensing

Create the product hidden in the existing admin panel: slug `neurosub`, format `v3`, `sales_enabled=false`. Generate a product-unique Ed25519 signing key and embed its **public** hex in the local NeuroSub plugin build. The existing `/api/license/v1/activate` route supports `product:neurosub`. No automatic sale or activation is claimed without actual license tests.

## Validation

New source-level Vitest contract confirms product-scoped tags/filenames, separate products, correct official download URLs, and rejection of foreign URLs. No GitHub native plugin builds are added. Product stays hidden until intentionally activated after native QA.
