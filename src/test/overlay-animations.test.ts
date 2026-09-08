import { describe, expect, it } from 'vitest'
import {
  getRandomOverlayAnimation,
  NONE_OVERLAY_ANIMATION,
  parseOverlayAnimationName,
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

  it('circuitBreak clips from the center line on enter and exit', () => {
    const anim = resolveOverlayAnimation('circuitBreak', false)
    expect(anim.modal.initial).toMatchObject({
      clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
    })
    expect(anim.modal.exit).toMatchObject({
      clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
    })
  })

  it('circuitHandshake uses the same clip-path with handshake interior', () => {
    const anim = resolveOverlayAnimation('circuitHandshake', false)
    expect(anim.interior).toBe('handshake')
    expect(anim.modal.initial).toEqual(resolveOverlayAnimation('circuitBreak', false).modal.initial)
  })

  it('parses known overlay animation names', () => {
    expect(parseOverlayAnimationName('circuitHandshake')).toBe('circuitHandshake')
    expect(parseOverlayAnimationName('systemPost')).toBe('systemPost')
    expect(parseOverlayAnimationName('not-a-real-anim')).toBeUndefined()
  })

  it('rich interiors keep matching clip-path shells', () => {
    expect(resolveOverlayAnimation('systemPost', false).interior).toBe('post')
    expect(resolveOverlayAnimation('systemPost', false).modal.initial).toEqual(
      resolveOverlayAnimation('systemBoot', false).modal.initial,
    )
    expect(resolveOverlayAnimation('sectorSweep', false).interior).toBe('sectorSweep')
    expect(resolveOverlayAnimation('sectorSweep', false).modal.initial).toMatchObject({
      clipPath: 'inset(0 100% 0 0)',
    })
    expect(resolveOverlayAnimation('packetFill', false).interior).toBe('packetFill')
    expect(resolveOverlayAnimation('packetFill', false).modal.initial).toEqual(
      resolveOverlayAnimation('dataStream', false).modal.initial,
    )
    expect(resolveOverlayAnimation('irisLock', false).interior).toBe('irisLock')
    expect(resolveOverlayAnimation('irisLock', false).modal.initial).toMatchObject({
      clipPath: 'circle(0% at 50% 50%)',
    })
  })
})
