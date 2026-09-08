'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUp } from '@phosphor-icons/react'
import type { FooterSlotProps } from '@/lib/types'
import { CookiePreferencesButton } from '@/components/CookieConsent'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { sanitizeExternalHref } from '@/lib/sanitize-href'
import { useLocale } from '@/contexts/LocaleContext'
import { useLenisContext } from '@/contexts/LenisContext'
import './styles.css'

export default function NeuroklastClassicFooter({
  socialLinks,
  siteName,
  genres,
  label,
  privacyPolicyUrl = '/privacy-policy',
  onAdminLogin,
  onImpressum,
  onDatenschutz,
}: FooterSlotProps) {
  const { t } = useLocale()
  const { scrollTo } = useLenisContext()
  const prefersReducedMotion = useReducedMotion()

  const socialEntries = Object.entries(socialLinks ?? {})

  return (
    <footer className="relative border-t border-primary/20 bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-14 md:py-16 relative pb-[max(3.5rem,env(safe-area-inset-bottom))]">
        {label ? (
          <p className="mb-6 text-center font-mono text-xs text-primary/80 tracking-wider uppercase">
            {label}
          </p>
        ) : null}

        <motion.div
          className="flex flex-col items-center gap-8"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          {genres && genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="nk-os-chip"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <LanguageSwitcher className="justify-center" />

          {socialEntries.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {socialEntries.map(([platform, url]) => (
                <a
                  key={platform}
                  href={sanitizeExternalHref(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nk-os-nav capitalize min-h-[44px] inline-flex items-center"
                >
                  {platform}
                </a>
              ))}
            </div>
          )}

          <div className="w-full max-w-xs mx-auto flex items-center gap-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <div className="w-1.5 h-1.5 rotate-45 border border-primary/60" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <div className="text-center space-y-3">
            <p className="text-xs font-mono text-muted-foreground tracking-wider">
              {`\u00A9 ${new Date().getFullYear()} ${(siteName || 'NEUROKLAST').toUpperCase()}. ALL RIGHTS RESERVED.`}
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-muted-foreground tracking-wider">
              {onImpressum && (
                <button
                  onClick={onImpressum}
                  className="nk-os-nav min-h-[44px]"
                >
                  {t('footer.legal')}
                </button>
              )}
              {onDatenschutz && (
                <button
                  onClick={onDatenschutz}
                  className="nk-os-nav min-h-[44px]"
                >
                  {t('footer.privacy')}
                </button>
              )}
              <CookiePreferencesButton
                privacyPolicyUrl={privacyPolicyUrl}
                className="nk-os-nav min-h-[44px] inline-flex items-center"
              />
              {onAdminLogin && (
                <button
                  onClick={onAdminLogin}
                  className="nk-os-nav min-h-[44px]"
                >
                  {t('footer.adminLogin')}
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => scrollTo(0, { offset: 0 })}
            className="nk-os-btn text-xs min-h-[44px]"
            aria-label={t('footer.backToTop')}
          >
            <ArrowUp size={14} />
            <span>{t('footer.backToTop')}</span>
          </button>
        </motion.div>
      </div>
    </footer>
  )
}

NeuroklastClassicFooter.displayName = 'NeuroklastClassicFooter'
