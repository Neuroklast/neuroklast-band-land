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

interface ConfigExportDialogProps {
  open: boolean
  onClose: () => void
  config: SiteConfig
}

interface ExportOption {
  scope: ExportScope
  icon: Icon
  title: string
  description: string
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    scope: 'full',
    icon: Folders,
    title: 'Alles',
    description: 'Vollständige SiteConfig (ohne syncUrl & secretCode)',
  },
  {
    scope: 'theme',
    icon: Palette,
    title: 'Nur Theme',
    description: 'Farben, Fonts, Presets, Effekte, Animationen',
  },
  {
    scope: 'content',
    icon: Article,
    title: 'Nur Content',
    description: 'Gigs, Releases, Bio, News, Fotos, Social Links, Impressum',
  },
  {
    scope: 'settings',
    icon: GearSix,
    title: 'Nur Einstellungen',
    description: 'Navigation, Footer, SEO, Features, Sections, Widgets',
  },
]

export default function ConfigExportDialog({ open, onClose, config }: ConfigExportDialogProps) {
  const [shareLinkCopied, setShareLinkCopied] = useState(false)

  const handleExport = (scope: ExportScope) => {
    const exportObj = exportSiteConfig(config, scope)
    downloadConfigExport(exportObj)
    toast.success(`Export gestartet (${scope === 'full' ? 'Alles' : scope})`)
  }

  const handleShareTheme = async () => {
    try {
      await copyThemeShareUrl(config)
      setShareLinkCopied(true)
      setTimeout(() => setShareLinkCopied(false), 3000)
    } catch {
      toast.error('Link konnte nicht kopiert werden')
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
              ▸ Config Export
            </h2>
            <CyberCloseButton onClick={onClose} />
          </div>

          <p className="text-muted-foreground text-xs tracking-wider">
            Wähle was exportiert werden soll. <span className="text-yellow-400">syncUrl</span> und <span className="text-yellow-400">secretCode</span> werden niemals exportiert.
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
                  <span className="text-primary font-bold text-sm tracking-wider uppercase">{opt.title}</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed flex-1">{opt.description}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 text-xs font-mono w-full"
                  onClick={() => handleExport(opt.scope)}
                >
                  <DownloadSimple size={14} weight="bold" className="mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>

          {/* Share theme URL */}
          <div className="border border-primary/20 bg-background/40 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Link size={16} weight="bold" className="text-primary" />
              <span className="text-primary text-sm tracking-wider uppercase">Theme als Link teilen</span>
            </div>
            <p className="text-muted-foreground text-xs">
              Kopiert einen Link mit dem aktuellen Theme in die Zwischenablage. Andere können ihn öffnen und das Theme direkt übernehmen.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 text-xs font-mono mt-1"
              onClick={handleShareTheme}
            >
              {shareLinkCopied ? '✓ Link kopiert!' : 'Link kopieren'}
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
              Schließen
            </Button>
          </div>
        </div>
      </motion.div>
    </CyberModalBackdrop>
  )
}
