# 3D Models

Place your GLB model files here.

## Expected files

- `NEUROKLASTTEXT.glb` — 3D text/logo model for the hero section (used by `Logo3D`)
- `NEUROKLASTHEAD.glb` — 3D head model for the loading screen (used by `CyberpunkLoader` with `loadingScreenType: '3d-model'`)

## Fallback behaviour

If a GLB file is missing, the respective component falls back to a 3D box placeholder
with the same scroll-parallax animation and primary-color material. The site continues
to work without the model files.
