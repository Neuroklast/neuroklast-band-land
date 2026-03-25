/**
 * @file ThemeStep.tsx
 *
 * Wizard step 3: design preset (theme) selection with live preview.
 */

import { useLocale } from '@/hooks/use-locale'
import { NavigationButtons } from '@/components/setup-wizard/WizardUIElements'
import { THEME_CATALOG, getTheme } from '@/lib/theme-registry'
import { applyThemeDefaults, applyThemeToDOM } from '@/lib/theme-application'

export interface ThemeStepProps {
  selectedPreset: string
  applyPreset: (themeId: string) => void
  goBack: () => void
  goNext: () => void
}

/**
 * Theme selection step.
 *
 * Hovering a theme card applies it to the DOM for a live preview without
 * committing the choice. Mouse-leave reverts to the currently selected theme.
 * Clicking a card commits the selection via `applyPreset`.
 */
export function ThemeStep({ selectedPreset, applyPreset, goBack, goNext }: ThemeStepProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold text-primary tracking-tight">
          {t('setup.themeTitle')}
        </h2>
        <p className="font-mono text-xs text-muted-foreground">{t('setup.themeDesc')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {THEME_CATALOG.map((themeDefn) => {
          const themePkg = getTheme(themeDefn.id)
          const colors = themePkg?.defaultColors
          return (
            <button
              key={themeDefn.id}
              onClick={() => applyPreset(themeDefn.id)}
              onMouseEnter={() => {
                const defaults = applyThemeDefaults(themeDefn.id)
                applyThemeToDOM(defaults)
              }}
              onMouseLeave={() => {
                const defaults = applyThemeDefaults(selectedPreset)
                applyThemeToDOM(defaults)
              }}
              className={`border rounded p-3 text-left transition-all hover:border-primary/50 ${
                selectedPreset === themeDefn.id
                  ? 'border-primary bg-primary/10'
                  : 'border-primary/15 bg-card'
              }`}
            >
              {colors && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ background: colors.primary }} />
                  <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ background: colors.accent }} />
                  <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ background: colors.background }} />
                </div>
              )}
              <div className="font-mono text-xs font-bold text-foreground">{themeDefn.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground leading-tight mt-0.5">
                {themeDefn.description}
              </div>
            </button>
          )
        })}
      </div>

      <NavigationButtons onBack={goBack} onNext={goNext} />
    </div>
  )
}
