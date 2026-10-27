import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { LegalDocumentContent } from '@/app/_components/public/LegalDocumentContent'
import { LEGAL_LOCALES, NOTICE_DOC_TITLE, PRIVACY_DOC_TITLE, INCOMPLETE_NOTICE } from '@/lib/legal-i18n'
import { COMMERCE_LEGAL_COPY, commerceSections } from '@/lib/commerce-legal-copy'
import { withdrawalLegalSections } from '@/lib/withdrawal-legal-sections'
import { buildLegalNoticeSections, buildPrivacyPolicySections } from '@/lib/legal-templates'
import { getLegalCompleteness, loadLegalConfig, DEFAULT_LEGAL_CONFIG } from '@/lib/legal-content'
import { createPublicClient } from '@/lib/supabaseServer'
import {
  LEGAL_DOCUMENTS, PUBLIC_LEGAL_LOCALES, validLegalLocale, validLegalDocument, localizedLegalPath, legalLanguageAlternates,
} from '@/lib/legal-routes'

export const revalidate = 60

type Params = { locale: string; document: string }
const siteOrigin = 'https://neuroklast.net'

export function generateStaticParams() {
  return PUBLIC_LEGAL_LOCALES.flatMap(locale => LEGAL_DOCUMENTS.map(document => ({ locale, document })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, document } = await params
  if (!validLegalLocale(locale) || !validLegalDocument(document)) return { robots: { index: false } }
  const title = document === 'legal-notice' ? NOTICE_DOC_TITLE[locale]
    : document === 'privacy-policy' ? PRIVACY_DOC_TITLE[locale]
      : COMMERCE_LEGAL_COPY[locale].docs[
        document === 'terms' ? 'terms' : document === 'purchase-info' ? 'purchase'
          : document === 'license-terms' ? 'license' : 'withdrawal'
      ]
  const path = localizedLegalPath(locale, document)
  return {
    title: title + ' | NEUROKLAST',
    description: title + ' – NEUROKLAST AUDIO',
    alternates: {
      canonical: siteOrigin + path,
      languages: Object.fromEntries(
        Object.entries(legalLanguageAlternates(document))
          .map(([lang, pathname]) => [lang, siteOrigin + pathname]),
      ),
    },
    openGraph: { title, url: siteOrigin + path, type: 'website', locale },
    robots: { index: true, follow: true },
  }
}

export default async function LocalizedLegalPage({ params }: { params: Promise<Params> }) {
  const { locale, document } = await params
  if (!validLegalDocument(document)) notFound()
  // Retire previously published translations without breaking old bookmarks.
  if (!validLegalLocale(locale)) {
    if ((LEGAL_LOCALES as readonly string[]).includes(locale)) {
      permanentRedirect(localizedLegalPath('en', document))
    }
    notFound()
  }
  let config = DEFAULT_LEGAL_CONFIG
  try { config = await loadLegalConfig(createPublicClient()) } catch { /* still render fallback */ }
  const translations = COMMERCE_LEGAL_COPY[locale]
  let title: string
  let sections
  if (document === 'legal-notice') {
    title = NOTICE_DOC_TITLE[locale]
    sections = buildLegalNoticeSections(config, locale)
  } else if (document === 'privacy-policy') {
    title = PRIVACY_DOC_TITLE[locale]
    sections = buildPrivacyPolicySections(config, locale)
  } else {
    const key = document === 'terms' ? 'terms' : document === 'purchase-info' ? 'purchase'
      : document === 'license-terms' ? 'license' : 'withdrawal'
    title = translations.docs[key]
    sections = key === 'withdrawal'
      ? withdrawalLegalSections(locale, config)
      : commerceSections(key, locale, config.termsText)
  }
  const incomplete = getLegalCompleteness(config).complete === false
  return (
    <LegalPageShell>
      <div lang={locale} className="bg-black text-white">
        <nav aria-label="Legal language versions" className="mx-auto flex max-w-3xl flex-wrap gap-3 px-4 pt-24 sm:px-6">
          {PUBLIC_LEGAL_LOCALES.map(lang => (
            <Link key={lang} href={localizedLegalPath(lang, document)}
              hrefLang={lang} lang={lang} aria-current={lang === locale ? 'page' : undefined}
              className={'min-h-11 border px-3 py-3 text-xs font-mono ' +
                (lang === locale ? 'border-red-600 text-white' : 'border-zinc-700 text-zinc-300 hover:border-zinc-400')}>
              {lang.toUpperCase()}
            </Link>
          ))}
        </nav>
        <LegalDocumentContent
          title={title} streamLabel={'// LEGAL.' + document.toUpperCase()}
          sections={sections} incomplete={incomplete && document === 'legal-notice'}
          incompleteMessage={INCOMPLETE_NOTICE[locale]}
          backHref="/" backLabel="NEUROKLAST"
        />
        <nav aria-label="Legal documents" className="mx-auto flex max-w-3xl flex-wrap gap-4 px-4 pb-20 text-sm sm:px-6">
          {LEGAL_DOCUMENTS.map(doc => (
            <Link key={doc} className="underline underline-offset-4 hover:text-red-400"
              href={localizedLegalPath(locale, doc)}>
              {doc === 'legal-notice' ? NOTICE_DOC_TITLE[locale] :
                doc === 'privacy-policy' ? PRIVACY_DOC_TITLE[locale] :
                translations.docs[doc === 'terms' ? 'terms' : doc === 'purchase-info' ? 'purchase' :
                  doc === 'license-terms' ? 'license' : 'withdrawal']}
            </Link>
          ))}
          <Link className="underline underline-offset-4" href="/withdrawal">{translations.links.withdrawal}</Link>
        </nav>
      </div>
    </LegalPageShell>
  )
}
