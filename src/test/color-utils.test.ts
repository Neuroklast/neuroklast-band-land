import { describe, it, expect } from 'vitest'
import { oklchToHex, hexToOklch } from '@/lib/color-utils'

describe('oklchToHex', () => {
  it('returns the fallback hex value when running without full CSS engine', () => {
    // In JSDOM the CSS engine does not resolve oklch() so the function
    // hits the fallback path and returns the default '#ff3333'.
    const result = oklchToHex('oklch(0.50 0.22 25)')
    expect(result).toBe('#ff3333')
  })

  it('converts a plain hex color to itself (through the browser engine)', () => {
    // JSDOM *can* resolve basic hex/rgb, so cssColorToRgb will succeed
    const result = oklchToHex('#00ff00')
    expect(result).toBe('#00ff00')
  })

  it('converts a named CSS color', () => {
    const result = oklchToHex('red')
    expect(result).toBe('#ff0000')
  })

  it('converts rgb() notation', () => {
    const result = oklchToHex('rgb(0, 0, 255)')
    expect(result).toBe('#0000ff')
  })
})

describe('hexToOklch', () => {
  it('returns a valid oklch string for unparseable input', () => {
    // JSDOM resolves unknown color keywords as black (rgb(0,0,0)), so
    // cssColorToRgb succeeds and we get the conversion of black.
    const result = hexToOklch('not-a-color')
    expect(result).toMatch(/^oklch\(\d+\.\d+ \d+\.\d+ \d+\)$/)
  })

  it('converts a hex color to an oklch-like string', () => {
    const result = hexToOklch('#ff0000')
    // We can't assert the exact oklch values (they depend on the
    // approximate conversion), but the string must start with "oklch("
    expect(result).toMatch(/^oklch\(\d+\.\d+ \d+\.\d+ \d+\)$/)
  })

  it('converts black to oklch with zero chroma', () => {
    const result = hexToOklch('#000000')
    expect(result).toMatch(/^oklch\(0\.00 0\.00 0\)$/)
  })
})
