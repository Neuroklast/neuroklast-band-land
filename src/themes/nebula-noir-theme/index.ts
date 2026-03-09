import Hero from './Hero'
import Navigation from './Navigation'
import Card from './Card'
import BackgroundEffects from './BackgroundEffects'
import SectionDivider from './SectionDivider'
import LoadingScreen from './LoadingScreen'
import './styles.css'

import type { ThemePackage } from '@/lib/types'

export const nebulaNoirTheme: ThemePackage = {
  id: 'nebula-noir-theme',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Cinzel', serif",
    body: "'Montserrat', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  colorPresets: [],
  effects: {},
  defaultPresetId: 'default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  name: 'Nebula Noir - Cosmic Art Deco Goth',
  description: 'A dark, elegant theme inspired by Art Deco geometry, cosmic aesthetics, and gothic sensibilities. Features subtle CRT effects, glowing purple accents, and mechanical animations.',
  version: '1.0.0',
  author: 'Nebula Noir',







  slots: {
    Hero,
    Navigation,
    Card,
    BackgroundEffects,
    SectionDivider,
    LoadingScreen,
  },


}

export default nebulaNoirTheme

export {
  Hero,
  Navigation,
  Card,
  BackgroundEffects,
  SectionDivider,
  LoadingScreen,
}
