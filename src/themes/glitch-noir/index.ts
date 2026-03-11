import Hero from './Hero'
import Navigation from './Navigation'
import Card from './Card'
import BackgroundEffects from './BackgroundEffects'
import SectionDivider from './SectionDivider'
import LoadingScreen from './LoadingScreen'
import './styles.css'

import type { ThemePackage } from '@/lib/types'

export const glitchNoirTheme: ThemePackage = {
  description: 'A minimal dark techno theme',
  version: '1.0.0',
  author: 'Neuroklast',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Inter', serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  effects: {},
  colorPresets: [],
  defaultPresetId: 'default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  id: 'glitch-noir',
  name: 'Glitch Noir',
  defaultModalAnimation: 'glitchScan',
  supportedModalAnimations: ['circuitBreak', 'systemBoot', 'glitchScan', 'dataStream', 'neuralJackIn', 'hologramMaterialize', 'matrixDecode', 'ringLink', 'random'],
  // colors: {

  slots: {
    Hero,
    Navigation,
    Card,
    BackgroundEffects,
    SectionDivider,
    LoadingScreen
  }
}
