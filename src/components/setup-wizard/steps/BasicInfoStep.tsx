/**
 * @file BasicInfoStep.tsx
 *
 * Wizard step 2: basic site information (name, tagline, description, genres, domain).
 */

import { Input } from '@/components/ui/input'
import { useLocale } from '@/hooks/use-locale'
import { NavigationButtons, Field } from '@/components/setup-wizard/WizardUIElements'

export interface BasicInfoStepProps {
  siteName: string
  tagline: string
  description: string
  genresInput: string
  domain: string
  setSiteName: (v: string) => void
  setTagline: (v: string) => void
  setDescription: (v: string) => void
  setGenresInput: (v: string) => void
  setDomain: (v: string) => void
  goBack: () => void
  goNext: () => void
}

/**
 * Basic Info step – collects core site metadata.
 *
 * Site name is the only required field; all others are optional but contribute
 * to SEO meta tags and the footer.
 */
export function BasicInfoStep({
  siteName,
  tagline,
  description,
  genresInput,
  domain,
  setSiteName,
  setTagline,
  setDescription,
  setGenresInput,
  setDomain,
  goBack,
  goNext,
}: BasicInfoStepProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold text-primary tracking-tight">
          {t('setup.basicInfoTitle')}
        </h2>
        <p className="font-mono text-xs text-muted-foreground">{t('setup.basicInfoDesc')}</p>
      </div>

      <div className="space-y-3">
        <Field label="Site Name *">
          <Input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="e.g. Neuroklast"
            className="font-mono text-sm"
          />
        </Field>
        <Field label="Tagline">
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Industrial Techno from Berlin"
            className="font-mono text-sm"
          />
        </Field>
        <Field label="Description">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short SEO description"
            className="font-mono text-sm"
          />
        </Field>
        <Field label="Genres (comma-separated)">
          <Input
            value={genresInput}
            onChange={(e) => setGenresInput(e.target.value)}
            placeholder="e.g. Techno, Industrial, EBM"
            className="font-mono text-sm"
          />
        </Field>
        <Field label="Domain (optional)">
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g. neuroklast.net"
            className="font-mono text-sm"
          />
        </Field>
      </div>

      <NavigationButtons
        onBack={goBack}
        onNext={siteName.trim() ? goNext : undefined}
        nextDisabled={!siteName.trim()}
        nextLabel="NEXT"
      />
    </div>
  )
}
