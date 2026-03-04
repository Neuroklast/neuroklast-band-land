import { useState, useEffect } from 'react'

type ActivationStatus = 'loading' | 'valid' | 'invalid' | 'bypassed'

const ACTIVATION_KEY = import.meta.env.VITE_ACTIVATION_KEY as string | undefined
const IS_PRIMARY = import.meta.env.VITE_IS_PRIMARY === 'true'
const VALIDATE_URL =
  (import.meta.env.VITE_ACTIVATION_API_URL as string | undefined) ||
  'https://neuroklast-band-land.vercel.app/api/validate-key'
const CACHE_KEY = 'activation_status_cache'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24h Cache

interface CacheEntry {
  valid: boolean
  timestamp: number
}

function getCachedStatus(): boolean | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY)
      return null
    }
    return entry.valid
  } catch {
    return null
  }
}

function setCachedStatus(valid: boolean) {
  try {
    const entry: CacheEntry = { valid, timestamp: Date.now() }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // sessionStorage not available
  }
}

export function useActivationKey() {
  const [status, setStatus] = useState<ActivationStatus>('loading')

  useEffect(() => {
    // Primäre Instanz (eigenes Deployment): immer gültig
    if (IS_PRIMARY) {
      setStatus('bypassed')
      return
    }

    // Kein Key konfiguriert → ungültig
    if (!ACTIVATION_KEY) {
      setStatus('invalid')
      return
    }

    // Cache prüfen
    const cached = getCachedStatus()
    if (cached !== null) {
      setStatus(cached ? 'valid' : 'invalid')
      return
    }

    // API prüfen
    let cancelled = false
    const validate = async () => {
      try {
        const res = await fetch(VALIDATE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: ACTIVATION_KEY }),
          signal: AbortSignal.timeout(8000),
        })
        if (cancelled) return
        const data = await res.json()
        const valid = Boolean(data?.valid)
        setCachedStatus(valid)
        setStatus(valid ? 'valid' : 'invalid')
      } catch {
        if (cancelled) return
        // Bei Netzwerkfehler: kurz warten, dann invalid (fail closed)
        setStatus('invalid')
      }
    }

    validate()
    return () => { cancelled = true }
  }, [])

  return {
    status,
    isValid: status === 'valid' || status === 'bypassed',
    isLoading: status === 'loading',
  }
}
