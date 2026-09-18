import { describe, expect, it } from 'vitest'
import { parseHeroPowerGlitch, toPowerGlitchOptions } from '@/lib/hero-glitch-config'

describe('parseHeroPowerGlitch', () => {
  it('defaults to off', () => {
    expect(parseHeroPowerGlitch(null).mode).toBe('off')
  })

  it('accepts hover and always', () => {
    expect(parseHeroPowerGlitch({ mode: 'hover' }).mode).toBe('hover')
    expect(parseHeroPowerGlitch({ mode: 'always', sliceCount: 10 }).sliceCount).toBe(10)
  })

  it('maps hover to playMode hover', () => {
    const options = toPowerGlitchOptions(parseHeroPowerGlitch({ mode: 'hover' }))
    expect(options.playMode).toBe('hover')
    expect(options.timing.iterations).toBe(1)
  })

  it('maps always to looping playMode', () => {
    const options = toPowerGlitchOptions(parseHeroPowerGlitch({ mode: 'always', continuous: true }))
    expect(options.playMode).toBe('always')
    expect(options.timing.iterations).toBe(Infinity)
    expect(options.glitchTimeSpan).toBe(false)
  })
})
