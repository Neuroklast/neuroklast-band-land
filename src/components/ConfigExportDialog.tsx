import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, DownloadSimple, Link, Folders, Palette, Article, GearSix } from '@phosphor-icons/react'
import { toast } from 'sonner'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import CyberCloseButton from '@/components/CyberCloseButton'
import type { SiteConfig } from '@/lib/types'
import type { ExportScope } from '@/lib/config-export'
import { exportSiteConfig, downloadConfigExport, copyThemeShareUrl } from '@/lib/config-export'
import type { Icon } from '@phosphor-icons/react'
import { useLocale } from '@/hooks/use-locale'

interface ConfigExportDialogProps {
  open: boolean
  onClose: () => void
  config: SiteConfig
}

interface ExportOption {
  scope: ExportScope
  icon: Icon
  titleKey: string
  descKey: string
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    scope: 'full',
    icon: Folders,
    titleKey: 'export.scopeFull',
    descKey: 'export.scopeFullDesc',
  },
  {
    scope: 'theme',
    icon: Palette,
    titleKey: 'export.scopeTheme',
    descKey: 'export.scopeThemeDesc',
  },
  {
    scope: 'content',
    icon: Article,
    titleKey: 'export.scopeContent',
    descKey: 'export.scopeContentDesc',
  },
  {
    scope: 'settings',
    icon: GearSix,
    titleKey: 'export.scopeSettings',
    descKey: 'export.scopeSettingsDesc',
  },
]

export default function ConfigExportDialog({ open, onClose, config }: ConfigExportDialogProps) {
  const [shareLinkCopied, setShareLinkCopied] = useState(false)
  const { t } = useLocale()

  const handleExport = (scope: ExportScope) => {
    const exportObj = exportSiteConfig(config, scope)
    downloadConfigExport(exportObj)
    toast.success(t('export.started').replace('{{scope}}', scope === 'full' ? t('export.scopeFull') : scope))
  }

  const handleShareTheme = async () => {
    try {
      await copyThemeShareUrl(config)
      setShareLinkCopied(true)
      setTimeout(() => setShareLinkCopied(false), 3000)
    } catch {
      toast.error(t('export.copyFailed'))
    }
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
              ▸ {t('export.title')}
            </h2>
            <CyberCloseButton onClick={onClose} />
          </div>

          <p className="text-muted-foreground text-xs tracking-wider">
            {t('export.description').replace('{{syncUrl}}', 'syncUrl').replace('{{secretCode}}', 'secretCode')}
          </p>

          {/* Export option cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EXPORT_OPTIONS.map((opt) => (
              <div
                key={opt.scope}
                className="border border-primary/20 bg-background/40 p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <opt.icon size={16} className="text-primary/70" />
                  <span className="text-primary font-bold text-sm tracking-wider uppercase">{t(opt.titleKey)}</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed flex-1">{t(opt.descKey)}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 text-xs font-mono w-full"
                  onClick={() => handleExport(opt.scope)}
                >
                  <DownloadSimple size={14} weight="bold" className="mr-1" />
                  {t('export.download')}
                </Button>
              </div>
            ))}
          </div>

          {/* Share theme URL */}
          <div className="border border-primary/20 bg-background/40 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Link size={16} weight="bold" className="text-primary" />
              <span className="text-primary text-sm tracking-wider uppercase">{t('export.shareTheme')}</span>
            </div>
            <p className="text-muted-foreground text-xs">
              {t('export.shareThemeDesc')}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 text-xs font-mono mt-1"
              onClick={handleShareTheme}
            >
              {shareLinkCopied ? t('export.linkCopied') : t('export.copyLink')}
            </Button>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 text-xs font-mono"
              onClick={onClose}
            >
              <X size={14} className="mr-1" />
              {t('export.close')}
            </Button>
          </div>
        </div>
      </motion.div>
    </CyberModalBackdrop>
  )
}
