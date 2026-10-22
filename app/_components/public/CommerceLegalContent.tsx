'use client'

import Link from 'next/link'
import type { LegalConfig } from '@/lib/legal-content'
import { formatServiceAddress } from '@/lib/legal-content'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveLegalLocale } from '@/lib/legal-templates'
import { COMMERCE_LEGAL_COPY, commerceSections } from '@/lib/commerce-legal-copy'
import { localizedLegalPath } from '@/lib/legal-routes'
import { withdrawalLegalSections } from '@/lib/withdrawal-legal-sections'
import { LegalDocumentContent } from './LegalDocumentContent'

type Doc = 'terms' | 'purchase' | 'withdrawal' | 'license'

const paths = {
  terms: '/terms',
  purchase: '/purchase-info',
  withdrawal: '/withdrawal-policy',
  license: '/license-terms',
} as const

/** Site language switcher controls the public legal documents just like Impressum. */
export function CommerceLegalContent({ document, config }: { document: Doc; config?: LegalConfig }) {
  const { locale } = useLocale()
  const lang = resolveLegalLocale(locale)
  const copy = COMMERCE_LEGAL_COPY[lang]
  const sections = document === 'withdrawal'
    ? withdrawalLegalSections(lang, config)
    : commerceSections(document, lang)
  return (
    <>
      <LegalDocumentContent title={copy.docs[document]} streamLabel={'// SOFTWARE.' + document.toUpperCase()}
        sections={sections} backHref="/" backLabel={lang === 'de' ? 'Zur Startseite' : 'Home'} />
      <nav className="mx-auto max-w-3xl space-y-4 px-5 pb-24 text-sm" aria-label="Related legal information">
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          <Link className="underline underline-offset-4" href={localizedLegalPath(lang, 'legal-notice')}>{copy.links.notice}</Link>
          <Link className="underline underline-offset-4" href={localizedLegalPath(lang, 'privacy-policy')}>{copy.links.privacy}</Link>
          <Link className="underline underline-offset-4" href="/withdrawal">{copy.links.withdrawal}</Link>
          <Link className="underline underline-offset-4" href={localizedLegalPath(lang, 'terms')}>{copy.links.terms}</Link>
          <Link className="underline underline-offset-4" href={localizedLegalPath(lang, 'license-terms')}>{copy.links.licence}</Link>
          <Link className="underline underline-offset-4" href={localizedLegalPath(lang, 'purchase-info')}>{copy.links.purchase}</Link>
        </div>
        <p className="text-zinc-500">{lang === 'de'
          ? 'Die Angaben zum Verkäufer stammen aus der Verwaltung. Übersetzungen und produktspezifische Vertragsbedingungen müssen vor dem Verkaufsstart geprüft werden.'
          : 'Seller details come from the website settings. Translations and product-specific contractual terms must be reviewed before sales start.'}</p>
        <p className="font-mono text-xs text-zinc-500">{paths[document]}</p>
      </nav>
    </>
  )
}
