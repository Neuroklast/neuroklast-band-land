import { Button } from '@/components/ui/button'
import { Lock } from '@phosphor-icons/react'
import type { ThemeLicenseStatus } from '@/lib/types'
import { THEME_CATALOG, getTheme } from '@/lib/theme-registry'
import { useLocale } from '@/hooks/use-locale'

interface ThemePanelProps {
  activeTheme: string
  isPrimary?: boolean
  themeAccessOverrides?: Record<string, ThemeLicenseStatus>
  unlockedThemeIds: string[]
  onThemeSelect: (themeId: string) => void
  onLicenseRequired: (themeId: string, themeName: string, prefix?: string) => void
  onSaveThemeAccessOverrides?: (overrides: Record<string, ThemeLicenseStatus>) => void
}

export default function ThemeCustomizerThemePanel({
  activeTheme,
  isPrimary,
  themeAccessOverrides,
  unlockedThemeIds,
  onThemeSelect,
  onLicenseRequired,
  onSaveThemeAccessOverrides,
}: ThemePanelProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-3">
      <p className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider">{t('themeCustomizer.selectThemeDesc')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {THEME_CATALOG.map(themeDefn => {
          const effectiveStatus = themeAccessOverrides?.[themeDefn.id] ?? themeDefn.licenseStatus
          const isUnlocked = effectiveStatus === 'free' || effectiveStatus === 'licensed' || unlockedThemeIds.includes(themeDefn.id)
          const isPreviewMode = effectiveStatus === 'preview'
          const canSelect = isUnlocked || isPreviewMode
          const isActive = activeTheme === themeDefn.id
          const themePkg = getTheme(themeDefn.id)
          return (
            <div
              key={themeDefn.id}
              className={`border rounded-lg p-3 transition-all relative ${isActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {themePkg?.defaultColors && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ background: themePkg.defaultColors.primary }} />
                      <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ background: themePkg.defaultColors.accent }} />
                      <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ background: themePkg.defaultColors.background }} />
                    </div>
                  )}
                  <div className="font-mono text-xs text-foreground font-semibold">
                    {themeDefn.name}
                    {isPreviewMode && !isActive && <span className="ml-2 text-[9px] px-1 py-0.5 rounded bg-status-info-em/20 text-status-info border border-status-info-em/30">PREVIEW</span>}
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground/70 mt-0.5 leading-tight">{themeDefn.description}</div>
                </div>
                <Button
                  size="sm"
                  variant={isActive ? 'default' : isPreviewMode ? 'secondary' : 'outline'}
                  className="text-xs h-7 flex-shrink-0"
                  onClick={() => {
                    if (!canSelect) {
                      onLicenseRequired(themeDefn.id, themeDefn.name, themeDefn.licenseKeyPrefix)
                      return
                    }
                    onThemeSelect(themeDefn.id)
                  }}
                >
                  {!canSelect && <Lock size={10} className="mr-1" />}
                  {isActive ? 'Active' : isPreviewMode ? 'Preview' : canSelect ? 'Select' : 'Unlock'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {isPrimary && onSaveThemeAccessOverrides && (
        <details>
          <summary className="font-mono text-[9px] text-primary/40 cursor-pointer hover:text-primary/60 uppercase tracking-wider">
            {t('themeCustomizer.licenseOverrides')}
          </summary>
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
                      const val = e.target.value as ThemeLicenseStatus
                      if (val === themeDefn.licenseStatus) { delete next[themeDefn.id] } else { next[themeDefn.id] = val }
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
  )
}
