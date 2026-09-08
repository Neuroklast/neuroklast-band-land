'use client'

import { useLocale } from '@/contexts/LocaleContext'
import type { Locale } from '@/lib/i18n'

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, languages, t } = useLocale()

  if (languages.length <= 1) return null

  return (
    <div className={`flex flex-col items-center gap-3 ${className ?? ''}`}>
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
        {t('nav.language')}
      </p>
      <div
        className="flex max-w-xl flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label={t('nav.language')}
      >
        {languages.map((language) => {
          const active = language.code === locale
          return (
            <button
              key={language.code}
              type="button"
              onClick={() => setLocale(language.code as Locale)}
              aria-pressed={active}
              aria-label={language.label}
              title={language.label}
              className={`inline-flex min-h-[44px] min-w-[3.25rem] items-center justify-center border px-3 font-mono text-xs uppercase tracking-[0.18em] transition-colors ${
                active
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border/80 text-muted-foreground hover:border-primary/60 hover:text-foreground'
              }`}
            >
              {language.code}
            </button>
          )
        })}
      </div>
    </div>
  )
}
