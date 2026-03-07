import './styles.css'
import type { ThemePackage } from '@/lib/types'
import MinimalBackgroundEffects from './BackgroundEffects'
import MinimalSectionDivider from './SectionDivider'
import MinimalHero from './Hero'
import MinimalNavigation from './Navigation'
import MinimalFooter from './Footer'
import MinimalLoadingScreen from './LoadingScreen'
import MinimalScrollReveal from './ScrollReveal'
import MinimalSectionHeading from './SectionHeading'

export const minimalTheme: ThemePackage = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean, light, content-first design with subtle accents',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'minimal',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  effects: {},
  borderRadius: 0.5,
  animationsEnabled: false,
  colorPresets: [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean light mode',
      colors: {
        primary: 'oklch(0.30 0 0)',
        accent: 'oklch(0.45 0 0)',
        background: 'oklch(0.99 0 0)',
        card: 'oklch(0.96 0 0)',
        foreground: 'oklch(0.15 0 0)',
        mutedForeground: 'oklch(0.50 0 0)',
        border: 'oklch(0.88 0 0)',
        secondary: 'oklch(0.93 0 0)',
      },
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Clean dark mode',
      colors: {
        primary: 'oklch(0.70 0 0)',
        accent: 'oklch(0.80 0 0)',
        background: 'oklch(0.10 0 0)',
        card: 'oklch(0.15 0 0)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.60 0 0)',
        border: 'oklch(0.25 0 0)',
        secondary: 'oklch(0.20 0 0)',
      },
    },
  ],
  defaultPresetId: 'light',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  slots: {
    BackgroundEffects: MinimalBackgroundEffects,
    SectionDivider: MinimalSectionDivider,
    Hero: MinimalHero,
    Navigation: MinimalNavigation,
    Footer: MinimalFooter,
    LoadingScreen: MinimalLoadingScreen,
    ScrollReveal: MinimalScrollReveal,
    SectionHeading: MinimalSectionHeading,
  },
}
