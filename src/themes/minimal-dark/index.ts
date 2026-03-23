import type { ThemePackage } from '@/lib/types'
import MinimalDarkHero from './Hero'
import MinimalDarkNavigation from './Navigation'
import MinimalDarkFooter from './Footer'
import MinimalDarkLoadingScreen from './LoadingScreen'

export const minimalDarkTheme: ThemePackage = {
  id: 'minimal-dark',
  name: 'Minimal Dark',
  description: 'A synthesized gap-filling fallback theme.',
  version: '1.0.0',
  author: 'Neuroklast',
  access: 'free',
  layout: {
    heroVariant: 'minimal',
    loadingScreen: 'minimal',
    navigationStyle: 'minimal',
  },
  typography: {
    heading: "'Space Grotesk', sans-serif",
    body: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  effects: {},
  gridLayout: {
    columns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem'
  },
  borderRadius: 0,
  animationsEnabled: false,
  defaultPresetId: 'minimal-dark',
  colorPresets: [
    {
      id: 'minimal-dark',
      name: 'Minimal Dark',
      description: 'A synthesized gap-filling fallback theme.',
      colors: {
        primary: 'oklch(0.9 0 0)',
        accent: 'oklch(0.5 0 0)',
        background: 'oklch(0.1 0 0)',
        card: 'oklch(0.15 0 0)',
        foreground: 'oklch(0.9 0 0)',
        mutedForeground: 'oklch(0.6 0 0)',
        border: 'oklch(0.2 0 0)',
        secondary: 'oklch(0.2 0 0)'
      }
    }
  ],
  customizability: {
    customColors: true,
    customFonts: true,
    adjustEffects: false
  },
  slots: {
    Hero: MinimalDarkHero,
    Navigation: MinimalDarkNavigation,
    Footer: MinimalDarkFooter,
    LoadingScreen: MinimalDarkLoadingScreen,
  },
  customConfigSchema: {}
}
