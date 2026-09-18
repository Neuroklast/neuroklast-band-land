/**
 * Per-overlay-type open/close choreography.
 *
 * Instead of picking a random clip wipe for every overlay, each content type
 * gets a deterministic shell animation that matches its skeleton. An explicit
 * admin pool still overrides this so existing configurations keep working.
 */

import type { CyberpunkOverlayState } from '@/lib/app-types'
import {
  getOverlayAnimationByName,
  NONE_OVERLAY_ANIMATION,
  pickOverlayAnimationFromPool,
  type OverlayAnimation,
} from '@/lib/overlay-animations'

export type OverlayType = CyberpunkOverlayState['type']

/** Default shell animation name per overlay type (must exist in overlay-animations). */
export const OVERLAY_TYPE_ANIMATIONS: Record<OverlayType, string> = {
  member: 'hologramMaterialize',
  news: 'systemBoot',
  gig: 'dataStream',
  release: 'matrixDecode',
  gallery: 'irisLock',
  media: 'circuitBreak',
  contact: 'glitchScan',
  partner: 'ringLink',
  explorer: 'systemBoot',
  terminal: 'none',
}

export function getOverlayDefaultAnimationName(type: OverlayType | undefined | null): string {
  if (!type) return 'circuitBreak'
  return OVERLAY_TYPE_ANIMATIONS[type] ?? 'circuitBreak'
}

/**
 * Shell animation for an overlay open. Priority:
 * reduced motion → none, explicit admin pool → random from pool,
 * otherwise the type's deterministic default.
 */
export function pickOverlayAnimationForType(options: {
  type?: OverlayType | null
  pool?: string[]
  reducedMotion?: boolean | null
}): OverlayAnimation {
  const { type, pool, reducedMotion } = options
  if (reducedMotion === true) return NONE_OVERLAY_ANIMATION
  if (pool && pool.length > 0) return pickOverlayAnimationFromPool(pool, false)
  return getOverlayAnimationByName(getOverlayDefaultAnimationName(type))
}
