import { describe, expect, it } from 'vitest'
import {
  applyHoldProgress,
  applySliderRelease,
  applySliderToward,
  createSliderState,
  pointerToTrackProgress,
  resolveAuthVariant,
  tickSliderCoast,
  TERMINAL_AUTH,
} from '@/lib/terminal-auth-physics'

describe('resolveAuthVariant', () => {
  it('uses fingerprint on coarse pointer', () => {
    expect(resolveAuthVariant({ coarse: true, hoverNone: false })).toBe('fingerprint')
  })

  it('uses fingerprint when hover is none', () => {
    expect(resolveAuthVariant({ coarse: false, hoverNone: true })).toBe('fingerprint')
  })

  it('uses slider on fine pointer with hover', () => {
    expect(resolveAuthVariant({ coarse: false, hoverNone: false })).toBe('slider')
  })

  it('uses fingerprint on a narrow mobile viewport', () => {
    expect(resolveAuthVariant({ coarse: false, hoverNone: false, narrowViewport: true })).toBe(
      'fingerprint',
    )
  })
})

describe('applyHoldProgress', () => {
  it('fills to 1 in 2000ms while holding', () => {
    let progress = 0
    progress = applyHoldProgress(progress, 1000, true)
    expect(progress).toBeCloseTo(0.5, 5)
    progress = applyHoldProgress(progress, 1000, true)
    expect(progress).toBe(1)
  })

  it('does not exceed 1', () => {
    expect(applyHoldProgress(0.95, 500, true)).toBe(1)
  })

  it('decays to 0 in 400ms when released', () => {
    expect(applyHoldProgress(1, 400, false)).toBe(0)
  })

  it('does not go below 0 while decaying', () => {
    expect(applyHoldProgress(0.1, 400, false)).toBe(0)
  })
})

describe('pointerToTrackProgress', () => {
  it('maps pointer position onto the rail without extra travel', () => {
    expect(pointerToTrackProgress(0, 0, 360)).toBe(0)
    expect(pointerToTrackProgress(180, 0, 360)).toBe(0.5)
    expect(pointerToTrackProgress(360, 0, 360)).toBe(1)
    expect(pointerToTrackProgress(900, 0, 360)).toBe(1)
  })
})

describe('slider physics', () => {
  it('starts open at zero', () => {
    const state = createSliderState()
    expect(state.progress).toBe(0)
    expect(state.latch).toBe('open')
    expect(state.dragging).toBe(false)
  })

  it('does not complete in a single frame even if the pointer is already at the end', () => {
    let state = createSliderState()
    state = applySliderToward(state, 1, 16)
    expect(state.progress).toBeGreaterThan(0)
    expect(state.progress).toBeLessThan(TERMINAL_AUTH.SNAP_THRESHOLD)
    expect(state.dragging).toBe(true)
    expect(state.latch).toBe('armed')
  })

  it('cannot complete faster than about one second even when held at the end', () => {
    let state = createSliderState()
    for (let i = 0; i < 20; i += 1) {
      state = applySliderToward(state, 1, 16)
    }
    expect(state.progress).toBeLessThan(TERMINAL_AUTH.SNAP_THRESHOLD)
    expect(state.progress).toBeGreaterThan(0.2)
  })

  it('latches after about one second of holding the pointer at the rail end', () => {
    let state = createSliderState()
    for (let i = 0; i < 63; i += 1) {
      state = applySliderToward(state, 1, 16)
    }
    expect(state.progress).toBeGreaterThanOrEqual(TERMINAL_AUTH.SNAP_THRESHOLD)
    expect(state.latch).toBe('sealed')
  })

  it('brakes on release instead of coasting to completion', () => {
    let state = createSliderState()
    state = applySliderToward(state, 0.4, 16)
    const atRelease = state.progress
    state = applySliderRelease(state)
    expect(state.dragging).toBe(false)

    for (let i = 0; i < 40; i += 1) {
      state = tickSliderCoast(state, 16)
    }

    expect(state.progress).toBeLessThan(atRelease)
    expect(state.progress).toBeLessThan(0.08)
    expect(state.latch).not.toBe('sealed')
  })

  it('a flick cannot latch', () => {
    let state = createSliderState()
    state = applySliderToward(state, 1, 16)
    state = applySliderRelease(state)
    for (let i = 0; i < 60; i += 1) {
      state = tickSliderCoast(state, 16)
    }
    expect(state.latch).not.toBe('sealed')
    expect(state.progress).toBeLessThan(0.08)
  })

  it('snaps to sealed when released at the threshold', () => {
    let state = createSliderState()
    for (let i = 0; i < 70; i += 1) {
      state = applySliderToward(state, 1, 16)
    }
    expect(state.latch).toBe('sealed')
    state = applySliderRelease(state)
    state = tickSliderCoast(state, 16)
    expect(state.progress).toBe(1)
    expect(state.latch).toBe('sealed')
  })
})
