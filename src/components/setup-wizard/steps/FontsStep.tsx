/**
 * @file FontsStep.tsx
 *
 * Wizard step 5: font selection for heading, body, and mono typefaces.
 */

import { useLocale } from '@/hooks/use-locale'
import { NavigationButtons, Field } from '@/components/setup-wizard/WizardUIElements'
import { applyThemeToDOM } from '@/lib/theme-application'
import { FONT_OPTIONS } from '@/lib/setup-wizard-constants'
import { loadGoogleFont, loadAllGoogleFonts } from '@/hooks/use-setup-wizard'

export interface FontsStepProps {
  fontHeading: string
  fontBody: string
  fontMono: string
  setFontHeading: (v: string) => void
  setFontBody: (v: string) => void
  setFontMono: (v: string) => void
  goBack: () => void
  goNext: () => void
}

// ─── Internal font select ─────────────────────────────────────────────────────

interface FontSelectProps {
  label: string
  value: string
  onChange: (v: string) => void
}

/**
 * Styled `<select>` for font-family picking with live preview text.
 * Eagerly loads all Google Fonts on focus to eliminate jank while scrolling
 * the option list.
 */
function FontSelect({ label, value, onChange }: FontSelectProps) {
  const { t } = useLocale()

  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value
          const match = FONT_OPTIONS.find((f) => f.value === v)
          if (match?.google) loadGoogleFont(match.label)
          onChange(v)
        }}
        className="w-full bg-background border border-primary/30 rounded px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
        onFocus={() => loadAllGoogleFonts()}
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
            {f.label}
          </option>
        ))}
      </select>
      <p className="font-mono text-[10px] text-muted-foreground mt-1" style={{ fontFamily: value }}>
        {t('setup.fontPreview')}
      </p>
    </Field>
  )
}

// ─── Step component ───────────────────────────────────────────────────────────

/**
 * Fonts step – independent pickers for heading, body, and mono typefaces.
 *
 * Each change is immediately applied to the DOM via `applyThemeToDOM` so the
 * rest of the wizard UI updates in real time.
 */
export function FontsStep({
  fontHeading,
  fontBody,
  fontMono,
  setFontHeading,
  setFontBody,
  setFontMono,
  goBack,
  goNext,
}: FontsStepProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold text-primary tracking-tight">FONTS</h2>
        <p className="font-mono text-xs text-muted-foreground">{t('setup.fontsDesc')}</p>
      </div>

      <div className="space-y-3">
        <FontSelect
          label="Heading Font"
          value={fontHeading}
          onChange={(v) => {
            setFontHeading(v)
            applyThemeToDOM({ fontHeading: v, fontBody, fontMono })
          }}
        />
        <FontSelect
          label="Body Font"
          value={fontBody}
          onChange={(v) => {
            setFontBody(v)
            applyThemeToDOM({ fontHeading, fontBody: v, fontMono })
          }}
        />
        <FontSelect
          label="Mono Font"
          value={fontMono}
          onChange={(v) => {
            setFontMono(v)
            applyThemeToDOM({ fontHeading, fontBody, fontMono: v })
          }}
        />
      </div>

      <NavigationButtons onBack={goBack} onNext={goNext} />
    </div>
  )
}
