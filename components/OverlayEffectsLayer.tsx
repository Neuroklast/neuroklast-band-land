'use client'

import type { OverlayEffects } from '@/lib/types'

interface OverlayEffectsLayerProps {
  effects?: OverlayEffects
}

/**
 * Renders configurable visual overlay effects (dot matrix, scanlines, CRT, noise, vignette, chromatic).
 * Each effect is rendered as a fixed overlay div with CSS-variable-driven intensity.
 */
export default function OverlayEffectsLayer({ effects }: OverlayEffectsLayerProps) {
  if (!effects) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 'var(--z-global-fx)', clipPath: 'inset(var(--nk-nav-h, 64px) 0 0 0)' }}
    >
      {effects.dotMatrix?.enabled && <div className="overlay-dot-matrix" />}
      {effects.scanlines?.enabled && <div className="overlay-scanlines" />}
      {effects.crt?.enabled && <div className="overlay-crt" />}
      {effects.noise?.enabled && <div className="overlay-noise" />}
      <div className="overlay-radiation" />
      {effects.vignette?.enabled && <div className="overlay-vignette" />}
      {effects.dof?.enabled && <div className="overlay-dof" />}
      {effects.chromatic?.enabled && <div className="overlay-chromatic" />}
    </div>
  )
}
