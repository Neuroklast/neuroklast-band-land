/**
 * Shared color conversion utilities.
 *
 * Provides oklch ↔ hex conversion via the browser's CSS engine.
 * Previously duplicated in ThemeCustomizerDialog and SetupWizard.
 */

import { cssColorToRgb } from './contrast'

/**
 * Convert any CSS color value (oklch, hsl, rgb, named, …) to a hex string.
 * Falls back to `#ff3333` when the color cannot be resolved.
 */
export function oklchToHex(oklch: string): string {
  const rgb = cssColorToRgb(oklch)
  if (rgb) {
    return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`
  }
  return '#ff3333'
}

/**
 * Convert a hex colour value to an approximate oklch() string.
 * Falls back to `oklch(0.50 0.22 25)` when the colour cannot be resolved.
 */
export function hexToOklch(hex: string): string {
  const rgb = cssColorToRgb(hex)
  if (rgb) {
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const c = max - min
    let h = 0
    if (c > 0) {
      if (max === r) h = ((g - b) / c + 6) % 6 * 60
      else if (max === g) h = ((b - r) / c + 2) * 60
      else h = ((r - g) / c + 4) * 60
    }
    return `oklch(${l.toFixed(2)} ${(c * 0.4).toFixed(2)} ${Math.round(h)})`
  }
  return 'oklch(0.50 0.22 25)'
}
