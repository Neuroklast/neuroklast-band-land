/**
 * @file LegalStep.tsx
 *
 * Wizard step 9: Impressum (legal notice) and Datenschutz (privacy policy) data entry.
 */

import { Input } from '@/components/ui/input'
import { useLocale } from '@/hooks/use-locale'
import { NavigationButtons, Field } from '@/components/setup-wizard/WizardUIElements'

export interface LegalStepProps {
  impressumName: string
  impressumStreet: string
  impressumZipCity: string
  impressumEmail: string
  datenschutzText: string
  setImpressumName: (v: string) => void
  setImpressumStreet: (v: string) => void
  setImpressumZipCity: (v: string) => void
  setImpressumEmail: (v: string) => void
  setDatenschutzText: (v: string) => void
  goBack: () => void
  goNext: () => void
}

/**
 * Legal step – collects Impressum contact data and optional custom Datenschutz text.
 *
 * All fields are optional from the wizard's perspective, but operators in
 * Germany and Austria are legally required to provide a valid Impressum.
 */
export function LegalStep({
  impressumName,
  impressumStreet,
  impressumZipCity,
  impressumEmail,
  datenschutzText,
  setImpressumName,
  setImpressumStreet,
  setImpressumZipCity,
  setImpressumEmail,
  setDatenschutzText,
  goBack,
  goNext,
}: LegalStepProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold text-primary tracking-tight">LEGAL</h2>
        <p className="font-mono text-xs text-muted-foreground">{t('setup.legalDesc')}</p>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        <Field label="Name / Organisation">
          <Input
            value={impressumName}
            onChange={(e) => setImpressumName(e.target.value)}
            placeholder="e.g. Max Mustermann or Neuroklast GbR"
            className="font-mono text-sm"
          />
        </Field>
        <Field label="Street &amp; House Number">
          <Input
            value={impressumStreet}
            onChange={(e) => setImpressumStreet(e.target.value)}
            placeholder="e.g. Musterstraße 42"
            className="font-mono text-sm"
          />
        </Field>
        <Field label="ZIP Code &amp; City">
          <Input
            value={impressumZipCity}
            onChange={(e) => setImpressumZipCity(e.target.value)}
            placeholder="e.g. 10115 Berlin"
            className="font-mono text-sm"
          />
        </Field>
        <Field label="Contact Email">
          <Input
            type="email"
            value={impressumEmail}
            onChange={(e) => setImpressumEmail(e.target.value)}
            placeholder="contact@example.com"
            className="font-mono text-sm"
          />
        </Field>
        <Field label="Privacy Policy (Datenschutz) — custom text">
          <textarea
            value={datenschutzText}
            onChange={(e) => setDatenschutzText(e.target.value)}
            placeholder="Optional: Paste your custom privacy policy text here…"
            rows={3}
            className="w-full bg-background border border-primary/30 rounded px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary resize-y"
          />
        </Field>
      </div>

      <div className="border border-primary/10 rounded p-3 bg-primary/5">
        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
          {t('setup.legalDisclaimer')}
        </p>
      </div>

      <NavigationButtons onBack={goBack} onNext={goNext} />
    </div>
  )
}
