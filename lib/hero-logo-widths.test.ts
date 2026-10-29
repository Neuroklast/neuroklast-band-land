import { describe, expect, it } from 'vitest'
import { parseHeroDesktopLogoWidth, parseHeroMobileLogoWidth } from '@/lib/hero-logo-widths'

describe('hero wordmark saved widths', () => {
  it('retains independent desktop/mobile defaults when no settings are saved', () => {
    expect(parseHeroDesktopLogoWidth({})).toBe(55)
    expect(parseHeroMobileLogoWidth({})).toBe(90)
  })

  it('prefers modern persisted desktop percentage over legacy height', () => {
    expect(parseHeroDesktopLogoWidth({
      logoWidthPercent: 70.6,
      logoMaxHeightRem: 12,
      logoMaxHeight: '6rem',
    })).toBe(71)
    expect(parseHeroDesktopLogoWidth({ logoWidthPercent: 0 })).toBe(15)
    expect(parseHeroDesktopLogoWidth({ logoWidthPercent: 150 })).toBe(100)
    expect(parseHeroDesktopLogoWidth({ logoWidthPercent: 50.4 })).toBe(50)
  })

  it('retains the numeric legacy rem conversion and its precedence', () => {
    expect(parseHeroDesktopLogoWidth({ logoMaxHeightRem: 24 })).toBe(50)
    expect(parseHeroDesktopLogoWidth({ logoMaxHeightRem: 48 })).toBe(100)
    expect(parseHeroDesktopLogoWidth({ logoMaxHeightRem: 0 })).toBe(15)
    expect(parseHeroDesktopLogoWidth({ logoWidthPercent: Infinity, logoMaxHeightRem: 36 })).toBe(75)
  })

  it('retains string legacy rem matching and fallback for malformed values', () => {
    expect(parseHeroDesktopLogoWidth({ logoMaxHeight: '24rem' })).toBe(50)
    expect(parseHeroDesktopLogoWidth({ logoMaxHeight: '12 rem' })).toBe(25)
    expect(parseHeroDesktopLogoWidth({ logoMaxHeight: '24REM' })).toBe(50)
    expect(parseHeroDesktopLogoWidth({ logoMaxHeight: '24px' })).toBe(55)
    expect(parseHeroDesktopLogoWidth({ logoMaxHeight: 24 })).toBe(55)
    expect(parseHeroDesktopLogoWidth({ logoMaxHeightRem: NaN })).toBe(55)
  })

  it('keeps mobile width independent and clamps valid saved numbers', () => {
    expect(parseHeroMobileLogoWidth({ logoWidthPercent: 20 })).toBe(90)
    expect(parseHeroMobileLogoWidth({ logoWidthPercentMobile: 83.6 })).toBe(84)
    expect(parseHeroMobileLogoWidth({ logoWidthPercentMobile: -2 })).toBe(15)
    expect(parseHeroMobileLogoWidth({ logoWidthPercentMobile: 150 })).toBe(100)
    expect(parseHeroMobileLogoWidth({ logoWidthPercentMobile: Infinity })).toBe(90)
    expect(parseHeroMobileLogoWidth({ logoWidthPercentMobile: '85' })).toBe(90)
  })
})
