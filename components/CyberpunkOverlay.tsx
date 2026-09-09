'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import CyberCloseButton from '@/components/CyberCloseButton'
import type { AdminSettings } from '@/lib/types'
import type { CyberpunkOverlayState } from '@/lib/app-types'
import {
  OVERLAY_LOADING_TEXT_INTERVAL_MS,
  OVERLAY_GLITCH_PHASE_DELAY_MS,
  OVERLAY_REVEAL_PHASE_DELAY_MS,
} from '@/lib/config'
import { overlayAnimationPoolKey, pickOverlayAnimationFromPool } from '@/lib/overlay-animations'
import { getOverlaySessionKey } from '@/lib/overlay-session'
import { getRandomProgressiveMode } from '@/lib/progressive-overlay-modes'
import { ContactOverlayContent } from '@/components/overlays/ContactOverlayContent'
import { MemberOverlayContent } from '@/components/overlays/MemberOverlayContent'
import { GigOverlayContent } from '@/components/overlays/GigOverlayContent'
import { ReleaseOverlayContent } from '@/components/overlays/ReleaseOverlayContent'
import { GalleryOverlayContent } from '@/components/overlays/GalleryOverlayContent'
import { MediaOverlayContent } from '@/components/overlays/MediaOverlayContent'
import { NewsOverlayContent } from '@/components/overlays/NewsOverlayContent'
import { MediaExplorerBody } from '@/app/_components/public/MediaOverlay'
import { toExplorerFiles } from '@/app/_components/public/MediaExplorer'
import { SecretTerminalContent } from '@/components/overlays/SecretTerminalContent'
import { PartnerOverlayContent } from '@/components/overlays/PartnerOverlayContent'
import { OverlayBootInterior } from '@/components/overlays/OverlayBootInterior'
import { OverlayShellLoader } from '@/components/overlays/OverlayShellLoader'
import { useLenisContext } from '@/contexts/LenisContext'

const OVERLAY_LOADING_TEXTS = [
  '> ACCESSING PROFILE...',
  '> DECRYPTING DATA...',
  '> IDENTITY VERIFIED',
]

const DEFAULT_MODAL_GLOW = 'rgba(180, 50, 50, 0.3)'
const INTERIOR_REVEAL_MS = 1000

function resolveModalGlow(adminSettings: AdminSettings | undefined, alpha: number): string {
  const fromAdmin = adminSettings?.design?.theme?.modalGlowColor
  if (fromAdmin) {
    if (fromAdmin.startsWith('rgba') || fromAdmin.startsWith('rgb')) return fromAdmin
    return `color-mix(in srgb, ${fromAdmin} ${Math.round(alpha * 100)}%, transparent)`
  }
  if (typeof document !== 'undefined') {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--modal-glow').trim()
    if (cssVar) {
      return `color-mix(in srgb, ${cssVar} ${Math.round(alpha * 100)}%, transparent)`
    }
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    if (accent) {
      return `color-mix(in srgb, ${accent} ${Math.round(alpha * 100)}%, transparent)`
    }
  }
  return DEFAULT_MODAL_GLOW.replace('0.3', String(alpha))
}

interface CyberpunkOverlayProps {
  overlay: CyberpunkOverlayState | null
  onClose: () => void
  adminSettings: AdminSettings | undefined
  artistName?: string
  overlayAnimations?: string[]
  overlayClassName?: string
}

function isDirectRevealType(type: string | undefined): boolean {
  return (
    type === 'release' ||
    type === 'gig' ||
    type === 'gallery' ||
    type === 'media' ||
    type === 'explorer' ||
    type === 'terminal' ||
    type === 'partner' ||
    type === 'member' ||
    type === 'news' ||
    type === 'contact'
  )
}

export default function CyberpunkOverlay({
  overlay,
  onClose,
  adminSettings,
  artistName = '',
  overlayAnimations,
  overlayClassName,
}: CyberpunkOverlayProps) {
  const [overlayPhase, setOverlayPhase] = useState<'loading' | 'glitch' | 'revealed'>('loading')
  const [loadingText, setLoadingText] = useState(OVERLAY_LOADING_TEXTS[0])
  const [progressiveMode, setProgressiveMode] = useState(() => getRandomProgressiveMode())
  const decorativeTexts = adminSettings?.decorative
  const { lenis } = useLenisContext()
  const prefersReducedMotion = useReducedMotion()
  const reducedMotion = prefersReducedMotion === true
  const progressiveOverlayModesRef = useRef(adminSettings?.progressiveOverlayModes)

  useEffect(() => {
    progressiveOverlayModesRef.current = adminSettings?.progressiveOverlayModes
  }, [adminSettings?.progressiveOverlayModes])

  const overlaySessionKey = getOverlaySessionKey(overlay)
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  const poolKey = overlayAnimationPoolKey(overlayAnimations)
  const anim = useMemo(() => {
    void overlaySessionKey
    return pickOverlayAnimationFromPool(poolKey ? poolKey.split('|') : undefined, reducedMotion)
  }, [overlaySessionKey, poolKey, reducedMotion])

  const systemLabel =
    decorativeTexts?.overlaySystemLabel ??
    `// ${artistName ? `${artistName.toUpperCase()}.NET` : 'SYSTEM.INTERFACE'} // v${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'}`

  useEffect(() => {
    if (!overlaySessionKey) return

    setProgressiveMode(getRandomProgressiveMode(progressiveOverlayModesRef.current))
    if (reducedMotion) {
      setOverlayPhase('revealed')
      setLoadingText(OVERLAY_LOADING_TEXTS[OVERLAY_LOADING_TEXTS.length - 1])
      return
    }
    setOverlayPhase('loading')
    setLoadingText(OVERLAY_LOADING_TEXTS[0])

    const revealMs = anim.interior ? INTERIOR_REVEAL_MS : OVERLAY_REVEAL_PHASE_DELAY_MS
    const revealTimer = setTimeout(() => {
      setOverlayPhase('revealed')
    }, revealMs)

    if (anim.interior) {
      return () => clearTimeout(revealTimer)
    }

    let idx = 0
    const txtInterval = setInterval(() => {
      idx += 1
      if (idx <= OVERLAY_LOADING_TEXTS.length - 1) {
        setLoadingText(OVERLAY_LOADING_TEXTS[idx])
      }
    }, OVERLAY_LOADING_TEXT_INTERVAL_MS)

    const glitchTimer = setTimeout(() => {
      clearInterval(txtInterval)
      setOverlayPhase('glitch')
    }, OVERLAY_GLITCH_PHASE_DELAY_MS)

    return () => {
      clearInterval(txtInterval)
      clearTimeout(glitchTimer)
      clearTimeout(revealTimer)
    }
  }, [overlaySessionKey, reducedMotion, anim.interior])

  useEffect(() => {
    if (!overlaySessionKey) return
    document.documentElement.classList.add('nk-scroll-lock')
    document.body.classList.add('nk-scroll-lock')
    lenis?.stop()
    return () => {
      document.documentElement.classList.remove('nk-scroll-lock')
      document.body.classList.remove('nk-scroll-lock')
      lenis?.start()
    }
  }, [overlaySessionKey, lenis])

  useEffect(() => {
    if (!overlaySessionKey) return

    lastFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusClose = () => {
      const closeBtn = panelRef.current?.querySelector<HTMLElement>('[data-overlay-close]')
      closeBtn?.focus()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const focusTimer = window.setTimeout(focusClose, OVERLAY_REVEAL_PHASE_DELAY_MS + 50)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(focusTimer)
      lastFocusedRef.current?.focus?.()
    }
  }, [overlaySessionKey, onClose])

  const sessionKey = overlaySessionKey ?? overlay?.type ?? 'overlay'
  const glow35 = overlay ? resolveModalGlow(adminSettings, 0.35) : DEFAULT_MODAL_GLOW

  return (
    <AnimatePresence>
      {overlay ? (
        <motion.div
          key={`${sessionKey}-backdrop`}
          initial={anim.backdrop.initial}
          animate={anim.backdrop.animate}
          exit={anim.backdrop.exit}
          transition={anim.backdrop.transition ?? { duration: 0.3 }}
          className="cyberpunk-overlay-bg fixed inset-0 bg-black/45 backdrop-blur-md"
          style={
            {
              zIndex: 'var(--z-overlay)',
              boxShadow: 'inset 0 0 120px color-mix(in srgb, var(--modal-glow, var(--primary)) 35%, transparent)',
            } as React.CSSProperties
          }
          onClick={onClose}
        >
          <div
            className={`${overlayClassName ?? 'neuroklast-classic-overlay-modal'} flex h-full items-end justify-center p-0 pointer-events-none md:items-center md:p-8`}
            style={{ perspective: '1000px' }}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cyberpunk-overlay-title"
              initial={{ ...anim.modal.initial, boxShadow: '0 0 0px rgba(0, 0, 0, 0)' }}
              animate={{
                ...anim.modal.animate,
                boxShadow: `0 0 24px ${glow35}, inset 0 0 28px ${glow35}`,
              }}
              exit={anim.modal.exit}
              transition={anim.modal.transition ?? { duration: reducedMotion ? 0 : 0.3 }}
              data-theme-color="card card-foreground border"
              data-cyberpunk-modal=""
              data-overlay-clip=""
              data-overlay-animation={anim.name}
              className="theme-overlay-modal-chrome relative flex h-[100svh] max-h-[100svh] w-full max-w-4xl min-h-0 flex-col overflow-hidden border border-primary/40 bg-background/98 pointer-events-auto scanline-effect box-border pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:h-auto md:max-h-[90vh] md:pt-0"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="pointer-events-none absolute top-0 left-0 z-10 h-3 w-3 border-t-2 border-l-2 border-primary"
                initial={prefersReducedMotion ? false : { opacity: 0, x: -10, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              />
              <motion.div
                className="pointer-events-none absolute top-0 right-0 z-10 h-3 w-3 border-t-2 border-r-2 border-primary"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 10, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              />
              <motion.div
                className="pointer-events-none absolute bottom-0 left-0 z-10 h-3 w-3 border-b-2 border-l-2 border-primary"
                initial={prefersReducedMotion ? false : { opacity: 0, x: -10, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              />
              <motion.div
                className="pointer-events-none absolute bottom-0 right-0 z-10 h-3 w-3 border-b-2 border-r-2 border-primary"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 10, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              />

              <motion.div
                className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-px bg-primary/20"
                initial={prefersReducedMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{ transformOrigin: 'left' }}
              />
              <motion.div
                className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-px bg-primary/20"
                initial={prefersReducedMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                style={{ transformOrigin: 'right' }}
              />

              <motion.div
                className="pointer-events-none absolute top-2 left-1/2 z-20 -translate-x-1/2"
                initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
              >
                <div id="cyberpunk-overlay-title" className="data-label">
                  {systemLabel}
                </div>
              </motion.div>

              <CyberCloseButton
                onClick={onClose}
                className="absolute top-3 right-3 z-20 md:top-4 md:right-4"
              />

              <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y scrollbar-hide">
                {overlayPhase === 'loading' &&
                  (anim.interior ? (
                    <OverlayBootInterior interior={anim.interior} />
                  ) : (
                    <OverlayShellLoader
                      loaderClass={anim.loaderClass}
                      loaderLabel={anim.loaderLabel}
                      loadingText={loadingText}
                    />
                  ))}

                {overlayPhase === 'glitch' && (
                  <div className="flex min-h-[min(400px,50vh)] items-center justify-center">
                    <motion.div
                      className="glitch-effect data-label text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0, 1, 0, 1] }}
                      transition={{ duration: 0.2 }}
                    >
                      {loadingText}
                    </motion.div>
                  </div>
                )}

                {overlayPhase === 'revealed' && (
                  <div className="p-4 pt-14 md:p-12 md:pt-12">
                    <AnimatePresence mode="wait">
                      {overlayPhase === 'revealed' && (
                        <motion.div
                          key={overlaySessionKey ?? overlay.type}
                          className={
                            isDirectRevealType(overlay.type) ? undefined : progressiveMode.className
                          }
                          initial={
                            isDirectRevealType(overlay.type)
                              ? { opacity: 0, y: 8 }
                              : progressiveMode.containerVariants.loading
                          }
                          animate={
                            isDirectRevealType(overlay.type)
                              ? { opacity: 1, y: 0 }
                              : progressiveMode.containerVariants.loaded
                          }
                          transition={
                            isDirectRevealType(overlay.type)
                              ? { duration: 0.25, ease: 'easeOut' }
                              : progressiveMode.transition
                          }
                        >
                          {overlay.type === 'contact' && (
                            <ContactOverlayContent adminSettings={adminSettings} decorativeTexts={decorativeTexts} />
                          )}

                          {overlay.type === 'member' && overlay.data && (
                            <MemberOverlayContent data={overlay.data} decorativeTexts={decorativeTexts} />
                          )}

                          {overlay.type === 'gig' && overlay.data && (
                            <GigOverlayContent data={overlay.data} artistName={artistName} decorativeTexts={decorativeTexts} />
                          )}

                          {overlay.type === 'release' && overlay.data && (
                            <ReleaseOverlayContent
                              data={overlay.data}
                              sectionLabels={adminSettings?.labels}
                              mainArtistName={artistName}
                            />
                          )}

                          {overlay.type === 'release' && !overlay.data && (
                            <p className="text-sm font-mono text-muted-foreground">Release data unavailable.</p>
                          )}

                          {overlay.type === 'gallery' && overlay.data && (
                            <GalleryOverlayContent data={overlay.data} />
                          )}

                          {overlay.type === 'media' && overlay.data && (
                            <MediaOverlayContent data={overlay.data} />
                          )}

                          {overlay.type === 'news' && overlay.data && (
                            <NewsOverlayContent data={overlay.data} />
                          )}

                          {overlay.type === 'explorer' && overlay.data && (
                            <MediaExplorerBody files={toExplorerFiles(overlay.data.items)} />
                          )}

                          {overlay.type === 'terminal' && (
                            <SecretTerminalContent siteName={artistName} />
                          )}

                          {overlay.type === 'partner' && overlay.data && (
                            <PartnerOverlayContent data={overlay.data} />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
