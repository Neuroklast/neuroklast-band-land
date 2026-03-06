/**
 * Default slot stubs — minimal React components used as fallbacks
 * when a theme doesn't provide its own slot implementation.
 */

import type React from 'react'
import type { NavigationSlotProps, FooterSlotProps } from '@/lib/types'

export function DefaultHero() {
  return null
}
DefaultHero.displayName = 'DefaultHero'

export { default as DefaultNavigation } from '@/components/DefaultNavigationSlot'

export function DefaultLoadingScreen({ onComplete }: { onComplete: () => void }) {
  onComplete()
  return null
}
DefaultLoadingScreen.displayName = 'DefaultLoadingScreen'

export function DefaultSectionDivider() {
  return null
}
DefaultSectionDivider.displayName = 'DefaultSectionDivider'

export function DefaultCard({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}
DefaultCard.displayName = 'DefaultCard'

export function DefaultBackgroundEffects() {
  return null
}
DefaultBackgroundEffects.displayName = 'DefaultBackgroundEffects'

export { default as DefaultFooter } from '@/components/DefaultFooterSlot'
