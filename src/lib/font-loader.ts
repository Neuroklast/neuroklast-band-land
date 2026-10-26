/**
 * Font loading utility – injects
 * `@font-face` declarations and applies fonts via CSS custom properties.
 *
 * Related issue: #158
 */

import type { FontConfig, FontEntry } from './types'

// ─── CSS custom property names ────────────────────────────────────────────────

export const FONT_CSS_VARS = {
  heading: '--font-heading',
  body: '--font-body',
  mono: '--font-mono',
} as const

// ─── Injection helpers (browser-only) ────────────────────────────────────────

function injectStyleTag(css: string, id: string): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = css
  document.head.appendChild(style)
}

// ─── Font entry loader ────────────────────────────────────────────────────────

/**
 * Load a single `FontEntry` into the document (browser only).
 * Remote fonts are deliberately ignored, never fetched from third parties.
 * For local fonts, injects a `<style>` tag with `@font-face` declarations.
 * System fonts need no loading.
 */
export function loadFontEntry(entry: FontEntry, slot: keyof typeof FONT_CSS_VARS): void {
  const id = `font-loader-${slot}`

  if (entry.source === 'local' && entry.localUrls?.length) {
    const srcParts = entry.localUrls
      .map((url) => `url('${url}') format('${guessFormat(url)}')`)
      .join(',\n    ')
    const css = `@font-face {
  font-family: '${entry.family}';
  src: ${srcParts};
  font-display: swap;
}`
    injectStyleTag(css, id)
  }
  // 'system' fonts need no loading
}

/** Guess the CSS font format from a file extension */
function guessFormat(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    woff2: 'woff2',
    woff: 'woff',
    ttf: 'truetype',
    otf: 'opentype',
    eot: 'embedded-opentype',
    svg: 'svg',
  }
  return map[ext] ?? 'woff2'
}

// ─── CSS custom property application ─────────────────────────────────────────

/**
 * Apply font families as CSS custom properties on `:root` (browser only).
 * Accepts partial config – only defined slots are updated.
 */
export function applyFontCssVars(config: FontConfig): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (config.heading) root.style.setProperty(FONT_CSS_VARS.heading, config.heading.family)
  if (config.body) root.style.setProperty(FONT_CSS_VARS.body, config.body.family)
  if (config.mono) root.style.setProperty(FONT_CSS_VARS.mono, config.mono.family)
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Load all fonts defined in `FontConfig` and apply the corresponding CSS
 * custom properties.  Safe to call in a React effect.
 */
export function applyFontConfig(config: FontConfig): void {
  const slots = ['heading', 'body', 'mono'] as const
  for (const slot of slots) {
    const entry = config[slot]
    if (entry) loadFontEntry(entry, slot)
  }
  applyFontCssVars(config)
}
