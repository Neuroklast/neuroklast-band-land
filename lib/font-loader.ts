/**
 * font-loader.ts
 *
 * - Core defaults (Orbitron, Share Tech Mono, Space Mono) are self-hosted via next/font.
 * - Admin Appearance may pick additional Google Fonts; those are loaded on demand
 *   when the site operator configures them (not on cold load of unused fonts).
 */

/** Fonts bundled at build time with next/font (no network at runtime). */
export const SELF_HOSTED_FONT_NAMES = new Set([
  'JetBrains Mono',
  'Space Grotesk',
  'Orbitron',
  'Share Tech Mono',
  'Space Mono',
])

/** Extract the first font-family name from a CSS font stack string. */
export function extractGoogleFontName(fontValue: string): string | null {
  const systemFonts = new Set([
    'system-ui', 'ui-monospace', 'ui-sans-serif', 'ui-serif',
    'monospace', 'sans-serif', 'serif', 'cursive', 'fantasy',
    'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Courier New',
    'Georgia', 'Cambria', 'Times New Roman', 'Times', 'Arial',
    'Helvetica Neue', 'Helvetica',
  ])
  // CSS vars like var(--font-orbitron) are not remote families
  if (fontValue.includes('var(')) {
    const quoted = fontValue.match(/['"]([A-Za-z0-9 ]+)['"]/)
    if (quoted) {
      const name = quoted[1].trim()
      if (systemFonts.has(name)) return null
      return name
    }
    return null
  }
  const first = fontValue.replace(/['"]/g, '').split(',')[0].trim()
  if (!first || systemFonts.has(first)) return null
  return first
}

/**
 * Remote font CSS is intentionally disabled. The public site must not send
 * visitors' IP addresses to Google Fonts merely because an admin selected
 * a theme. Unknown families resolve to the CSS fallback stack.
 */
export function loadGoogleFont(_fontName: string): void {
  // Only the build-bundled fonts are available without a runtime network call.
}

/** True when stack needs no remote load (system or self-hosted only). */
export function isPrivacySafeFontStack(fontValue: string): boolean {
  const name = extractGoogleFontName(fontValue)
  if (!name) return true
  return SELF_HOSTED_FONT_NAMES.has(name)
}
