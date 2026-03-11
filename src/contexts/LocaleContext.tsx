import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { type Locale, t as translate } from '@/lib/i18n'
import i18n from '@/lib/i18n-config'
import { LocaleContext } from '@/hooks/use-locale'

const STORAGE_KEY = 'zd-locale'

function detectLocale(): Locale {
  // Check URL path first — /de or /de/ prefix triggers German
  try {
    const pathname = window.location.pathname
    if (pathname === '/de' || pathname.startsWith('/de/')) return 'de'
  } catch {
    // window unavailable (SSR)
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'de') return stored
  } catch {
    // localStorage unavailable
  }

  // Default to English — users can switch to German via the language picker
  return 'en'
}

// Async detection is no longer needed (locale defaults to stored preference or English).
// detectLocale() is called synchronously on mount.

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  // On mount, re-apply stored preference if it was set since initial render.
  // Wrapped in setTimeout to avoid synchronous setState in effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      if (cancelled) return
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === 'en' || stored === 'de') {
          setLocaleState(stored as Locale)
        }
      } catch {
        // localStorage unavailable
      }
    }, 0)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [])

  // Sync i18next language with locale state
  useEffect(() => {
    document.documentElement.lang = locale
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const t = useCallback(
    (key: string) => translate(key, locale),
    [locale],
  )

  return (
    <LocaleContext value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext>
  )
}
