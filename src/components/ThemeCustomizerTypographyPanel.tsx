import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowCounterClockwise } from '@phosphor-icons/react'
import type { ThemeSettings } from '@/lib/types'
import type { ThemePackage } from '@/lib/types'
import { FONT_OPTIONS, loadGoogleFont } from '@/lib/theme-application'
import { useLocale } from '@/hooks/use-locale'

interface TypographyPanelProps {
  themeSettings: ThemeSettings
  activeTheme: string
  activeThemePkg: ThemePackage | undefined
  onPatch: (patch: Partial<ThemeSettings>) => void
  onResetToThemeDefaults: () => void
}

export default function ThemeCustomizerTypographyPanel({
  themeSettings,
  activeTheme,
  activeThemePkg,
  onPatch,
  onResetToThemeDefaults,
}: TypographyPanelProps) {
  const { t } = useLocale()
  const fontFields: { key: 'fontHeading' | 'fontBody' | 'fontMono'; label: string; hint: string | undefined }[] = [
    { key: 'fontHeading', label: 'Heading Font', hint: activeThemePkg?.defaultFonts?.heading },
    { key: 'fontBody', label: 'Body Font', hint: activeThemePkg?.defaultFonts?.body },
    { key: 'fontMono', label: 'Mono/Code Font', hint: activeThemePkg?.defaultFonts?.mono },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] text-muted-foreground/60">{t('themeCustomizer.fontDesc')}</p>
        {activeTheme && activeThemePkg?.defaultFonts && (
          <Button variant="outline" size="sm" onClick={onResetToThemeDefaults} className="gap-1 text-xs border-primary/30 h-7 flex-shrink-0">
            <ArrowCounterClockwise size={12} /> {t('themeCustomizer.themeDefaults')}
          </Button>
        )}
      </div>

      {fontFields.map(({ key, label, hint }) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="font-mono text-xs text-muted-foreground">{label}</Label>
            {hint && (
              <span className="font-mono text-[9px] text-primary/40">
                {t('themeCustomizer.fontDefault').replace('{0}', hint.split(',')[0].replace(/'/g, ''))}
              </span>
            )}
          </div>
          <select
            value={themeSettings[key] || FONT_OPTIONS[0].value}
            onChange={e => {
              const opt = FONT_OPTIONS.find(f => f.value === e.target.value)
              if (opt?.google) loadGoogleFont(opt.label)
              onPatch({ [key]: e.target.value })
            }}
            className="w-full h-9 rounded border border-primary/20 bg-card px-3 text-xs text-foreground"
            style={{ fontFamily: themeSettings[key] || FONT_OPTIONS[0].value }}
          >
            {FONT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value }}>
                {opt.label}{opt.google ? ' (Google)' : ''}
              </option>
            ))}
          </select>
          <div className="border border-primary/10 bg-card/50 p-3" style={{ fontFamily: themeSettings[key] || FONT_OPTIONS[0].value }}>
            <p className="text-sm text-foreground/80">{t('themeCustomizer.fontSampleText')}</p>
            <p className="text-xs text-foreground/50 mt-1">{t('themeCustomizer.fontSampleChars')}</p>
          </div>
        </div>
      ))}

      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <Label className="font-mono text-xs text-muted-foreground">{t('themeCustomizer.fontSize')}</Label>
          <span className="font-mono text-[10px] text-primary/70">{Math.round((themeSettings.fontSize ?? 1) * 100)}%</span>
        </div>
        <input
          type="range" min="0.75" max="1.5" step="0.05"
          value={themeSettings.fontSize ?? 1}
          onChange={e => onPatch({ fontSize: parseFloat(e.target.value) })}
          className="w-full h-1.5 appearance-none bg-primary/20 rounded cursor-pointer accent-primary"
          aria-label="Font size"
        />
        <div className="flex justify-between text-[9px] text-muted-foreground/40 font-mono mt-1">
          <span>{t('themeCustomizer.fontSizeSmall')}</span>
          <span>{t('themeCustomizer.fontSizeNormal')}</span>
          <span>{t('themeCustomizer.fontSizeLarge')}</span>
        </div>
      </div>
    </div>
  )
}
