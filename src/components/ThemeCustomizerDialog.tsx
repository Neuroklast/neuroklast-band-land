import { useState, useEffect, useCallback, useRef, startTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, ArrowCounterClockwise, Export, ArrowSquareIn, FloppyDisk, Eye, EyeSlash, Lock } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { ThemeSettings, SectionVisibility, OverlayEffect } from '@/lib/types'
import { THEME_CATALOG, getTheme } from '@/lib/theme-registry'
import { DESIGN_PRESETS, PRESET_IDS, presetToThemeSettings } from '@/lib/design-presets'
import ThemeLicenseDialog from '@/components/ThemeLicenseDialog'
import { applyThemeToDOM, resetThemeDOM, FONT_OPTIONS, loadGoogleFont, loadAllGoogleFonts } from '@/lib/theme-application'

/* ─── Theme presets ─── */
export interface ThemePreset {
  name: string
  description: string
  theme: ThemeSettings
}

// eslint-disable-next-line react-refresh/only-export-components
export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Neon Red (Default)',
    description: 'Default red cyberpunk theme',
    theme: {
      primary: 'oklch(0.50 0.22 25)',
      accent: 'oklch(0.60 0.24 25)',
      background: 'oklch(0 0 0)',
      card: 'oklch(0.05 0 0)',
      foreground: 'oklch(1 0 0)',
      mutedForeground: 'oklch(0.55 0 0)',
      border: 'oklch(0.15 0 0)',
      secondary: 'oklch(0.10 0 0)',
      fontHeading: "'JetBrains Mono', monospace",
      fontBody: "'Space Grotesk', sans-serif",
      fontMono: "'JetBrains Mono', monospace",
    },
  },
  {
    name: 'Cyber Blue',
    description: 'Cool blue neon – Night City vibes',
    theme: {
      primary: 'oklch(0.55 0.20 250)',
      accent: 'oklch(0.65 0.22 250)',
      background: 'oklch(0.02 0.01 260)',
      card: 'oklch(0.06 0.01 260)',
      foreground: 'oklch(0.95 0.01 250)',
      mutedForeground: 'oklch(0.55 0.05 250)',
      border: 'oklch(0.15 0.03 250)',
      secondary: 'oklch(0.10 0.02 260)',
      fontHeading: "'JetBrains Mono', monospace",
      fontBody: "'Space Grotesk', sans-serif",
      fontMono: "'JetBrains Mono', monospace",
    },
  },
  {
    name: 'Toxic Green',
    description: 'Matrix / hacker green terminal theme',
    theme: {
      primary: 'oklch(0.60 0.22 145)',
      accent: 'oklch(0.70 0.24 145)',
      background: 'oklch(0.01 0 0)',
      card: 'oklch(0.04 0.01 145)',
      foreground: 'oklch(0.90 0.10 145)',
      mutedForeground: 'oklch(0.50 0.08 145)',
      border: 'oklch(0.12 0.04 145)',
      secondary: 'oklch(0.08 0.02 145)',
      fontHeading: "'JetBrains Mono', monospace",
      fontBody: "'JetBrains Mono', monospace",
      fontMono: "'JetBrains Mono', monospace",
    },
  },
  {
    name: 'Violet Chrome',
    description: 'Deep purple & chrome – synthwave aesthetic',
    theme: {
      primary: 'oklch(0.55 0.25 300)',
      accent: 'oklch(0.65 0.27 310)',
      background: 'oklch(0.02 0.02 290)',
      card: 'oklch(0.06 0.03 290)',
      foreground: 'oklch(0.95 0.02 300)',
      mutedForeground: 'oklch(0.55 0.06 300)',
      border: 'oklch(0.15 0.05 300)',
      secondary: 'oklch(0.10 0.04 300)',
      fontHeading: "'JetBrains Mono', monospace",
      fontBody: "'Space Grotesk', sans-serif",
      fontMono: "'JetBrains Mono', monospace",
    },
  },
  {
    name: 'Gold Circuit',
    description: 'Gold & dark – luxury tech aesthetic',
    theme: {
      primary: 'oklch(0.65 0.18 80)',
      accent: 'oklch(0.72 0.20 80)',
      background: 'oklch(0.03 0.01 60)',
      card: 'oklch(0.07 0.02 60)',
      foreground: 'oklch(0.92 0.05 80)',
      mutedForeground: 'oklch(0.55 0.04 60)',
      border: 'oklch(0.18 0.06 80)',
      secondary: 'oklch(0.10 0.03 60)',
      fontHeading: "'JetBrains Mono', monospace",
      fontBody: "'Space Grotesk', sans-serif",
      fontMono: "'JetBrains Mono', monospace",
    },
  },
  {
    name: 'Crimson Punk',
    description: 'Deep crimson & hot pink – aggressive cyberpunk',
    theme: {
      primary: 'oklch(0.55 0.24 10)',
      accent: 'oklch(0.62 0.26 350)',
      background: 'oklch(0.02 0.01 350)',
      card: 'oklch(0.06 0.02 350)',
      foreground: 'oklch(0.95 0.02 10)',
      mutedForeground: 'oklch(0.50 0.06 350)',
      border: 'oklch(0.15 0.04 350)',
      secondary: 'oklch(0.10 0.03 350)',
      fontHeading: "'JetBrains Mono', monospace",
      fontBody: "'Space Grotesk', sans-serif",
      fontMono: "'JetBrains Mono', monospace",
    },
  },
]

/** Default overlay effect */
const DEFAULT_OVERLAY: OverlayEffect = { enabled: false, intensity: 0.5 }

const OVERLAY_LABELS: Record<string, { name: string; description: string }> = {
  dotMatrix: { name: 'Dot Matrix', description: 'Retro dot-grid pattern overlay' },
  scanlines: { name: 'Scanlines', description: 'Horizontal CRT scanline bars' },
  crt: { name: 'CRT Curvature', description: 'Curved screen edge distortion' },
  noise: { name: 'Static Noise', description: 'Subtle random noise grain' },
  vignette: { name: 'Vignette', description: 'Dark edges / spotlight center' },
  chromatic: { name: 'Chromatic Aberration', description: 'RGB color fringe shift' },
  movingScanline: { name: 'Moving Scanline', description: 'Animated CRT refresh line sweep' },
}

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

/** Simple oklch → hex approximation for the color picker */
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

/** Convert hex color to oklch via browser */
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
      // Simple sRGB → approximate oklch
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
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'presets' | 'visibility' | 'effects' | 'theme_config'>('presets')
  const [licenseDialog, setLicenseDialog] = useState<{ themeId: string; themeName: string; licenseKeyPrefix?: string } | null>(null)
  const [unlockedThemeIds, setUnlockedThemeIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('nk-unlocked-themes') || '[]') } catch { return [] }
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const prevOpenRef = useRef(false)

  // Sync draft when dialog opens (not on every prop change while open)
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

  // Load all Google Fonts when fonts tab is opened
  useEffect(() => {
    if (open && activeTab === 'fonts') loadAllGoogleFonts()
  }, [open, activeTab])

  // Live preview: apply to DOM as user changes colors
  useEffect(() => {
    if (open) applyThemeToDOM(draft)
  }, [draft, open])

  const updateColor = useCallback((key: keyof ThemeSettings, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }, [])

  const handlePreset = (preset: ThemePreset) => {
    // Legacy quick color palettes: apply colors/fonts only, preserve active theme engine
    const { activePreset: _discard, ...colorPatch } = preset.theme
    setDraft(prev => ({ ...prev, ...colorPatch }))
  }

  /** Apply a design preset from design-presets.ts — updates colors, fonts, effects, and animation settings */
  const handleDesignPreset = (presetId: string) => {
    const preset = DESIGN_PRESETS[presetId]
    if (!preset) return
    const patch = presetToThemeSettings(preset)
    // Preserve the current theme engine (activePreset) — only apply visual settings
    const { activePreset: _ignore, ...colorPatch } = patch
    setDraft(prev => ({ ...prev, ...colorPatch }))
  }

  /** Switch the structural theme engine — updates only activePreset for layout switching */
  const handleThemeEngine = (themeId: string) => {
    setDraft(prev => ({ ...prev, activePreset: themeId }))
  }

  const handleSave = () => {
    onSaveTheme(draft)
    onSaveSectionVisibility(visDraft)
    toast.success('Theme saved')
    onClose()
  }

  const handleReset = () => {
    const defaultPreset = presetToThemeSettings(DESIGN_PRESETS['cyberpunk'])
    setDraft({ ...defaultPreset, activePreset: 'cyberpunk' })
    resetThemeDOM()
    applyThemeToDOM(defaultPreset)
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

  const updateOverlayEffect = (key: string, updates: Partial<OverlayEffect>) => {
    setDraft(prev => ({
      ...prev,
      overlayEffects: {
        ...prev.overlayEffects,
        [key]: { ...(prev.overlayEffects?.[key as keyof typeof prev.overlayEffects] || DEFAULT_OVERLAY), ...updates },
      },
    }))
  }

  // Determine if the currently selected theme has a customConfigSchema
  const activeThemeDef = draft.activePreset ? THEME_CATALOG.find(t => t.id === draft.activePreset) : undefined
  const activeThemePkg = draft.activePreset ? getTheme(draft.activePreset) : undefined
  const hasCustomConfig = !!activeThemePkg?.customConfigSchema

  const tabs: { key: 'presets' | 'colors' | 'fonts' | 'effects' | 'visibility' | 'theme_config'; label: string }[] = [
    { key: 'presets', label: 'PRESETS' },
    { key: 'colors', label: 'COLORS' },
    { key: 'fonts', label: 'FONTS' },
    { key: 'effects', label: 'EFFECTS' },
    { key: 'visibility', label: 'VISIBILITY' },
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
            {/* HUD corners */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

            {/* Header */}
            <div className="h-12 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs text-primary/70 tracking-wider uppercase">THEME CUSTOMIZER</span>
                {draft.activePreset && (
                  <span className="font-mono text-[9px] text-primary bg-primary/15 px-2 py-0.5 rounded">
                    Engine: {THEME_CATALOG.find(t => t.id === draft.activePreset)?.name ?? draft.activePreset}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="text-primary/60 hover:text-primary p-1">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-primary/20">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 font-mono text-xs tracking-wider transition-colors ${
                    activeTab === tab.key
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-primary/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto p-4">

              {/* PRESETS TAB */}
              {activeTab === 'presets' && (
                <div className="space-y-6">

                  {/* ── Section 1: Theme Engine (Layout & Effects) ── */}
                  <div className="space-y-3">
                    <div className="border-b border-primary/20 pb-2">
                      <h3 className="font-mono text-xs text-primary/90 uppercase tracking-wider">Theme Engine (Layout &amp; Effects)</h3>
                      <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
                        Select the structural layout theme. This controls the page layout, background effects, and component style.
                      </p>
                    </div>
                    <div>
                      <Label className="font-mono text-[10px] text-muted-foreground/60 mb-1 block">Active Layout Theme</Label>
                      <select
                        value={draft.activePreset || ''}
                        onChange={e => {
                          const themeId = e.target.value
                          const themeDefn = THEME_CATALOG.find(t => t.id === themeId)
                          if (!themeDefn) return
                          const effectiveStatus = themeAccessOverrides?.[themeDefn.id] ?? themeDefn.licenseStatus
                          const isUnlocked = effectiveStatus === 'free' || effectiveStatus === 'licensed' || unlockedThemeIds.includes(themeDefn.id)
                          if (!isUnlocked) {
                            setLicenseDialog({ themeId: themeDefn.id, themeName: themeDefn.name, licenseKeyPrefix: themeDefn.licenseKeyPrefix })
                            return
                          }
                          handleThemeEngine(themeId)
                        }}
                        className="w-full h-9 rounded border border-primary/20 bg-card px-3 text-xs text-foreground font-mono"
                      >
                        {THEME_CATALOG.map(themeDefn => {
                          const effectiveStatus = themeAccessOverrides?.[themeDefn.id] ?? themeDefn.licenseStatus
                          const isUnlocked = effectiveStatus === 'free' || effectiveStatus === 'licensed' || unlockedThemeIds.includes(themeDefn.id)
                          return (
                            <option key={themeDefn.id} value={themeDefn.id}>
                              {themeDefn.name}{!isUnlocked ? ' 🔒' : ''} — {themeDefn.description}
                            </option>
                          )
                        })}
                      </select>
                      {draft.activePreset && (
                        <p className="font-mono text-[9px] text-primary/50 mt-1">
                          Active engine: <strong>{THEME_CATALOG.find(t => t.id === draft.activePreset)?.name ?? draft.activePreset}</strong>
                        </p>
                      )}
                    </div>

                    {/* License override for primary admins */}
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

                  {/* ── Section 2: Design Presets (Colors & Typography) ── */}
                  <div className="space-y-3">
                    <div className="border-b border-primary/20 pb-2">
                      <h3 className="font-mono text-xs text-primary/90 uppercase tracking-wider">Design Presets (Colors &amp; Typography)</h3>
                      <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
                        Apply a color palette and font pairing. This does not change the active layout theme.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PRESET_IDS.map(presetId => {
                        const preset = DESIGN_PRESETS[presetId]
                        return (
                          <button
                            key={presetId}
                            onClick={() => handleDesignPreset(presetId)}
                            className={`border rounded p-3 text-left transition-all hover:border-primary/50 ${
                              draft.primary === preset.colors.primary && draft.accent === preset.colors.accent
                                ? 'border-primary bg-primary/10'
                                : 'border-primary/15'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.colors.primary }} />
                              <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.colors.accent }} />
                              <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.colors.background }} />
                            </div>
                            <div className="font-mono text-xs text-primary/90">{preset.name}</div>
                            <div className="font-mono text-[9px] text-muted-foreground/60">{preset.description}</div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Quick Color Palettes + custom saved presets */}
                    <details className="mt-4">
                      <summary className="font-mono text-[9px] text-primary/40 cursor-pointer hover:text-primary/60 uppercase tracking-wider">Quick Color Palettes</summary>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {[...THEME_PRESETS, ...(draft.customConfig?.savedPresets as ThemePreset[] || [])].map(preset => (

                          <div key={preset.name} className="relative group">
                            <button
                              onClick={() => handlePreset(preset)}
                              className="w-full border rounded p-3 text-left transition-all hover:border-primary/50 border-primary/15"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.theme.primary }} />
                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.theme.accent }} />
                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.theme.background }} />
                              </div>
                              <div className="font-mono text-xs text-primary/90">{preset.name}</div>
                              <div className="font-mono text-[9px] text-muted-foreground/60">{preset.description}</div>
                            </button>
                            {!THEME_PRESETS.find(p => p.name === preset.name) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const updatedPresets = (draft.customConfig?.savedPresets as ThemePreset[] || []).filter(p => p.name !== preset.name)
                                  setDraft(prev => ({
                                    ...prev,
                                    customConfig: {
                                      ...(prev.customConfig || {}),
                                      savedPresets: updatedPresets
                                    }
                                  }))
                                  toast.success('Design preset deleted')
                                }}
                              >
                                <X className="w-3 h-3 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="font-mono text-[10px] text-muted-foreground/60 mb-2">Save current color palette as a custom design preset</p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Design Preset Name"
                            className="font-mono text-xs bg-black/40 border-primary/20 flex-1"
                            id="new-preset-name"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-mono text-xs"
                            onClick={() => {
                              const input = document.getElementById('new-preset-name') as HTMLInputElement
                              const name = input?.value?.trim()
                              if (!name) return toast.error('Enter a design preset name')

                              const currentPresets = (draft.customConfig?.savedPresets as ThemePreset[] || [])
                              if (currentPresets.find(p => p.name === name) || THEME_PRESETS.find(p => p.name === name)) {
                                return toast.error('Design preset name already exists')
                              }

                              const newPreset: ThemePreset = {
                                name,
                                description: 'Custom design preset',
                                theme: { ...draft, customConfig: { ...(draft.customConfig || {}), savedPresets: undefined } }
                              }

                              setDraft(prev => ({
                                ...prev,
                                customConfig: {
                                  ...(prev.customConfig || {}),
                                  savedPresets: [...currentPresets, newPreset]
                                }
                              }))

                              if (input) input.value = ''
                              toast.success('Design preset saved')
                            }}
                          >
                            Save Current
                          </Button>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              )}

              {/* COLORS TAB */}
              {activeTab === 'colors' && (
                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                    Customize individual colors and border radius. Changes preview live.
                  </p>
                  <ColorInput label="Primary" value={draft.primary || 'oklch(0.50 0.22 25)'} onChange={v => updateColor('primary', v)} />
                  <ColorInput label="Accent" value={draft.accent || 'oklch(0.60 0.24 25)'} onChange={v => updateColor('accent', v)} />
                  <ColorInput label="Background" value={draft.background || 'oklch(0 0 0)'} onChange={v => updateColor('background', v)} />
                  <ColorInput label="Card" value={draft.card || 'oklch(0.05 0 0)'} onChange={v => updateColor('card', v)} />
                  <ColorInput label="Foreground" value={draft.foreground || 'oklch(1 0 0)'} onChange={v => updateColor('foreground', v)} />
                  <ColorInput label="Muted Text" value={draft.mutedForeground || 'oklch(0.55 0 0)'} onChange={v => updateColor('mutedForeground', v)} />
                  <ColorInput label="Border" value={draft.border || 'oklch(0.15 0 0)'} onChange={v => updateColor('border', v)} />
                  <ColorInput label="Secondary" value={draft.secondary || 'oklch(0.10 0 0)'} onChange={v => updateColor('secondary', v)} />

                  {/* Border Radius Slider */}
                  <div className="pt-4 border-t border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-mono text-xs text-muted-foreground">Border Radius</Label>
                      <span className="font-mono text-[10px] text-primary/70">{(draft.borderRadius ?? 0.125).toFixed(3)}rem</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.025"
                      value={draft.borderRadius ?? 0.125}
                      onChange={e => setDraft(prev => ({ ...prev, borderRadius: parseFloat(e.target.value) }))}
                      className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground/40 font-mono mt-1">
                      <span>SHARP</span>
                      <span>ROUNDED</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-16 h-10 border border-primary/40 bg-primary/10" style={{ borderRadius: `${(draft.borderRadius ?? 0.125) * 16}px` }} />
                      <div className="w-20 h-8 border border-primary/40 bg-primary/10" style={{ borderRadius: `${(draft.borderRadius ?? 0.125) * 16}px` }} />
                      <span className="font-mono text-[9px] text-muted-foreground/50">Preview</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FONTS TAB */}
              {activeTab === 'fonts' && (
                <div className="space-y-4">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                    Choose from local and Google Fonts. Font previews are shown below each selector.
                  </p>
                  {[
                    { key: 'fontHeading' as const, label: 'Heading Font' },
                    { key: 'fontBody' as const, label: 'Body Font' },
                    { key: 'fontMono' as const, label: 'Mono/Code Font' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <Label className="font-mono text-xs text-muted-foreground">{label}</Label>
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
                      <div
                        className="border border-primary/10 bg-black/30 p-3 mt-1"
                        style={{ fontFamily: draft[key] || FONT_OPTIONS[0].value }}
                      >
                        <p className="text-sm text-foreground/80">
                          SITE — The quick brown fox jumps over the lazy dog
                        </p>
                        <p className="text-xs text-foreground/50 mt-1">
                          0123456789 !@#$%^&amp;*() ABCDEFGHIJKLMNOPQRSTUVWXYZ
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Font Size Slider */}
                  <div className="pt-4 border-t border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-mono text-xs text-muted-foreground">Schriftgröße (Basis)</Label>
                      <span className="font-mono text-[10px] text-primary/70">{Math.round((draft.fontSize ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.5"
                      step="0.05"
                      value={draft.fontSize ?? 1}
                      onChange={e => setDraft(prev => ({ ...prev, fontSize: parseFloat(e.target.value) }))}
                      className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                      aria-label="Schriftgröße"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground/40 font-mono mt-1">
                      <span>KLEIN (75%)</span>
                      <span>NORMAL (100%)</span>
                      <span>GROß (150%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* EFFECTS TAB */}
              {activeTab === 'effects' && (
                <div className="space-y-3">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                    Enable, disable, and adjust visual overlay effects.
                  </p>
                  {Object.entries(OVERLAY_LABELS).map(([key, { name, description }]) => {
                    const effect = draft.overlayEffects?.[key as keyof typeof draft.overlayEffects] || DEFAULT_OVERLAY
                    return (
                      <div key={key} className="border border-primary/10 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs text-foreground/90">{name}</span>
                            <p className="font-mono text-[9px] text-muted-foreground/50">{description}</p>
                          </div>
                          <button
                            onClick={() => updateOverlayEffect(key, { enabled: !effect.enabled })}
                            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono transition-colors ${
                              effect.enabled ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'
                            }`}
                          >
                            {effect.enabled ? <Eye size={14} /> : <EyeSlash size={14} />}
                            {effect.enabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        {effect.enabled && (
                          <div className="flex items-center gap-3">
                            <Label className="font-mono text-[10px] text-muted-foreground/60 w-16 flex-shrink-0">Intensity</Label>
                            <input
                              type="range"
                              min="0.05"
                              max="1"
                              step="0.05"
                              value={effect.intensity}
                              onChange={e => updateOverlayEffect(key, { intensity: parseFloat(e.target.value) })}
                              className="flex-1 h-1 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                            />
                            <span className="font-mono text-[10px] text-primary/70 w-8 text-right">
                              {Math.round(effect.intensity * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* VISIBILITY TAB */}
              {activeTab === 'visibility' && (
                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                    Show or hide individual sections and effects.
                  </p>
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

              {/* THEME CONFIG TAB */}
              {activeTab === 'theme_config' && hasCustomConfig && activeThemePkg?.customConfigSchema && (
                <div className="space-y-4">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                    Custom configuration settings specific to the active theme ({activeThemeDef?.name ?? activeThemePkg.name}).
                  </p>
                  {(Object.entries(activeThemePkg.customConfigSchema) as Array<[string, { label: string; description: string; type: 'number' | 'boolean' | 'string'; default: unknown }]>).map(([key, schema]) => {
                    // Custom config is usually stored on the theme settings or we can place it on a dedicated customConfig object.
                    // For now, let's look for a customConfig block on draft, or default.
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
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={val as number}
                            onChange={e => {
                              const updatedVal = parseFloat(e.target.value)
                              setDraft(prev => {
                                const newConfig = {
                                  ...prev,
                                  customConfig: {
                                    ...(prev.customConfig || {}),
                                    [key]: updatedVal
                                  }
                                }
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
                                const newConfig = {
                                  ...prev,
                                  customConfig: {
                                    ...(prev.customConfig || {}),
                                    [key]: !val
                                  }
                                }
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
                                const newConfig = {
                                  ...prev,
                                  customConfig: {
                                    ...(prev.customConfig || {}),
                                    [key]: e.target.value
                                  }
                                }
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

            {/* Footer */}
            <div className="p-4 border-t border-primary/20 flex flex-wrap gap-2 justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportTheme} className="gap-1 text-xs border-primary/30">
                  <Export size={14} /> Export
                </Button>
                <label>
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImportTheme}
                  />
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
          // After unlocking, switch only the theme engine (layout), keep current colors
          handleThemeEngine(themeId)
        }}
      />
    )}
    </>
  )
}
