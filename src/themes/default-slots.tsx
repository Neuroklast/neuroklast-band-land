/**
 * Default slot stubs — minimal React components used as fallbacks
 * when a theme doesn't provide its own slot implementation.
 */

import type React from 'react'
import { motion } from 'framer-motion'

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
