export { neuroklastClassicTheme } from './neuroklast-classic'
export { nebulaNoirTheme } from './nebula-noir-theme'
export { glitchNoirTheme } from './glitch-noir'
export { zardonicTheme } from './zardonic'
export { darkMinimalTheme } from './dark-minimal'

export * from './default-slots'

import type { ThemePackage } from '@/lib/types'
import { neuroklastClassicTheme } from './neuroklast-classic'
import { nebulaNoirTheme } from './nebula-noir-theme'
import { glitchNoirTheme } from './glitch-noir'
import { zardonicTheme } from './zardonic'
import { darkMinimalTheme } from './dark-minimal'

export const builtInThemes: ThemePackage[] = [
  darkMinimalTheme,       // default free theme — listed first
  neuroklastClassicTheme,
  nebulaNoirTheme,
  glitchNoirTheme,
  zardonicTheme,
]
