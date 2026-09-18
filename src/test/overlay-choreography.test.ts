import { describe, expect, it } from 'vitest'
import { getAllOverlayAnimations, NONE_OVERLAY_ANIMATION } from '@/lib/overlay-animations'
import {
  getOverlayDefaultAnimationName,
  OVERLAY_TYPE_ANIMATIONS,
  pickOverlayAnimationForType,
} from '@/lib/overlay-choreography'

describe('overlay choreography', () => {
  it('maps every overlay type to a known shell animation', () => {
    const known = new Set([...getAllOverlayAnimations().map((a) => a.name), 'none'])
    for (const name of Object.values(OVERLAY_TYPE_ANIMATIONS)) {
      expect(known.has(name)).toBe(true)
    }
  })

  it('returns the deterministic default per type', () => {
    expect(getOverlayDefaultAnimationName('member')).toBe('hologramMaterialize')
    expect(getOverlayDefaultAnimationName('news')).toBe('systemBoot')
    expect(getOverlayDefaultAnimationName('gig')).toBe('dataStream')
    expect(getOverlayDefaultAnimationName(undefined)).toBe('circuitBreak')
  })

  it('skips animation entirely for reduced motion', () => {
    expect(
      pickOverlayAnimationForType({ type: 'gig', reducedMotion: true }),
    ).toEqual(NONE_OVERLAY_ANIMATION)
  })

  it('uses the type default when no admin pool is configured', () => {
    expect(pickOverlayAnimationForType({ type: 'gallery' }).name).toBe('irisLock')
    expect(pickOverlayAnimationForType({ type: 'release' }).name).toBe('matrixDecode')
  })

  it('lets an explicit admin pool override the type default', () => {
    expect(
      pickOverlayAnimationForType({ type: 'gig', pool: ['circuitBreak'] }).name,
    ).toBe('circuitBreak')
  })
})
