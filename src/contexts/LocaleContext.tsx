import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { type Locale, t as translate } from '@/lib/i18n'
import i18n from '@/lib/i18n-config'
import { LocaleContext } from '@/hooks/use-locale'

const STORAGE_KEY = 'zd-locale'

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'de') return stored
  } catch {
    // localStorage unavailable
  }

  // Default to English — users can switch to German via the language picker
  return 'en'
}

async function detectLocaleAsync(): Promise<Locale> {
  // No-op: locale defaults to English; only stored preference is respected
  return detectLocale()
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  // Async geo detection on mount if no stored preference
  useEffect(() => {
    let cancelled = false
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'en' || stored === 'de') return
    } catch {
      // localStorage unavailable
    }

    detectLocaleAsync().then((detected) => {
      if (!cancelled) setLocaleState(detected)
    })

    return () => { cancelled = true }
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
