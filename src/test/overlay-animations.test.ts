import { describe, expect, it } from 'vitest'
import {
  getRandomOverlayAnimation,
  NONE_OVERLAY_ANIMATION,
  resolveOverlayAnimation,
} from '@/lib/overlay-animations'

describe('overlay animations', () => {
  it('skips clip-path motion when reduced motion is requested', () => {
    expect(resolveOverlayAnimation('circuitBreak', true)).toEqual(NONE_OVERLAY_ANIMATION)
    expect(resolveOverlayAnimation('circuitBreak', false).name).toBe('circuitBreak')
  })

  it('picks a named shell animation at random', () => {
    const anim = getRandomOverlayAnimation()
    expect(anim.name).toBeTruthy()
    expect(anim.modal.initial).toBeTruthy()
    expect(anim.modal.exit).toBeTruthy()
  })
})
