import { PencilSimple, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface EditControlsProps {
  editMode: boolean
  onToggleEdit: () => void
}

export default function EditControls({ editMode, onToggleEdit }: EditControlsProps) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <AnimatePresence mode="wait">
        {editMode ? (
          <Button
            key="exit"
            onClick={onToggleEdit}
            className="bg-destructive hover:bg-destructive/90 active:bg-destructive/80 active:scale-95 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg shadow-destructive/30 hover:shadow-destructive/50 transition-all touch-manipulation"
            size="icon"
          >
            <X size={20} className="md:hidden" weight="bold" />
            <X size={24} className="hidden md:block" weight="bold" />
          </Button>
        ) : (
          <Button
            key="edit"
            onClick={onToggleEdit}
            className="bg-primary hover:bg-accent active:bg-accent/90 active:scale-95 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all touch-manipulation"
            size="icon"
          >
            <PencilSimple size={20} className="md:hidden" weight="bold" />
            <PencilSimple size={24} className="hidden md:block" weight="bold" />
          </Button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
