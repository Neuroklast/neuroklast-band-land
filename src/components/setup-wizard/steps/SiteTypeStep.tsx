/**
 * @file SiteTypeStep.tsx
 *
 * Wizard step 1: the operator selects the site type (band, DJ, artist, etc.).
 */

import { useLocale } from '@/hooks/use-locale'
import { NavigationButtons } from '@/components/setup-wizard/WizardUIElements'
import { SITE_TYPES } from '@/lib/setup-wizard-constants'
import type { SiteConfig } from '@/lib/types'

export interface SiteTypeStepProps {
  siteType: SiteConfig['siteType']
  setSiteType: (v: SiteConfig['siteType']) => void
  goBack: () => void
  goNext: () => void
}

/**
 * Site-type selection step.
 *
 * Renders a grid of labelled cards, one per supported site type. Selecting
 * a card updates `siteType` in the wizard hook state.
 */
export function SiteTypeStep({ siteType, setSiteType, goBack, goNext }: SiteTypeStepProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold text-primary tracking-tight">
          {t('setup.siteTypeTitle')}
        </h2>
        <p className="font-mono text-xs text-muted-foreground">{t('setup.siteTypeDesc')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SITE_TYPES.map(({ id, label, description: desc, Icon }) => (
          <button
            key={id}
            onClick={() => setSiteType(id)}
            className={`border rounded p-3 text-left transition-all hover:border-primary/50 ${
              siteType === id ? 'border-primary bg-primary/10' : 'border-primary/15 bg-card'
            }`}
          >
            <Icon
              size={20}
              weight={siteType === id ? 'fill' : 'regular'}
              className="text-primary mb-1"
            />
            <div className="font-mono text-xs font-bold text-foreground">{label}</div>
            <div className="font-mono text-[10px] text-muted-foreground leading-tight mt-0.5">
              {desc}
            </div>
          </button>
        ))}
      </div>

      <NavigationButtons onBack={goBack} onNext={goNext} />
    </div>
  )
}
