import { describe, it, expect } from 'vitest'
import {
  getRandomOverlayAnimation,
  getOverlayAnimationByName,
  getAllOverlayAnimations,
  NONE_OVERLAY_ANIMATION,
} from '@/lib/overlay-animations'

describe('overlay-animations', () => {
  it('getRandomOverlayAnimation returns a valid animation', () => {
    const anim = getRandomOverlayAnimation()
    expect(anim).toBeDefined()
    expect(anim.name).toBeTruthy()
    expect(anim.backdrop).toBeDefined()
    expect(anim.modal).toBeDefined()
  })

  it('getOverlayAnimationByName returns the correct animation by name', () => {
    const anim = getOverlayAnimationByName('circuitBreak')
    expect(anim.name).toBe('circuitBreak')
  })

  it('getOverlayAnimationByName returns a random animation for undefined', () => {
    const anim = getOverlayAnimationByName(undefined)
    expect(anim).toBeDefined()
    expect(anim.name).toBeTruthy()
  })

  it('getOverlayAnimationByName falls back to random for unknown name', () => {
    const anim = getOverlayAnimationByName('nonexistent')
    expect(anim).toBeDefined()
    expect(anim.name).toBeTruthy()
  })

  it('NONE_OVERLAY_ANIMATION has name "none" and minimal transitions', () => {
    expect(NONE_OVERLAY_ANIMATION.name).toBe('none')
    expect(NONE_OVERLAY_ANIMATION.loaderClass).toBe('')
    expect(NONE_OVERLAY_ANIMATION.loaderLabel).toBe('')
    expect(NONE_OVERLAY_ANIMATION.backdrop).toBeDefined()
    expect(NONE_OVERLAY_ANIMATION.modal).toBeDefined()
  })

  it('getAllOverlayAnimations returns all registered animations', () => {
    const all = getAllOverlayAnimations()
    expect(all.length).toBeGreaterThanOrEqual(8)
    const names = all.map((a) => a.name)
    expect(names).toContain('circuitBreak')
    expect(names).toContain('systemBoot')
    expect(names).toContain('ringLink')
  })

  it('every animation has required fields', () => {
    const all = getAllOverlayAnimations()
    for (const anim of all) {
      expect(anim.name).toBeTruthy()
      expect(anim.backdrop).toBeDefined()
      expect(anim.modal).toBeDefined()
      expect(anim.backdrop.initial).toBeDefined()
      expect(anim.backdrop.animate).toBeDefined()
      expect(anim.backdrop.exit).toBeDefined()
      expect(anim.modal.initial).toBeDefined()
      expect(anim.modal.animate).toBeDefined()
      expect(anim.modal.exit).toBeDefined()
    }
  })
})
