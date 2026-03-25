/**
 * @file ColorsStep.tsx
 *
 * Wizard step 4: colour customisation with live WCAG AA contrast check.
 */

import { CheckCircle, Warning } from '@phosphor-icons/react'
import { useLocale } from '@/hooks/use-locale'
import { NavigationButtons, WizardColorInput } from '@/components/setup-wizard/WizardUIElements'
import { applyThemeToDOM } from '@/lib/theme-application'
import { getContrastRatio, meetsWcagAA } from '@/lib/contrast'

export interface ColorsStepProps {
  colorPrimary: string
  colorAccent: string
  colorBackground: string
  colorForeground: string
  setColorPrimary: (v: string) => void
  setColorAccent: (v: string) => void
  setColorBackground: (v: string) => void
  setColorForeground: (v: string) => void
  goBack: () => void
  goNext: () => void
}

/**
 * Colours step – live colour editor with real-time WCAG AA contrast feedback.
 *
 * Each colour change is immediately applied to the DOM so the operator can
 * see results against the actual site background.
 */
export function ColorsStep({
  colorPrimary,
  colorAccent,
  colorBackground,
  colorForeground,
  setColorPrimary,
  setColorAccent,
  setColorBackground,
  setColorForeground,
  goBack,
  goNext,
}: ColorsStepProps) {
  const { t } = useLocale()
  const ratio = getContrastRatio(colorForeground, colorBackground)
  const passesAA = ratio != null && meetsWcagAA(ratio)

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold text-primary tracking-tight">COLORS</h2>
        <p className="font-mono text-xs text-muted-foreground">{t('setup.colorsDesc')}</p>
      </div>

      <div className="space-y-2">
        <WizardColorInput
          label="Primary"
          value={colorPrimary}
          onChange={(v) => { setColorPrimary(v); applyThemeToDOM({ primary: v }) }}
        />
        <WizardColorInput
          label="Accent"
          value={colorAccent}
          onChange={(v) => { setColorAccent(v); applyThemeToDOM({ accent: v }) }}
        />
        <WizardColorInput
          label="Background"
          value={colorBackground}
          onChange={(v) => { setColorBackground(v); applyThemeToDOM({ background: v }) }}
        />
        <WizardColorInput
          label="Foreground"
          value={colorForeground}
          onChange={(v) => { setColorForeground(v); applyThemeToDOM({ foreground: v }) }}
        />
      </div>

      {ratio != null && (
        <div
          className={`flex items-center gap-2 border rounded px-3 py-2 font-mono text-xs ${
            passesAA
              ? 'border-status-success-em/30 bg-status-success-em/5 text-status-success'
              : 'border-status-warning-em/30 bg-status-warning-em/5 text-status-warning'
          }`}
        >
          {passesAA ? <CheckCircle size={16} /> : <Warning size={16} />}
          <span>
            {t('setup.contrastRatio').replace('{0}', ratio.toFixed(1))}
            {passesAA ? ' — WCAG AA ✓' : ' — Below WCAG AA (4.5:1 recommended)'}
          </span>
        </div>
      )}

      <NavigationButtons onBack={goBack} onNext={goNext} />
    </div>
  )
}
