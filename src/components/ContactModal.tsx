/**
 * ContactModal — wraps ContactSection inside a full-screen modal overlay.
 *
 * Uses the theme's OverlayModal slot for chrome/animations when available,
 * falling back to a simple backdrop + centered panel.
 */
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import ContactSection from '@/components/ContactSection'
import type { ContactSettings, SectionLabels } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface ContactModalProps {
  open: boolean
  onClose: () => void
  contactSettings?: ContactSettings
  sectionLabels?: SectionLabels
}

export default function ContactModal({ open, onClose, contactSettings, sectionLabels }: ContactModalProps) {
  const { t } = useLocale()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="contact-modal-backdrop"
          className="fixed inset-0 z-[9900] bg-black/85 backdrop-blur-sm overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <div className="min-h-full flex items-center justify-center p-4 md:p-8">
            <motion.div
              key="contact-modal-panel"
              className="w-full max-w-2xl bg-card border border-primary/40 relative theme-overlay-modal-chrome"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                boxShadow: '0 0 40px color-mix(in oklch, var(--primary) 20%, transparent), 0 0 80px color-mix(in oklch, var(--primary) 10%, transparent)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* HUD corner decorators */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary/50 pointer-events-none" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary/50 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary/50 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary/50 pointer-events-none" />

              {/* Header bar */}
              <div className="h-10 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4">
                <span className="font-mono text-[10px] text-primary/70 tracking-wider uppercase">
                  {t('contact.modalTitle') || 'CONTACT // SEND MESSAGE'}
                </span>
                <button
                  onClick={onClose}
                  aria-label={t('contact.closeModal') || 'Close'}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content: reuse existing ContactSection */}
              <div className="p-0">
                <ContactSection
                  contactSettings={contactSettings}
                  sectionLabels={sectionLabels}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
