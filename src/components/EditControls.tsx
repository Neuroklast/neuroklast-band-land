import { PencilSimple, X, Key, Export, ArrowSquareIn, Globe, SpeakerHigh, Sliders, ChartBar, SignOut, ShieldWarning, ShieldCheck, ProhibitInset, Palette, Terminal, Envelope, Users, Megaphone, UsersFour, ArrowCounterClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import AdminLoginDialog from '@/components/AdminLoginDialog'
import CyberCloseButton from '@/components/CyberCloseButton'
import type { AdminDialog, SiteConfig } from '@/lib/types'
import { useLocale } from '@/contexts/LocaleContext'
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
  onResetSetup?: () => void
  siteConfig?: SiteConfig
  onImportData?: (data: SiteConfig) => void
  onOpenDialog: (dialog: AdminDialog) => void
}

/** Convert a Google Drive file share link to a direct-download URL for JSON */
function toDriveJsonUrl(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`
  const m2 = url.match(/drive\.google\.com\/open\?id=([^&#]+)/)
  if (m2) return `https://drive.google.com/uc?export=download&id=${m2[1]}`
  return url
}

export default function EditControls({ editMode, onToggleEdit, hasPassword, onChangePassword, onSetPassword, onLogout, onResetSetup, siteConfig, onImportData, onOpenDialog }: EditControlsProps) {
  const { t } = useLocale()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showUrlImport, setShowUrlImport] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  const handleExportData = () => {
    if (!siteConfig) return
    const json = JSON.stringify(siteConfig, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `site-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully')
  }

  const handleImportDataFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImportData) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (!parsed.siteName && !parsed.name) {
          toast.error('Invalid site config file')
          return
        }
        // Support legacy band-data format: map name → siteName
        const normalized = { ...parsed, siteName: parsed.siteName || parsed.name }
        onImportData(normalized as SiteConfig)
        toast.success('Data imported successfully')
      } catch {
        toast.error('Failed to parse JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const importDataFromUrl = useCallback(async (url: string, silent = false) => {
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
      if (!parsed.siteName && !parsed.name) {
        if (!silent) toast.error('Invalid site config file at URL')
        return
      }
      // Support legacy band-data format: map name → siteName
      const normalized = { ...parsed, siteName: parsed.siteName || parsed.name, syncUrl: url }
      onImportData(normalized as SiteConfig)
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
    importDataFromUrl(url)
    setShowUrlImport(false)
    setImportUrl('')
  }

  // Periodic sync: if siteConfig.syncUrl is set, check for updates every 5 minutes
  useEffect(() => {
    const syncUrl = siteConfig?.syncUrl
    if (!syncUrl) return

    const checkSync = () => {
      importDataFromUrl(syncUrl, true)
    }

    const initialTimeout = setTimeout(checkSync, INITIAL_SYNC_DELAY_MS)
    const interval = setInterval(checkSync, SYNC_INTERVAL_MS)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [siteConfig?.syncUrl, importDataFromUrl])

  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportDataFromFile}
      />

      {/* URL import overlay */}
      <AnimatePresence>
        {showUrlImport && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card border border-border rounded-[var(--radius-lg)] p-6 w-full max-w-md space-y-4 relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CyberCloseButton onClick={() => setShowUrlImport(false)} label="CLOSE" className="absolute top-3 right-3" />
              <h3 className="text-lg font-bold">{t('edit.importUrl')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('edit.importDesc')}
              </p>
              <Input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder={t('edit.urlPlaceholder')}
                className="text-sm"
              />
              {siteConfig?.syncUrl && (
                <p className="text-xs text-muted-foreground">
                  {t('edit.currentSync')} <span className="text-primary/60 break-all">{siteConfig.syncUrl}</span>
                </p>
              )}
              <div className="flex gap-2">
                <Button onClick={handleImportUrl} disabled={!importUrl.trim() || isImporting} className="flex-1">
                  {isImporting ? t('edit.importing') : t('edit.importSync')}
                </Button>
                {siteConfig?.syncUrl && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (onImportData && siteConfig) {
                        const { syncUrl: _, ...rest } = siteConfig
                        onImportData(rest as SiteConfig)
                        toast.success('Auto-sync disabled')
                      }
                      setShowUrlImport(false)
                    }}
                    title="Stop auto-syncing"
                  >
                    {t('edit.stopSync')}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowUrlImport(false)}>{t('edit.cancel')}</Button>
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
              className="flex flex-wrap gap-2 justify-end max-w-md"
            >
              <Button
                onClick={handleExportData}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Export data as JSON"
              >
                <Export size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.export')}</span>
              </Button>
              <Button
                onClick={() => importInputRef.current?.click()}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Import data from JSON file"
              >
                <ArrowSquareIn size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.import')}</span>
              </Button>
              <Button
                onClick={() => setShowUrlImport(true)}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Import data from URL (Google Drive)"
              >
                <Globe size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.syncUrl')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('sound')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Sound effects settings"
              >
                <SpeakerHigh size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.sound')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('config')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Config variables editor"
              >
                <Sliders size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.config')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('analytics')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Site analytics"
              >
                <ChartBar size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.analytics')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('security-log')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Security incidents"
              >
                <ShieldWarning size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.secLog')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('security-settings')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Security settings"
              >
                <ShieldCheck size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.security')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('blocklist')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Blocklist manager"
              >
                <ProhibitInset size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.blocklist')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('attacker-profiles')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Attacker profiles overview"
              >
                <UsersFour size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.attackerProfiles')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('design')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Theme customizer (colors, fonts, visibility)"
              >
                <Palette size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.theme')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('terminal')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Terminal settings (commands, key sequence, morse code)"
              >
                <Terminal size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.terminal')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('secret-terminal')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Open secret terminal"
              >
                <Terminal size={20} weight="fill" />
                <span className="text-[9px] font-mono leading-none">{t('edit.openTerminal')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('inbox')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Contact inbox"
              >
                <Envelope size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.inbox')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('subscribers')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Newsletter subscribers"
              >
                <Users size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.subscribers')}</span>
              </Button>
              <Button
                onClick={() => onOpenDialog('marketing')}
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title="Marketing tools"
              >
                <Megaphone size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.marketing')}</span>
              </Button>
              {onResetSetup && (
                <Button
                  onClick={onResetSetup}
                  className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                  title="Re-run setup wizard"
                >
                  <ArrowCounterClockwise size={20} weight="bold" />
                  <span className="text-[9px] font-mono leading-none">{t('edit.resetSetup')}</span>
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
                className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                title={hasPassword ? 'Change admin password' : 'Set admin password'}
              >
                <Key size={20} weight="bold" />
                <span className="text-[9px] font-mono leading-none">{t('edit.password')}</span>
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
                  className="bg-secondary hover:bg-secondary/80 active:scale-90 rounded-[var(--radius-lg)] shadow-lg transition-all touch-manipulation flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
                  title="Logout"
                >
                  <SignOut size={20} weight="bold" />
                  <span className="text-[9px] font-mono leading-none">{t('edit.logout')}</span>
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
