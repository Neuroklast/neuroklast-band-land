import { useState, useEffect, startTransition } from 'react'
import { isPrimaryInstance } from '@/lib/primary-check'
import { validateActivationKey } from '@/lib/activation'

type ActivationStatus = 'loading' | 'valid' | 'invalid' | 'bypassed'

const ACTIVATION_KEY = process.env.NEXT_PUBLIC_ACTIVATION_KEY as string | undefined
// SECURITY: hostname-based check; env vars like NEXT_PUBLIC_IS_PRIMARY must never be used here.
const IS_PRIMARY = isPrimaryInstance()

/** localStorage key for a user-supplied activation key (from wizard or URL hash). */
export const LOCAL_ACTIVATION_KEY = 'nk-local-activation-key'

/** Read the locally stored activation key (set by wizard or #activate= URL). */
export function getLocalActivationKey(): string | null {
  try {
    return localStorage.getItem(LOCAL_ACTIVATION_KEY) || null
  } catch {
    return null
  }
}

/** Persist a user-supplied activation key to localStorage. */
export function saveLocalActivationKey(key: string): void {
  try {
    localStorage.setItem(LOCAL_ACTIVATION_KEY, key)
  } catch {
    // localStorage not available
  }
}

/** Remove the locally stored activation key. */
export function clearLocalActivationKey(): void {
  try {
    localStorage.removeItem(LOCAL_ACTIVATION_KEY)
  } catch {
    // localStorage not available
  }
}

/** Extract and persist an activation key from the URL hash (#activate=KEY). */
function processUrlHashKey(): void {
  try {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    const match = hash.match(/[#&]?activate=([^&]+)/)
    if (!match?.[1]) return

    const urlKey = decodeURIComponent(match[1]).trim()
    if (!urlKey) return

    saveLocalActivationKey(urlKey)
    // Remove the activate param from the URL to avoid re-processing on reload
    const withoutActivate = hash.replace(/[#&]?activate=[^&]+/, '').replace(/^#$/, '')
    const newUrl = withoutActivate ? `#${withoutActivate.replace(/^#/, '')}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  } catch {
    // URL manipulation not available in this environment
  }
}

export function useActivationKey() {
  const [status, setStatus] = useState<ActivationStatus>(() => IS_PRIMARY ? 'bypassed' : 'loading')

  useEffect(() => {
    // Primäre Instanz (eigenes Deployment): immer gültig
    if (IS_PRIMARY) return

    // Check URL hash for #activate=KEY parameter (save to localStorage)
    processUrlHashKey()

    // Resolve the key to validate: ENV > localStorage
    const key = ACTIVATION_KEY?.trim() || getLocalActivationKey()?.trim() || ''

    // Kein Key konfiguriert → free-tier (activation optional)
    if (!key) {
      startTransition(() => setStatus('valid'))
      return
    }

    // Use activation.ts (which caches via nk-activation-result in sessionStorage)
    let cancelled = false
    validateActivationKey().then((result) => {
      if (cancelled) return
      startTransition(() => setStatus(result.valid ? 'valid' : 'invalid'))
    }).catch(() => {
      if (cancelled) return
      setStatus('invalid')
    })

    return () => { cancelled = true }
  }, [])

  return {
    status,
    isValid: status === 'valid' || status === 'bypassed',
    isLoading: status === 'loading',
  }
}
