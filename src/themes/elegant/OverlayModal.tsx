import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { useEffect } from 'react'
import type { OverlayModalSlotProps } from '@/lib/types'
import type { Member, Release, Gig, Impressum, NewsItem, Friend } from '@/lib/types'
import MemberContent from '@/components/overlay-content/MemberContent'
import ReleaseContent from '@/components/overlay-content/ReleaseContent'
import GigContent from '@/components/overlay-content/GigContent'
import ImpressumContent from '@/components/overlay-content/ImpressumContent'
import NewsContent, { formatNewsDate } from '@/components/overlay-content/NewsContent'
import FriendContent from '@/components/overlay-content/FriendContent'

/**
 * Elegant theme overlay modal — gentle fade-in with serif typography.
 * No loading phase or glitch effects; just a soft opacity transition.
 */
export default function ElegantOverlayModal({ overlay, onClose, sectionLabels }: OverlayModalSlotProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const headerTitle = overlay
    ? overlay.type === 'member'  ? (overlay.data as Member).name
    : overlay.type === 'release' ? (overlay.data as Release).title
    : overlay.type === 'gig'     ? (overlay.data as Gig).venue
    : overlay.type === 'news'    ? formatNewsDate((overlay.data as NewsItem).date)
    : overlay.type === 'friend'  ? (overlay.data as Friend).name
    : 'Impressum'
    : ''

  return (
    <AnimatePresence>
      {overlay && (
        <motion.div
          key="elegant-overlay-backdrop"
          className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        >
          <div className="min-h-full flex items-center justify-center p-4 md:p-8">
            <motion.div
              key="elegant-overlay-modal"
              className="w-full max-w-3xl bg-card border border-border/60 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
                <h2 className="font-serif text-lg text-foreground/90 italic tracking-wide">
                  {headerTitle}
                </h2>
                <button
                  onClick={onClose}
                  className="text-foreground/40 hover:text-foreground transition-colors p-1"
                  aria-label={sectionLabels?.closeButtonText || 'Close'}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
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
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
