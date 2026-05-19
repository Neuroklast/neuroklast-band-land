import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LockSimple, Eye, EyeSlash, Key, ShieldCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocale } from '@/hooks/use-locale'
import type { LoginResult } from '@/hooks/use-admin-auth'

interface AdminLoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'login' | 'setup'
  totpEnabled?: boolean
  setupTokenRequired?: boolean
  onLogin?: (password: string, totpCode?: string) => Promise<LoginResult>
  onSetPassword: (password: string, setupToken?: string) => Promise<void>
}

export default function AdminLoginDialog({ open, onOpenChange, mode, totpEnabled, setupTokenRequired, onLogin, onSetPassword }: AdminLoginDialogProps) {
  const { t } = useLocale()
  const isLoginMode = mode === 'login'
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [setupToken, setSetupToken] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showTotpInput, setShowTotpInput] = useState(totpEnabled || false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Sync showTotpInput when totpEnabled prop changes (only when not already in an active TOTP flow)
  useEffect(() => {
    if (!showTotpInput) {
      setShowTotpInput(totpEnabled || false)
    }
  }, [totpEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer for rate-limit feedback
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setIsLoading(true)
    setError('')
    try {
      const result = await onLogin!(password, showTotpInput ? totpCode : undefined)
      if (result === 'totp-required') {
        setShowTotpInput(true)
        setError(t('adminLogin.enterTotpCode'))
        return
      }
      if (result === 'rate-limited') {
        setError(t('adminLogin.errorRateLimited'))
        setCountdown(10)
        return
      }
      if (result === 'invalid-credentials') {
        setError(t('adminLogin.errorInvalidCredentials'))
        return
      }
      if (result === 'server-error') {
        setError(t('adminLogin.errorServer'))
        return
      }
      if (result === 'network-error') {
        setError(t('adminLogin.errorNetwork'))
        return
      }
      if (result) {
        toast.success(t('adminLogin.accessGranted'), {
          description: t('adminLogin.accessGrantedDesc')
        })
        setPassword('')
        setTotpCode('')
        onOpenChange(false)
      } else {
        setError(t('adminLogin.invalidPassword'))
      }
    } catch {
      setError(t('adminLogin.loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await onSetPassword(password, setupTokenRequired ? setupToken : undefined)
      toast.success(t('adminLogin.passwordSet'), {
        description: t('adminLogin.passwordSetDesc')
      })
      setPassword('')
      setConfirmPassword('')
      setSetupToken('')
      onOpenChange(false)
    } catch {
      setError('Failed to set password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setPassword('')
      setConfirmPassword('')
      setSetupToken('')
      setTotpCode('')
      setError('')
      setShowPassword(false)
      setShowTotpInput(totpEnabled || false)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <LockSimple size={20} className="text-primary" />
            {isLoginMode ? t('adminLogin.title') : t('adminLogin.setPasswordTitle')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isLoginMode
              ? t('adminLogin.loginDescription')
              : t('adminLogin.setupDescription')
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={isLoginMode ? handleLogin : handleSetPassword} className="space-y-4">
          {!isLoginMode && setupTokenRequired && (
            <div className="space-y-2">
              <Label htmlFor="admin-setup-token">{t('adminLogin.setupToken')}</Label>
              <div className="relative">
                <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-setup-token"
                  type="password"
                  value={setupToken}
                  onChange={(e) => { setSetupToken(e.target.value); setError('') }}
                  placeholder="Enter setup token..."
                  className="bg-secondary border-input pl-9"
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="admin-password">{t('adminLogin.password')}</Label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder={isLoginMode ? 'Enter password...' : 'Choose a password (min. 8 characters)...'}
                className="bg-secondary border-input pl-9 pr-10"
                autoFocus
                autoComplete={isLoginMode ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLoginMode && (
            <div className="space-y-2">
              <Label htmlFor="admin-confirm-password">{t('adminLogin.confirmPassword')}</Label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  placeholder="Confirm your password..."
                  className="bg-secondary border-input pl-9"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {isLoginMode && showTotpInput && (
            <div className="space-y-2">
              <Label htmlFor="admin-totp-code">{t('adminLogin.authenticatorCode')}</Label>
              <div className="relative">
                <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-totp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => { setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  placeholder="000000"
                  className="bg-secondary border-input pl-9 font-mono tracking-widest"
                  autoComplete="one-time-code"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive font-mono">&gt; {t('adminLogin.errorPrefix')} {error}</p>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-accent"
              disabled={isLoading || !password.trim() || countdown > 0}
            >
              {isLoading
                ? t('common.processing')
                : countdown > 0
                  ? `${countdown}s`
                  : isLoginMode ? t('adminLogin.login') : t('adminLogin.setPassword')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
