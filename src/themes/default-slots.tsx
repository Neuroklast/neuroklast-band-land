/**
 * Default slot stubs — minimal React components used as fallbacks
 * when a theme doesn't provide its own slot implementation.
 */

import type React from 'react'
import { motion } from 'framer-motion'
import type { HeroSlotProps } from '@/lib/types'

export function DefaultHero({ name, genres }: HeroSlotProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-4">
          {name}
        </h1>
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {genres.map((genre) => (
              <span key={genre} className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
DefaultHero.displayName = 'DefaultHero'

export { default as DefaultNavigation } from '@/components/DefaultNavigationSlot'

export function DefaultLoadingScreen({ onComplete }: { onComplete: () => void }) {
  onComplete()
  return null
}
DefaultLoadingScreen.displayName = 'DefaultLoadingScreen'

export { default as DefaultSectionDivider } from './primitives/ThemeSectionDivider'

export { default as DefaultCard } from './primitives/ThemeCard'

export function DefaultBackgroundEffects() {
  return null
}
DefaultBackgroundEffects.displayName = 'DefaultBackgroundEffects'

export { default as DefaultFooter } from '@/components/DefaultFooterSlot'

// ─── New default slots (slots 8–15) ──────────────────────────────────────────

export { default as DefaultOverlayModal } from '@/components/DefaultOverlayModalSlot'

export function DefaultSectionHeading({ title, prefix = '>' }: { title: string; prefix?: string }) {
  return (
    <h2 className="font-mono text-xs uppercase tracking-widest text-primary/60 mb-6 border-b border-primary/10 pb-2">
      {prefix && <span className="text-primary/40 mr-1">{prefix}</span>}
      {title}
    </h2>
  )
}
DefaultSectionHeading.displayName = 'DefaultSectionHeading'

export function DefaultOverlayTransition() {
  return null
}
DefaultOverlayTransition.displayName = 'DefaultOverlayTransition'

export function DefaultItemCard({ onClick, children }: { onClick?: () => void; children?: React.ReactNode }) {
  return (
    <div
      className={`border border-primary/20 bg-card p-4 ${onClick ? 'cursor-pointer hover:border-primary/40 transition-colors' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  )
}
DefaultItemCard.displayName = 'DefaultItemCard'

export { default as DefaultCookieBanner } from '@/components/CookieBanner'

export function DefaultScrollReveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}
DefaultScrollReveal.displayName = 'DefaultScrollReveal'

export function DefaultHoverEffect({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={className} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  )
}
DefaultHoverEffect.displayName = 'DefaultHoverEffect'

export function DefaultPageLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
DefaultPageLayout.displayName = 'DefaultPageLayout'

// ─── Content-section default slots (slots 16–24) ────────────────────────────

export { default as DefaultGigsSection } from '@/components/DefaultGigsSectionSlot'
export { default as DefaultReleasesSection } from '@/components/DefaultReleasesSectionSlot'
export { default as DefaultBiographySection } from '@/components/DefaultBiographySectionSlot'
export { default as DefaultNewsSection } from '@/components/DefaultNewsSectionSlot'
export { default as DefaultMediaSection } from '@/components/DefaultMediaSectionSlot'
export { default as DefaultGallerySection } from '@/components/DefaultGallerySectionSlot'
export { default as DefaultSocialSection } from '@/components/DefaultSocialSectionSlot'
export { default as DefaultContactSection } from '@/components/DefaultContactSectionSlot'
export { default as DefaultPartnersSection } from '@/components/DefaultPartnersSectionSlot'
