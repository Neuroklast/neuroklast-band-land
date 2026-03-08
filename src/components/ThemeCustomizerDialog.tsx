import { useState, useEffect, useCallback, useRef, startTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, ArrowCounterClockwise, Export, ArrowSquareIn, FloppyDisk, Eye, EyeSlash, Lock } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { ThemeSettings, SectionVisibility } from '@/lib/types'
import { THEME_CATALOG, getTheme } from '@/lib/theme-registry'
import ThemeLicenseDialog from '@/components/ThemeLicenseDialog'
import { applyThemeToDOM, resetThemeDOM, applyThemeDefaults, FONT_OPTIONS, loadGoogleFont, loadAllGoogleFonts } from '@/lib/theme-application'

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
}

// Re-export for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { applyThemeToDOM, resetThemeDOM }

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

function oklchToHex(oklch: string): string {
  try {
    const el = document.createElement('div')
    el.style.color = oklch
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) {
      const [, r, g, b] = match
      return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`
    }
  } catch { /* fallback */ }
  return '#ff3333'
}

function hexToOklch(hex: string): string {
  try {
    const el = document.createElement('div')
    el.style.color = hex
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) {
      const [, rs, gs, bs] = match
      const r = Number(rs) / 255
      const g = Number(gs) / 255
      const b = Number(bs) / 255
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const c = max - min
      let h = 0
      if (c > 0) {
        if (max === r) h = ((g - b) / c + 6) % 6 * 60
        else if (max === g) h = ((b - r) / c + 2) * 60
        else h = ((r - g) / c + 4) * 60
      }
      return `oklch(${l.toFixed(2)} ${(c * 0.4).toFixed(2)} ${Math.round(h)})`
    }
  } catch { /* fallback */ }
  return `oklch(0.50 0.22 25)`
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
}: ThemeCustomizerDialogProps) {
  const [draft, setDraft] = useState<ThemeSettings>(themeSettings || {})
  const [visDraft, setVisDraft] = useState<SectionVisibility>(sectionVisibility || {})
  const [activeTab, setActiveTab] = useState<'theme' | 'colors' | 'animations' | 'fonts' | 'visibility' | 'theme_config'>('theme')
  const [licenseDialog, setLicenseDialog] = useState<{ themeId: string; themeName: string; licenseKeyPrefix?: string } | null>(null)
  const [unlockedThemeIds, setUnlockedThemeIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('nk-unlocked-themes') || '[]') } catch { return [] }
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      startTransition(() => {
        setDraft(themeSettings || {})
        setVisDraft(sectionVisibility || {})
      })
    }
    prevOpenRef.current = open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (open && activeTab === 'fonts') loadAllGoogleFonts()
  }, [open, activeTab])

  useEffect(() => {
    if (open) applyThemeToDOM(draft)
  }, [draft, open])

  const updateColor = useCallback((key: keyof ThemeSettings, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleThemeSelect = (themeId: string) => {
    const defaults = applyThemeDefaults(themeId)
    const themeDef = THEME_CATALOG.find(t => t.id === themeId)
    const structuralPatch: Partial<ThemeSettings> = { activePreset: themeId }
    if (themeDef?.theme.heroStyle) structuralPatch.heroStyle = themeDef.theme.heroStyle
    if (themeDef?.theme.loadingScreenType) structuralPatch.loadingScreenType = themeDef.theme.loadingScreenType
    setDraft(prev => ({ ...prev, ...defaults, ...structuralPatch }))
  }

  const handleResetToThemeDefaults = () => {
    if (!draft.activePreset) return
    const defaults = applyThemeDefaults(draft.activePreset)
    setDraft(prev => ({ ...prev, ...defaults }))
    toast.success('Reset to theme defaults')
  }

  const handleSave = () => {
    onSaveTheme(draft)
    onSaveSectionVisibility(visDraft)
    toast.success('Theme saved')
    onClose()
  }

  const handleReset = () => {
    const firstTheme = THEME_CATALOG[0]
    if (firstTheme) {
      const defaults = applyThemeDefaults(firstTheme.id)
      setDraft({ ...defaults, activePreset: firstTheme.id })
      resetThemeDOM()
      applyThemeToDOM({ ...defaults, activePreset: firstTheme.id })
    } else {
      setDraft({})
      resetThemeDOM()
    }
  }

  const handleExportTheme = () => {
    const json = JSON.stringify({ theme: draft, visibility: visDraft }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `theme-${(draft.activePreset || 'custom').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
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
        if (parsed.theme) {
          setDraft(parsed.theme)
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

  const activeThemeDef = draft.activePreset ? THEME_CATALOG.find(t => t.id === draft.activePreset) : undefined
  const activeThemePkg = draft.activePreset ? getTheme(draft.activePreset) : undefined
  const hasCustomConfig = !!activeThemePkg?.customConfigSchema
  const activeAnimations = activeThemePkg?.animations ?? []

  const tabs: { key: 'theme' | 'colors' | 'animations' | 'fonts' | 'visibility' | 'theme_config'; label: string }[] = [
    { key: 'theme', label: 'THEME' },
    { key: 'colors', label: 'FARBEN' },
    { key: 'animations', label: 'ANIMATIONEN' },
    { key: 'fonts', label: 'SCHRIFTEN' },
    { key: 'visibility', label: 'SICHTBARKEIT' },
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
                <span className="font-mono text-xs text-primary/70 tracking-wider uppercase">THEME CUSTOMIZER</span>
                {draft.activePreset && (
                  <span className="font-mono text-[9px] text-primary bg-primary/15 px-2 py-0.5 rounded">
                    {THEME_CATALOG.find(t => t.id === draft.activePreset)?.name ?? draft.activePreset}
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
                    Select a theme. Each theme is a complete visual package including colors, fonts, and effects.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {THEME_CATALOG.map(themeDefn => {
                      const effectiveStatus = themeAccessOverrides?.[themeDefn.id] ?? themeDefn.licenseStatus
                      const isUnlocked = effectiveStatus === 'free' || effectiveStatus === 'licensed' || unlockedThemeIds.includes(themeDefn.id)
                      const isActive = draft.activePreset === themeDefn.id
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
                      <summary className="font-mono text-[9px] text-primary/40 cursor-pointer hover:text-primary/60 uppercase tracking-wider">License Overrides (Admin)</summary>
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
                                <option value="free">Free</option>
                                <option value="preview">Preview</option>
                                <option value="locked">Locked</option>
                                <option value="licensed">Licensed</option>
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
                      Customize individual colors. Changes preview live.
                    </p>
                    {draft.activePreset && (
                      <Button variant="outline" size="sm" onClick={handleResetToThemeDefaults} className="gap-1 text-xs border-primary/30 h-7">
                        <ArrowCounterClockwise size={12} /> Theme-Defaults
                      </Button>
                    )}
                  </div>
                  <ColorInput label="Primary" value={draft.primary || 'oklch(0.50 0.22 25)'} onChange={v => updateColor('primary', v)} />
                  <ColorInput label="Accent" value={draft.accent || 'oklch(0.60 0.24 25)'} onChange={v => updateColor('accent', v)} />
                  <ColorInput label="Background" value={draft.background || 'oklch(0 0 0)'} onChange={v => updateColor('background', v)} />
                  <ColorInput label="Card" value={draft.card || 'oklch(0.05 0 0)'} onChange={v => updateColor('card', v)} />
                  <ColorInput label="Foreground" value={draft.foreground || 'oklch(1 0 0)'} onChange={v => updateColor('foreground', v)} />
                  <ColorInput label="Muted Text" value={draft.mutedForeground || 'oklch(0.55 0 0)'} onChange={v => updateColor('mutedForeground', v)} />
                  <ColorInput label="Border" value={draft.border || 'oklch(0.15 0 0)'} onChange={v => updateColor('border', v)} />
                  <ColorInput label="Secondary" value={draft.secondary || 'oklch(0.10 0 0)'} onChange={v => updateColor('secondary', v)} />

                  <div className="pt-4 border-t border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-mono text-xs text-muted-foreground">Border Radius</Label>
                      <span className="font-mono text-[10px] text-primary/70">{(draft.borderRadius ?? 0.125).toFixed(3)}rem</span>
                    </div>
                    <input
                      type="range" min="0" max="1.5" step="0.025"
                      value={draft.borderRadius ?? 0.125}
                      onChange={e => setDraft(prev => ({ ...prev, borderRadius: parseFloat(e.target.value) }))}
                      className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground/40 font-mono mt-1">
                      <span>SHARP</span><span>ROUNDED</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-16 h-10 border border-primary/40 bg-primary/10" style={{ borderRadius: `${(draft.borderRadius ?? 0.125) * 16}px` }} />
                      <div className="w-20 h-8 border border-primary/40 bg-primary/10" style={{ borderRadius: `${(draft.borderRadius ?? 0.125) * 16}px` }} />
                      <span className="font-mono text-[9px] text-muted-foreground/50">Preview</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'animations' && (
                <div className="space-y-3">
                  {!draft.activePreset ? (
                    <p className="font-mono text-[10px] text-muted-foreground/60">Select a theme first to see available animations.</p>
                  ) : activeAnimations.length === 0 ? (
                    <p className="font-mono text-[10px] text-muted-foreground/60">This theme has no configurable animations.</p>
                  ) : (
                    <>
                      <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                        Toggle animations for the active theme.
                      </p>
                      {activeAnimations.map(anim => {
                        const enabled = getAnimationEnabled(draft, anim.id)
                        const intensity = getAnimationIntensity(draft, anim.id)
                        const hasIntensity = anim.defaultIntensity !== undefined && ['scanlines','crt','noise','vignette','chromatic','dotMatrix'].includes(anim.id)
                        return (
                          <div key={anim.id} className="border border-primary/10 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs text-foreground/90">{anim.label}</span>
                              <button
                                onClick={() => setDraft(prev => setAnimationEnabled(prev, anim.id, !enabled))}
                                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono transition-colors ${
                                  enabled ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'
                                }`}
                              >
                                {enabled ? <Eye size={14} /> : <EyeSlash size={14} />}
                                {enabled ? 'AN' : 'AUS'}
                              </button>
                            </div>
                            {enabled && hasIntensity && (
                              <div className="flex items-center gap-3">
                                <Label className="font-mono text-[10px] text-muted-foreground/60 w-16 flex-shrink-0">Intensität</Label>
                                <input
                                  type="range" min="0.05" max="1" step="0.05"
                                  value={intensity}
                                  onChange={e => setDraft(prev => setAnimationIntensity(prev, anim.id, parseFloat(e.target.value)))}
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
                    </>
                  )}
                </div>
              )}

              {activeTab === 'fonts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-mono text-[10px] text-muted-foreground/60">Choose from local and Google Fonts.</p>
                    {draft.activePreset && activeThemePkg?.defaultFonts && (
                      <Button variant="outline" size="sm" onClick={handleResetToThemeDefaults} className="gap-1 text-xs border-primary/30 h-7">
                        <ArrowCounterClockwise size={12} /> Theme-Defaults
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
                        {hint && <span className="font-mono text-[9px] text-primary/40">Default: {hint.split(',')[0].replace(/'/g, '')}</span>}
                      </div>
                      <select
                        value={draft[key] || FONT_OPTIONS[0].value}
                        onChange={e => {
                          const opt = FONT_OPTIONS.find(f => f.value === e.target.value)
                          if (opt?.google) loadGoogleFont(opt.label)
                          setDraft(prev => ({ ...prev, [key]: e.target.value }))
                        }}
                        className="w-full h-9 rounded border border-primary/20 bg-card px-3 text-xs text-foreground"
                        style={{ fontFamily: draft[key] || FONT_OPTIONS[0].value }}
                      >
                        {FONT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value }}>
                            {opt.label}{opt.google ? ' (Google)' : ''}
                          </option>
                        ))}
                      </select>
                      <div className="border border-primary/10 bg-black/30 p-3 mt-1" style={{ fontFamily: draft[key] || FONT_OPTIONS[0].value }}>
                        <p className="text-sm text-foreground/80">SITE — The quick brown fox jumps over the lazy dog</p>
                        <p className="text-xs text-foreground/50 mt-1">0123456789 !@#$%^&*() ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-mono text-xs text-muted-foreground">Schriftgröße (Basis)</Label>
                      <span className="font-mono text-[10px] text-primary/70">{Math.round((draft.fontSize ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0.75" max="1.5" step="0.05"
                      value={draft.fontSize ?? 1}
                      onChange={e => setDraft(prev => ({ ...prev, fontSize: parseFloat(e.target.value) }))}
                      className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                      aria-label="Schriftgröße"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground/40 font-mono mt-1">
                      <span>KLEIN (75%)</span><span>NORMAL (100%)</span><span>GROß (150%)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'visibility' && (
                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">Show or hide individual sections and effects.</p>
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

              {activeTab === 'theme_config' && hasCustomConfig && activeThemePkg?.customConfigSchema && (
                <div className="space-y-4">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                    Custom configuration settings specific to the active theme ({activeThemeDef?.name ?? activeThemePkg.name}).
                  </p>
                  {(Object.entries(activeThemePkg.customConfigSchema) as Array<[string, { label: string; description: string; type: 'number' | 'boolean' | 'string'; default: unknown }]>).map(([key, schema]) => {
                    const val = draft.customConfig?.[key] ?? schema.default
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
                              setDraft(prev => {
                                const newConfig = { ...prev, customConfig: { ...(prev.customConfig || {}), [key]: updatedVal } }
                                window.dispatchEvent(new CustomEvent('neuroklast_theme_config_update', { detail: newConfig.customConfig }))
                                return newConfig
                              })
                            }}
                            className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary mt-2"
                          />
                        )}
                        {schema.type === 'boolean' && (
                          <button
                            onClick={() => {
                              setDraft(prev => {
                                const newConfig = { ...prev, customConfig: { ...(prev.customConfig || {}), [key]: !val } }
                                window.dispatchEvent(new CustomEvent('neuroklast_theme_config_update', { detail: newConfig.customConfig }))
                                return newConfig
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
                              setDraft(prev => {
                                const newConfig = { ...prev, customConfig: { ...(prev.customConfig || {}), [key]: e.target.value } }
                                window.dispatchEvent(new CustomEvent('neuroklast_theme_config_update', { detail: newConfig.customConfig }))
                                return newConfig
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
                  <Export size={14} /> Export
                </Button>
                <label>
                  <input type="file" accept=".json,application/json" className="hidden" ref={fileInputRef} onChange={handleImportTheme} />
                  <Button variant="outline" size="sm" asChild className="gap-1 text-xs border-primary/30 cursor-pointer">
                    <span><ArrowSquareIn size={14} /> Import</span>
                  </Button>
                </label>
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1 text-xs border-primary/30">
                  <ArrowCounterClockwise size={14} /> Reset
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                <Button size="sm" onClick={handleSave} className="gap-1">
                  <FloppyDisk size={14} /> Save Theme
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
          const updated = [...unlockedThemeIds, themeId]
          setUnlockedThemeIds(updated)
          try { localStorage.setItem('nk-unlocked-themes', JSON.stringify(updated)) } catch { /* ignore */ }
          handleThemeSelect(themeId)
        }}
      />
    )}
    </>
  )
}
