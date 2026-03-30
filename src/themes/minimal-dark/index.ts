import type { ThemePackage } from '@/lib/types'
import NewsSection from '../../components/themes/MinimalDarkNewsContainer'

export const minimalDarkTheme: ThemePackage = {
  id: 'minimal-dark',
  name: 'Minimal Dark',
  description: 'Synthesized minimal dark theme',
  author: 'System',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0,
  animationsEnabled: false,
  effects: {},
  gridLayout: {
    columns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  colorPresets: [
    {
      id: 'minimal-dark-default',
      name: 'Minimal Dark',
      description: 'Default black and red theme',
      colors: {
        primary: 'oklch(0.60 0.22 25)',
        accent: 'oklch(0.50 0.20 25)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.1 0 0)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.6 0 0)',
        border: 'oklch(0.2 0 0)',
        secondary: 'oklch(0.15 0 0)',
      },
    },
  ],
  defaultPresetId: 'minimal-dark-default',
  customizability: { customColors: true, customFonts: true, adjustEffects: false },
  slots: {
    NewsSection,
  },
}
