/**
 * @file ActivationStep.tsx
 *
 * Wizard step shown when an activation key is required before setup can begin.
 * Rendered as step 0 when `needsActivationStep()` returns `true`.
 */

import { Check, Key } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocale } from '@/hooks/use-locale'

export interface ActivationStepProps {
  activationKeyInput: string
  activationValidating: boolean
  activationError: string
  activationValid: boolean
  setActivationKeyInput: (v: string) => void
  setActivationError: (v: string) => void
  handleActivationSubmit: () => Promise<void>
}

/**
 * Activation-key gate step.
 *
 * Validates the user's licence key against the `/api/validate-key` endpoint.
 * On success the key is persisted locally so subsequent loads skip this step.
 */
export function ActivationStep({
  activationKeyInput,
  activationValidating,
  activationError,
  activationValid,
  setActivationKeyInput,
  setActivationError,
  handleActivationSubmit,
}: ActivationStepProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <div className="text-4xl mb-2">🔑</div>
        <h1 className="text-2xl font-mono font-bold text-primary tracking-tight">
          {t('setup.activationKeyTitle')}
        </h1>
        <p className="text-muted-foreground font-mono text-sm leading-relaxed">
          {t('setup.activationKeyDesc')}
        </p>
      </div>

      {activationValid ? (
        <div className="flex items-center justify-center gap-2 text-status-success font-mono text-sm">
          <Check size={16} weight="bold" /> {t('setup.keyActivated')}
        </div>
      ) : (
        <div className="space-y-3 text-left">
          <div className="space-y-1.5">
            <Label className="font-mono text-xs">{t('setup.activationKeyLabel')}</Label>
            <Input
              value={activationKeyInput}
              onChange={(e) => { setActivationKeyInput(e.target.value); setActivationError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleActivationSubmit()}
              placeholder="nk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="bg-secondary border-input font-mono text-sm"
              autoFocus
            />
            {activationError && (
              <p className="text-xs text-destructive font-mono">{activationError}</p>
            )}
          </div>

          <Button
            onClick={handleActivationSubmit}
            disabled={activationValidating || !activationKeyInput.trim()}
            className="w-full font-mono tracking-wider gap-2"
          >
            <Key size={16} />
            {activationValidating ? 'Validating…' : 'Activate'}
          </Button>

          <p className="text-xs text-center text-muted-foreground font-mono">
            {t('setup.noKeyYet')}{' '}
            <a
              href="https://neuroklast.net/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t('setup.contactNeuroklast')}
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
