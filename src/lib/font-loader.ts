/** Only locally hosted or system fonts may be loaded at runtime. */
import type { FontConfig, FontEntry } from './types'

export const FONT_CSS_VARS = {
  heading: '--font-heading',
  body: '--font-body',
  mono: '--font-mono',
} as const

function injectStyleTag(css: string, id: string): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = css
  document.head.appendChild(style)
}

function guessFormat(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase() ?? ''
  const formats: Record<string, string> = {
    woff2: 'woff2', woff: 'woff', ttf: 'truetype',
    otf: 'opentype', eot: 'embedded-opentype', svg: 'svg',
  }
  return formats[extension] ?? 'woff2'
}

/** Reject remote URLs and CSS injection through custom font entries. */
function safeLocalUrl(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//') &&
    /^[a-zA-Z0-9_./%-]+$/.test(url)
}

export function loadFontEntry(entry: FontEntry, slot: keyof typeof FONT_CSS_VARS): void {
  if (entry.source !== 'local' || !entry.localUrls?.length) return
  const sources = entry.localUrls.filter(safeLocalUrl)
  if (sources.length === 0) return
  const family = entry.family.replace(/[^a-zA-Z0-9 _-]/g, '')
  if (!family) return
  const src = sources.map(url => `url('${url}') format('${guessFormat(url)}')`).join(', ')
  injectStyleTag(`@font-face { font-family: '${family}'; src: ${src}; font-display: swap; }`, `font-loader-${slot}`)
}

export function applyFontCssVars(config: FontConfig): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (config.heading) root.style.setProperty(FONT_CSS_VARS.heading, config.heading.family)
  if (config.body) root.style.setProperty(FONT_CSS_VARS.body, config.body.family)
  if (config.mono) root.style.setProperty(FONT_CSS_VARS.mono, config.mono.family)
}

export function applyFontConfig(config: FontConfig): void {
  const slots = ['heading', 'body', 'mono'] as const
  for (const slot of slots) {
    const entry = config[slot]
    if (entry) loadFontEntry(entry, slot)
  }
  applyFontCssVars(config)
}
