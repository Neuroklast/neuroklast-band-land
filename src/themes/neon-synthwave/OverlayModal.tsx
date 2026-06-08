import React, { useEffect, useState } from 'react'
import type { OverlayModalSlotProps } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

// Note: To keep the theme presentation-focused, we render the exact modal contents
// using the built-in components from src/components/overlay-content, but we wrap
// them in our custom synthwave themed container.
import { MemberContent, GigContent, ReleaseContent, NewsContent, FriendContent, ImpressumContent } from '@/components/overlay-content'
import type { Member, Gig, Release, NewsItem, Friend, Impressum } from '@/lib/types'

export default function OverlayModal({ overlay, onClose, sectionLabels }: OverlayModalSlotProps) {
  // Use local state to render contents to allow animation out before setting overlay to null
  const [activeOverlay, setActiveOverlay] = useState(overlay)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (overlay) {
      timer = setTimeout(() => setActiveOverlay(overlay), 0)
    }
    return () => clearTimeout(timer)
  }, [overlay])

  return (
    <AnimatePresence onExitComplete={() => setActiveOverlay(null)}>
      {overlay && activeOverlay && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto card-container border-2 bg-card/95"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              borderColor: 'var(--primary)',
              boxShadow: '0 0 30px rgba(var(--primary-rgb), 0.3), inset 0 0 20px rgba(var(--primary-rgb), 0.1)'
            }}
          >
            {/* Custom Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-primary hover:text-white bg-background/50 border border-primary hover:bg-primary/50 transition-all rounded"
              style={{ boxShadow: '0 0 10px var(--primary)' }}
            >
              <X size={24} />
            </button>

            <div className="p-1 sm:p-4">
              {activeOverlay.type === 'member' && <MemberContent member={activeOverlay.data as Member} sectionLabels={sectionLabels} />}
              {activeOverlay.type === 'gig' && <GigContent gig={activeOverlay.data as Gig} />}
              {activeOverlay.type === 'release' && <ReleaseContent release={activeOverlay.data as Release} />}
              {activeOverlay.type === 'news' && <NewsContent item={activeOverlay.data as NewsItem} />}
              {activeOverlay.type === 'friend' && <FriendContent friend={activeOverlay.data as Friend} sectionLabels={sectionLabels} />}
              {['impressum', 'datenschutz'].includes(activeOverlay.type) && <ImpressumContent impressum={activeOverlay.data as Impressum} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
