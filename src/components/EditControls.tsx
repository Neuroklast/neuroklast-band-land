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
      className="fixed bottom-8 right-8 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <AnimatePresence mode="wait">
        {editMode ? (
          <Button
            key="exit"
            onClick={onToggleEdit}
            className="bg-destructive hover:bg-destructive/90 w-14 h-14 rounded-full shadow-lg"
            size="icon"
          >
            <X size={24} weight="bold" />
          </Button>
        ) : (
          <Button
            key="edit"
            onClick={onToggleEdit}
            className="bg-primary hover:bg-accent w-14 h-14 rounded-full shadow-lg"
            size="icon"
          >
            <PencilSimple size={24} weight="bold" />
          </Button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
