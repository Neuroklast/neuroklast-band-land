export const TERMINAL_AUTH = {
  BRAKE: 0.72,
  SPRING: 0.18,
  SNAP_THRESHOLD: 0.98,
  HOLD_MS: 2000,
  DECAY_MS: 400,
  GRANT_HOLD_MS: 300,
  MAX_PROGRESS_PER_MS: 0.001,
  FRAME_MS: 16,
  REST_VELOCITY: 1e-6,
  MOBILE_BREAKPOINT: 768,
} as const

export type AuthVariant = 'fingerprint' | 'slider'
export type SliderLatch = 'open' | 'armed' | 'sealed'

export interface SliderState {
  progress: number
  velocity: number
  dragging: boolean
  latch: SliderLatch
}

export function resolveAuthVariant(input: {
  coarse: boolean
  hoverNone: boolean
  narrowViewport?: boolean
}): AuthVariant {
  if (input.coarse || input.hoverNone || input.narrowViewport) return 'fingerprint'
  return 'slider'
}

export function createSliderState(): SliderState {
  return { progress: 0, velocity: 0, dragging: false, latch: 'open' }
}

function clamp01(value: number): number {
  if (value <= 0) return 0
  if (value >= 1) return 1
  return value
}

function latchFor(progress: number): SliderLatch {
  if (progress >= TERMINAL_AUTH.SNAP_THRESHOLD) return 'sealed'
  if (progress > 0) return 'armed'
  return 'open'
}

function sealed(dragging: boolean): SliderState {
  return { progress: 1, velocity: 0, dragging, latch: 'sealed' }
}

export function pointerToTrackProgress(clientX: number, trackLeft: number, trackWidth: number): number {
  return clamp01((clientX - trackLeft) / Math.max(trackWidth, 1))
}

/** Chase a target on the rail. Speed is capped so a full latch takes ~1s. */
export function applySliderToward(state: SliderState, targetProgress: number, dtMs: number): SliderState {
  if (state.latch === 'sealed') return sealed(true)

  const dt = Math.max(dtMs, 1)
  const target = clamp01(targetProgress)
  const cap = TERMINAL_AUTH.MAX_PROGRESS_PER_MS * dt
  const applied = Math.min(Math.max(target - state.progress, -cap), cap)
  const progress = clamp01(state.progress + applied)
  if (progress >= TERMINAL_AUTH.SNAP_THRESHOLD) return sealed(true)

  return {
    progress,
    velocity: applied / dt,
    dragging: true,
    latch: latchFor(progress),
  }
}

export function applySliderRelease(state: SliderState): SliderState {
  if (state.latch === 'sealed') return sealed(false)
  return { ...state, dragging: false }
}

export function tickSliderCoast(state: SliderState, dtMs: number): SliderState {
  if (state.latch === 'sealed') return sealed(false)
  if (state.dragging) return state

  const dt = Math.max(dtMs, 1)
  let { progress, velocity } = state
  progress = clamp01(progress + velocity * dt)
  velocity *= Math.pow(TERMINAL_AUTH.BRAKE, dt / TERMINAL_AUTH.FRAME_MS)

  if (progress >= TERMINAL_AUTH.SNAP_THRESHOLD) return sealed(false)

  if (Math.abs(velocity) < TERMINAL_AUTH.REST_VELOCITY) {
    velocity = 0
    const spring = 1 - Math.pow(1 - TERMINAL_AUTH.SPRING, dt / TERMINAL_AUTH.FRAME_MS)
    progress = clamp01(progress + (0 - progress) * spring)
    if (progress < 0.0005) progress = 0
  }

  return { progress, velocity, dragging: false, latch: latchFor(progress) }
}

export function applyHoldProgress(progress: number, dtMs: number, holding: boolean): number {
  if (holding) return clamp01(progress + dtMs / TERMINAL_AUTH.HOLD_MS)
  return clamp01(progress - dtMs / TERMINAL_AUTH.DECAY_MS)
}
