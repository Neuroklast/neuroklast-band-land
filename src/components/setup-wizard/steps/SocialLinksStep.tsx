/**
 * @file SocialLinksStep.tsx
 *
 * Wizard step 8: social-media platform URL entry.
 */

import { Input } from '@/components/ui/input'
import { useLocale } from '@/hooks/use-locale'
import { NavigationButtons, Field } from '@/components/setup-wizard/WizardUIElements'
import { SOCIAL_FIELDS, type SocialLinksState } from '@/lib/setup-wizard-constants'

export interface SocialLinksStepProps {
  socialLinks: SocialLinksState
  setSocialLinks: React.Dispatch<React.SetStateAction<SocialLinksState>>
  goBack: () => void
  goNext: () => void
}

/**
 * Social Links step – URL fields for every supported social-media platform.
 *
 * Each field is optional. Only non-empty values are included in the final
 * `SiteConfig.socialLinks` object (filtering happens in `handleFinish` inside
 * `useSetupWizard`).
 */
export function SocialLinksStep({
  socialLinks,
  setSocialLinks,
  goBack,
  goNext,
}: SocialLinksStepProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold text-primary tracking-tight">
          {t('setup.socialLinksTitle')}
        </h2>
        <p className="font-mono text-xs text-muted-foreground">{t('setup.socialLinksDesc')}</p>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
          <Field key={key} label={label}>
            <Input
              value={socialLinks[key]}
              onChange={(e) =>
                setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={placeholder}
              className="font-mono text-sm"
            />
          </Field>
        ))}
      </div>

      <NavigationButtons onBack={goBack} onNext={goNext} />
    </div>
  )
}
