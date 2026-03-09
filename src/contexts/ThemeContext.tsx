/**
 * Centralized Theme State Engine
 *
 * Provides a single React Context for theme state management with:
 * - Atomic theme persistence to localStorage (`nk-theme-cache` key)
 * - Synchronous DOM application via `applyThemeToDOM`
 * - SSR/hydration-safe design (reads from localStorage only on client)
 * - FOUC prevention through a dedicated cache key read by `theme-init.js`
 *
 * Priority chain for initial theme:
 *   1. User preference (localStorage `nk-theme-cache` / `kv:site-config`)
 *   2. Fallback (undefined → default theme)
 */

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { ThemeSettings } from '@/lib/types'
import { applyThemeToDOM } from '@/lib/theme-application'

// ── Cache key used by both this provider and public/theme-init.js ───────────
const THEME_CACHE_KEY = 'nk-theme-cache'

// ── Context shape ───────────────────────────────────────────────────────────

interface ThemeContextValue {
  /** Current theme settings (undefined while site config is still loading). */
  themeSettings: ThemeSettings | undefined
  /** Replace the active theme settings — persists to localStorage and updates DOM atomically. */
  setThemeSettings: (settings: ThemeSettings) => void
  /** Shorthand for `themeSettings?.activePreset`. */
  activePreset: string | undefined
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ── Provider ────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode
  /** Theme settings sourced from the site config (useSiteConfig). */
  themeSettings: ThemeSettings | undefined
  /** Callback to persist theme changes back to the site config store. */
  onChangeTheme: (settings: ThemeSettings) => void
}

export function ThemeProvider({
  children,
  themeSettings,
  onChangeTheme,
}: ThemeProviderProps) {
  // ── Apply theme to DOM whenever settings change ──────────────────────────
  useEffect(() => {
    applyThemeToDOM(themeSettings)
  }, [themeSettings])

  // ── Persist a fast-access cache so theme-init.js can restore on reload ───
  useEffect(() => {
    if (!themeSettings) return
    try {
      localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(themeSettings))
    } catch {
      // localStorage unavailable (SSR, private browsing quota, etc.)
    }
  }, [themeSettings])

  // ── Atomic setter: updates DOM + cache + config store in one call ─────────
  const setThemeSettings = useCallback(
    (settings: ThemeSettings) => {
      // 1. Immediate DOM update — no flicker
      applyThemeToDOM(settings)

      // 2. Synchronous localStorage write — survives page reload
      try {
        localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(settings))
      } catch {
        // ignore
      }

      // 3. Propagate to persistent config (useKV → Vercel KV / localStorage)
      onChangeTheme(settings)
    },
    [onChangeTheme],
  )

  // ── Memoised context value ───────────────────────────────────────────────
  const value = useMemo<ThemeContextValue>(
    () => ({
      themeSettings,
      setThemeSettings,
      activePreset: themeSettings?.activePreset,
    }),
    [themeSettings, setThemeSettings],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

// ── Consumer hook ───────────────────────────────────────────────────────────

export function useThemeEngine(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeEngine must be used within a ThemeProvider')
  }
  return ctx
}
