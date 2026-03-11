import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowCounterClockwise, FloppyDisk, Trash } from '@phosphor-icons/react'
import type { ThemeSettings, ColorPreset } from '@/lib/types'
import { presetToThemeSettings } from '@/lib/design-presets'
import { oklchToHex, hexToOklch } from '@/lib/color-utils'
import { useLocale } from '@/hooks/use-locale'
import { getTheme } from '@/lib/theme-registry'

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [localHex, setLocalHex] = useState(() => oklchToHex(value))
  useEffect(() => { setLocalHex(oklchToHex(value)) }, [value])
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Label className="font-mono text-xs text-muted-foreground w-32 flex-shrink-0">{label}</Label>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={localHex}
          onChange={e => setLocalHex(e.target.value)}
          onMouseUp={e => onChange(hexToOklch((e.target as HTMLInputElement).value))}
          onBlur={e => onChange(hexToOklch(e.target.value))}
          className="w-8 h-8 rounded cursor-pointer border border-primary/20 bg-transparent flex-shrink-0"
        />
        <Input value={value} onChange={e => onChange(e.target.value)} className="font-mono text-xs h-8" placeholder="oklch(0.50 0.22 25)" />
      </div>
    </div>
  )
}

interface ColorPanelProps {
  themeSettings: ThemeSettings
  activeTheme: string
  onPatch: (patch: Partial<ThemeSettings>) => void
  onResetToThemeDefaults: () => void
}

export default function ThemeCustomizerColorPanel({ themeSettings, activeTheme, onPatch, onResetToThemeDefaults }: ColorPanelProps) {
  const { t } = useLocale()
  const [savePresetName, setSavePresetName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)

  const activeThemePkg = getTheme(activeTheme)
  const builtInPresets: ColorPreset[] = activeThemePkg?.colorPresets ?? []
  const customPresets: ColorPreset[] = themeSettings.customColorPresets ?? []

  function applyPreset(preset: ColorPreset) {
    onPatch({
      ...presetToThemeSettings({
        id: preset.id,
        name: preset.name,
        description: preset.description,
        colors: preset.colors,
        fonts: {
          heading: themeSettings.fontHeading || '',
          body: themeSettings.fontBody || '',
          mono: themeSettings.fontMono || '',
        },
        borderRadius: themeSettings.borderRadius ?? 0,
        animationsEnabled: true,
      }),
      activePreset: preset.id,
    })
  }

  function handleSaveCustomPreset() {
    const name = savePresetName.trim()
    if (!name) return
    const newPreset: ColorPreset = {
      id: `custom-${Date.now()}`,
      name,
      description: 'Custom preset',
      colors: {
        primary: themeSettings.primary || 'oklch(0.50 0.22 25)',
        accent: themeSettings.accent || 'oklch(0.60 0.24 25)',
        background: themeSettings.background || 'oklch(0 0 0)',
        card: themeSettings.card || 'oklch(0.05 0 0)',
        foreground: themeSettings.foreground || 'oklch(1 0 0)',
        mutedForeground: themeSettings.mutedForeground || 'oklch(0.55 0 0)',
        border: themeSettings.border || 'oklch(0.15 0 0)',
        secondary: themeSettings.secondary || 'oklch(0.10 0 0)',
      },
    }
    onPatch({ customColorPresets: [...customPresets, newPreset] })
    setSavePresetName('')
    setShowSaveInput(false)
  }

  function handleDeleteCustomPreset(id: string) {
    onPatch({ customColorPresets: customPresets.filter(p => p.id !== id) })
  }

  function PresetButton({ preset }: { preset: ColorPreset }) {
    const isActive = themeSettings.activePreset === preset.id
    return (
      <button
        key={preset.id}
        onClick={() => applyPreset(preset)}
        className={`border rounded p-2 text-left transition-all hover:border-primary/50 ${isActive ? 'border-primary bg-primary/10' : 'border-primary/15'}`}
      >
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ background: preset.colors.primary }} />
          <div className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ background: preset.colors.accent }} />
          <div className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ background: preset.colors.background }} />
        </div>
        <div className="font-mono text-[9px] text-primary/80 font-semibold leading-tight">{preset.name}</div>
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] text-muted-foreground/60">{t('themeCustomizer.customizeColorsDesc')}</p>
        {activeTheme && (
          <Button variant="outline" size="sm" onClick={onResetToThemeDefaults} className="gap-1 text-xs border-primary/30 h-7 flex-shrink-0">
            <ArrowCounterClockwise size={12} /> {t('themeCustomizer.themeDefaults')}
          </Button>
        )}
      </div>

      {builtInPresets.length > 0 && (
        <div>
          <p className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider mb-2">{t('themeCustomizer.colorPalettes')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {builtInPresets.map(preset => <PresetButton key={preset.id} preset={preset} />)}
          </div>
        </div>
      )}

      {customPresets.length > 0 && (
        <div>
          <p className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider mb-2">{t('themeCustomizer.customPresetsLabel') || 'Custom'}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {customPresets.map(preset => (
              <div key={preset.id} className="relative group">
                <PresetButton preset={preset} />
                <button
                  onClick={() => handleDeleteCustomPreset(preset.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full items-center justify-center hidden group-hover:flex"
                  aria-label={`Delete preset ${preset.name}`}
                >
                  <Trash size={8} className="text-destructive-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-3 space-y-0.5">
        <p className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider mb-2">{t('themeCustomizer.customColors')}</p>
        <ColorInput label="Primary" value={themeSettings.primary || 'oklch(0.50 0.22 25)'} onChange={v => onPatch({ primary: v })} />
        <ColorInput label="Accent" value={themeSettings.accent || 'oklch(0.60 0.24 25)'} onChange={v => onPatch({ accent: v })} />
        <ColorInput label="Background" value={themeSettings.background || 'oklch(0 0 0)'} onChange={v => onPatch({ background: v })} />
        <ColorInput label="Card" value={themeSettings.card || 'oklch(0.05 0 0)'} onChange={v => onPatch({ card: v })} />
        <ColorInput label="Foreground" value={themeSettings.foreground || 'oklch(1 0 0)'} onChange={v => onPatch({ foreground: v })} />
        <ColorInput label="Muted Text" value={themeSettings.mutedForeground || 'oklch(0.55 0 0)'} onChange={v => onPatch({ mutedForeground: v })} />
        <ColorInput label="Border" value={themeSettings.border || 'oklch(0.15 0 0)'} onChange={v => onPatch({ border: v })} />
        <ColorInput label="Secondary" value={themeSettings.secondary || 'oklch(0.10 0 0)'} onChange={v => onPatch({ secondary: v })} />
      </div>

      <div className="border-t border-border pt-3">
        {showSaveInput ? (
          <div className="flex gap-2">
            <Input
              value={savePresetName}
              onChange={e => setSavePresetName(e.target.value)}
              placeholder={t('themeCustomizer.presetNamePlaceholder') || 'Preset name…'}
              className="font-mono text-xs h-8 flex-1"
              onKeyDown={e => { if (e.key === 'Enter') handleSaveCustomPreset(); if (e.key === 'Escape') setShowSaveInput(false) }}
              autoFocus
            />
            <Button size="sm" onClick={handleSaveCustomPreset} className="h-8 text-xs gap-1">
              <FloppyDisk size={12} /> {t('common.save') || 'Save'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowSaveInput(false)} className="h-8 text-xs border-primary/30">
              {t('common.cancel') || 'Cancel'}
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowSaveInput(true)} className="gap-1 text-xs border-primary/30 h-7 w-full">
            <FloppyDisk size={12} /> {t('themeCustomizer.saveAsCustomPreset') || 'Save as Custom Preset'}
          </Button>
        )}
      </div>
    </div>
  )
}

