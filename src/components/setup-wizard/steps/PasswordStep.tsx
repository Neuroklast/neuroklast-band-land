/**
 * @file PasswordStep.tsx
 *
 * Wizard step 10: admin password creation with strength validation.
 */

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, Eye, EyeSlash } from '@phosphor-icons/react'
import { useLocale } from '@/hooks/use-locale'
import { Field } from '@/components/setup-wizard/WizardUIElements'

export interface PasswordStepProps {
  adminPassword: string
  adminPasswordConfirm: string
  showPassword: boolean
  passwordError: string
  setAdminPassword: (v: string) => void
  setAdminPasswordConfirm: (v: string) => void
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  setPasswordError: (v: string) => void
  handlePasswordNext: () => Promise<void>
  goBack: () => void
}

/**
 * Admin Password step – validates that:
 *  - Password is not empty
 *  - Minimum length is 8 characters
 *  - Both fields match
 *
 * Inline validation is handled by `handlePasswordNext` in `useSetupWizard`.
 */
export function PasswordStep({
  adminPassword,
  adminPasswordConfirm,
  showPassword,
  passwordError,
  setAdminPassword,
  setAdminPasswordConfirm,
  setShowPassword,
  setPasswordError,
  handlePasswordNext,
  goBack,
}: PasswordStepProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold text-primary tracking-tight">
          {t('setup.adminPasswordTitle')}
        </h2>
        <p className="font-mono text-xs text-muted-foreground">
          {t('setup.adminPasswordDesc')}
        </p>
      </div>

      <div className="space-y-3">
        <Field label="Password">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={adminPassword}
              onChange={(e) => {
                setAdminPassword(e.target.value)
                setPasswordError('')
              }}
              placeholder="Min. 8 characters"
              className="font-mono text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <Field label="Confirm Password">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={adminPasswordConfirm}
            onChange={(e) => {
              setAdminPasswordConfirm(e.target.value)
              setPasswordError('')
            }}
            placeholder="Repeat password"
            className="font-mono text-sm"
          />
        </Field>

        {passwordError && (
          <p className="font-mono text-xs text-destructive">{passwordError}</p>
        )}
      </div>

      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          onClick={goBack}
          className="font-mono text-xs gap-1 flex-1"
        >
          <ArrowLeft size={14} />
          BACK
        </Button>
        <Button
          onClick={handlePasswordNext}
          className="font-mono text-xs gap-1 flex-1"
        >
          {t('setup.finishSetup')}
          <Check size={14} />
        </Button>
      </div>
    </div>
  )
}
