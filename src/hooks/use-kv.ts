import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom KV hook backed by Vercel KV API routes, with localStorage fallback for local dev.
 * Uses /api/kv (Vercel KV) for persistence, with localStorage fallback for local dev.
 * Auth is handled via HttpOnly session cookies (set by /api/auth).
 *
 * Returns [value, updateValue, loaded] — `loaded` is true once the initial
 * KV/localStorage/default fetch has completed so consumers can avoid acting on
 * stale default data.
 */
export function useKV<T>(key: string, defaultValue: T): [T | undefined, (updater: T | ((current: T | undefined) => T)) => void, boolean] {
  const [value, setValue] = useState<T | undefined>(undefined)
  const [loaded, setLoaded] = useState(false)
  const initializedRef = useRef(false)
  const defaultRef = useRef(defaultValue)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    fetch(`/api/kv?key=${encodeURIComponent(key)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.value !== null && data.value !== undefined) {
          setValue(data.value as T)
          // Keep localStorage in sync as backup
          try { localStorage.setItem(`kv:${key}`, JSON.stringify(data.value)) } catch { /* ignore */ }
        } else {
          // API returned null — try localStorage before falling back to default
          try {
            const stored = localStorage.getItem(`kv:${key}`)
            if (stored !== null) {
              setValue(JSON.parse(stored) as T)
              return
            }
          } catch { /* ignore */ }
          setValue(defaultRef.current)
        }
      })
      .catch(() => {
        // API not available (local dev), try localStorage as last resort
        try {
          const stored = localStorage.getItem(`kv:${key}`)
          if (stored !== null) {
            setValue(JSON.parse(stored) as T)
          } else {
            setValue(defaultRef.current)
          }
        } catch {
          setValue(defaultRef.current)
        }
      })
      .finally(() => {
        loadedRef.current = true
        setLoaded(true)
      })
  }, [key])

  const updateValue = useCallback((updater: T | ((current: T | undefined) => T)) => {
    setValue(prev => {
      const newValue = typeof updater === 'function'
        ? (updater as (current: T | undefined) => T)(prev)
        : updater

      const persistLocally = () => {
        try {
          localStorage.setItem(`kv:${key}`, JSON.stringify(newValue))
        } catch (e) {
          console.warn('Failed to persist KV:', e)
        }
      }

      // Always persist to localStorage as a backup
      persistLocally()

      // Write to the remote KV once the initial load has finished.
      // Auth is handled via HttpOnly session cookie (sent automatically).
      // Non-admin writes will get 403 which we suppress silently.
      if (loadedRef.current) {
        fetch('/api/kv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ key, value: newValue }),
        }).then(async res => {
          if (res.status === 403) {
            // Session may have expired — check auth status and reload if needed
            // so the next login starts with a clean state (no stale 503 errors)
            try {
              const authRes = await fetch('/api/auth', { credentials: 'same-origin' })
              if (authRes.ok) {
                const authData = await authRes.json()
                if (!authData.authenticated) {
                  window.location.reload()
                  return
                }
              }
            } catch { /* ignore — transient network error */ }
            return
          }
          if (!res.ok) {
            try {
              const errorData = await res.json()
              if (res.status === 503) {
                console.error(`KV service unavailable (${res.status}) for key "${key}":`, errorData.message || errorData.error)
                console.warn('Data is saved locally in localStorage but not synced to server.')
              } else {
                console.error(`KV POST failed (${res.status}) for key "${key}":`, errorData)
              }
            } catch {
              console.warn(`KV POST failed (${res.status}) for key "${key}"`)
            }
          }
        }).catch(err => {
          console.error('KV POST error:', err)
        })
      }

      return newValue
    })
  }, [key])

  return [value, updateValue, loaded]
}
