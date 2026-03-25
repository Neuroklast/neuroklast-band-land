/**
 * @file LogoStep.tsx
 *
 * Wizard step 6: logo URL, OG image, and favicon entry with file upload support.
 */

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/use-locale'
import { NavigationButtons, Field } from '@/components/setup-wizard/WizardUIElements'
import { toPreviewUrl } from '@/hooks/use-setup-wizard'

export interface LogoStepProps {
  logoUrl: string
  ogImage: string
  favicon: string
  setLogoUrl: (v: string) => void
  setOgImage: (v: string) => void
  setFavicon: (v: string) => void
  handleLogoFile: (file: File) => void
  logoInputRef: React.RefObject<HTMLInputElement | null>
  goBack: () => void
  goNext: () => void
}

/**
 * Logo & Assets step – supports both URL entry and file upload (converted to
 * base-64 data URL). Google Drive share links are automatically rewritten to
 * direct-preview URLs via `toPreviewUrl`.
 */
export function LogoStep({
  logoUrl,
  ogImage,
  favicon,
  setLogoUrl,
  setOgImage,
  setFavicon,
  handleLogoFile,
  logoInputRef,
  goBack,
  goNext,
}: LogoStepProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold text-primary tracking-tight">
          {t('setup.logoAssetsTitle')}
        </h2>
        <p className="font-mono text-xs text-muted-foreground">{t('setup.logoAssetsDesc')}</p>
      </div>

      <div className="space-y-3">
        <Field label="Logo URL or Upload">
          <div className="flex gap-2">
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://... or upload below"
              className="font-mono text-sm flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoInputRef.current?.click()}
              className="font-mono text-xs shrink-0"
            >
              {t('setup.upload')}
            </Button>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleLogoFile(file)
            }}
          />
          {logoUrl && (
            <div style={{ filter: 'drop-shadow(0 0 8px var(--primary))' }}>
              <img
                src={toPreviewUrl(logoUrl)}
                alt="Logo preview"
                className="mt-2 h-16 object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  img.style.display = 'none'
                  const sibling = img.nextElementSibling as HTMLElement | null
                  if (sibling) sibling.style.display = 'block'
                }}
              />
              <p className="mt-1 font-mono text-[10px] text-destructive/70 hidden">
                {t('setup.imageLoadError')}
              </p>
            </div>
          )}
        </Field>

        <Field label="OG Image URL (social preview)">
          <Input
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://..."
            className="font-mono text-sm"
          />
        </Field>

        <Field label="Favicon URL">
          <Input
            value={favicon}
            onChange={(e) => setFavicon(e.target.value)}
            placeholder="https://... (optional)"
            className="font-mono text-sm"
          />
        </Field>
      </div>

      <NavigationButtons onBack={goBack} onNext={goNext} />
    </div>
  )
}
