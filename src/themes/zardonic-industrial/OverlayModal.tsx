import React, { useEffect, useState } from 'react'
import type { OverlayModalSlotProps } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { MemberContent, GigContent, ReleaseContent, NewsContent, FriendContent, ImpressumContent } from '@/components/overlay-content'

export default function OverlayModal({ overlay, onClose, sectionLabels }: OverlayModalSlotProps) {
  const [activeOverlay, setActiveOverlay] = useState(overlay)

  useEffect(() => {
    if (overlay) setActiveOverlay(overlay)
  }, [overlay])

  return (
    <AnimatePresence onExitComplete={() => setActiveOverlay(null)}>
      {overlay && activeOverlay && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-background/95 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-l-4 shadow-[0_0_50px_rgba(var(--primary),0.1)]"
            initial={{ scale: 1.05, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            style={{ borderLeftColor: 'var(--primary)' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-mutedForeground hover:text-primary transition-colors bg-background/80 hover:bg-card border border-transparent hover:border-primary"
            >
              <X size={24} />
            </button>

            <div className="p-2 sm:p-6">
              {activeOverlay.type === 'member' && <MemberContent member={activeOverlay.data as any} sectionLabels={sectionLabels} />}
              {activeOverlay.type === 'gig' && <GigContent gig={activeOverlay.data as any} />}
              {activeOverlay.type === 'release' && <ReleaseContent release={activeOverlay.data as any} />}
              {activeOverlay.type === 'news' && <NewsContent item={activeOverlay.data as any} />}
              {activeOverlay.type === 'friend' && <FriendContent friend={activeOverlay.data as any} sectionLabels={sectionLabels} />}
              {['impressum', 'datenschutz'].includes(activeOverlay.type) && <ImpressumContent impressum={activeOverlay.data as any} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
