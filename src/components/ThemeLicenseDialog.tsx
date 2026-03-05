/**
 * ThemeLicenseDialog – Dialog for entering a license key to unlock a theme.
 *
 * Validates the key against `/api/admin/validate-theme-key` and, on success,
 * calls `onUnlocked` so the parent can activate the theme.
 */
import { useState, startTransition, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Lock, Key, CheckCircle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface ThemeLicenseDialogProps {
  open: boolean
  onClose: () => void
  themeId: string
  themeName: string
  licenseKeyPrefix?: string
  /** Called with the themeId after the key is successfully validated */
  onUnlocked: (themeId: string) => void
}

export default function ThemeLicenseDialog({
  open,
  onClose,
  themeId,
  themeName,
  licenseKeyPrefix,
  onUnlocked,
}: ThemeLicenseDialogProps) {
  const [keyValue, setKeyValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [validated, setValidated] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up pending close timeout on unmount
  useEffect(() => {
    return () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current) }
  }, [])

  const handleClose = () => {
    if (loading) return
    setKeyValue('')
    setValidated(false)
    onClose()
  }

  const handleSubmit = async () => {
    if (!keyValue.trim()) return
    startTransition(() => setLoading(true))
    try {
      const res = await fetch('/api/admin/validate-theme-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ themeId, licenseKey: keyValue.trim() }),
      })
      const data = await res.json() as { valid: boolean; themeId?: string; error?: string }
      if (data.valid) {
        setValidated(true)
        toast.success(`${themeName} unlocked!`)
        // Short delay so the success state is visible before closing
        closeTimeoutRef.current = setTimeout(() => {
          onUnlocked(themeId)
          handleClose()
        }, 800)
      } else {
        toast.error(data.error || 'Invalid license key')
      }
    } catch {
      toast.error('Could not validate key — please try again')
    } finally {
      startTransition(() => setLoading(false))
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-card border border-border rounded-lg w-full max-w-sm p-5 relative"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              aria-label="Close"
              disabled={loading}
            >
              <X size={16} weight="bold" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-primary" />
              <h2 className="font-mono text-sm font-bold tracking-widest text-foreground uppercase">
                Unlock Theme
              </h2>
            </div>

            <p className="font-mono text-xs text-muted-foreground mb-1">
              Theme: <span className="text-foreground">{themeName}</span>
            </p>
            {licenseKeyPrefix && (
              <p className="font-mono text-[10px] text-primary/60 mb-4">
                Key format: {licenseKeyPrefix}XXXX-XXXX-XXXX-XXXX
              </p>
            )}

            {validated ? (
              <div className="flex items-center gap-2 text-primary font-mono text-sm py-4 justify-center">
                <CheckCircle size={18} weight="fill" />
                <span>Theme unlocked!</span>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mt-3">
                  <div className="relative flex-1">
                    <Key size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/40" />
                    <Input
                      className="pl-7 font-mono text-xs h-9"
                      placeholder={licenseKeyPrefix ? `${licenseKeyPrefix}XXXX-XXXX-XXXX-XXXX` : 'Enter license key'}
                      value={keyValue}
                      onChange={(e) => setKeyValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={loading || !keyValue.trim()}
                    className="font-mono text-xs h-9"
                  >
                    {loading ? '...' : 'Validate'}
                  </Button>
                </div>
                <p className="font-mono text-[9px] text-muted-foreground/50 mt-3">
                  Your key will be validated against the license server. Internet access required.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
