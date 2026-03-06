# 3D Models

Place your GLB model files here.

## Expected files

- `ZARDONICTEXT.glb` — 3D text/logo model for the hero section (used by `Logo3D`)
- `ZARDONICHEAD.glb` — 3D head model for the loading screen (used by `CyberpunkLoader` with `loadingScreenType: '3d-model'`)

## Where to get the models

The original `.glb` files are part of the [zardonic](https://github.com/Neuroklast/zardonic)
design preset. Download them from there and place them in this directory.

## Fallback behaviour

If a GLB file is missing, the respective component falls back to a 3D box placeholder
with the same scroll-parallax animation and primary-color material. The site continues
to work without the model files.
