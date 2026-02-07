import { motion, AnimatePresence } from 'framer-motion'
import { X, PencilSimple } from '@phosphor-icons/react'
import type { Impressum } from '@/lib/types'

interface ImpressumWindowProps {
  isOpen: boolean
  onClose: () => void
  impressum?: Impressum
  editMode?: boolean
  onEdit?: () => void
}

export default function ImpressumWindow({ isOpen, onClose, impressum, editMode, onEdit }: ImpressumWindowProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-3xl bg-card border-2 border-primary/30 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 hud-scanline pointer-events-none opacity-20" />

            <div className="absolute top-0 left-0 right-0 h-12 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs text-primary uppercase tracking-wider">
                  IMPRESSUM
                </span>
              </div>
              <div className="flex items-center gap-2">
                {editMode && onEdit && (
                  <button
                    onClick={onEdit}
                    className="text-primary hover:text-accent transition-colors"
                    title="Impressum bearbeiten"
                  >
                    <PencilSimple size={18} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-primary hover:text-accent transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="pt-16 pb-8 px-8 font-mono text-sm space-y-6 max-h-[80vh] overflow-y-auto">
              {!impressum || !impressum.name ? (
                <p className="text-muted-foreground text-center py-8">
                  {editMode
                    ? 'Noch kein Impressum hinterlegt. Klicke auf den Stift oben rechts, um es zu bearbeiten.'
                    : 'Impressum wird noch eingerichtet.'}
                </p>
              ) : (
                <>
                  <div>
                    <h2 className="text-primary text-base mb-3 tracking-wider">Angaben gemäß § 5 DDG</h2>
                    <p className="text-foreground/80">{impressum.name}</p>
                    {impressum.careOf && <p className="text-foreground/80">c/o {impressum.careOf}</p>}
                    {impressum.street && <p className="text-foreground/80">{impressum.street}</p>}
                    {impressum.zipCity && <p className="text-foreground/80">{impressum.zipCity}</p>}
                  </div>

                  {(impressum.phone || impressum.email) && (
                    <div>
                      <h2 className="text-primary text-base mb-3 tracking-wider">Kontakt</h2>
                      {impressum.phone && <p className="text-foreground/80">Telefon: {impressum.phone}</p>}
                      {impressum.email && <p className="text-foreground/80">E-Mail: {impressum.email}</p>}
                    </div>
                  )}

                  {impressum.responsibleName && (
                    <div>
                      <h2 className="text-primary text-base mb-3 tracking-wider">
                        Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
                      </h2>
                      <p className="text-foreground/80">{impressum.responsibleName}</p>
                      {impressum.responsibleAddress && (
                        <p className="text-foreground/80">{impressum.responsibleAddress}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
