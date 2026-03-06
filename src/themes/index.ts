/**
 * Barrel file for all built-in themes and default slot stubs.
 */

export { cyberpunkTheme } from './cyberpunk'
export { minimalTheme } from './minimal'
export { elegantTheme } from './elegant'
export { neonTheme } from './neon'
export { retroTheme } from './retro'
export { zardonicIndustrialTheme } from './zardonic-industrial'
export { neuroklastClassicTheme } from './neuroklast-classic'
export { artDecoCyberpunkTheme } from './art-deco-cyberpunk'
export { vhsRetroTheme } from './vhs-retro'
export { steampunkTheme } from './steampunk'
export { analogDarkMetalTheme } from './analog-dark-metal'
export { glitchNoirTheme } from './glitch-noir'
export { signalStaticTheme } from './signal-static'

export * from './default-slots'

import type { ThemePackage } from '@/lib/types'
import { cyberpunkTheme } from './cyberpunk'
import { minimalTheme } from './minimal'
import { elegantTheme } from './elegant'
import { neonTheme } from './neon'
import { retroTheme } from './retro'
import { zardonicIndustrialTheme } from './zardonic-industrial'
import { neuroklastClassicTheme } from './neuroklast-classic'
import { artDecoCyberpunkTheme } from './art-deco-cyberpunk'
import { vhsRetroTheme } from './vhs-retro'
import { steampunkTheme } from './steampunk'
import { analogDarkMetalTheme } from './analog-dark-metal'
import { glitchNoirTheme } from './glitch-noir'
import { signalStaticTheme } from './signal-static'

export const builtInThemes: ThemePackage[] = [
  cyberpunkTheme,
  minimalTheme,
  elegantTheme,
  neonTheme,
  retroTheme,
  zardonicIndustrialTheme,
  neuroklastClassicTheme,
  artDecoCyberpunkTheme,
  vhsRetroTheme,
  steampunkTheme,
  analogDarkMetalTheme,
  glitchNoirTheme,
  signalStaticTheme,
]
