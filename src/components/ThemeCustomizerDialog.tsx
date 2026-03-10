import { useState, useEffect, useCallback, useRef, startTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, ArrowCounterClockwise, Export, ArrowSquareIn, FloppyDisk, Eye, EyeSlash, Lock, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { ThemeSettings, SectionVisibility, SectionConfig } from '@/lib/types'
import { THEME_CATALOG, getTheme } from '@/lib/theme-registry'
import ThemeLicenseDialog from '@/components/ThemeLicenseDialog'
import { applyThemeToDocument, applyThemeToDOM, resetThemeDOM, applyThemeDefaults, FONT_OPTIONS, loadGoogleFont, loadAllGoogleFonts } from '@/lib/theme-application'
import { DESIGN_PRESETS, presetToThemeSettings } from '@/lib/design-presets'
import { resolveSections, normalizeSections, toggleSection, reorderSections } from '@/lib/sections'
import { useLocale } from '@/hooks/use-locale'
import { oklchToHex, hexToOklch } from '@/lib/color-utils'
import { useKV } from '@/hooks/use-kv'

// ─── Animation ID → ThemeSettings mapping ─────────────────────────────────────

function getAnimationEnabled(draft: ThemeSettings, animId: string): boolean {
  switch (animId) {
    case 'glitch': return draft.animationSettings?.glitchEnabled ?? false
    case 'scanlines': return draft.overlayEffects?.scanlines?.enabled ?? false
    case 'crt': return draft.overlayEffects?.crt?.enabled ?? false
    case 'noise': return draft.overlayEffects?.noise?.enabled ?? false
    case 'vignette': return draft.overlayEffects?.vignette?.enabled ?? false
    case 'chromatic': return draft.overlayEffects?.chromatic?.enabled ?? false
    case 'dotMatrix': return draft.overlayEffects?.dotMatrix?.enabled ?? false
    case 'particles': return draft.animationSettings?.circuitBackgroundEnabled ?? false
    case 'overlayTransition': return draft.animationSettings?.overlayTransitionEnabled ?? false
    default: return false
  }
}

function getAnimationIntensity(draft: ThemeSettings, animId: string): number {
  switch (animId) {
    case 'scanlines': return draft.overlayEffects?.scanlines?.intensity ?? 0.5
    case 'crt': return draft.overlayEffects?.crt?.intensity ?? 0.5
    case 'noise': return draft.overlayEffects?.noise?.intensity ?? 0.5
    case 'vignette': return draft.overlayEffects?.vignette?.intensity ?? 0.5
    case 'chromatic': return draft.overlayEffects?.chromatic?.intensity ?? 0.5
    case 'dotMatrix': return draft.overlayEffects?.dotMatrix?.intensity ?? 0.5
    default: return 0.5
  }
}

function setAnimationEnabled(draft: ThemeSettings, animId: string, enabled: boolean): ThemeSettings {
  switch (animId) {
    case 'glitch':
      return { ...draft, animationSettings: { ...draft.animationSettings, glitchEnabled: enabled } }
    case 'scanlines':
      return {
        ...draft,
        overlayEffects: { ...draft.overlayEffects, scanlines: { ...(draft.overlayEffects?.scanlines ?? { intensity: 0.3 }), enabled } },
        animationSettings: { ...draft.animationSettings, scanlineEnabled: enabled },
      }
    case 'crt':
      return {
        ...draft,
        overlayEffects: { ...draft.overlayEffects, crt: { ...(draft.overlayEffects?.crt ?? { intensity: 0.4 }), enabled } },
        animationSettings: { ...draft.animationSettings, crtEnabled: enabled },
      }
    case 'noise':
      return {
        ...draft,
        overlayEffects: { ...draft.overlayEffects, noise: { ...(draft.overlayEffects?.noise ?? { intensity: 0.3 }), enabled } },
        animationSettings: { ...draft.animationSettings, noiseEnabled: enabled },
      }
    case 'vignette':
      return { ...draft, overlayEffects: { ...draft.overlayEffects, vignette: { ...(draft.overlayEffects?.vignette ?? { intensity: 0.5 }), enabled } } }
    case 'chromatic':
      return {
        ...draft,
        overlayEffects: { ...draft.overlayEffects, chromatic: { ...(draft.overlayEffects?.chromatic ?? { intensity: 0.3 }), enabled } },
        animationSettings: { ...draft.animationSettings, chromaticEnabled: enabled },
      }
    case 'dotMatrix':
      return { ...draft, overlayEffects: { ...draft.overlayEffects, dotMatrix: { ...(draft.overlayEffects?.dotMatrix ?? { intensity: 0.1 }), enabled } } }
    case 'particles':
      return { ...draft, animationSettings: { ...draft.animationSettings, circuitBackgroundEnabled: enabled } }
    case 'overlayTransition':
      return { ...draft, animationSettings: { ...draft.animationSettings, overlayTransitionEnabled: enabled } }
    default:
      return draft
  }
}

function setAnimationIntensity(draft: ThemeSettings, animId: string, intensity: number): ThemeSettings {
  switch (animId) {
    case 'scanlines':
      return { ...draft, overlayEffects: { ...draft.overlayEffects, scanlines: { ...(draft.overlayEffects?.scanlines ?? { enabled: false }), intensity } } }
    case 'crt':
      return { ...draft, overlayEffects: { ...draft.overlayEffects, crt: { ...(draft.overlayEffects?.crt ?? { enabled: false }), intensity } } }
    case 'noise':
      return { ...draft, overlayEffects: { ...draft.overlayEffects, noise: { ...(draft.overlayEffects?.noise ?? { enabled: false }), intensity } } }
    case 'vignette':
      return { ...draft, overlayEffects: { ...draft.overlayEffects, vignette: { ...(draft.overlayEffects?.vignette ?? { enabled: false }), intensity } } }
    case 'chromatic':
      return { ...draft, overlayEffects: { ...draft.overlayEffects, chromatic: { ...(draft.overlayEffects?.chromatic ?? { enabled: false }), intensity } } }
    case 'dotMatrix':
      return { ...draft, overlayEffects: { ...draft.overlayEffects, dotMatrix: { ...(draft.overlayEffects?.dotMatrix ?? { enabled: false }), intensity } } }
    default:
      return draft
  }
}

// ─── Section visibility labels ────────────────────────────────────────────────

const SECTION_LABELS: Record<keyof SectionVisibility, string> = {
  news: 'News Section',
  biography: 'Biography Section',
  gallery: 'Gallery Section',
  gigs: 'Gigs Section',
  releases: 'Releases Section',
  media: 'Media Section',
  social: 'Social / Connect Section',
  partnersAndFriends: 'Partners & Friends Section',
  contact: 'Contact Form Section',
  hudBackground: 'HUD Background Overlay',
  audioVisualizer: 'Audio Visualizer',
  scanline: 'CRT Scanline Effect',
  systemMonitor: 'System Monitor HUD',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ThemeCustomizerDialogProps {
  open: boolean
  onClose: () => void
  themeSettings: ThemeSettings | undefined
  onSaveTheme: (theme: ThemeSettings) => void
  sectionVisibility: SectionVisibility | undefined
  onSaveSectionVisibility: (vis: SectionVisibility) => void
  isPrimary?: boolean
  themeAccessOverrides?: Record<string, import('@/lib/types').ThemeLicenseStatus>
  onSaveThemeAccessOverrides?: (overrides: Record<string, import('@/lib/types').ThemeLicenseStatus>) => void
  sections?: SectionConfig[]
  onSaveSections?: (sections: SectionConfig[]) => void
}

// ─── Section display names ─────────────────────────────────────────────────────

const SECTION_DISPLAY_NAMES: Record<string, string> = {
  news: 'News & Ankündigungen',
  biography: 'Biografie',
  gallery: 'Foto Galerie',
  gigs: 'Live Gigs',
  releases: 'Musik Releases',
  media: 'Media / Videos',
  social: 'Social Media',
  partners: 'Partner & Freunde',
  contact: 'Kontakt',
}

// Re-export for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { applyThemeToDOM, resetThemeDOM }

// ─── Preview config type ──────────────────────────────────────────────────────

interface PreviewConfig {
  /** The active layout engine ID (drives `data-theme` and structural layout). */
  theme: string
  /** Color, font, radius and effect settings for the current preview. */
  themeSettings: ThemeSettings
}

// ─── Color input helper ───────────────────────────────────────────────────────

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Label className="font-mono text-xs text-muted-foreground w-36 flex-shrink-0">{label}</Label>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={oklchToHex(value)}
          onChange={e => onChange(hexToOklch(e.target.value))}
          className="w-8 h-8 rounded cursor-pointer border border-primary/20 bg-transparent"
        />
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="font-mono text-xs h-8 flex-1"
          placeholder="oklch(0.50 0.22 25)"
        />
      </div>
    </div>
  )
}

export default function ThemeCustomizerDialog({
  open,
  onClose,
  themeSettings,
  onSaveTheme,
  sectionVisibility,
  onSaveSectionVisibility,
  isPrimary,
  themeAccessOverrides,
  onSaveThemeAccessOverrides,
  sections,
  onSaveSections,
}: ThemeCustomizerDialogProps) {
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>(() => ({
    theme: themeSettings?.activePreset || '',
    themeSettings: themeSettings || {},
  }))
  const [visDraft, setVisDraft] = useState<SectionVisibility>(sectionVisibility || {})
  const [layoutDraft, setLayoutDraft] = useState<SectionConfig[]>(() =>
    normalizeSections(resolveSections(sections ? { sections } : {}))
  )
  const [activeTab, setActiveTab] = useState<'theme' | 'colors' | 'animations' | 'fonts' | 'visibility' | 'layout' | 'theme_config'>('theme')
  const [licenseDialog, setLicenseDialog] = useState<{ themeId: string; themeName: string; licenseKeyPrefix?: string } | null>(null)
  const [unlockedThemeIds, setUnlockedThemeIds] = useKV<string[]>('unlocked-themes', [])
  const { t } = useLocale()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      startTransition(() => {
        setPreviewConfig({
          theme: themeSettings?.activePreset || '',
          themeSettings: themeSettings || {},
        })
        setVisDraft(sectionVisibility || {})
        setLayoutDraft(normalizeSections(resolveSections(sections ? { sections } : {})))
      })
    }
    prevOpenRef.current = open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (open && activeTab === 'fonts') loadAllGoogleFonts()
  }, [open, activeTab])

  useEffect(() => {
    if (open) applyThemeToDocument(previewConfig.theme, previewConfig.themeSettings)
  }, [previewConfig, open])

  const updateColor = useCallback((key: keyof ThemeSettings, value: string) => {
    setPreviewConfig(prev => ({ ...prev, themeSettings: { ...prev.themeSettings, [key]: value } }))
  }, [])

  const handleThemeSelect = (themeId: string) => {
    const themeDef = THEME_CATALOG.find(t => t.id === themeId)
    // Only update the layout engine and structural props — do NOT overwrite colors.
    const structuralPatch: Partial<ThemeSettings> = {}
    if (themeDef?.theme.heroStyle) structuralPatch.heroStyle = themeDef.theme.heroStyle
    if (themeDef?.theme.loadingScreenType) structuralPatch.loadingScreenType = themeDef.theme.loadingScreenType
    setPreviewConfig(prev => ({
      theme: themeId,
      themeSettings: { ...prev.themeSettings, ...structuralPatch },
    }))
  }

  const handleResetToThemeDefaults = () => {
    if (!previewConfig.theme) return
    const defaults = applyThemeDefaults(previewConfig.theme)
    setPreviewConfig(prev => ({ ...prev, themeSettings: { ...prev.themeSettings, ...defaults } }))
    toast.success('Reset to theme defaults')
  }

  const handleSave = () => {
    onSaveTheme({ ...previewConfig.themeSettings, activePreset: previewConfig.theme })
    onSaveSectionVisibility(visDraft)
    if (onSaveSections) {
      onSaveSections(layoutDraft)
    }
    toast.success('Theme saved')
    onClose()
  }

  const handleReset = () => {
    const firstTheme = THEME_CATALOG[0]
    if (firstTheme) {
      const defaults = applyThemeDefaults(firstTheme.id)
      setPreviewConfig({ theme: firstTheme.id, themeSettings: { ...defaults, activePreset: firstTheme.id } })
      resetThemeDOM()
      applyThemeToDocument(firstTheme.id, { ...defaults, activePreset: firstTheme.id })
    } else {
      setPreviewConfig({ theme: '', themeSettings: {} })
      resetThemeDOM()
    }
  }

  const handleExportTheme = () => {
    const exportData = { theme: previewConfig.theme, themeSettings: previewConfig.themeSettings, visibility: visDraft }
    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `theme-${(previewConfig.theme || 'custom').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Theme exported')
  }

  const handleImportTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        // Support both new format { theme, themeSettings } and legacy { theme: ThemeSettings }
        if (parsed.themeSettings && typeof parsed.theme === 'string') {
          setPreviewConfig({ theme: parsed.theme, themeSettings: parsed.themeSettings })
          if (parsed.visibility) setVisDraft(parsed.visibility)
          toast.success('Theme imported')
        } else if (parsed.theme && typeof parsed.theme === 'object') {
          // Legacy format: { theme: ThemeSettings, visibility }
          const legacySettings: ThemeSettings = parsed.theme
          setPreviewConfig({ theme: legacySettings.activePreset || '', themeSettings: legacySettings })
          if (parsed.visibility) setVisDraft(parsed.visibility)
          toast.success('Theme imported')
        } else {
          toast.error('Invalid theme file')
        }
      } catch {
        toast.error('Failed to parse theme file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const toggleVisibility = (key: keyof SectionVisibility) => {
    setVisDraft(prev => {
      const currentlyVisible = prev[key] !== false
      return { ...prev, [key]: !currentlyVisible }
    })
  }

  const activeThemeDef = previewConfig.theme ? THEME_CATALOG.find(t => t.id === previewConfig.theme) : undefined
  const activeThemePkg = previewConfig.theme ? getTheme(previewConfig.theme) : undefined
  const hasCustomConfig = !!activeThemePkg?.customConfigSchema
  const activeAnimations = activeThemePkg?.animations ?? []

  const tabs: { key: 'theme' | 'colors' | 'animations' | 'fonts' | 'visibility' | 'layout' | 'theme_config'; label: string }[] = [
    { key: 'theme', label: 'THEME' },
    { key: 'colors', label: 'FARBEN' },
    { key: 'animations', label: 'ANIMATIONEN' },
    { key: 'fonts', label: 'SCHRIFTEN' },
    { key: 'visibility', label: 'SICHTBARKEIT' },
    { key: 'layout', label: 'SEITEN-LAYOUT' },
  ]

  if (hasCustomConfig) {
    tabs.push({ key: 'theme_config', label: 'THEME CONFIG' })
  }

  return (
    <>
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-3xl bg-card border-2 border-primary/30 relative overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

            <div className="h-12 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs text-primary/70 tracking-wider uppercase">{t('themeCustomizer.title')}</span>
                {previewConfig.theme && (
                  <span className="font-mono text-[9px] text-primary bg-primary/15 px-2 py-0.5 rounded">
                    {THEME_CATALOG.find(t => t.id === previewConfig.theme)?.name ?? previewConfig.theme}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="text-primary/60 hover:text-primary p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-primary/20 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 flex-1 py-2 font-mono text-xs tracking-wider transition-colors ${
                    activeTab === tab.key
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-primary/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">

              {activeTab === 'theme' && (
                <div className="space-y-4">
                  <p className="font-mono text-[10px] text-muted-foreground/60">
                    {t('themeCustomizer.selectThemeDesc')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {THEME_CATALOG.map(themeDefn => {
                      const effectiveStatus = themeAccessOverrides?.[themeDefn.id] ?? themeDefn.licenseStatus
                      const isUnlocked = effectiveStatus === 'free' || effectiveStatus === 'licensed' || unlockedThemeIds.includes(themeDefn.id)
                      const isActive = previewConfig.theme === themeDefn.id
                      const themePkg = getTheme(themeDefn.id)
                      const colors = themePkg?.defaultColors
                      return (
                        <button
                          key={themeDefn.id}
                          onClick={() => {
                            if (!isUnlocked) {
                              setLicenseDialog({ themeId: themeDefn.id, themeName: themeDefn.name, licenseKeyPrefix: themeDefn.licenseKeyPrefix })
                              return
                            }
                            handleThemeSelect(themeDefn.id)
                          }}
                          className={`border rounded p-3 text-left transition-all hover:border-primary/50 relative ${
                            isActive ? 'border-primary bg-primary/10' : 'border-primary/15'
                          }`}
                        >
                          {!isUnlocked && (
                            <div className="absolute top-2 right-2 text-muted-foreground/40">
                              <Lock size={12} />
                            </div>
                          )}
                          {colors && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" style={{ background: colors.primary }} />
                              <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" style={{ background: colors.accent }} />
                              <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" style={{ background: colors.background }} />
                            </div>
                          )}
                          <div className="font-mono text-xs text-primary/90 font-semibold">{themeDefn.name}</div>
                          <div className="font-mono text-[9px] text-muted-foreground/60 mt-0.5 leading-tight">{themeDefn.description}</div>
                          {!isUnlocked && (
                            <div className="font-mono text-[9px] text-primary/40 mt-1">
                              {effectiveStatus === 'preview' ? 'Preview Only' : 'Requires License'}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {isPrimary && onSaveThemeAccessOverrides && (
                    <details className="mt-2">
                      <summary className="font-mono text-[9px] text-primary/40 cursor-pointer hover:text-primary/60 uppercase tracking-wider">{t('themeCustomizer.licenseOverrides')}</summary>
                      <div className="mt-2 space-y-2">
                        {THEME_CATALOG.map(themeDefn => {
                          const effectiveStatus = themeAccessOverrides?.[themeDefn.id] ?? themeDefn.licenseStatus
                          return (
                            <div key={themeDefn.id} className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[10px] text-muted-foreground">{themeDefn.name}</span>
                              <select
                                value={effectiveStatus}
                                onChange={e => {
                                  const next = { ...themeAccessOverrides }
                                  const val = e.target.value as import('@/lib/types').ThemeLicenseStatus
                                  if (val === themeDefn.licenseStatus) {
                                    delete next[themeDefn.id]
                                  } else {
                                    next[themeDefn.id] = val
                                  }
                                  onSaveThemeAccessOverrides(next)
                                }}
                                className="bg-background border border-primary/20 rounded px-2 py-1 font-mono text-[9px] text-primary/80"
                              >
                                <option value="free">{t('themeCustomizer.free')}</option>
                                <option value="preview">{t('themeCustomizer.preview')}</option>
                                <option value="locked">{t('themeCustomizer.locked')}</option>
                                <option value="licensed">{t('themeCustomizer.licensed')}</option>
                              </select>
                            </div>
                          )
                        })}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-mono text-[10px] text-muted-foreground/60">
                      {t('themeCustomizer.customizeColorsDesc')}
                    </p>
                    {previewConfig.theme && (
                      <Button variant="outline" size="sm" onClick={handleResetToThemeDefaults} className="gap-1 text-xs border-primary/30 h-7">
                        <ArrowCounterClockwise size={12} /> {t('themeCustomizer.themeDefaults')}
                      </Button>
                    )}
                  </div>

                  {/* Design Palette Presets — apply colors only, layout engine is untouched */}
                  <div className="mb-4">
                    <p className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider mb-2">{t('themeCustomizer.colorPalettes')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.values(DESIGN_PRESETS).map(preset => {
                        const isActivePreset = previewConfig.themeSettings.activePreset === preset.id
                        return (
                          <button
                            key={preset.id}
                            onClick={() => {
                              const settings = presetToThemeSettings(preset)
                              setPreviewConfig(prev => ({
                                theme: prev.theme,
                                themeSettings: { ...prev.themeSettings, ...settings, activePreset: preset.id },
                              }))
                            }}
                            className={`border rounded p-2 text-left transition-all hover:border-primary/50 ${
                              isActivePreset ? 'border-primary bg-primary/10' : 'border-primary/15'
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ background: preset.colors.primary }} />
                              <div className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ background: preset.colors.accent }} />
                              <div className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ background: preset.colors.background }} />
                            </div>
                            <div className="font-mono text-[9px] text-primary/80 font-semibold leading-tight">{preset.name}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="border-t border-primary/10 pt-3">
                    <p className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider mb-2">{t('themeCustomizer.customColors')}</p>
                    <ColorInput label="Primary" value={previewConfig.themeSettings.primary || 'oklch(0.50 0.22 25)'} onChange={v => updateColor('primary', v)} />
                    <ColorInput label="Accent" value={previewConfig.themeSettings.accent || 'oklch(0.60 0.24 25)'} onChange={v => updateColor('accent', v)} />
                    <ColorInput label="Background" value={previewConfig.themeSettings.background || 'oklch(0 0 0)'} onChange={v => updateColor('background', v)} />
                    <ColorInput label="Card" value={previewConfig.themeSettings.card || 'oklch(0.05 0 0)'} onChange={v => updateColor('card', v)} />
                    <ColorInput label="Foreground" value={previewConfig.themeSettings.foreground || 'oklch(1 0 0)'} onChange={v => updateColor('foreground', v)} />
                    <ColorInput label="Muted Text" value={previewConfig.themeSettings.mutedForeground || 'oklch(0.55 0 0)'} onChange={v => updateColor('mutedForeground', v)} />
                    <ColorInput label="Border" value={previewConfig.themeSettings.border || 'oklch(0.15 0 0)'} onChange={v => updateColor('border', v)} />
                    <ColorInput label="Secondary" value={previewConfig.themeSettings.secondary || 'oklch(0.10 0 0)'} onChange={v => updateColor('secondary', v)} />
                  </div>

                  <div className="pt-4 border-t border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-mono text-xs text-muted-foreground">{t('themeCustomizer.borderRadius')}</Label>
                      <span className="font-mono text-[10px] text-primary/70">{t('themeCustomizer.remValue').replace('{0}', (previewConfig.themeSettings.borderRadius ?? 0.125).toFixed(3))}</span>
                    </div>
                    <input
                      type="range" min="0" max="1.5" step="0.025"
                      value={previewConfig.themeSettings.borderRadius ?? 0.125}
                      onChange={e => setPreviewConfig(prev => ({ ...prev, themeSettings: { ...prev.themeSettings, borderRadius: parseFloat(e.target.value) } }))}
                      className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground/40 font-mono mt-1">
                      <span>SHARP</span><span>ROUNDED</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-16 h-10 border border-primary/40 bg-primary/10" style={{ borderRadius: `${(previewConfig.themeSettings.borderRadius ?? 0.125) * 16}px` }} />
                      <div className="w-20 h-8 border border-primary/40 bg-primary/10" style={{ borderRadius: `${(previewConfig.themeSettings.borderRadius ?? 0.125) * 16}px` }} />
                      <span className="font-mono text-[9px] text-muted-foreground/50">{t('common.preview')}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'animations' && (
                <div className="space-y-4">
                  {/* Global Animation & Overlay Controls */}
                  <div className="space-y-3 border border-primary/20 p-3 bg-primary/5 rounded">
                    <p className="font-mono text-[10px] text-muted-foreground/80 uppercase tracking-wider mb-2">{t('theme.globalEffects')}</p>

                    {/* Global Animations Toggle */}
                    <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                      <div>
                        <span className="font-mono text-xs text-foreground/90 block">{t('theme.globalAnimations')}</span>
                        <span className="font-mono text-[9px] text-muted-foreground/60">{t('theme.globalAnimationsDesc')}</span>
                      </div>
                      <button
                        onClick={() => {
                          setPreviewConfig(prev => {
                            const current = prev.themeSettings.animationsEnabled ?? true
                            return {
                              ...prev,
                              themeSettings: {
                                ...prev.themeSettings,
                                animationsEnabled: !current
                              }
                            }
                          })
                        }}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono transition-colors ${
                          previewConfig.themeSettings.animationsEnabled !== false ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'
                        }`}
                      >
                        {previewConfig.themeSettings.animationsEnabled !== false ? <Eye size={14} /> : <EyeSlash size={14} />}
                        {previewConfig.themeSettings.animationsEnabled !== false ? t('theme.on') : t('theme.off')}
                      </button>
                    </div>

                    {[
                      { id: 'crt', label: t('theme.crt') },
                      { id: 'scanlines', label: t('theme.scanlines') },
                      { id: 'noise', label: t('theme.noise') }
                    ].map(effect => {
                      const isEnabled = getAnimationEnabled(previewConfig.themeSettings, effect.id)
                      const intensity = getAnimationIntensity(previewConfig.themeSettings, effect.id)
                      return (
                        <div key={effect.id} className="space-y-2 border-b border-primary/10 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-foreground/90">{effect.label}</span>
                            <button
                              onClick={() => setPreviewConfig(prev => ({ ...prev, themeSettings: setAnimationEnabled(prev.themeSettings, effect.id, !isEnabled) }))}
                              className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono transition-colors ${
                                isEnabled ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'
                              }`}
                            >
                              {isEnabled ? <Eye size={14} /> : <EyeSlash size={14} />}
                              {isEnabled ? t('theme.on') : t('theme.off')}
                            </button>
                          </div>
                          {isEnabled && (
                            <div className="flex items-center gap-3">
                              <Label className="font-mono text-[10px] text-muted-foreground/60 w-16 flex-shrink-0">{t('theme.intensity')}</Label>
                              <input
                                type="range" min="0.05" max="1" step="0.05"
                                value={intensity}
                                onChange={e => setPreviewConfig(prev => ({ ...prev, themeSettings: setAnimationIntensity(prev.themeSettings, effect.id, parseFloat(e.target.value)) }))}
                                className="flex-1 h-1 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                              />
                              <span className="font-mono text-[10px] text-primary/70 w-8 text-right">
                                {Math.round(intensity * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {!previewConfig.theme ? (
                    <p className="font-mono text-[10px] text-muted-foreground/60 mt-4">{t('theme.selectThemeAnim')}</p>
                  ) : activeAnimations.length === 0 ? (
                    <p className="font-mono text-[10px] text-muted-foreground/60 mt-4">{t('theme.noAnim')}</p>
                  ) : (
                    <div className="mt-4">
                      <p className="font-mono text-[10px] text-muted-foreground/80 uppercase tracking-wider mb-2">
                        {t('theme.themeSpecific')}
                      </p>
                      <div className="space-y-3">
                      {activeAnimations.map(anim => {
                        const enabled = getAnimationEnabled(previewConfig.themeSettings, anim.id)
                        const intensity = getAnimationIntensity(previewConfig.themeSettings, anim.id)
                        const hasIntensity = anim.hasIntensity === true
                        return (
                          <div key={anim.id} className="border border-primary/10 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs text-foreground/90">{anim.label}</span>
                              <button
                                onClick={() => setPreviewConfig(prev => ({ ...prev, themeSettings: setAnimationEnabled(prev.themeSettings, anim.id, !enabled) }))}
                                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono transition-colors ${
                                  enabled ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'
                                }`}
                              >
                                {enabled ? <Eye size={14} /> : <EyeSlash size={14} />}
                                {enabled ? t('theme.on') : t('theme.off')}
                              </button>
                            </div>
                            {enabled && hasIntensity && (
                              <div className="flex items-center gap-3">
                                <Label className="font-mono text-[10px] text-muted-foreground/60 w-16 flex-shrink-0">{t('theme.intensity')}</Label>
                                <input
                                  type="range" min="0.05" max="1" step="0.05"
                                  value={intensity}
                                  onChange={e => setPreviewConfig(prev => ({ ...prev, themeSettings: setAnimationIntensity(prev.themeSettings, anim.id, parseFloat(e.target.value)) }))}
                                  className="flex-1 h-1 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                                />
                                <span className="font-mono text-[10px] text-primary/70 w-8 text-right">
                                  {Math.round(intensity * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'fonts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-mono text-[10px] text-muted-foreground/60">{t('themeCustomizer.fontDesc')}</p>
                    {previewConfig.theme && activeThemePkg?.defaultFonts && (
                      <Button variant="outline" size="sm" onClick={handleResetToThemeDefaults} className="gap-1 text-xs border-primary/30 h-7">
                        <ArrowCounterClockwise size={12} /> {t('themeCustomizer.themeDefaults')}
                      </Button>
                    )}
                  </div>
                  {[
                    { key: 'fontHeading' as const, label: 'Heading Font', hint: activeThemePkg?.defaultFonts?.heading },
                    { key: 'fontBody' as const, label: 'Body Font', hint: activeThemePkg?.defaultFonts?.body },
                    { key: 'fontMono' as const, label: 'Mono/Code Font', hint: activeThemePkg?.defaultFonts?.mono },
                  ].map(({ key, label, hint }) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="font-mono text-xs text-muted-foreground">{label}</Label>
                        {hint && <span className="font-mono text-[9px] text-primary/40">{t('themeCustomizer.fontDefault').replace('{0}', hint.split(',')[0].replace(/'/g, ''))}</span>}
                      </div>
                      <select
                        value={previewConfig.themeSettings[key] || FONT_OPTIONS[0].value}
                        onChange={e => {
                          const opt = FONT_OPTIONS.find(f => f.value === e.target.value)
                          if (opt?.google) loadGoogleFont(opt.label)
                          setPreviewConfig(prev => ({ ...prev, themeSettings: { ...prev.themeSettings, [key]: e.target.value } }))
                        }}
                        className="w-full h-9 rounded border border-primary/20 bg-card px-3 text-xs text-foreground"
                        style={{ fontFamily: previewConfig.themeSettings[key] || FONT_OPTIONS[0].value }}
                      >
                        {FONT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value }}>
                            {opt.label}{opt.google ? ' (Google)' : ''}
                          </option>
                        ))}
                      </select>
                      <div className="border border-primary/10 bg-black/30 p-3 mt-1" style={{ fontFamily: previewConfig.themeSettings[key] || FONT_OPTIONS[0].value }}>
                        <p className="text-sm text-foreground/80">{t('themeCustomizer.fontSampleText')}</p>
                        <p className="text-xs text-foreground/50 mt-1">{t('themeCustomizer.fontSampleChars')}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-mono text-xs text-muted-foreground">{t('themeCustomizer.fontSize')}</Label>
                      <span className="font-mono text-[10px] text-primary/70">{Math.round((previewConfig.themeSettings.fontSize ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0.75" max="1.5" step="0.05"
                      value={previewConfig.themeSettings.fontSize ?? 1}
                      onChange={e => setPreviewConfig(prev => ({ ...prev, themeSettings: { ...prev.themeSettings, fontSize: parseFloat(e.target.value) } }))}
                      className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                      aria-label="Schriftgröße"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground/40 font-mono mt-1">
                      <span>{t('themeCustomizer.fontSizeSmall')}</span><span>{t('themeCustomizer.fontSizeNormal')}</span><span>{t('themeCustomizer.fontSizeLarge')}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'visibility' && (
                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">{t('themeCustomizer.visibilityDesc')}</p>
                  {(Object.keys(SECTION_LABELS) as (keyof SectionVisibility)[]).map(key => {
                    const visible = visDraft[key] !== false
                    return (
                      <div key={key} className="flex items-center justify-between py-2 border-b border-primary/5">
                        <span className="font-mono text-xs text-muted-foreground">{SECTION_LABELS[key]}</span>
                        <button
                          onClick={() => toggleVisibility(key)}
                          className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono transition-colors ${
                            visible ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'
                          }`}
                        >
                          {visible ? <Eye size={14} /> : <EyeSlash size={14} />}
                          {visible ? 'VISIBLE' : 'HIDDEN'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === 'layout' && (
                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                    {t('themeCustomizer.layoutDesc')}
                  </p>
                  {layoutDraft.map((section, index) => (
                    <div key={section.id} className={`flex items-center gap-2 p-2 border rounded transition-colors ${
                      section.enabled ? 'border-primary/20 bg-primary/5' : 'border-primary/5 opacity-50'
                    }`}>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => setLayoutDraft(prev => reorderSections(prev, section.id, index - 1))}
                          disabled={index === 0}
                          className="text-muted-foreground/60 hover:text-primary disabled:opacity-20 p-0.5"
                          title="Move up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => setLayoutDraft(prev => reorderSections(prev, section.id, index + 1))}
                          disabled={index === layoutDraft.length - 1}
                          className="text-muted-foreground/60 hover:text-primary disabled:opacity-20 p-0.5"
                          title="Move down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <span className="flex-1 font-mono text-xs text-foreground/80">
                        {SECTION_DISPLAY_NAMES[section.id] ?? section.id}
                      </span>
                      <button
                        onClick={() => setLayoutDraft(prev => toggleSection(prev, section.id))}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors ${
                          section.enabled ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'
                        }`}
                      >
                        {section.enabled ? <Eye size={12} /> : <EyeSlash size={12} />}
                        {section.enabled ? 'AN' : 'AUS'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'theme_config' && hasCustomConfig && activeThemePkg?.customConfigSchema && (
                <div className="space-y-4">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                    {t('themeCustomizer.themeConfigDesc').replace('{0}', activeThemeDef?.name ?? activeThemePkg.name)}
                  </p>
                  {(Object.entries(activeThemePkg.customConfigSchema) as Array<[string, { label: string; description: string; type: 'number' | 'boolean' | 'string'; default: unknown }]>).map(([key, schema]) => {
                    const val = previewConfig.themeSettings.customConfig?.[key] ?? schema.default
                    return (
                      <div key={key} className="space-y-1">
                        <Label className="font-mono text-xs text-muted-foreground flex items-center justify-between">
                          {schema.label}
                          {schema.type === 'number' && <span className="text-[10px] text-primary/70">{val as number}</span>}
                        </Label>
                        <p className="font-mono text-[9px] text-muted-foreground/50">{schema.description}</p>
                        {schema.type === 'number' && (
                          <input
                            type="range" min="0" max="1" step="0.05"
                            value={val as number}
                            onChange={e => {
                              const updatedVal = parseFloat(e.target.value)
                              setPreviewConfig(prev => {
                                const newSettings = { ...prev.themeSettings, customConfig: { ...(prev.themeSettings.customConfig || {}), [key]: updatedVal } }
                                window.dispatchEvent(new CustomEvent('neuroklast_theme_config_update', { detail: newSettings.customConfig }))
                                return { ...prev, themeSettings: newSettings }
                              })
                            }}
                            className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary mt-2"
                          />
                        )}
                        {schema.type === 'boolean' && (
                          <button
                            onClick={() => {
                              setPreviewConfig(prev => {
                                const newSettings = { ...prev.themeSettings, customConfig: { ...(prev.themeSettings.customConfig || {}), [key]: !val } }
                                window.dispatchEvent(new CustomEvent('neuroklast_theme_config_update', { detail: newSettings.customConfig }))
                                return { ...prev, themeSettings: newSettings }
                              })
                            }}
                            className={`mt-1 flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                              val ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'
                            }`}
                          >
                            {val ? 'ENABLED' : 'DISABLED'}
                          </button>
                        )}
                        {schema.type === 'string' && (
                          <Input
                            value={val as string}
                            onChange={e => {
                              setPreviewConfig(prev => {
                                const newSettings = { ...prev.themeSettings, customConfig: { ...(prev.themeSettings.customConfig || {}), [key]: e.target.value } }
                                window.dispatchEvent(new CustomEvent('neuroklast_theme_config_update', { detail: newSettings.customConfig }))
                                return { ...prev, themeSettings: newSettings }
                              })
                            }}
                            className="font-mono text-xs mt-1"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-primary/20 flex flex-wrap gap-2 justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportTheme} className="gap-1 text-xs border-primary/30">
                  <Export size={14} /> {t('common.export')}
                </Button>
                <label>
                  <input type="file" accept=".json,application/json" className="hidden" ref={fileInputRef} onChange={handleImportTheme} />
                  <Button variant="outline" size="sm" asChild className="gap-1 text-xs border-primary/30 cursor-pointer">
                    <span><ArrowSquareIn size={14} /> {t('common.import')}</span>
                  </Button>
                </label>
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1 text-xs border-primary/30">
                  <ArrowCounterClockwise size={14} /> {t('common.reset')}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
                <Button size="sm" onClick={handleSave} className="gap-1">
                  <FloppyDisk size={14} /> {t('themeCustomizer.saveTheme')}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    {licenseDialog && (
      <ThemeLicenseDialog
        open={!!licenseDialog}
        onClose={() => setLicenseDialog(null)}
        themeId={licenseDialog.themeId}
        themeName={licenseDialog.themeName}
        licenseKeyPrefix={licenseDialog.licenseKeyPrefix}
        onUnlocked={(themeId) => {
          const updated = [...(unlockedThemeIds || []), themeId]
          setUnlockedThemeIds(updated)
          handleThemeSelect(themeId)
        }}
      />
    )}
    </>
  )
}
