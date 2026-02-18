import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, ArrowCounterClockwise, Export, ArrowSquareIn, FloppyDisk, Eye, EyeSlash } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { ThemeSettings, SectionVisibility } from '@/lib/types'

/* ─── Theme presets ─── */
export interface ThemePreset {
  name: string
  description: string
  theme: ThemeSettings
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Neon Red (Default)',
    description: 'Default Neuroklast red cyberpunk theme',
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

const FONT_OPTIONS = [
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'System Mono', value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
  { label: 'System Sans', value: "ui-sans-serif, system-ui, sans-serif" },
  { label: 'System Serif', value: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif" },
]

const SECTION_LABELS: Record<keyof SectionVisibility, string> = {
  news: 'News Section',
  biography: 'Biography Section',
  gallery: 'Gallery Section',
  gigs: 'Gigs Section',
  releases: 'Releases Section',
  media: 'Media Section',
  social: 'Social / Connect Section',
  partnersAndFriends: 'Partners & Friends Section',
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
}

/** Apply theme CSS variables to <html> element */
export function applyThemeToDOM(theme: ThemeSettings | undefined) {
  const root = document.documentElement
  if (!theme) return

  if (theme.primary) root.style.setProperty('--primary', theme.primary)
  if (theme.accent) root.style.setProperty('--accent', theme.accent)
  if (theme.background) root.style.setProperty('--background', theme.background)
  if (theme.card) root.style.setProperty('--card', theme.card)
  if (theme.foreground) root.style.setProperty('--foreground', theme.foreground)
  if (theme.mutedForeground) root.style.setProperty('--muted-foreground', theme.mutedForeground)
  if (theme.border) root.style.setProperty('--border', theme.border)
  if (theme.secondary) root.style.setProperty('--secondary', theme.secondary)
  if (theme.fontBody) root.style.setProperty('--font-sans', theme.fontBody)
  if (theme.fontMono) root.style.setProperty('--font-mono', theme.fontMono)

  // Also update heading font
  if (theme.fontHeading) {
    root.style.setProperty('--font-heading', theme.fontHeading)
  }

  // Update ring & destructive to match primary
  if (theme.primary) {
    root.style.setProperty('--ring', theme.primary)
    root.style.setProperty('--destructive', theme.primary)
  }
  if (theme.foreground) {
    root.style.setProperty('--primary-foreground', theme.foreground)
    root.style.setProperty('--secondary-foreground', theme.foreground)
    root.style.setProperty('--accent-foreground', theme.foreground)
    root.style.setProperty('--card-foreground', theme.foreground)
    root.style.setProperty('--popover-foreground', theme.foreground)
    root.style.setProperty('--destructive-foreground', theme.foreground)
  }
  if (theme.background) {
    root.style.setProperty('--popover', theme.background)
  }
  if (theme.mutedForeground) {
    root.style.setProperty('--muted', theme.mutedForeground)
  }
}

/** Reset all custom CSS variables set by theme */
export function resetThemeDOM() {
  const root = document.documentElement
  const props = [
    '--primary', '--accent', '--background', '--card', '--foreground',
    '--muted-foreground', '--border', '--secondary', '--font-sans', '--font-mono',
    '--font-heading', '--ring', '--destructive', '--primary-foreground',
    '--secondary-foreground', '--accent-foreground', '--card-foreground',
    '--popover-foreground', '--destructive-foreground', '--popover', '--muted',
  ]
  props.forEach(p => root.style.removeProperty(p))
}

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
}: ThemeCustomizerDialogProps) {
  const [draft, setDraft] = useState<ThemeSettings>(themeSettings || {})
  const [visDraft, setVisDraft] = useState<SectionVisibility>(sectionVisibility || {})
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'presets' | 'visibility'>('presets')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Sync draft when props change
  useEffect(() => {
    if (open) {
      setDraft(themeSettings || {})
      setVisDraft(sectionVisibility || {})
    }
  }, [open, themeSettings, sectionVisibility])

  // Live preview: apply to DOM as user changes colors
  useEffect(() => {
    if (open) applyThemeToDOM(draft)
  }, [draft, open])

  const updateColor = useCallback((key: keyof ThemeSettings, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }, [])

  const handlePreset = (preset: ThemePreset) => {
    setDraft({ ...preset.theme, activePreset: preset.name })
  }

  const handleSave = () => {
    onSaveTheme(draft)
    onSaveSectionVisibility(visDraft)
    toast.success('Theme saved')
    onClose()
  }

  const handleReset = () => {
    const defaults = THEME_PRESETS[0].theme
    setDraft({ ...defaults, activePreset: THEME_PRESETS[0].name })
    resetThemeDOM()
    applyThemeToDOM(defaults)
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
    setVisDraft(prev => ({ ...prev, [key]: prev[key] === false ? true : false }))
  }

  const tabs = [
    { key: 'presets' as const, label: 'PRESETS' },
    { key: 'colors' as const, label: 'COLORS' },
    { key: 'fonts' as const, label: 'FONTS' },
    { key: 'visibility' as const, label: 'VISIBILITY' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-sm flex items-start justify-center p-4 pt-8 overflow-y-auto"
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
                    {draft.activePreset}
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
                <div className="space-y-3">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-4">
                    Select a cyberpunk design preset. You can further customize colors and fonts in the other tabs.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {THEME_PRESETS.map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => handlePreset(preset)}
                        className={`border rounded p-3 text-left transition-all hover:border-primary/50 ${
                          draft.activePreset === preset.name ? 'border-primary bg-primary/10' : 'border-primary/15'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ background: preset.theme.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ background: preset.theme.accent }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ background: preset.theme.background }}
                          />
                        </div>
                        <div className="font-mono text-xs text-primary/90">{preset.name}</div>
                        <div className="font-mono text-[9px] text-muted-foreground/60">{preset.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COLORS TAB */}
              {activeTab === 'colors' && (
                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                    Customize individual colors. Changes preview live.
                  </p>
                  <ColorInput label="Primary" value={draft.primary || 'oklch(0.50 0.22 25)'} onChange={v => updateColor('primary', v)} />
                  <ColorInput label="Accent" value={draft.accent || 'oklch(0.60 0.24 25)'} onChange={v => updateColor('accent', v)} />
                  <ColorInput label="Background" value={draft.background || 'oklch(0 0 0)'} onChange={v => updateColor('background', v)} />
                  <ColorInput label="Card" value={draft.card || 'oklch(0.05 0 0)'} onChange={v => updateColor('card', v)} />
                  <ColorInput label="Foreground" value={draft.foreground || 'oklch(1 0 0)'} onChange={v => updateColor('foreground', v)} />
                  <ColorInput label="Muted Text" value={draft.mutedForeground || 'oklch(0.55 0 0)'} onChange={v => updateColor('mutedForeground', v)} />
                  <ColorInput label="Border" value={draft.border || 'oklch(0.15 0 0)'} onChange={v => updateColor('border', v)} />
                  <ColorInput label="Secondary" value={draft.secondary || 'oklch(0.10 0 0)'} onChange={v => updateColor('secondary', v)} />
                </div>
              )}

              {/* FONTS TAB */}
              {activeTab === 'fonts' && (
                <div className="space-y-4">
                  <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
                    Change font families for different parts of the site.
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
                        onChange={e => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full h-9 rounded border border-primary/20 bg-card px-3 font-mono text-xs text-foreground"
                      >
                        {FONT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <p className="font-mono text-[10px] text-muted-foreground/40" style={{ fontFamily: draft[key] || FONT_OPTIONS[0].value }}>
                        Preview: The quick brown fox jumps over the lazy dog — 0123456789
                      </p>
                    </div>
                  ))}
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
  )
}
