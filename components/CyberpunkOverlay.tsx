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
import { resolveOverlayAnimation } from '@/lib/overlay-animations'
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
import { useLenisContext } from '@/contexts/LenisContext'

const OVERLAY_LOADING_TEXTS = [
  '> ACCESSING PROFILE...',
  '> DECRYPTING DATA...',
  '> IDENTITY VERIFIED',
]

const DEFAULT_MODAL_GLOW = 'rgba(180, 50, 50, 0.3)'

/** Resolve overlay edge glow: admin theme → CSS --modal-glow → default crimson. */
function resolveModalGlow(adminSettings: AdminSettings | undefined, alpha: number): string {
  const fromAdmin = adminSettings?.design?.theme?.modalGlowColor
  if (fromAdmin) {
    if (fromAdmin.startsWith('rgba') || fromAdmin.startsWith('rgb')) return fromAdmin
    // oklch/hex: use color-mix for alpha when possible
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
  overlayAnimation?: string
  overlayClassName?: string
}

/** Content types that skip progressive-reveal scramble (direct content fade). */
function isDirectRevealType(type: string | undefined): boolean {
  return (
    type === 'release' ||
    type === 'gig' ||
    type === 'gallery' ||
    type === 'media' ||
    type === 'news' ||
    type === 'member' ||
    type === 'explorer' ||
    type === 'terminal' ||
    type === 'partner'
  )
}

export default function CyberpunkOverlay({ overlay, onClose, adminSettings, artistName = '', overlayAnimation, overlayClassName }: CyberpunkOverlayProps) {
  const [overlayPhase, setOverlayPhase] = useState<'loading' | 'glitch' | 'revealed'>('loading')
  const [loadingText, setLoadingText] = useState(OVERLAY_LOADING_TEXTS[0])
  const [progressiveMode, setProgressiveMode] = useState(() => getRandomProgressiveMode())
  const decorativeTexts = adminSettings?.decorative
  const { lenis } = useLenisContext()
  const prefersReducedMotion = useReducedMotion()

  // Use a ref so the progressive modes config is always current inside the effect
  // without it being a dependency — prevents a re-run (and phase reset) whenever
  // adminSettings changes while the overlay is already open.
  const progressiveOverlayModesRef = useRef(adminSettings?.progressiveOverlayModes)

  // Keep the ref in sync as a separate effect so we don't assign to .current during render.
  useEffect(() => {
    progressiveOverlayModesRef.current = adminSettings?.progressiveOverlayModes
  }, [adminSettings?.progressiveOverlayModes])

  const overlaySessionKey = getOverlaySessionKey(overlay)
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  const anim = useMemo(() => {
    void overlaySessionKey
    return resolveOverlayAnimation(overlayAnimation ?? 'circuitBreak', prefersReducedMotion)
  }, [overlaySessionKey, overlayAnimation, prefersReducedMotion])
  const systemLabel = decorativeTexts?.overlaySystemLabel ?? `// ${artistName ? `${artistName.toUpperCase()}.NET` : 'SYSTEM.INTERFACE'} // v${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'}`

  useEffect(() => {
    if (!overlaySessionKey) return

    setProgressiveMode(getRandomProgressiveMode(progressiveOverlayModesRef.current))
    if (prefersReducedMotion) {
      setOverlayPhase('revealed')
      setLoadingText(OVERLAY_LOADING_TEXTS[OVERLAY_LOADING_TEXTS.length - 1])
      return
    }
    setOverlayPhase('loading')
    setLoadingText(OVERLAY_LOADING_TEXTS[0])

    const revealTimer = setTimeout(() => {
      setOverlayPhase('revealed')
    }, OVERLAY_REVEAL_PHASE_DELAY_MS)

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
  }, [overlaySessionKey, prefersReducedMotion, anim.interior])

  useEffect(() => {
    if (!overlaySessionKey) return
    const prevOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    lenis?.stop()
    return () => {
      document.body.style.overflow = prevOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.touchAction = ''
      lenis?.start()
    }
  }, [overlaySessionKey, lenis])

  useEffect(() => {
    if (!overlaySessionKey) return

    lastFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusClose = () => {
      const closeBtn = panelRef.current?.querySelector<HTMLElement>('button[aria-label="Close dialog"]')
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
  const glow50 = overlay ? resolveModalGlow(adminSettings, 0.5) : DEFAULT_MODAL_GLOW

  return (
    <AnimatePresence>
      {overlay ? (
        <motion.div
          key={sessionKey}
          initial={anim.backdrop.initial}
          animate={anim.backdrop.animate}
          exit={anim.backdrop.exit}
          transition={anim.backdrop.transition ?? { duration: 0.3 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm cyberpunk-overlay-bg"
          style={{ zIndex: 'var(--z-overlay)' } as React.CSSProperties}
          onClick={onClose}
        >
          <div
            className={`${overlayClassName ?? 'neuroklast-classic-overlay-modal'} flex h-full items-center justify-center p-3 md:p-8 pointer-events-none`}
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
                boxShadow: prefersReducedMotion
                  ? `0 0 20px ${glow35}`
                  : [`0 0 20px ${glow35}`, `0 0 40px ${glow50}`, `0 0 20px ${glow35}`],
              }}
              exit={anim.modal.exit}
              data-theme-color="card card-foreground border"
              data-cyberpunk-modal=""
              transition={{
                ...(anim.modal.transition ?? { duration: 0.3 }),
                boxShadow: prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="theme-overlay-modal-chrome relative flex h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl min-h-0 flex-col overflow-hidden border border-primary/40 bg-background/98 pointer-events-auto scanline-effect pb-[env(safe-area-inset-bottom)] md:h-auto md:max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pointer-events-none absolute top-0 left-0 z-10 h-6 w-6 border-t-2 border-l-2 border-primary/50" />
              <div className="pointer-events-none absolute top-0 right-0 z-10 h-6 w-6 border-t-2 border-r-2 border-primary/50" />
              <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-6 w-6 border-b-2 border-l-2 border-primary/50" />
              <div className="pointer-events-none absolute bottom-0 right-0 z-10 h-6 w-6 border-b-2 border-r-2 border-primary/50" />

              <div className="relative z-20 flex h-11 shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-primary/30 bg-primary/10 pr-[max(0.75rem,env(safe-area-inset-right))] pl-4">
                {!prefersReducedMotion ? (
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 w-8 bg-primary/20"
                    animate={{ x: ['-100%', '120%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  />
                ) : null}
                <div className="relative z-[1] flex min-w-0 items-center gap-3">
                  <div className="h-2 w-2 shrink-0 animate-pulse bg-primary" />
                  <div id="cyberpunk-overlay-title" className="truncate font-mono text-[10px] uppercase tracking-wider text-primary/70">
                    {systemLabel}
                  </div>
                </div>
                <CyberCloseButton onClick={onClose} />
              </div>

              <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y scrollbar-hide">
                {overlayPhase === 'loading' &&
                  (anim.interior ? (
                    <OverlayBootInterior interior={anim.interior} />
                  ) : (
                    <div className="flex min-h-[min(400px,50vh)] items-center justify-center">
                      <motion.span
                        className="progressive-loading-label font-mono text-lg text-primary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {loadingText}
                      </motion.span>
                    </div>
                  ))}

                {overlayPhase === 'glitch' && (
                  <div className="flex items-center justify-center min-h-[min(400px,50vh)]">
                    <motion.div className="glitch-effect text-primary font-mono text-lg" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 1, 0, 1] }} transition={{ duration: 0.2 }}>
                      {loadingText}
                    </motion.div>
                  </div>
                )}

                {overlayPhase === 'revealed' && (
                  <div className="p-4 md:p-10">
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
