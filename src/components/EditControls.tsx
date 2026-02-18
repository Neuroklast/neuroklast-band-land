import { PencilSimple, X, Key, Export, ArrowSquareIn, Globe, SpeakerHigh, Sliders, ChartBar, SignOut } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import AdminLoginDialog from '@/components/AdminLoginDialog'
import CyberCloseButton from '@/components/CyberCloseButton'
import type { BandData } from '@/lib/types'
import { toast } from 'sonner'
import {
  INITIAL_SYNC_DELAY_MS,
  SYNC_INTERVAL_MS,
} from '@/lib/config'

interface EditControlsProps {
  editMode: boolean
  onToggleEdit: () => void
  hasPassword: boolean
  onChangePassword: (password: string) => Promise<void>
  onSetPassword: (password: string) => Promise<void>
  onLogout?: () => Promise<void>
  bandData?: BandData
  onImportData?: (data: BandData) => void
  onOpenSoundSettings?: () => void
  onOpenConfigEditor?: () => void
  onOpenStats?: () => void
}

/** Convert a Google Drive file share link to a direct-download URL for JSON */
function toDriveJsonUrl(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`
  const m2 = url.match(/drive\.google\.com\/open\?id=([^&#]+)/)
  if (m2) return `https://drive.google.com/uc?export=download&id=${m2[1]}`
  return url
}

export default function EditControls({ editMode, onToggleEdit, hasPassword, onChangePassword, onSetPassword, onLogout, bandData, onImportData, onOpenSoundSettings, onOpenConfigEditor, onOpenStats }: EditControlsProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showUrlImport, setShowUrlImport] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
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

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    e.target.value = ''
  }

  const importFromUrl = useCallback(async (url: string, silent = false) => {
    if (!url || !onImportData) return
    setIsImporting(true)
    try {
      const directUrl = toDriveJsonUrl(url)
      // Use the image proxy for CORS — it works for any file
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(directUrl)}`
      const res = await fetch(proxyUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const parsed = JSON.parse(text)
      if (!parsed.name || !parsed.socialLinks) {
        if (!silent) toast.error('Invalid band data file at URL')
        return
      }
      // Preserve the syncUrl so periodic checking continues
      parsed.syncUrl = url
      onImportData(parsed as BandData)
      if (!silent) toast.success('Data imported from URL')
    } catch (err) {
      console.error('URL import error:', err)
      if (!silent) toast.error('Failed to import data from URL')
    } finally {
      setIsImporting(false)
    }
  }, [onImportData])

  const handleImportUrl = () => {
    const url = importUrl.trim()
    if (!url) return
    importFromUrl(url)
    setShowUrlImport(false)
    setImportUrl('')
  }

  // Periodic sync: if bandData.syncUrl is set, check for updates every 5 minutes
  useEffect(() => {
    const syncUrl = bandData?.syncUrl
    if (!syncUrl) return

    const checkSync = () => {
      importFromUrl(syncUrl, true)
    }

    const initialTimeout = setTimeout(checkSync, INITIAL_SYNC_DELAY_MS)
    const interval = setInterval(checkSync, SYNC_INTERVAL_MS)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [bandData?.syncUrl, importFromUrl])

  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* URL import overlay */}
      <AnimatePresence>
        {showUrlImport && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card border border-border rounded-lg p-6 w-full max-w-md space-y-4 relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CyberCloseButton onClick={() => setShowUrlImport(false)} label="CLOSE" className="absolute top-3 right-3" />
              <h3 className="text-lg font-bold">Import from URL</h3>
              <p className="text-sm text-muted-foreground">
                Enter a URL to a JSON file (e.g. Google Drive share link).
                The data will be auto-synced periodically if the URL is kept.
              </p>
              <Input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view"
                className="text-sm"
              />
              {bandData?.syncUrl && (
                <p className="text-xs text-muted-foreground">
                  Current sync URL: <span className="text-primary/60 break-all">{bandData.syncUrl}</span>
                </p>
              )}
              <div className="flex gap-2">
                <Button onClick={handleImportUrl} disabled={!importUrl.trim() || isImporting} className="flex-1">
                  {isImporting ? 'Importing...' : 'Import & Sync'}
                </Button>
                {bandData?.syncUrl && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (onImportData && bandData) {
                        const { syncUrl: _, ...rest } = bandData
                        onImportData(rest as BandData)
                        toast.success('Auto-sync disabled')
                      }
                      setShowUrlImport(false)
                    }}
                    title="Stop auto-syncing"
                  >
                    Stop Sync
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowUrlImport(false)}>Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                title="Import data from JSON file"
              >
                <ArrowSquareIn size={18} className="md:hidden" weight="bold" />
                <ArrowSquareIn size={20} className="hidden md:block" weight="bold" />
              </Button>
              <Button
                onClick={() => setShowUrlImport(true)}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg transition-all touch-manipulation"
                size="icon"
                title="Import data from URL (Google Drive)"
              >
                <Globe size={18} className="md:hidden" weight="bold" />
                <Globe size={20} className="hidden md:block" weight="bold" />
              </Button>
              {onOpenSoundSettings && (
                <Button
                  onClick={onOpenSoundSettings}
                  className="bg-secondary hover:bg-secondary/80 active:scale-90 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg transition-all touch-manipulation"
                  size="icon"
                  title="Sound effects settings"
                >
                  <SpeakerHigh size={18} className="md:hidden" weight="bold" />
                  <SpeakerHigh size={20} className="hidden md:block" weight="bold" />
                </Button>
              )}
              {onOpenConfigEditor && (
                <Button
                  onClick={onOpenConfigEditor}
                  className="bg-secondary hover:bg-secondary/80 active:scale-90 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg transition-all touch-manipulation"
                  size="icon"
                  title="Config variables editor"
                >
                  <Sliders size={18} className="md:hidden" weight="bold" />
                  <Sliders size={20} className="hidden md:block" weight="bold" />
                </Button>
              )}
              {onOpenStats && (
                <Button
                  onClick={onOpenStats}
                  className="bg-secondary hover:bg-secondary/80 active:scale-90 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg transition-all touch-manipulation"
                  size="icon"
                  title="Site analytics"
                >
                  <ChartBar size={18} className="md:hidden" weight="bold" />
                  <ChartBar size={20} className="hidden md:block" weight="bold" />
                </Button>
              )}
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

            {onLogout && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Button
                  onClick={onLogout}
                  className="bg-secondary hover:bg-secondary/80 active:scale-90 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg transition-all touch-manipulation"
                  size="icon"
                  title="Logout"
                >
                  <SignOut size={18} className="md:hidden" weight="bold" />
                  <SignOut size={20} className="hidden md:block" weight="bold" />
                </Button>
              </motion.div>
            )}
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
