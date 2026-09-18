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
import { overlayAnimationPoolKey } from '@/lib/overlay-animations'
import { pickOverlayAnimationForType } from '@/lib/overlay-choreography'
import { getOverlaySessionKey } from '@/lib/overlay-session'
import { PhaseCrossfade } from '@/components/motion/PhaseCrossfade'
import { useLinearProgress } from '@/hooks/use-linear-progress'
import { MOTION } from '@/lib/motion-tokens'
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
import { OverlaySkeletonBoot } from '@/components/overlays/OverlaySkeletonBoot'
import { useLenisContext } from '@/contexts/LenisContext'

const OVERLAY_LOADING_TEXTS = [
  '> ACCESSING PROFILE...',
  '> DECRYPTING DATA...',
  '> IDENTITY VERIFIED',
]

const OVERLAY_CLOSE_TEXT = '> DROPPING LINK...'
const OVERLAY_CLOSE_LABEL = 'LINK DROP'

const INTERIOR_REVEAL_MS = 1000

interface CyberpunkOverlayProps {
  overlay: CyberpunkOverlayState | null
  onClose: () => void
  adminSettings: AdminSettings | undefined
  artistName?: string
  overlayAnimations?: string[]
  overlayClassName?: string
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
  const decorativeTexts = adminSettings?.decorative
  const { lenis } = useLenisContext()
  const prefersReducedMotion = useReducedMotion()
  const reducedMotion = prefersReducedMotion === true

  const overlaySessionKey = getOverlaySessionKey(overlay)
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const [held, setHeld] = useState<CyberpunkOverlayState | null>(overlay)

  const poolKey = overlayAnimationPoolKey(overlayAnimations)
  const anim = useMemo(() => {
    void overlaySessionKey
    return pickOverlayAnimationForType({
      type: overlay?.type,
      pool: poolKey ? poolKey.split('|') : undefined,
      reducedMotion,
    })
  }, [overlaySessionKey, poolKey, reducedMotion, overlay?.type])
  const [heldAnim, setHeldAnim] = useState(anim)
  const displayAnim = overlay ? anim : heldAnim

  useEffect(() => {
    if (!overlay) return
    setHeld(overlay)
    setHeldAnim(anim)
  }, [overlay, anim])

  const skipCloseAnim = reducedMotion || held?.type === 'terminal'
  const closing = !overlay && held !== null && !skipCloseAnim
  const displayOverlay = overlay ?? (closing ? held : null)
  const displaySessionKey = getOverlaySessionKey(displayOverlay)

  const skipBoot = reducedMotion || displayOverlay?.type === 'terminal'
  const openHandoff = useLinearProgress(overlayPhase === 'revealed' || skipBoot, MOTION.HANDOFF_MS, skipBoot)
  const closeProgress = useLinearProgress(closing, MOTION.CLOSE_MS, reducedMotion)
  const handoff = closing ? 1 - closeProgress : openHandoff

  useEffect(() => {
    if (!closing) return
    if (closeProgress < 1) return
    setHeld(null)
  }, [closing, closeProgress])

  const systemLabel =
    decorativeTexts?.overlaySystemLabel ??
    `// ${artistName ? `${artistName.toUpperCase()}.NET` : 'SYSTEM.INTERFACE'} // v${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'}`

  useEffect(() => {
    if (!overlaySessionKey) return

    if (reducedMotion || overlay?.type === 'terminal') {
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
  }, [overlaySessionKey, reducedMotion, anim.interior, overlay?.type])

  useEffect(() => {
    if (!displaySessionKey) return
    document.documentElement.classList.add('nk-scroll-lock')
    document.body.classList.add('nk-scroll-lock')
    lenis?.stop()
    return () => {
      document.documentElement.classList.remove('nk-scroll-lock')
      document.body.classList.remove('nk-scroll-lock')
      lenis?.start()
    }
  }, [displaySessionKey, lenis])

  useEffect(() => {
    if (!displaySessionKey) return

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
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && !el.closest('[inert]'))

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
  }, [displaySessionKey, onClose])

  const sessionKey = displaySessionKey ?? displayOverlay?.type ?? 'overlay'

  return (
    <AnimatePresence>
      {displayOverlay ? (
        <motion.div
          key={`${sessionKey}-backdrop`}
          initial={displayAnim.backdrop.initial}
          animate={displayAnim.backdrop.animate}
          exit={displayAnim.backdrop.exit}
          transition={displayAnim.backdrop.transition ?? { duration: 0.3 }}
          className="cyberpunk-overlay-bg fixed inset-0 bg-black/45 backdrop-blur-sm"
          style={{ zIndex: 'var(--z-overlay)' } as React.CSSProperties}
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
              initial={displayAnim.modal.initial}
              animate={displayAnim.modal.animate}
              exit={displayAnim.modal.exit}
              transition={displayAnim.modal.transition ?? { duration: reducedMotion ? 0 : 0.3 }}
              data-theme-color="card card-foreground border"
              data-cyberpunk-modal=""
              data-overlay-clip=""
              data-overlay-animation={displayAnim.name}
              data-overlay-closing={closing ? '' : undefined}
              className="theme-overlay-modal-chrome relative flex h-[100svh] max-h-[100svh] w-full max-w-4xl min-h-0 flex-col overflow-hidden border border-primary/40 bg-background/80 pointer-events-auto scanline-effect box-border pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:h-auto md:max-h-[90vh] md:pt-0"
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
                <PhaseCrossfade
                  progress={handoff}
                  holdIncoming={overlayPhase === 'revealed' || skipBoot}
                  outgoing={
                    !poolKey ? (
                      <OverlaySkeletonBoot type={displayOverlay.type} />
                    ) : displayAnim.interior ? (
                      <OverlayBootInterior interior={displayAnim.interior} />
                    ) : (
                      <OverlayShellLoader
                        loaderClass={displayAnim.loaderClass}
                        loaderLabel={closing ? OVERLAY_CLOSE_LABEL : displayAnim.loaderLabel}
                        loadingText={closing ? OVERLAY_CLOSE_TEXT : loadingText}
                      />
                    )
                  }
                  incoming={
                    <div className="p-4 pt-14 md:p-12 md:pt-12">
                      {displayOverlay.type === 'contact' && (
                        <ContactOverlayContent
                          adminSettings={adminSettings}
                          decorativeTexts={decorativeTexts}
                          closing={closing}
                        />
                      )}

                      {displayOverlay.type === 'member' && displayOverlay.data && (
                        <MemberOverlayContent
                          data={displayOverlay.data}
                          decorativeTexts={decorativeTexts}
                          closing={closing}
                        />
                      )}

                      {displayOverlay.type === 'gig' && displayOverlay.data && (
                        <GigOverlayContent
                          data={displayOverlay.data}
                          artistName={artistName}
                          decorativeTexts={decorativeTexts}
                          closing={closing}
                        />
                      )}

                      {displayOverlay.type === 'release' && displayOverlay.data && (
                        <ReleaseOverlayContent
                          data={displayOverlay.data}
                          sectionLabels={adminSettings?.labels}
                          mainArtistName={artistName}
                          closing={closing}
                        />
                      )}

                      {displayOverlay.type === 'release' && !displayOverlay.data && (
                        <p className="text-sm font-mono text-muted-foreground">Release data unavailable.</p>
                      )}

                      {displayOverlay.type === 'gallery' && displayOverlay.data && (
                        <GalleryOverlayContent data={displayOverlay.data} closing={closing} />
                      )}

                      {displayOverlay.type === 'media' && displayOverlay.data && (
                        <MediaOverlayContent data={displayOverlay.data} closing={closing} />
                      )}

                      {displayOverlay.type === 'news' && displayOverlay.data && (
                        <NewsOverlayContent data={displayOverlay.data} closing={closing} />
                      )}

                      {displayOverlay.type === 'explorer' && displayOverlay.data && (
                        <MediaExplorerBody
                          files={toExplorerFiles(displayOverlay.data.items)}
                          closing={closing}
                        />
                      )}

                      {displayOverlay.type === 'terminal' && (
                        <SecretTerminalContent siteName={artistName} />
                      )}

                      {displayOverlay.type === 'partner' && displayOverlay.data && (
                        <PartnerOverlayContent data={displayOverlay.data} closing={closing} />
                      )}
                    </div>
                  }
                />

                {overlayPhase === 'glitch' ? (
                  <div className="pointer-events-none absolute inset-0 flex min-h-[min(400px,50vh)] items-center justify-center">
                    <motion.div
                      className="glitch-effect data-label text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0, 1, 0, 1] }}
                      transition={{ duration: 0.2 }}
                    >
                      {loadingText}
                    </motion.div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
