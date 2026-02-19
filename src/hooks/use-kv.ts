import { useState, useEffect, useCallback, useRef } from 'react'

/** Result reported to the optional onSaveResult callback after each remote write. */
export type KVSaveResult =
  | { ok: true }
  | { ok: false; status: number; error?: string }

/**
 * Custom KV hook backed by Vercel KV API routes, with localStorage fallback for local dev.
 * Uses /api/kv (Vercel KV) for persistence, with localStorage fallback for local dev.
 * Auth is handled via HttpOnly session cookies (set by /api/auth).
 *
 * Returns [value, updateValue, loaded] — `loaded` is true once the initial
 * KV/localStorage/default fetch has completed so consumers can avoid acting on
 * stale default data.
 *
 * Pass `options.onSaveResult` to be notified of remote-write outcomes (success,
 * 403 auth failure, 503 unavailable, network error, etc.) so callers can surface
 * clear feedback to the user without having to inspect fetch internals.
 */
export function useKV<T>(
  key: string,
  defaultValue: T,
  options?: { onSaveResult?: (result: KVSaveResult) => void },
): [T | undefined, (updater: T | ((current: T | undefined) => T)) => void, boolean] {
  const [value, setValue] = useState<T | undefined>(undefined)
  const [loaded, setLoaded] = useState(false)
  const initializedRef = useRef(false)
  const defaultRef = useRef(defaultValue)
  const loadedRef = useRef(false)
  // Keep a stable ref so updateValue doesn't need to re-create when the callback changes
  const onSaveResultRef = useRef(options?.onSaveResult)
  useEffect(() => {
    onSaveResultRef.current = options?.onSaveResult
  }, [options?.onSaveResult])

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
      if (loadedRef.current) {
        fetch('/api/kv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ key, value: newValue }),
        }).then(async res => {
          if (res.ok) {
            console.log(`KV: "${key}" saved globally ✓`)
            onSaveResultRef.current?.({ ok: true })
          } else if (res.status === 403) {
            console.warn(`KV: not authenticated (403) — "${key}" not persisted globally`)
            onSaveResultRef.current?.({ ok: false, status: 403, error: 'Not authenticated' })
          } else {
            try {
              const errorData = await res.json()
              const errorMessage: string = errorData.message || errorData.error || String(res.status)
              if (res.status === 503) {
                console.error(`KV service unavailable (503) for key "${key}":`, errorMessage)
                console.warn('Data is saved locally in localStorage but not synced to server.')
              } else {
                console.error(`KV POST failed (${res.status}) for key "${key}":`, errorData)
              }
              onSaveResultRef.current?.({ ok: false, status: res.status, error: errorMessage })
            } catch {
              console.warn(`KV POST failed (${res.status}) for key "${key}"`)
              onSaveResultRef.current?.({ ok: false, status: res.status })
            }
          }
        }).catch(err => {
          console.error('KV POST error:', err)
          onSaveResultRef.current?.({ ok: false, status: 0, error: err?.message || 'Network error' })
        })
      }

      return newValue
    })
  }, [key])

  return [value, updateValue, loaded]
}
