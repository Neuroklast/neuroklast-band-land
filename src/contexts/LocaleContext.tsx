import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { type Locale, t as translate } from '@/lib/i18n'
import i18n from '@/lib/i18n-config'
import { LocaleContext } from '@/hooks/use-locale'

const STORAGE_KEY = 'zd-locale'

function detectLocale(): Locale {
  return 'en'
}

// Async detection is no longer needed (locale defaults to stored preference or English).
// detectLocale() is called synchronously on mount.

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

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
