import { describe, it, expect } from 'vitest'
import { buildGoogleFontsUrl, FONT_CSS_VARS } from '@/lib/font-loader'

describe('buildGoogleFontsUrl', () => {
  it('generates a valid Google Fonts v2 URL', () => {
    const url = buildGoogleFontsUrl('Inter', ['400', '700'])
    expect(url).toContain('fonts.googleapis.com/css2')
    expect(url).toContain('family=Inter')
    expect(url).toContain('400')
    expect(url).toContain('700')
    expect(url).toContain('display=swap')
  })

  it('encodes spaces in family name', () => {
    const url = buildGoogleFontsUrl('Playfair Display', ['400'])
    expect(url).toContain('Playfair+Display')
  })

  it('includes italic variants when italic=true', () => {
    const url = buildGoogleFontsUrl('Inter', ['400', '700'], true)
    expect(url).toContain('ital,wght')
    expect(url).toContain('0,400')
    expect(url).toContain('1,400')
  })

  it('uses only wght axis when italic=false', () => {
    const url = buildGoogleFontsUrl('Inter', ['400'])
    expect(url).toContain('wght@400')
    expect(url).not.toContain('ital')
  })

  it('defaults to weights 400 and 700 when not supplied', () => {
    const url = buildGoogleFontsUrl('Roboto')
    expect(url).toContain('400')
    expect(url).toContain('700')
  })
})

describe('FONT_CSS_VARS', () => {
  it('exports the three expected CSS variable names', () => {
    expect(FONT_CSS_VARS.heading).toBe('--font-heading')
    expect(FONT_CSS_VARS.body).toBe('--font-body')
    expect(FONT_CSS_VARS.mono).toBe('--font-mono')
  })
})
