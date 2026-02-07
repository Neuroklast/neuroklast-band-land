import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom KV hook backed by Vercel KV API routes, with localStorage fallback for local dev.
 * Uses /api/kv (Vercel KV) for persistence, with localStorage fallback for local dev.
 * The admin token from sessionStorage is sent with write requests for auth.
 */
export function useKV<T>(key: string, defaultValue: T): [T | undefined, (updater: T | ((current: T | undefined) => T)) => void] {
  const [value, setValue] = useState<T | undefined>(undefined)
  const initializedRef = useRef(false)
  const defaultRef = useRef(defaultValue)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    fetch(`/api/kv?key=${encodeURIComponent(key)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.value !== null && data.value !== undefined) {
          setValue(data.value as T)
        } else {
          setValue(defaultRef.current)
        }
      })
      .catch(() => {
        // API not available (local dev), try localStorage
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
  }, [key])

  const updateValue = useCallback((updater: T | ((current: T | undefined) => T)) => {
    setValue(prev => {
      const newValue = typeof updater === 'function'
        ? (updater as (current: T | undefined) => T)(prev)
        : updater

      const adminToken = sessionStorage.getItem('admin-token') || ''

      fetch('/api/kv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ key, value: newValue }),
      }).catch(() => {
        // API not available (local dev), fallback to localStorage
        try {
          localStorage.setItem(`kv:${key}`, JSON.stringify(newValue))
        } catch (e) {
          console.warn('Failed to persist KV:', e)
        }
      })

      return newValue
    })
  }, [key])

  return [value, updateValue]
}
