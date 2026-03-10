import { createContext, useContext } from 'react'
import type { ThemeSettings } from '@/lib/types'

export interface ThemeContextValue {
  /** Current theme settings (undefined while site config is still loading). */
  themeSettings: ThemeSettings | undefined
  /** Replace the active theme settings — persists to localStorage and updates DOM atomically. */
  setThemeSettings: (settings: ThemeSettings) => void
  /** Shorthand for `themeSettings?.activePreset`. */
  activePreset: string | undefined
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export const useThemeEngine = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeEngine must be used within a ThemeProvider')
  }
  return ctx
}
