export { neuroklastClassicTheme } from './neuroklast-classic'
export { glitchNoirTheme } from './glitch-noir'
export { neuroklastIndustrialTheme } from './neuroklast-industrial'
export { umbrellaCorpTheme } from './umbrella-corp'

export * from './default-slots'

import type { ThemePackage } from '@/lib/types'
import { neuroklastClassicTheme } from './neuroklast-classic'
import { glitchNoirTheme } from './glitch-noir'
import { neuroklastIndustrialTheme } from './neuroklast-industrial'
import { umbrellaCorpTheme } from './umbrella-corp'

export const builtInThemes: ThemePackage[] = [
  glitchNoirTheme,               // default free theme — listed first
  neuroklastClassicTheme,
  neuroklastIndustrialTheme,
  umbrellaCorpTheme,
]
