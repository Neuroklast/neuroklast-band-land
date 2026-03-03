/**
 * WCAG contrast-ratio helpers.
 *
 * Works with any CSS color value the browser can resolve (hex, rgb, oklch, …).
 * Uses a temporary DOM element + getComputedStyle to convert the value to sRGB,
 * then calculates the relative luminance and contrast ratio per WCAG 2.1.
 */

/** Parse any CSS color to { r, g, b } (0-255) via the browser */
export function cssColorToRgb(color: string): { r: number; g: number; b: number } | null {
  if (typeof document === 'undefined') return null
  try {
    const el = document.createElement('div')
    el.style.color = color
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (m) return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }
  } catch { /* ignore */ }
  return null
}

/** Relative luminance per WCAG 2.1 (0 = darkest, 1 = lightest) */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/** WCAG contrast ratio between two luminances (result ≥ 1) */
export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Calculate the WCAG contrast ratio between two CSS color values.
 * Returns `null` when running outside a browser (SSR) or when colours
 * cannot be parsed.
 */
export function getContrastRatio(color1: string, color2: string): number | null {
  const rgb1 = cssColorToRgb(color1)
  const rgb2 = cssColorToRgb(color2)
  if (!rgb1 || !rgb2) return null
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  return contrastRatio(l1, l2)
}

/** WCAG AA requires ≥ 4.5 for normal text, ≥ 3.0 for large text */
export function meetsWcagAA(ratio: number, largeText = false): boolean {
  return ratio >= (largeText ? 3.0 : 4.5)
}

/** WCAG AAA requires ≥ 7.0 for normal text, ≥ 4.5 for large text */
export function meetsWcagAAA(ratio: number, largeText = false): boolean {
  return ratio >= (largeText ? 4.5 : 7.0)
}

/**
 * Pure-math contrast ratio that works without a DOM (for tests / SSR).
 * Accepts { r, g, b } objects with 0-255 values.
 */
export function contrastRatioFromRgb(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number },
): number {
  const l1 = relativeLuminance(c1.r, c1.g, c1.b)
  const l2 = relativeLuminance(c2.r, c2.g, c2.b)
  return contrastRatio(l1, l2)
}
