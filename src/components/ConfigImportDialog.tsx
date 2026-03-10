import { useState, startTransition } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Warning, CheckCircle, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import CyberCloseButton from '@/components/CyberCloseButton'
import { useLocale } from '@/hooks/use-locale'
import type { SiteConfig } from '@/lib/types'
import type { ExportScope, ImportValidationResult } from '@/lib/config-export'
import { exportSiteConfig, mergeImportedConfig } from '@/lib/config-export'

interface ConfigImportDialogProps {
  open: boolean
  onClose: () => void
  importData: Partial<SiteConfig> | null
  validationResult: ImportValidationResult | null
  currentConfig: SiteConfig
  onConfirm: (mergedConfig: SiteConfig) => void
}

const SCOPE_LABEL_KEYS: Record<ExportScope, string> = {
  full: 'configImport.scopeFull',
  theme: 'configImport.scopeTheme',
  content: 'configImport.scopeContent',
  settings: 'configImport.scopeSettings',
}

const SCOPE_OVERWRITES: Record<ExportScope, string[]> = {
  full: ['Alle Felder der SiteConfig (außer siteId)'],
  theme: ['themeSettings', 'fontConfig', 'sectionVisibility', 'animations'],
  content: ['siteName', 'tagline', 'description', 'genres', 'biography', 'gigs', 'releases', 'news', 'galleryImages', 'mediaFiles', 'socialLinks', 'impressum', 'datenschutz', 'label'],
  settings: ['siteType', 'domain', 'navigation', 'footer', 'seo', 'features', 'sections', 'sectionLabels', 'newsletterSettings', 'contactSettings', 'soundSettings', 'widgetPlugins'],
}

export default function ConfigImportDialog({ open, onClose, importData, validationResult, currentConfig, onConfirm }: ConfigImportDialogProps) {
  const { t } = useLocale()
  const [selectedScope, setSelectedScope] = useState<ExportScope>('full')
  const [backupBeforeImport, setBackupBeforeImport] = useState(true)

  if (!validationResult || !importData) return null

  // For new format: use the scope from the file; for legacy: let user choose
  const effectiveScope: ExportScope = validationResult.isNewFormat
    ? validationResult.scope
    : selectedScope

  const hasErrors = validationResult.errors.length > 0

  const handleConfirm = () => {
    if (hasErrors) return

    if (backupBeforeImport) {
      // Download current config as backup first
      const backupExport = exportSiteConfig(currentConfig, 'full')
      const backupBlob = new Blob([JSON.stringify(backupExport, null, 2)], { type: 'application/json' })
      const backupUrl = URL.createObjectURL(backupBlob)
      const a = document.createElement('a')
      a.href = backupUrl
      a.download = `backup-site-config-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(backupUrl)
    }

    const merged = mergeImportedConfig(currentConfig, importData, effectiveScope)
    startTransition(() => {
      onConfirm(merged)
    })
    toast.success(t('configImport.successToast'))
    onClose()
  }

  return (
    <CyberModalBackdrop open={open}>
      <motion.div
        className="w-full max-w-lg bg-card border border-primary/30 font-mono relative"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Corner ornaments */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-primary text-lg tracking-widest uppercase">
              ▸ {t('configImport.title')}
            </h2>
            <CyberCloseButton onClick={onClose} />
          </div>

          {/* Step 1: Scope (only shown for legacy format) */}
          {validationResult.isLegacyFormat && (
            <div className="border border-primary/20 bg-background/40 p-4 flex flex-col gap-3">
              <p className="text-primary text-xs tracking-wider uppercase">{t('configImport.step1')}</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SCOPE_LABEL_KEYS) as ExportScope[]).map((scope) => (
                  <button
                    key={scope}
                    onClick={() => setSelectedScope(scope)}
                    className={`text-left p-2 border text-xs transition-colors ${
                      selectedScope === scope
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-primary/20 text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {t(SCOPE_LABEL_KEYS[scope])}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          <div className="border border-primary/20 bg-background/40 p-4 flex flex-col gap-3">
            <p className="text-primary text-xs tracking-wider uppercase">
              {validationResult.isLegacyFormat ? t('configImport.step2Prefix') : ''}{t('configImport.preview')}
            </p>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28 shrink-0">{t('configImport.siteName')}</span>
                <span className="text-foreground">{validationResult.siteName || '—'}</span>
              </div>
              {validationResult.exportedAt && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-28 shrink-0">{t('configImport.exportedAt')}</span>
                  <span className="text-foreground">{new Date(validationResult.exportedAt).toLocaleString()}</span>
                </div>
              )}
              {validationResult.templateVersion && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-28 shrink-0">{t('configImport.templateVersion')}</span>
                  <span className="text-foreground">{validationResult.templateVersion}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28 shrink-0">{t('configImport.scope')}</span>
                <span className="text-primary">{t(SCOPE_LABEL_KEYS[effectiveScope])}</span>
              </div>
            </div>

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {validationResult.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-status-warning text-xs">
                    <Warning size={14} className="shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {validationResult.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-destructive text-xs">
                    <X size={14} className="shrink-0 mt-0.5" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            )}

            {/* What will be overwritten */}
            {!hasErrors && (
              <div className="mt-1">
                <p className="text-muted-foreground text-xs mb-1.5 flex items-center gap-1">
                  <Info size={12} />
                  {t('configImport.fieldsOverwritten')}
                </p>
                <ul className="text-xs text-foreground/70 space-y-0.5 pl-3">
                  {SCOPE_OVERWRITES[effectiveScope].map((field) => (
                    <li key={field} className="list-disc list-inside">
                      <span className="text-primary/80">{field}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Step 3: Backup option */}
          {!hasErrors && (
            <div className="border border-primary/20 bg-background/40 p-4 flex flex-col gap-2">
              <p className="text-primary text-xs tracking-wider uppercase">
                {validationResult.isLegacyFormat ? t('configImport.step3Prefix') : ''}{t('configImport.backup')}
              </p>
              <label className="flex items-center gap-3 cursor-pointer select-none text-xs">
                <div
                  role="checkbox"
                  aria-checked={backupBeforeImport}
                  tabIndex={0}
                  className={`w-4 h-4 border flex items-center justify-center transition-colors cursor-pointer ${
                    backupBeforeImport ? 'border-primary bg-primary/20' : 'border-primary/30'
                  }`}
                  onClick={() => setBackupBeforeImport(!backupBeforeImport)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setBackupBeforeImport(!backupBeforeImport) } }}
                >
                  {backupBeforeImport && <CheckCircle size={10} weight="bold" className="text-primary" />}
                </div>
                <span className="text-foreground/80">
                  {t('configImport.backupLabel')} <span className="text-primary">{t('configImport.recommended')}</span>
                </span>
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 text-xs font-mono"
              onClick={onClose}
            >
              <X size={14} className="mr-1" />
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/80 text-xs font-mono disabled:opacity-40"
              onClick={handleConfirm}
              disabled={hasErrors}
            >
              {t('common.import')}
            </Button>
          </div>
        </div>
      </motion.div>
    </CyberModalBackdrop>
  )
}
