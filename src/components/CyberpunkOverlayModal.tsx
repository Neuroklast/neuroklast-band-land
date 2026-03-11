import { motion, AnimatePresence, type Target, type TargetAndTransition } from 'framer-motion'
import CyberCloseButton from '@/components/CyberCloseButton'
import { useEffect } from 'react'
import type { Member, Release, Gig, Impressum, NewsItem, Friend, SectionLabels } from '@/lib/types'
import type { OverlayAnimation } from '@/lib/overlay-animations'
import type { OverlayPhase } from '@/hooks/use-overlay-state'
import MemberContent from '@/components/overlay-content/MemberContent'
import ReleaseContent from '@/components/overlay-content/ReleaseContent'
import GigContent from '@/components/overlay-content/GigContent'
import ImpressumContent from '@/components/overlay-content/ImpressumContent'
import NewsContent from '@/components/overlay-content/NewsContent'
import { formatNewsDate } from '@/lib/news-utils'
import FriendContent from '@/components/overlay-content/FriendContent'

interface CyberpunkOverlayModalProps {
  overlay: { type: string; data: unknown } | null
  phase: OverlayPhase
  loadingText: string
  animation: OverlayAnimation
  onClose: () => void
  sectionLabels?: SectionLabels
}

/** The full cyberpunk 3-phase overlay modal rendered in App.tsx */
export default function CyberpunkOverlayModal({
  overlay,
  phase,
  loadingText,
  animation,
  onClose,
  sectionLabels,
}: CyberpunkOverlayModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const headerTitle = overlay
    ? overlay.type === 'member'    ? `PROFILE // ${(overlay.data as Member).name?.toUpperCase()}`
    : overlay.type === 'release'   ? `RELEASE // ${(overlay.data as Release).title?.toUpperCase()}`
    : overlay.type === 'gig'       ? `EVENT // ${(overlay.data as Gig).venue?.toUpperCase()}`
    : overlay.type === 'news'      ? `NEWS // ${formatNewsDate((overlay.data as NewsItem).date)}`
    : overlay.type === 'friend'    ? `PROFILE // ${(overlay.data as Friend).name?.toUpperCase()}`
    : 'ENTITY.INFO // LEGAL'
    : ''

  return (
    <AnimatePresence>
      {overlay && (
        <motion.div
          key="cyberpunk-overlay-backdrop"
          className="fixed inset-0 z-[9998] cyberpunk-overlay-bg bg-black/90 backdrop-blur-sm overflow-y-auto"
          initial={animation.backdrop.initial as Target}
          animate={animation.backdrop.animate as TargetAndTransition}
          exit={animation.backdrop.exit as TargetAndTransition}
          transition={animation.backdrop.transition}
          onClick={onClose}
        >
          <div className="min-h-full flex items-center justify-center p-4 md:p-6">
            <motion.div
              key="cyberpunk-overlay-modal"
              className="w-full max-w-3xl bg-card border border-primary/40 relative theme-overlay-modal-chrome"
              initial={animation.modal.initial as Target}
              animate={animation.modal.animate as TargetAndTransition}
              exit={animation.modal.exit as TargetAndTransition}
              transition={animation.modal.transition}
              style={{
                boxShadow: '0 0 40px color-mix(in oklch, var(--primary) 20%, transparent), 0 0 80px color-mix(in oklch, var(--primary) 10%, transparent)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Loading phase */}
              {phase === 'loading' && (
                <div className="flex flex-col items-center justify-center gap-4 py-16 px-8">
                  <div className={animation.loaderClass} />
                  <p className="progressive-loading-label text-primary/70 font-mono text-xs tracking-wider">{loadingText}</p>
                  <p className="text-primary/40 font-mono text-[9px] tracking-widest uppercase">{animation.loaderLabel}</p>
                </div>
              )}

              {/* Revealed phase */}
              {phase === 'revealed' && (
                <>
                  {/* HUD corner accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50 pointer-events-none" />

                  {/* Header bar with animated scanline */}
                  <div className="h-10 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 w-8 bg-primary/20"
                      animate={{ x: ['-100%', '120%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="flex items-center gap-3 relative z-[1]">
                      <div className="w-2 h-2 bg-primary animate-pulse" />
                      <span className="font-mono text-[10px] text-primary/70 tracking-wider uppercase truncate max-w-[200px] md:max-w-xs">
                        {headerTitle}
                      </span>
                    </div>
                    <CyberCloseButton
                      onClick={onClose}
                      label={sectionLabels?.closeButtonText || 'CLOSE'}
                    />
                  </div>

                  {/* Per-type content */}
                  <AnimatePresence mode="wait">
                    {overlay.type === 'member' && (
                      <MemberContent key="member" member={overlay.data as Member} sectionLabels={sectionLabels} />
                    )}
                    {overlay.type === 'release' && (
                      <ReleaseContent key="release" release={overlay.data as Release} />
                    )}
                    {overlay.type === 'gig' && (
                      <GigContent key="gig" gig={overlay.data as Gig} />
                    )}
                    {overlay.type === 'impressum' && (
                      <ImpressumContent key="impressum" impressum={overlay.data as Impressum} />
                    )}
                    {overlay.type === 'news' && (
                      <NewsContent key="news" item={overlay.data as NewsItem} sectionLabels={sectionLabels} />
                    )}
                    {overlay.type === 'friend' && (
                      <FriendContent key="friend" friend={overlay.data as Friend} sectionLabels={sectionLabels} />
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
