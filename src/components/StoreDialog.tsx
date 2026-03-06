import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Storefront,
  MagnifyingGlass,
  Star,
  StarHalf,
  Check,
  DownloadSimple,
  Trash,
  ToggleLeft,
  ToggleRight,
  Palette,
  PuzzlePiece,
  Sliders,
  X,
  Lock,
  GearSix,
  ArrowsClockwise,
  Warning,
  Export,
  Upload,
  Copy,
} from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import { useLocale } from '@/contexts/LocaleContext'
import { toast } from 'sonner'
import type { WidgetPlugin, ThemeSettings, StoreTab, StoreItemLicense } from '@/lib/types'
import type { LicenseTier } from '@/lib/license'
import { hasFeature } from '@/lib/license'
import ThemePreviewCard from '@/components/ThemePreviewCard'
import WidgetConfigDialog from '@/components/WidgetConfigDialog'
import WidgetImportDialog from '@/components/WidgetImportDialog'
import {
  exportWidgets,
  downloadWidgetExport,
  copyWidgetsToClipboard,
} from '@/lib/config-export'
import {
  buildStoreItems,
  filterStoreItems,
  installWidget,
  uninstallWidget,
  toggleWidget,
  updateWidgetConfig,
  updateWidget,
  mixThemeSettings,
  type StoreItem,
  type MixPart,
} from '@/lib/widget-plugins'
import { DESIGN_PRESETS, PRESET_IDS, presetToThemeSettings } from '@/lib/design-presets'
import { applyThemeToDOM } from '@/lib/theme-application'

// ─── Star rating display ─────────────────────────────────────────────────────

function StarRating({ average, count }: { average: number; count: number }) {
  const { t } = useLocale()
  const full = Math.floor(average)
  const half = average - full >= 0.25
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <Star key={i} size={12} weight="fill" className="text-yellow-500" />
        if (i === full && half) return <StarHalf key={i} size={12} weight="fill" className="text-yellow-500" />
        return <Star key={i} size={12} className="text-muted-foreground/40" />
      })}
      <span className="ml-0.5">{average.toFixed(1)}</span>
      <span className="text-muted-foreground/50">({t('store.ratings').replace('{0}', String(count))})</span>
    </span>
  )
}

// ─── Store item card ─────────────────────────────────────────────────────────

interface StoreItemCardProps {
  item: StoreItem
  licenseTier?: LicenseTier
  onInstall: () => void
  onUninstall: () => void
  onToggle: () => void
  onApplyTheme: () => void
  onConfigure?: () => void
  onUpdate?: () => void
}

function StoreItemCard({ item, licenseTier, onInstall, onUninstall, onToggle, onApplyTheme, onConfigure, onUpdate }: StoreItemCardProps) {
  const { t } = useLocale()
  const isWidget = item.type === 'widget'
  const isTheme = item.type === 'theme'

  const tier = licenseTier ?? 'free'
  const isPremiumLocked = item.license === 'premium' && !hasFeature(tier, 'premium-themes')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`border rounded bg-card/50 p-3 flex flex-col gap-2 transition-colors ${
        item.hasUpdate
          ? 'border-blue-500/30 hover:border-blue-500/50'
          : 'border-primary/15 hover:border-primary/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isWidget ? (
            <PuzzlePiece size={18} className="text-primary flex-shrink-0" />
          ) : (
            <Palette size={18} className="text-primary flex-shrink-0" />
          )}
          <div className="min-w-0">
            <h4 className="font-mono text-sm font-semibold truncate">{item.name}</h4>
            <span className="text-[10px] text-muted-foreground font-mono">
              v{item.version} {item.author && `· ${item.author}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {item.hasUpdate && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              {item.updateIsBreaking && <Warning size={9} weight="fill" />}
              <ArrowsClockwise size={9} />
              {t('store.updateAvailable').replace('{0}', item.updateVersion ?? '')}
            </span>
          )}
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
              item.license === 'premium'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}
          >
            {item.license === 'premium' ? t('store.premium') : t('store.free')}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {item.description}
      </p>

      {/* Rating */}
      <StarRating average={item.rating.average} count={item.rating.count} />

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[9px] font-mono bg-primary/10 text-primary/70 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Theme preview for theme items */}
      {isTheme && (
        <ThemePreviewCard
          preset={Object.values(DESIGN_PRESETS).find((p) => p.id === item.id) ?? Object.values(DESIGN_PRESETS)[0]}
          active={item.enabled}
          className="mt-1"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-primary/10 flex-wrap">
        {isWidget && !item.installed && (
          <Button
            size="sm"
            variant="outline"
            onClick={isPremiumLocked ? undefined : onInstall}
            disabled={isPremiumLocked}
            title={isPremiumLocked ? 'Upgrade to Pro to install premium widgets' : undefined}
            className={`text-xs gap-1 h-7 ${isPremiumLocked ? 'opacity-50 cursor-not-allowed border-yellow-500/30 text-yellow-500/70' : 'border-primary/30'}`}
          >
            {isPremiumLocked ? (
              <><Lock size={12} /> PRO REQUIRED</>
            ) : (
              <><DownloadSimple size={14} /> {t('store.install')}</>
            )}
          </Button>
        )}
        {isWidget && item.installed && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggle}
              className={`text-xs gap-1 h-7 border-primary/30 ${item.enabled ? 'text-green-400' : 'text-muted-foreground'}`}
            >
              {item.enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              {item.enabled ? t('store.disable') : t('store.enable')}
            </Button>
            <Button size="sm" variant="outline" onClick={onUninstall} className="text-xs gap-1 h-7 border-destructive/40 text-destructive">
              <Trash size={14} /> {t('store.uninstall')}
            </Button>
            {onConfigure && (
              <Button size="sm" variant="outline" onClick={onConfigure} className="text-xs gap-1 h-7 border-primary/20 text-muted-foreground hover:text-foreground">
                <GearSix size={14} />
              </Button>
            )}
            {item.hasUpdate && onUpdate && (
              <Button
                size="sm"
                variant="outline"
                onClick={onUpdate}
                title={item.updateIsBreaking ? t('store.updateBreaking') : undefined}
                className="text-xs gap-1 h-7 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
              >
                {item.updateIsBreaking
                  ? <><Warning size={14} weight="fill" /> {t('store.update')}</>
                  : <><ArrowsClockwise size={14} /> {t('store.update')}</>
                }
              </Button>
            )}
          </>
        )}
        {isTheme && !item.enabled && (
          <Button
            size="sm"
            variant="outline"
            onClick={isPremiumLocked ? undefined : onApplyTheme}
            disabled={isPremiumLocked}
            title={isPremiumLocked ? 'Upgrade to Pro to use premium themes' : undefined}
            className={`text-xs gap-1 h-7 ${isPremiumLocked ? 'opacity-50 cursor-not-allowed border-yellow-500/30 text-yellow-500/70' : 'border-primary/30'}`}
          >
            {isPremiumLocked ? (
              <><Lock size={12} /> PRO REQUIRED</>
            ) : (
              <><Palette size={14} /> {t('store.apply')}</>
            )}
          </Button>
        )}
        {isTheme && item.enabled && (
          <span className="text-xs font-mono text-green-400 flex items-center gap-1">
            <Check size={14} /> {t('store.applied')}
          </span>
        )}
        {isWidget && item.installed && (
          <span className="ml-auto text-[10px] font-mono text-green-400/60 flex items-center gap-1">
            <Check size={12} /> {t('store.installed')}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Mix-and-Match panel ─────────────────────────────────────────────────────

interface MixPanelProps {
  onApplyMix: (theme: ThemeSettings) => void
}

function MixPanel({ onApplyMix }: MixPanelProps) {
  const { t } = useLocale()
  const [colorPreset, setColorPreset] = useState<string>('')
  const [fontPreset, setFontPreset] = useState<string>('')
  const [effectPreset, setEffectPreset] = useState<string>('')

  const handleApply = useCallback(() => {
    const parts: MixPart[] = []
    if (colorPreset) parts.push({ presetId: colorPreset, aspects: ['colors'] })
    if (fontPreset) parts.push({ presetId: fontPreset, aspects: ['fonts'] })
    if (effectPreset) parts.push({ presetId: effectPreset, aspects: ['effects'] })

    if (parts.length === 0) {
      toast.error(t('store.mixSelectOne'))
      return
    }

    const theme = mixThemeSettings(parts, DESIGN_PRESETS)
    onApplyMix(theme)
    toast.success(t('store.mixApplied'))
  }, [colorPreset, fontPreset, effectPreset, onApplyMix, t])

  const previewMix = useCallback(() => {
    const parts: MixPart[] = []
    if (colorPreset) parts.push({ presetId: colorPreset, aspects: ['colors'] })
    if (fontPreset) parts.push({ presetId: fontPreset, aspects: ['fonts'] })
    if (effectPreset) parts.push({ presetId: effectPreset, aspects: ['effects'] })
    if (parts.length === 0) return
    const theme = mixThemeSettings(parts, DESIGN_PRESETS)
    applyThemeToDOM(theme)
  }, [colorPreset, fontPreset, effectPreset])

  const presetOptions = PRESET_IDS.map((id) => ({
    id: String(id),
    name: DESIGN_PRESETS[id].name,
  }))

  return (
    <div className="border border-primary/20 rounded bg-card/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sliders size={18} className="text-primary" />
        <h3 className="font-mono text-sm font-bold">{t('store.mixTitle')}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{t('store.mixDesc')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Colors selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-muted-foreground">{t('store.mixColors')}</label>
          <select
            value={colorPreset}
            onChange={(e) => setColorPreset(e.target.value)}
            className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-xs font-mono text-foreground"
          >
            <option value="">{t('store.mixNone')}</option>
            {presetOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Fonts selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-muted-foreground">{t('store.mixFonts')}</label>
          <select
            value={fontPreset}
            onChange={(e) => setFontPreset(e.target.value)}
            className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-xs font-mono text-foreground"
          >
            <option value="">{t('store.mixNone')}</option>
            {presetOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Effects selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-muted-foreground">{t('store.mixEffects')}</label>
          <select
            value={effectPreset}
            onChange={(e) => setEffectPreset(e.target.value)}
            className="w-full bg-secondary border border-primary/20 rounded px-2 py-1.5 text-xs font-mono text-foreground"
          >
            <option value="">{t('store.mixNone')}</option>
            {presetOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" onClick={previewMix} className="text-xs gap-1 h-7 border-primary/30">
          {t('store.mixPreview')}
        </Button>
        <Button size="sm" onClick={handleApply} className="text-xs gap-1 h-7">
          {t('store.mixApply')}
        </Button>
      </div>
    </div>
  )
}

// ─── Main StoreDialog ────────────────────────────────────────────────────────

interface StoreDialogProps {
  open: boolean
  onClose: () => void
  widgetPlugins: WidgetPlugin[]
  onUpdatePlugins: (plugins: WidgetPlugin[]) => void
  activePresetId?: string
  onApplyTheme: (theme: ThemeSettings) => void
  licenseTier?: LicenseTier
}

export default function StoreDialog({
  open,
  onClose,
  widgetPlugins,
  onUpdatePlugins,
  activePresetId,
  onApplyTheme,
  licenseTier,
}: StoreDialogProps) {
  const { t } = useLocale()
  const [tab, setTab] = useState<StoreTab>('all')
  const [search, setSearch] = useState('')
  const [licenseFilter, setLicenseFilter] = useState<StoreItemLicense | undefined>()
  const [configWidget, setConfigWidget] = useState<WidgetPlugin | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const allItems = useMemo(
    () => buildStoreItems(widgetPlugins, DESIGN_PRESETS, activePresetId),
    [widgetPlugins, activePresetId],
  )

  const filteredItems = useMemo(
    () => filterStoreItems(allItems, tab, search, licenseFilter),
    [allItems, tab, search, licenseFilter],
  )

  const handleInstall = useCallback(
    (id: string) => {
      onUpdatePlugins(installWidget(widgetPlugins, id))
      toast.success(t('store.widgetInstalled'))
    },
    [widgetPlugins, onUpdatePlugins, t],
  )

  const handleUninstall = useCallback(
    (id: string) => {
      onUpdatePlugins(uninstallWidget(widgetPlugins, id))
      toast.success(t('store.widgetUninstalled'))
    },
    [widgetPlugins, onUpdatePlugins, t],
  )

  const handleToggle = useCallback(
    (id: string) => {
      onUpdatePlugins(toggleWidget(widgetPlugins, id))
    },
    [widgetPlugins, onUpdatePlugins],
  )

  const handleApplyThemePreset = useCallback(
    (presetId: string) => {
      const preset = DESIGN_PRESETS[presetId]
      if (!preset) return
      const theme = presetToThemeSettings(preset)
      onApplyTheme(theme)
      applyThemeToDOM(theme)
      toast.success(t('store.themeApplied').replace('{0}', preset.name))
    },
    [onApplyTheme, t],
  )

  const handleApplyMix = useCallback(
    (theme: ThemeSettings) => {
      onApplyTheme(theme)
      applyThemeToDOM(theme)
    },
    [onApplyTheme],
  )

  const handleConfigure = useCallback(
    (id: string) => {
      const plugin = widgetPlugins.find((p) => p.id === id) ?? null
      setConfigWidget(plugin)
    },
    [widgetPlugins],
  )

  const handleUpdate = useCallback(
    (id: string, isBreaking: boolean, updateVersion: string) => {
      if (isBreaking && !window.confirm(t('store.updateBreaking'))) return
      onUpdatePlugins(updateWidget(widgetPlugins, id))
      toast.success(t('store.widgetUpdated').replace('{0}', updateVersion))
    },
    [widgetPlugins, onUpdatePlugins, t],
  )

  const handleSaveConfig = useCallback(
    (config: Record<string, unknown>) => {
      if (!configWidget) return
      onUpdatePlugins(updateWidgetConfig(widgetPlugins, configWidget.id, config))
      setConfigWidget(null)
    },
    [configWidget, widgetPlugins, onUpdatePlugins],
  )

  const handleExportWidgets = useCallback(() => {
    const exportObj = exportWidgets(widgetPlugins)
    downloadWidgetExport(exportObj)
    toast.success(t('store.widgetsExported'))
  }, [widgetPlugins, t])

  const handleCopyWidgets = useCallback(async () => {
    try {
      await copyWidgetsToClipboard(widgetPlugins)
      toast.success(t('store.widgetsCopied'))
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [widgetPlugins, t])

  const handleImportWidgets = useCallback((plugins: WidgetPlugin[]) => {
    onUpdatePlugins(plugins)
  }, [onUpdatePlugins])

  if (!open) return null

  const tabs: { key: StoreTab; label: string }[] = [
    { key: 'all', label: t('store.tabAll') },
    { key: 'widgets', label: t('store.tabWidgets') },
    { key: 'themes', label: t('store.tabThemes') },
  ]

  return (
    <>
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4 pt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card border border-border rounded-[var(--radius-lg)] w-full max-w-3xl max-h-[85vh] flex flex-col relative"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Storefront size={22} className="text-primary" weight="duotone" />
                <h2 className="font-mono text-base font-bold tracking-wider">{t('store.title')}</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Export/Import widget actions */}
                {(tab === 'all' || tab === 'widgets') && (
                  <>
                    <button
                      onClick={handleCopyWidgets}
                      title={t('store.copyWidgets')}
                      className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={handleExportWidgets}
                      title={t('store.exportWidgets')}
                      className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Export size={16} />
                    </button>
                    <button
                      onClick={() => setImportDialogOpen(true)}
                      title={t('store.importWidgets')}
                      className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Upload size={16} />
                    </button>
                    <div className="w-px h-4 bg-primary/20 mx-0.5" />
                  </>
                )}
                <CyberCloseButton onClick={onClose} label="CLOSE" />
              </div>
            </div>

            {/* Search + Filters */}
            <div className="p-4 border-b border-primary/10 space-y-3">
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('store.search')}
                  className="pl-9 text-sm bg-secondary border-input"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Tabs */}
                {tabs.map((tabItem) => (
                  <button
                    key={tabItem.key}
                    onClick={() => setTab(tabItem.key)}
                    className={`text-xs font-mono px-3 py-1.5 rounded transition-colors ${
                      tab === tabItem.key
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-secondary text-muted-foreground border border-transparent hover:border-primary/20'
                    }`}
                  >
                    {tabItem.label}
                  </button>
                ))}

                <span className="text-muted-foreground/30 mx-1">|</span>

                {/* License filters */}
                <button
                  onClick={() => setLicenseFilter(licenseFilter === 'free' ? undefined : 'free')}
                  className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                    licenseFilter === 'free'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-secondary text-muted-foreground border border-transparent hover:border-green-500/20'
                  }`}
                >
                  {t('store.filterFree')}
                </button>
                <button
                  onClick={() => setLicenseFilter(licenseFilter === 'premium' ? undefined : 'premium')}
                  className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                    licenseFilter === 'premium'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-secondary text-muted-foreground border border-transparent hover:border-yellow-500/20'
                  }`}
                >
                  {t('store.filterPremium')}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Mix-and-Match panel (visible on themes tab or all) */}
              {(tab === 'all' || tab === 'themes') && (
                <MixPanel onApplyMix={handleApplyMix} />
              )}

              {/* Item grid */}
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                      <StoreItemCard
                        key={item.id}
                        item={item}
                        licenseTier={licenseTier}
                        onInstall={() => handleInstall(item.id)}
                        onUninstall={() => handleUninstall(item.id)}
                        onToggle={() => handleToggle(item.id)}
                        onApplyTheme={() => handleApplyThemePreset(item.id)}
                        onConfigure={item.type === 'widget' && item.installed ? () => handleConfigure(item.id) : undefined}
                        onUpdate={item.type === 'widget' && item.installed && item.hasUpdate ? () => handleUpdate(item.id, item.updateIsBreaking ?? false, item.updateVersion ?? '') : undefined}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm font-mono">
                  {t('store.noResults')}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Widget config dialog */}
    {configWidget && (
      <WidgetConfigDialog
        widget={configWidget}
        onSave={handleSaveConfig}
        onClose={() => setConfigWidget(null)}
      />
    )}

    {/* Widget import dialog */}
    <WidgetImportDialog
      open={importDialogOpen}
      onClose={() => setImportDialogOpen(false)}
      currentPlugins={widgetPlugins}
      onConfirm={handleImportWidgets}
    />
  </>
  )
}
