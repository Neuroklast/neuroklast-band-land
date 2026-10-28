'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUp } from '@phosphor-icons/react'
import type { FooterSlotProps } from '@/lib/types'
import { CookiePreferencesButton } from '@/components/CookieConsent'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { sanitizeExternalHref } from '@/lib/sanitize-href'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveLegalLocale } from '@/lib/legal-templates'
import { COMMERCE_LEGAL_COPY } from '@/lib/commerce-legal-copy'
import { localizedLegalPath } from '@/lib/legal-routes'
import { useLenisContext } from '@/contexts/LenisContext'
import './styles.css'

export default function NeuroklastClassicFooter({
  socialLinks,
  siteName: _siteName,
  label,
  legalNoticeUrl = '/legal-notice',
  privacyPolicyUrl = '/privacy-policy',
  onAdminLogin,
}: FooterSlotProps) {
  const { t, locale } = useLocale()
  const legalLocale = resolveLegalLocale(locale)
  const shopLinks = COMMERCE_LEGAL_COPY[legalLocale].links
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
              {t('footer.copyrightLine').replace('{0}', String(new Date().getFullYear()))}
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-muted-foreground tracking-wider">
              <Link href={sanitizeExternalHref(legalNoticeUrl) ?? '/legal-notice'} className="nk-os-nav min-h-[44px] inline-flex items-center">
                {t('footer.legal')}
              </Link>
              <Link href={sanitizeExternalHref(privacyPolicyUrl) ?? '/privacy-policy'} className="nk-os-nav min-h-[44px] inline-flex items-center">
                {t('footer.privacy')}
              </Link>
              <Link
                href="/withdrawal"
                aria-label={shopLinks.withdrawal}
                className="inline-flex min-h-[48px] items-center justify-center rounded-sm border-2 border-primary bg-primary/15 px-4 py-2 font-mono text-sm font-bold text-foreground outline-offset-4 transition-colors hover:bg-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {shopLinks.withdrawal}
              </Link>
              <Link href={localizedLegalPath(legalLocale, "withdrawal-policy")} className="nk-os-nav min-h-[44px] inline-flex items-center">
                {COMMERCE_LEGAL_COPY[legalLocale].docs.withdrawal}
              </Link>
              <Link href={localizedLegalPath(legalLocale, "purchase-info")} className="nk-os-nav min-h-[44px] inline-flex items-center">
                {shopLinks.purchase}
              </Link>
              <Link href={localizedLegalPath(legalLocale, "license-terms")} className="nk-os-nav min-h-[44px] inline-flex items-center">
                {shopLinks.licence}
              </Link>
              <Link href={localizedLegalPath(legalLocale, "terms")} className="nk-os-nav min-h-[44px] inline-flex items-center">
                {shopLinks.terms}
              </Link>
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
