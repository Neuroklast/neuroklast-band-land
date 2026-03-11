import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import type { ThemeSettings } from '@/lib/types'
import type { ThemePackage } from '@/lib/types'
import { getAnimationEnabled, getAnimationIntensity, setAnimationEnabled, setAnimationIntensity } from '@/lib/theme-customizer-utils'
import { useLocale } from '@/hooks/use-locale'

interface EffectsPanelProps {
  themeSettings: ThemeSettings
  activeTheme: string
  activeThemePkg: ThemePackage | undefined
  onUpdate: (ts: ThemeSettings) => void
}

const GLOBAL_EFFECTS = [
  { id: 'crt' as const, labelKey: 'theme.crt' },
  { id: 'scanlines' as const, labelKey: 'theme.scanlines' },
  { id: 'noise' as const, labelKey: 'theme.noise' },
]

export default function ThemeCustomizerEffectsPanel({ themeSettings, activeTheme, activeThemePkg, onUpdate }: EffectsPanelProps) {
  const { t } = useLocale()
  const activeAnimations = activeThemePkg?.animations ?? []
  const hasCustomConfig = !!activeThemePkg?.customConfigSchema

  return (
    <div className="space-y-4">
      <div className="space-y-3 border border-primary/20 p-3 bg-primary/5 rounded">
        <p className="font-mono text-[10px] text-muted-foreground/80 uppercase tracking-wider">{t('theme.globalEffects')}</p>

        <div className="flex items-center justify-between border-b border-primary/10 pb-2">
          <div>
            <span className="font-mono text-xs text-foreground/90 block">{t('theme.globalAnimations')}</span>
            <span className="font-mono text-[9px] text-muted-foreground/60">{t('theme.globalAnimationsDesc')}</span>
          </div>
          <button
            onClick={() => onUpdate({ ...themeSettings, animationsEnabled: !(themeSettings.animationsEnabled !== false) })}
            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono transition-colors ${themeSettings.animationsEnabled !== false ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'}`}
          >
            {themeSettings.animationsEnabled !== false ? <Eye size={14} /> : <EyeSlash size={14} />}
            {themeSettings.animationsEnabled !== false ? t('theme.on') : t('theme.off')}
          </button>
        </div>

        {GLOBAL_EFFECTS.map(effect => {
          const isEnabled = getAnimationEnabled(themeSettings, effect.id)
          const intensity = getAnimationIntensity(themeSettings, effect.id)
          return (
            <div key={effect.id} className="space-y-2 border-b border-primary/10 pb-2 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-foreground/90">{t(effect.labelKey)}</span>
                <button
                  onClick={() => onUpdate(setAnimationEnabled(themeSettings, effect.id, !isEnabled))}
                  className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono transition-colors ${isEnabled ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'}`}
                >
                  {isEnabled ? <Eye size={14} /> : <EyeSlash size={14} />}
                  {isEnabled ? t('theme.on') : t('theme.off')}
                </button>
              </div>
              {isEnabled && (
                <div className="flex items-center gap-3">
                  <Label className="font-mono text-[10px] text-muted-foreground/60 w-16 flex-shrink-0">{t('theme.intensity')}</Label>
                  <input type="range" min="0.05" max="1" step="0.05" value={intensity}
                    onChange={e => onUpdate(setAnimationIntensity(themeSettings, effect.id, parseFloat(e.target.value)))}
                    className="flex-1 h-1 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                  />
                  <span className="font-mono text-[10px] text-primary/70 w-8 text-right">{Math.round(intensity * 100)}%</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!activeTheme ? (
        <p className="font-mono text-[10px] text-muted-foreground/60">{t('theme.selectThemeAnim')}</p>
      ) : activeAnimations.length > 0 && (
        <div>
          <p className="font-mono text-[10px] text-muted-foreground/80 uppercase tracking-wider mb-2">{t('theme.themeSpecific')}</p>
          <div className="space-y-3">
            {activeAnimations.map(anim => {
              const enabled = getAnimationEnabled(themeSettings, anim.id)
              const intensity = getAnimationIntensity(themeSettings, anim.id)
              return (
                <div key={anim.id} className="border border-primary/10 p-3 space-y-2 rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-foreground/90">{anim.label}</span>
                    <button
                      onClick={() => onUpdate(setAnimationEnabled(themeSettings, anim.id, !enabled))}
                      className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono transition-colors ${enabled ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'}`}
                    >
                      {enabled ? <Eye size={14} /> : <EyeSlash size={14} />}
                      {enabled ? t('theme.on') : t('theme.off')}
                    </button>
                  </div>
                  {enabled && anim.hasIntensity === true && (
                    <div className="flex items-center gap-3">
                      <Label className="font-mono text-[10px] text-muted-foreground/60 w-16 flex-shrink-0">{t('theme.intensity')}</Label>
                      <input type="range" min="0.05" max="1" step="0.05" value={intensity}
                        onChange={e => onUpdate(setAnimationIntensity(themeSettings, anim.id, parseFloat(e.target.value)))}
                        className="flex-1 h-1 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
                      />
                      <span className="font-mono text-[10px] text-primary/70 w-8 text-right">{Math.round(intensity * 100)}%</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hasCustomConfig && activeThemePkg?.customConfigSchema && (
        <div className="border-t border-border pt-4">
          <p className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider mb-3">{t('themeCustomizer.themeConfigDesc').replace('{0}', activeThemePkg.name)}</p>
          <div className="space-y-3">
            {(Object.entries(activeThemePkg.customConfigSchema) as Array<[string, { label: string; description: string; type: 'number' | 'boolean' | 'string'; default: unknown }]>).map(([key, schema]) => {
              const val = themeSettings.customConfig?.[key] ?? schema.default
              const updateConfig = (newVal: unknown) => {
                const newSettings = { ...themeSettings, customConfig: { ...(themeSettings.customConfig ?? {}), [key]: newVal } }
                // eslint-disable-next-line no-restricted-syntax -- legitimate theme-engine live-preview event, not React state propagation
                window.dispatchEvent(new CustomEvent('neuroklast_theme_config_update', { detail: newSettings.customConfig }))
                onUpdate(newSettings)
              }
              return (
                <div key={key} className="space-y-1">
                  <Label className="font-mono text-xs text-muted-foreground flex items-center justify-between">
                    {schema.label}
                    {schema.type === 'number' && <span className="text-[10px] text-primary/70">{val as number}</span>}
                  </Label>
                  <p className="font-mono text-[9px] text-muted-foreground/50">{schema.description}</p>
                  {schema.type === 'number' && (
                    <input type="range" min="0" max="1" step="0.05" value={val as number}
                      onChange={e => updateConfig(parseFloat(e.target.value))}
                      className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary mt-2"
                    />
                  )}
                  {schema.type === 'boolean' && (
                    <button
                      onClick={() => updateConfig(!val)}
                      className={`mt-1 flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-colors ${val ? 'text-primary bg-primary/10' : 'text-muted-foreground/40 bg-muted/20'}`}
                    >
                      {val ? 'ENABLED' : 'DISABLED'}
                    </button>
                  )}
                  {schema.type === 'string' && (
                    <Input value={val as string} onChange={e => updateConfig(e.target.value)} className="font-mono text-xs mt-1" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
