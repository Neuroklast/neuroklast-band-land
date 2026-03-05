/**
 * Theme DOM application — applies ThemeSettings to the document root element.
 *
 * Extracted from ThemeCustomizerDialog for reuse across the application.
 */

import type { ThemeSettings } from '@/lib/types'

export const FONT_OPTIONS = [
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace", google: false },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif", google: false },
  { label: 'System Mono', value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", google: false },
  { label: 'System Sans', value: "ui-sans-serif, system-ui, sans-serif", google: false },
  { label: 'System Serif', value: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif", google: false },
  { label: 'Orbitron', value: "'Orbitron', sans-serif", google: true },
  { label: 'Share Tech Mono', value: "'Share Tech Mono', monospace", google: true },
  { label: 'VT323', value: "'VT323', monospace", google: true },
  { label: 'Press Start 2P', value: "'Press Start 2P', monospace", google: true },
  { label: 'Audiowide', value: "'Audiowide', sans-serif", google: true },
  { label: 'Rajdhani', value: "'Rajdhani', sans-serif", google: true },
  { label: 'Chakra Petch', value: "'Chakra Petch', sans-serif", google: true },
  { label: 'Exo 2', value: "'Exo 2', sans-serif", google: true },
  { label: 'Tektur', value: "'Tektur', sans-serif", google: true },
  { label: 'Oxanium', value: "'Oxanium', sans-serif", google: true },
  { label: 'Iceland', value: "'Iceland', monospace", google: true },
  { label: 'Michroma', value: "'Michroma', sans-serif", google: true },
  { label: 'Russo One', value: "'Russo One', sans-serif", google: true },
  { label: 'Bruno Ace', value: "'Bruno Ace', sans-serif", google: true },
  { label: 'Electrolize', value: "'Electrolize', sans-serif", google: true },
]

/** Load Google Fonts by injecting a stylesheet link */
export const loadedFonts = new Set<string>()
export function loadGoogleFont(fontLabel: string) {
  if (loadedFonts.has(fontLabel)) return
  loadedFonts.add(fontLabel)
  const family = fontLabel.replace(/ /g, '+')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;700&display=swap`
  document.head.appendChild(link)
}

/** Pre-load all Google Fonts for preview */
export function loadAllGoogleFonts() {
  FONT_OPTIONS.filter(f => f.google).forEach(f => loadGoogleFont(f.label))
}

/** Apply overlay effect CSS classes to root element */
export function applyOverlayEffectsToDOM(theme: ThemeSettings | undefined) {
  const root = document.documentElement
  const effects = theme?.overlayEffects
  root.style.setProperty('--overlay-dot-matrix', effects?.dotMatrix?.enabled ? String(effects.dotMatrix.intensity) : '0')
  root.style.setProperty('--overlay-scanlines', effects?.scanlines?.enabled ? String(effects.scanlines.intensity) : '0')
  root.style.setProperty('--overlay-crt', effects?.crt?.enabled ? String(effects.crt.intensity) : '0')
  root.style.setProperty('--overlay-noise', effects?.noise?.enabled ? String(effects.noise.intensity) : '0')
  root.style.setProperty('--overlay-vignette', effects?.vignette?.enabled ? String(effects.vignette.intensity) : '0')
  root.style.setProperty('--overlay-chromatic', effects?.chromatic?.enabled ? String(effects.chromatic.intensity) : '0')
  root.style.setProperty('--overlay-moving-scanline', effects?.movingScanline?.enabled ? '1' : '0')
}

/** Apply theme CSS variables to <html> element */
export function applyThemeToDOM(theme: ThemeSettings | undefined) {
  const root = document.documentElement
  if (!theme) return

  if (theme.primary) root.style.setProperty('--primary', theme.primary)
  if (theme.accent) root.style.setProperty('--accent', theme.accent)
  if (theme.background) root.style.setProperty('--background', theme.background)
  if (theme.card) root.style.setProperty('--card', theme.card)
  if (theme.foreground) root.style.setProperty('--foreground', theme.foreground)
  if (theme.mutedForeground) root.style.setProperty('--muted-foreground', theme.mutedForeground)
  if (theme.border) root.style.setProperty('--border', theme.border)
  if (theme.secondary) root.style.setProperty('--secondary', theme.secondary)
  if (theme.fontBody) root.style.setProperty('--font-sans', theme.fontBody)
  if (theme.fontMono) root.style.setProperty('--font-mono', theme.fontMono)

  // Also update heading font
  if (theme.fontHeading) {
    root.style.setProperty('--font-heading', theme.fontHeading)
  }

  // Border radius
  // We set both --radius (used by index.css @theme) and --radius-factor
  // (used by theme.css #root rules which have higher CSS specificity).
  // Default: --radius = 0.125rem → --radius-factor = 1, so factor = radius / 0.125
  if (theme.borderRadius !== undefined) {
    root.style.setProperty('--radius', `${theme.borderRadius}rem`)
    root.style.setProperty('--radius-factor', String(theme.borderRadius / 0.125))
  }

  // Font size factor — scales html { font-size } so all rem-based values follow
  root.style.setProperty('--font-size-factor', String(theme.fontSize ?? 1))

  // Overlay effects
  applyOverlayEffectsToDOM(theme)

  // Update ring & destructive to match primary
  if (theme.primary) {
    root.style.setProperty('--ring', theme.primary)
    root.style.setProperty('--destructive', theme.primary)
  }
  if (theme.foreground) {
    root.style.setProperty('--primary-foreground', theme.foreground)
    root.style.setProperty('--secondary-foreground', theme.foreground)
    root.style.setProperty('--accent-foreground', theme.foreground)
    root.style.setProperty('--card-foreground', theme.foreground)
    root.style.setProperty('--popover-foreground', theme.foreground)
    root.style.setProperty('--destructive-foreground', theme.foreground)
  }
  if (theme.background) {
    root.style.setProperty('--popover', theme.background)
  }
  if (theme.mutedForeground) {
    root.style.setProperty('--muted', theme.mutedForeground)
  }

  // Extended color overrides — applied after the derived values so they take precedence
  if (theme.primaryForeground) root.style.setProperty('--primary-foreground', theme.primaryForeground)
  if (theme.cardForeground) root.style.setProperty('--card-foreground', theme.cardForeground)
  if (theme.popoverColor) root.style.setProperty('--popover', theme.popoverColor)
  if (theme.popoverForeground) root.style.setProperty('--popover-foreground', theme.popoverForeground)
  if (theme.secondaryForeground) root.style.setProperty('--secondary-foreground', theme.secondaryForeground)
  if (theme.accentForeground) root.style.setProperty('--accent-foreground', theme.accentForeground)
  if (theme.destructiveColor) root.style.setProperty('--destructive', theme.destructiveColor)
  if (theme.destructiveForeground) root.style.setProperty('--destructive-foreground', theme.destructiveForeground)
  if (theme.inputColor) root.style.setProperty('--input', theme.inputColor)
  if (theme.ringColor) root.style.setProperty('--ring', theme.ringColor)
  if (theme.hoverColor) root.style.setProperty('--hover-color', theme.hoverColor)

  // Load Google Fonts if selected
  for (const key of ['fontHeading', 'fontBody', 'fontMono'] as const) {
    const val = theme[key]
    if (!val) continue
    const match = FONT_OPTIONS.find(f => f.value === val)
    if (match?.google) loadGoogleFont(match.label)
  }
}

/** Reset all custom CSS variables set by theme */
export function resetThemeDOM() {
  const root = document.documentElement
  const props = [
    '--primary', '--accent', '--background', '--card', '--foreground',
    '--muted-foreground', '--border', '--secondary', '--font-sans', '--font-mono',
    '--font-heading', '--ring', '--destructive', '--primary-foreground',
    '--secondary-foreground', '--accent-foreground', '--card-foreground',
    '--popover-foreground', '--destructive-foreground', '--popover', '--muted',
    '--radius', '--radius-factor', '--font-size-factor',
    '--overlay-dot-matrix', '--overlay-scanlines', '--overlay-crt',
    '--overlay-noise', '--overlay-vignette', '--overlay-chromatic',
    '--overlay-moving-scanline', '--input', '--hover-color',
  ]
  props.forEach(p => root.style.removeProperty(p))
}
