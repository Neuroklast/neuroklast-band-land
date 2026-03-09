/**
 * AdminButton — compact admin dashboard entry point for logged-in owners.
 *
 * Replaces the old floating EditControls pencil button. There is no
 * "edit mode" toggle here — the admin simply clicks the gear icon to open
 * the AdminHubDialog (the dashboard).
 *
 * Import / export / sync functionality is preserved from the old EditControls.
 */
import { PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect, useCallback, lazy, Suspense } from 'react'
import AdminLoginDialog from '@/components/AdminLoginDialog'
import CyberCloseButton from '@/components/CyberCloseButton'

const AdminHubDialog = lazy(() => import('@/features/admin/components/AdminHubDialog'))
import ConfigExportDialog from '@/components/ConfigExportDialog'
import ConfigImportDialog from '@/components/ConfigImportDialog'
import type { AdminDialog, SiteConfig } from '@/lib/types'
import type { ImportValidationResult } from '@/lib/config-export'
import { validateImport } from '@/lib/config-export'
import { useLocale } from '@/contexts/LocaleContext'
import { toast } from 'sonner'
import {
  INITIAL_SYNC_DELAY_MS,
  SYNC_INTERVAL_MS,
} from '@/lib/config'

interface AdminButtonProps {
  hasPassword: boolean
  onChangePassword: (password: string) => Promise<void>
  onSetPassword: (password: string) => Promise<void>
  onLogout?: () => Promise<void>
  onResetSetup?: () => void
  siteConfig?: SiteConfig
  onUpdateSiteConfig?: (key: keyof SiteConfig, value: unknown) => void
  onImportData?: (data: SiteConfig) => void
  onOpenDialog: (dialog: AdminDialog) => void
  isPrimary?: boolean
  /** When true the AdminHubDialog opens immediately on mount (used after auto-login). */
  openHubOnMount?: boolean
}

/** Convert a Google Drive file share link to a direct-download URL for JSON */
function toDriveJsonUrl(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`
  const m2 = url.match(/drive\.google\.com\/open\?id=([^&#]+)/)
  if (m2) return `https://drive.google.com/uc?export=download&id=${m2[1]}`
  return url
}

export default function AdminButton({
  hasPassword,
  onChangePassword,
  onSetPassword,
  onLogout,
  onResetSetup,
  siteConfig,
  onUpdateSiteConfig,
  onImportData,
  onOpenDialog,
  isPrimary = false,
  openHubOnMount = false,
}: AdminButtonProps) {
  const { t } = useLocale()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showUrlImport, setShowUrlImport] = useState(false)
  const [showAdminHub, setShowAdminHub] = useState(openHubOnMount)
  const openedOnMountRef = useRef(false)
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [pendingImportData, setPendingImportData] = useState<Partial<SiteConfig> | null>(null)
  const [pendingValidation, setPendingValidation] = useState<ImportValidationResult | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  // If openHubOnMount transitions to true after mount (e.g. after login), open the hub once
  useEffect(() => {
    if (openHubOnMount && !openedOnMountRef.current) {
      openedOnMountRef.current = true
      setShowAdminHub(true)
    }
  }, [openHubOnMount])

  const handleExportData = () => {
    if (!siteConfig) return
    setShowExportDialog(true)
  }

  const openImportDialog = (raw: unknown, preserveSyncUrl?: string) => {
    const result = validateImport(raw)
    if (!result.valid) {
      toast.error(result.errors[0] || 'Invalid config file')
      return
    }
    const data = preserveSyncUrl && result.data
      ? { ...result.data, syncUrl: preserveSyncUrl }
      : result.data
    setPendingImportData(data)
    setPendingValidation(result)
    setShowImportDialog(true)
  }

  const handleImportDataFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImportData) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        openImportDialog(parsed)
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
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(directUrl)}`
      const res = await fetch(proxyUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const parsed = JSON.parse(text)
      if (silent) {
        const result = validateImport(parsed)
        if (result.valid && result.data) {
          onImportData({ ...result.data, syncUrl: url } as SiteConfig)
        }
      } else {
        openImportDialog(parsed, url)
      }
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

  // Periodic sync: if siteConfig.syncUrl is set, refresh every 5 minutes
  useEffect(() => {
    const syncUrl = siteConfig?.syncUrl
    if (!syncUrl) return
    const checkSync = () => { importDataFromUrl(syncUrl, true) }
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
              <p className="text-sm text-muted-foreground">{t('edit.importDesc')}</p>
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

      {/* Admin dialogs */}
      <Suspense fallback={null}>
        {showExportDialog && siteConfig && (
          <ConfigExportDialog
            open={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            config={siteConfig}
          />
        )}
        {showImportDialog && pendingImportData && pendingValidation && siteConfig && (
          <ConfigImportDialog
            open={showImportDialog}
            onClose={() => { setShowImportDialog(false); setPendingImportData(null); setPendingValidation(null) }}
            importData={pendingImportData}
            validationResult={pendingValidation}
            currentConfig={siteConfig}
            onConfirm={(merged) => {
              onImportData?.(merged)
              setShowImportDialog(false)
              setPendingImportData(null)
              setPendingValidation(null)
            }}
          />
        )}
        <AdminHubDialog
          open={showAdminHub}
          onClose={() => setShowAdminHub(false)}
          onOpenDialog={onOpenDialog}
          onExportData={handleExportData}
          onImportFile={() => importInputRef.current?.click()}
          onImportUrl={() => setShowUrlImport(true)}
          onChangePassword={() => setShowPasswordDialog(true)}
          onLogout={onLogout}
          onResetSetup={onResetSetup}
          isPrimary={isPrimary}
          siteConfig={siteConfig}
          onUpdateSiteConfig={onUpdateSiteConfig}
        />
      </Suspense>

      {/* Password dialog */}
      {showPasswordDialog && (
        <AdminLoginDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          mode='setup'
          onSetPassword={async (pw) => { await onSetPassword(pw); setShowPasswordDialog(false) }}
        />
      )}

      {/* Admin FAB — unobtrusive gear icon, only visible to logged-in admins */}
      <motion.div
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setShowAdminHub(true)}
          className="bg-primary hover:bg-accent active:bg-accent/90 active:scale-90 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-xl shadow-primary/40 hover:shadow-primary/60 transition-all touch-manipulation relative overflow-hidden group"
          size="icon"
          title="Admin Dashboard"
        >
          <div className="absolute inset-0 bg-foreground/0 group-active:bg-foreground/20 transition-colors duration-100 rounded-full" />
          <PencilSimple size={24} className="md:hidden relative z-10" weight="bold" />
          <PencilSimple size={28} className="hidden md:block relative z-10" weight="bold" />
        </Button>
      </motion.div>
    </>
  )
}
