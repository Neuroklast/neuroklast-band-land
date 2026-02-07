import { PencilSimple, X, Key, Export, ArrowSquareIn } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import AdminLoginDialog from '@/components/AdminLoginDialog'
import type { BandData } from '@/lib/types'
import { toast } from 'sonner'

interface EditControlsProps {
  editMode: boolean
  onToggleEdit: () => void
  hasPassword: boolean
  onChangePassword: (password: string) => Promise<void>
  onSetPassword: (password: string) => Promise<void>
  bandData?: BandData
  onImportData?: (data: BandData) => void
}

export default function EditControls({ editMode, onToggleEdit, hasPassword, onChangePassword, onSetPassword, bandData, onImportData }: EditControlsProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    if (!bandData) return
    const json = JSON.stringify(bandData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `band-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImportData) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (!parsed.name || !parsed.socialLinks) {
          toast.error('Invalid band data file')
          return
        }
        onImportData(parsed as BandData)
        toast.success('Data imported successfully')
      } catch {
        toast.error('Failed to parse JSON file')
      }
    }
    reader.readAsText(file)
    // Reset so the same file can be re-imported
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
      />

      <motion.div
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {editMode && (
          <>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex gap-2"
            >
              <Button
                onClick={handleExport}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg transition-all touch-manipulation"
                size="icon"
                title="Export data as JSON"
              >
                <Export size={18} className="md:hidden" weight="bold" />
                <Export size={20} className="hidden md:block" weight="bold" />
              </Button>
              <Button
                onClick={() => importInputRef.current?.click()}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg transition-all touch-manipulation"
                size="icon"
                title="Import data from JSON"
              >
                <ArrowSquareIn size={18} className="md:hidden" weight="bold" />
                <ArrowSquareIn size={20} className="hidden md:block" weight="bold" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Button
                onClick={() => setShowPasswordDialog(true)}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg transition-all touch-manipulation"
                size="icon"
                title={hasPassword ? 'Change admin password' : 'Set admin password'}
              >
                <Key size={18} className="md:hidden" weight="bold" />
                <Key size={20} className="hidden md:block" weight="bold" />
              </Button>
            </motion.div>
          </>
        )}

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

      {showPasswordDialog && (
        <AdminLoginDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          mode="setup"
          onSetPassword={hasPassword ? onChangePassword : onSetPassword}
        />
      )}
    </>
  )
}
