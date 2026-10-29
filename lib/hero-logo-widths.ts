/** Wordmark widths preserve the historic desktop REM -> percent migration. */
const clampWordmarkWidth = (n: number) => Math.min(100, Math.max(15, Math.round(n)))

/** Default desktop width: 55%. Older saved height-rem settings remain supported. */
export function parseHeroDesktopLogoWidth(raw: Record<string, unknown>): number {
  if (typeof raw.logoWidthPercent === 'number' && Number.isFinite(raw.logoWidthPercent)) {
    return clampWordmarkWidth(raw.logoWidthPercent)
  }
  if (typeof raw.logoMaxHeightRem === 'number' && Number.isFinite(raw.logoMaxHeightRem)) {
    return clampWordmarkWidth((raw.logoMaxHeightRem / 48) * 100)
  }
  if (typeof raw.logoMaxHeight === 'string') {
    const match = raw.logoMaxHeight.match(/^([\\d.]+)\\s*rem$/i)
    if (match) return clampWordmarkWidth((Number(match[1]) / 48) * 100)
  }
  return 55
}

/** Mobile width deliberately defaults independently of desktop at 90%. */
export function parseHeroMobileLogoWidth(raw: Record<string, unknown>): number {
  if (typeof raw.logoWidthPercentMobile === 'number' && Number.isFinite(raw.logoWidthPercentMobile)) {
    return clampWordmarkWidth(raw.logoWidthPercentMobile)
  }
  return 90
}
