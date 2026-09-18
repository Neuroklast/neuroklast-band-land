import {
  applyHoldProgress as applyHoldToward,
  applyLatchRelease,
  applyLatchToward,
  createLatchState,
  pointerToTrackProgress,
  tickLatchCoast,
  type LatchState,
  type LatchStatus,
  LATCH_PHYSICS,
} from '@/lib/latch-physics'

export const TERMINAL_AUTH = {
  ...LATCH_PHYSICS,
  HOLD_MS: 2000,
  DECAY_MS: 400,
  GRANT_HOLD_MS: 300,
  HATCH_MS: 550,
  MOBILE_BREAKPOINT: 768,
} as const

export type AuthVariant = 'fingerprint' | 'slider'
export type SliderLatch = LatchStatus
export type SliderState = LatchState

export function resolveAuthVariant(input: {
  coarse: boolean
  hoverNone: boolean
  narrowViewport?: boolean
}): AuthVariant {
  if (input.coarse || input.hoverNone || input.narrowViewport) return 'fingerprint'
  return 'slider'
}

export const createSliderState = createLatchState
export const applySliderToward = applyLatchToward
export const applySliderRelease = applyLatchRelease
export const tickSliderCoast = tickLatchCoast
export { pointerToTrackProgress }

export function applyHoldProgress(progress: number, dtMs: number, holding: boolean): number {
  return applyHoldToward(progress, dtMs, holding, TERMINAL_AUTH.HOLD_MS, TERMINAL_AUTH.DECAY_MS)
}
