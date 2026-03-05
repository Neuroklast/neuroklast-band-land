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

export * from './default-slots'

import type { ThemePackage } from '@/lib/types'
import { cyberpunkTheme } from './cyberpunk'
import { minimalTheme } from './minimal'
import { elegantTheme } from './elegant'
import { neonTheme } from './neon'
import { retroTheme } from './retro'
import { zardonicIndustrialTheme } from './zardonic-industrial'
import { neuroklastClassicTheme } from './neuroklast-classic'

export const builtInThemes: ThemePackage[] = [
  cyberpunkTheme,
  minimalTheme,
  elegantTheme,
  neonTheme,
  retroTheme,
  zardonicIndustrialTheme,
  neuroklastClassicTheme,
]
