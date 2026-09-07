import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CRT_GLITCH_MS, crtGlitchVars, scheduleCrtIdle } from '@/themes/neuroklast-classic/crtGlitch'

describe('crt glitch', () => {
  it('is an extremely short twitch', () => {
    expect(CRT_GLITCH_MS).toBeLessThanOrEqual(140)
    expect(CRT_GLITCH_MS).toBeGreaterThanOrEqual(80)
    expect(scheduleCrtIdle(0, true)).toBeLessThan(1400)
    expect(scheduleCrtIdle(0)).toBeGreaterThanOrEqual(2800)

    const vars = crtGlitchVars(42)
    expect(vars['--nk-g-amp']).toMatch(/%$/)
    expect(vars['--nk-g-y1']).toMatch(/%$/)
    expect(Number.parseFloat(vars['--nk-g-amp'] ?? '0')).toBeGreaterThan(2)
  })

  it('clips letter slices — no solid bars, no long tear', () => {
    const css = readFileSync(resolve('themes/neuroklast-classic/styles.css'), 'utf8')
    expect(css).toMatch(/--nk-g-ms:\s*110ms/)
    expect(css).toMatch(/clip-path:\s*inset\(var\(--nk-g-y1\)/)
    expect(css).not.toMatch(/nk-crt-mark::(?:before|after)/)
    expect(css).not.toMatch(/nk-line-[ab]/)
    expect(css).not.toMatch(/hue-rotate/)
  })
})
