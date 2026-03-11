import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowCounterClockwise } from '@phosphor-icons/react'
import type { ThemeSettings } from '@/lib/types'
import { DESIGN_PRESETS, presetToThemeSettings } from '@/lib/design-presets'
import { oklchToHex, hexToOklch } from '@/lib/color-utils'
import { useLocale } from '@/hooks/use-locale'

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

      <div>
        <p className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider mb-2">{t('themeCustomizer.colorPalettes')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.values(DESIGN_PRESETS).map(preset => {
            const isActive = themeSettings.activePreset === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => onPatch({ ...presetToThemeSettings(preset), activePreset: preset.id })}
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
          })}
        </div>
      </div>

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
    </div>
  )
}
