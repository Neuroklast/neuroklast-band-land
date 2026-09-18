import { describe, expect, it } from 'vitest'
import {
  applyHoldProgress,
  applyLatchToward,
  createLatchState,
  LATCH_PHYSICS,
} from '@/lib/latch-physics'
import { applySliderToward, createSliderState, TERMINAL_AUTH } from '@/lib/terminal-auth-physics'

describe('latch physics', () => {
  it('shares snap threshold with terminal auth', () => {
    expect(LATCH_PHYSICS.SNAP_THRESHOLD).toBe(TERMINAL_AUTH.SNAP_THRESHOLD)
  })

  it('latches after a sustained chase', () => {
    let state = createLatchState()
    for (let i = 0; i < 63; i += 1) {
      state = applyLatchToward(state, 1, 16)
    }
    expect(state.latch).toBe('sealed')
    expect(state.progress).toBe(1)
  })

  it('hold progress respects custom durations', () => {
    expect(applyHoldProgress(0, 500, true, 1000, 400)).toBeCloseTo(0.5, 5)
    expect(applyHoldProgress(1, 400, false, 1000, 400)).toBe(0)
  })

  it('terminal slider helpers still wrap latch physics', () => {
    let state = createSliderState()
    state = applySliderToward(state, 1, 16)
    expect(state.progress).toBeGreaterThan(0)
    expect(state.latch).toBe('armed')
  })
})
