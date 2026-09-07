import type { AppearanceTheme } from '@/lib/appearance-presets'
import type { LookId, OverlayEffects } from '@/lib/types'

export const DEFAULT_LOOK_ID: LookId = 'neuroklast-classic'

export const CLASSIC_OVERLAY_EFFECTS: OverlayEffects = {
  scanlines: { enabled: true, intensity: 0.5 },
  crt: { enabled: false, intensity: 0 },
  noise: { enabled: false, intensity: 0 },
  vignette: { enabled: false, intensity: 0 },
  dof: { enabled: false, intensity: 0 },
  chromatic: { enabled: false, intensity: 0 },
  dotMatrix: { enabled: false, intensity: 0 },
  movingScanline: { enabled: false, intensity: 0 },
}

export const CLASSIC_THEME: AppearanceTheme = {
  primaryColor: 'oklch(0.50 0.22 25)',
  accentColor: 'oklch(0.60 0.24 25)',
  backgroundColor: 'oklch(0 0 0)',
  cardColor: 'oklch(0.05 0 0)',
  foregroundColor: 'oklch(1 0 0)',
  mutedForegroundColor: 'oklch(0.55 0 0)',
  borderColor: 'oklch(0.15 0 0)',
  secondaryColor: 'oklch(0.10 0 0)',
  modalGlowColor: 'oklch(0.55 0.22 25)',
  fontHeading: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
  fontBody: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
  fontMono: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
}

export interface LookDefinition {
  id: LookId
  name: string
  description: string
  theme: AppearanceTheme
  overlayEffects: OverlayEffects
  overlayAnimation: string
  overlayClass: string
  defaultCta: string
}

export const LOOKS: LookDefinition[] = [
  {
    id: 'neuroklast-classic',
    name: 'Neuroklast Classic',
    description: 'Original Neuroklast look — crimson HUD, JetBrains Mono, code-rain boot',
    theme: CLASSIC_THEME,
    overlayEffects: CLASSIC_OVERLAY_EFFECTS,
    overlayAnimation: 'neuralJackIn',
    overlayClass: 'neuroklast-classic-overlay-modal',
    defaultCta: 'INITIALIZE',
  },
  {
    id: 'glitch-noir',
    name: 'Glitch Noir',
    description: 'Minimal dark techno',
    theme: {
      primaryColor: 'oklch(0.72 0.14 250)',
      accentColor: 'oklch(0.78 0.12 250)',
      backgroundColor: 'oklch(0.08 0.01 250)',
      cardColor: 'oklch(0.12 0.01 250)',
      foregroundColor: 'oklch(0.93 0.02 250)',
      mutedForegroundColor: 'oklch(0.55 0.04 250)',
      borderColor: 'oklch(0.22 0.03 250)',
      secondaryColor: 'oklch(0.14 0.02 250)',
      modalGlowColor: 'oklch(0.72 0.14 250)',
      fontHeading: "var(--font-space-mono), 'Space Mono', monospace",
      fontBody: "var(--font-share-tech-mono), 'Share Tech Mono', monospace",
      fontMono: "var(--font-share-tech-mono), 'Share Tech Mono', monospace",
    },
    overlayEffects: {
      scanlines: { enabled: true, intensity: 0.2 },
      crt: { enabled: false, intensity: 0 },
      noise: { enabled: true, intensity: 0.1 },
      vignette: { enabled: true, intensity: 0.35 },
      chromatic: { enabled: true, intensity: 0.2 },
    },
    overlayAnimation: 'glitchScan',
    overlayClass: 'glitch-noir-overlay-modal',
    defaultCta: 'ENTER',
  },
  {
    id: 'zardonic-industrial',
    name: 'Zardonic Industrial',
    description: 'Industrial dark cyberpunk',
    theme: {
      primaryColor: 'oklch(0.62 0.19 35)',
      accentColor: 'oklch(0.70 0.18 50)',
      backgroundColor: 'oklch(0.07 0.02 40)',
      cardColor: 'oklch(0.11 0.02 40)',
      foregroundColor: 'oklch(0.92 0.03 50)',
      mutedForegroundColor: 'oklch(0.55 0.04 40)',
      borderColor: 'oklch(0.22 0.04 40)',
      secondaryColor: 'oklch(0.14 0.03 40)',
      modalGlowColor: 'oklch(0.62 0.19 35)',
      fontHeading: "var(--font-orbitron), 'Orbitron', sans-serif",
      fontBody: "var(--font-share-tech-mono), 'Share Tech Mono', monospace",
      fontMono: "var(--font-share-tech-mono), 'Share Tech Mono', monospace",
    },
    overlayEffects: CLASSIC_OVERLAY_EFFECTS,
    overlayAnimation: 'circuitBreak',
    overlayClass: 'zardonic-industrial-overlay-modal',
    defaultCta: 'ENGAGE',
  },
  {
    id: 'umbrella-corp',
    name: 'Umbrella Corp',
    description: 'Biohazard tactical',
    theme: {
      primaryColor: 'oklch(0.55 0.21 25)',
      accentColor: 'oklch(0.65 0.18 140)',
      backgroundColor: 'oklch(0.06 0.01 140)',
      cardColor: 'oklch(0.10 0.02 140)',
      foregroundColor: 'oklch(0.92 0.03 140)',
      mutedForegroundColor: 'oklch(0.52 0.04 140)',
      borderColor: 'oklch(0.20 0.04 140)',
      secondaryColor: 'oklch(0.12 0.02 140)',
      modalGlowColor: 'oklch(0.55 0.21 25)',
      fontHeading: "var(--font-orbitron), 'Orbitron', sans-serif",
      fontBody: "var(--font-share-tech-mono), 'Share Tech Mono', monospace",
      fontMono: "var(--font-share-tech-mono), 'Share Tech Mono', monospace",
    },
    overlayEffects: CLASSIC_OVERLAY_EFFECTS,
    overlayAnimation: 'systemBoot',
    overlayClass: 'umbrella-corp-overlay-modal',
    defaultCta: 'ACCESS',
  },
]

export function parseLookId(value: unknown): LookId {
  if (value === 'glitch-noir' || value === 'zardonic-industrial' || value === 'umbrella-corp') {
    return value
  }
  return DEFAULT_LOOK_ID
}

export function getLook(id?: string | null): LookDefinition {
  return LOOKS.find((look) => look.id === id) ?? LOOKS[0]
}
