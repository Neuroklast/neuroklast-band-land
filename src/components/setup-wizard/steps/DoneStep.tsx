/**
 * @file DoneStep.tsx
 *
 * Wizard step 11: completion confirmation screen.
 */

import { Button } from '@/components/ui/button'
import { Check, Globe } from '@phosphor-icons/react'
import { useLocale } from '@/hooks/use-locale'

/**
 * Done step – shown after setup completes successfully.
 *
 * Reloads the page so the main app mounts with the newly saved `SiteConfig`.
 * Using `window.location.reload()` is intentional here — it is the simplest
 * and most reliable way to re-hydrate all app state after initial setup.
 */
export function DoneStep() {
  const { t } = useLocale()

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <div className="w-16 h-16 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center mx-auto">
          <Check size={32} weight="bold" className="text-primary" />
        </div>
        <h2 className="text-2xl font-mono font-bold text-primary tracking-tight">
          {t('setup.setupComplete')}
        </h2>
        <p className="text-muted-foreground font-mono text-sm">
          {t('setup.siteConfigured')}
          <br />
          {t('setup.adjustSettingsLater')}
        </p>
      </div>
      <Button
        onClick={() => window.location.reload()}
        className="font-mono tracking-wider gap-2 w-full"
      >
        <Globe size={16} />
        {t('setup.goToSite')}
      </Button>
    </div>
  )
}
