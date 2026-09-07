import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BACKGROUND_VIDEO_OPACITY,
  DEFAULT_SITE_BACKGROUND_VIDEO,
  HERO_BACKGROUND_VIDEO_OPACITY,
  backgroundVideoDimOpacity,
  backgroundVideoOpacityForScroll,
  parseBackgroundVideoEnabled,
  resolveActiveBackgroundVideoUrl,
} from '@/lib/background-config'

describe('default site background video', () => {
  it('is the bundled scroll-scrub video at 30% opacity', () => {
    expect(DEFAULT_SITE_BACKGROUND_VIDEO).toBe('/brand/websitebg.scrub.mp4')
    expect(HERO_BACKGROUND_VIDEO_OPACITY).toBe(0.5)
    expect(DEFAULT_BACKGROUND_VIDEO_OPACITY).toBe(0.3)
    expect(backgroundVideoDimOpacity()).toBe(0.7)
  })

  it('fades video opacity from 50% at top to 30% after one viewport', () => {
    expect(backgroundVideoOpacityForScroll(0, 800)).toBe(0.5)
    expect(backgroundVideoOpacityForScroll(400, 800)).toBe(0.4)
    expect(backgroundVideoOpacityForScroll(800, 800)).toBe(0.3)
    expect(backgroundVideoOpacityForScroll(1200, 800)).toBe(0.3)
  })
})

describe('parseBackgroundVideoEnabled', () => {
  it('uses explicit boolean', () => {
    expect(parseBackgroundVideoEnabled(true, false)).toBe(true)
    expect(parseBackgroundVideoEnabled(false, true)).toBe(false)
  })

  it('defaults to hasConfiguredVideo when key missing', () => {
    expect(parseBackgroundVideoEnabled(undefined, true)).toBe(true)
    expect(parseBackgroundVideoEnabled(undefined, false)).toBe(false)
  })
})

describe('resolveActiveBackgroundVideoUrl', () => {
  it('returns undefined when video master switch is off', () => {
    expect(
      resolveActiveBackgroundVideoUrl('https://x/v.mp4', undefined, 'same', false, false),
    ).toBeUndefined()
  })

  it('returns desktop url when enabled', () => {
    expect(
      resolveActiveBackgroundVideoUrl('https://x/v.mp4', undefined, 'same', false, true),
    ).toBe('https://x/v.mp4')
  })

  it('respects mobile off mode', () => {
    expect(
      resolveActiveBackgroundVideoUrl('https://x/v.mp4', 'https://x/m.mp4', 'off', true, true),
    ).toBeUndefined()
  })
})
