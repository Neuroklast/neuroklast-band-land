/**
 * @file WelcomeStep.tsx
 *
 * Wizard step 0 (or 1 with activation): the introduction screen shown before
 * any form data is entered. Displays ENV variable status and step overview.
 */

import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Warning } from '@phosphor-icons/react'
import { useLocale } from '@/hooks/use-locale'
import { REQUIRED_ENV_VARS, allRequiredSet, type EnvStatus } from '@/lib/env-check'
import { STEPS_BASE, ENV_WARNING_COLOR, ENV_WARNING_BG } from '@/lib/setup-wizard-constants'

export interface WelcomeStepProps {
  envStatus: EnvStatus | null
  envLoading: boolean
  goNext: () => void
}

/**
 * Welcome step – introduction screen with ENV variable health check.
 *
 * Shows which required environment variables are configured so the operator
 * can fix missing configuration before completing the wizard.
 */
export function WelcomeStep({ envStatus, envLoading, goNext }: WelcomeStepProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <p className="font-mono text-[10px] text-primary/60 tracking-[0.3em] uppercase">
          {t('setup.bandLandTemplate')}
        </p>
        <h1 className="text-3xl font-mono font-bold text-primary tracking-tight">
          {t('setup.title')}
        </h1>
        <p className="text-muted-foreground font-mono text-sm leading-relaxed">
          {t('setup.welcomeMessage')}
          <br />
          {t('setup.changeSettingsLater')}
        </p>
      </div>

      <div className="border border-primary/20 rounded p-4 bg-primary/5 text-left space-y-2">
        {STEPS_BASE.slice(1, -1).map((s, i) => (
          <div key={s} className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="text-primary/60 w-4">{String(i + 1).padStart(2, '0')}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {!envLoading && envStatus && (
        <div
          className="border rounded p-4 text-left space-y-2"
          style={{
            borderColor: allRequiredSet(envStatus) ? 'var(--primary)' : ENV_WARNING_COLOR,
            backgroundColor: allRequiredSet(envStatus) ? 'hsl(var(--primary) / 0.05)' : ENV_WARNING_BG,
          }}
        >
          <p
            className="font-mono text-xs font-bold"
            style={{ color: allRequiredSet(envStatus) ? 'var(--primary)' : ENV_WARNING_COLOR }}
          >
            {allRequiredSet(envStatus) ? '✓ ENVIRONMENT CONFIGURED' : '⚠ ENVIRONMENT VARIABLES'}
          </p>
          {!allRequiredSet(envStatus) && (
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              {t('setup.envMissingVars')}
            </p>
          )}
          <div className="space-y-1">
            {REQUIRED_ENV_VARS.map((v) => (
              <div key={v.key} className="flex items-center gap-2 font-mono text-[11px]">
                {envStatus[v.key] ? (
                  <CheckCircle size={14} weight="fill" className="text-status-success-em shrink-0" />
                ) : (
                  <Warning
                    size={14}
                    weight="fill"
                    className="shrink-0"
                    style={{ color: v.required ? ENV_WARNING_COLOR : 'var(--muted-foreground)' }}
                  />
                )}
                <span className={envStatus[v.key] ? 'text-muted-foreground' : v.required ? 'text-foreground' : 'text-muted-foreground'}>
                  {v.label}
                  {!v.required && (
                    <span className="text-muted-foreground/60 ml-1">{t('setup.optionalTag')}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={goNext} className="font-mono tracking-wider gap-2 w-full">
        {t('setup.startSetup')}
        <ArrowRight size={16} />
      </Button>
    </div>
  )
}
