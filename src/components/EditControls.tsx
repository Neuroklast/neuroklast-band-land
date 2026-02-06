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
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <AnimatePresence mode="wait">
        {editMode ? (
          <motion.div
            key="exit"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Button
              onClick={onToggleEdit}
              className="bg-destructive hover:bg-destructive/90 active:bg-destructive/80 active:scale-90 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-xl shadow-destructive/40 hover:shadow-destructive/60 active:shadow-destructive/80 transition-all touch-manipulation relative overflow-hidden group"
              size="icon"
            >
              <div className="absolute inset-0 bg-white/0 group-active:bg-white/20 transition-colors duration-100 rounded-full" />
              <X size={24} className="md:hidden relative z-10" weight="bold" />
              <X size={28} className="hidden md:block relative z-10" weight="bold" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Button
              onClick={onToggleEdit}
              className="bg-primary hover:bg-accent active:bg-accent/90 active:scale-90 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-xl shadow-primary/40 hover:shadow-primary/60 active:shadow-primary/80 transition-all touch-manipulation relative overflow-hidden group"
              size="icon"
            >
              <div className="absolute inset-0 bg-white/0 group-active:bg-white/20 transition-colors duration-100 rounded-full" />
              <PencilSimple size={24} className="md:hidden relative z-10" weight="bold" />
              <PencilSimple size={28} className="hidden md:block relative z-10" weight="bold" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
