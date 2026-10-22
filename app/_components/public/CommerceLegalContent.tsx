'use client'

import Link from 'next/link'
import type { LegalConfig } from '@/lib/legal-content'
import { formatServiceAddress } from '@/lib/legal-content'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveLegalLocale } from '@/lib/legal-templates'
import { COMMERCE_LEGAL_COPY, commerceSections } from '@/lib/commerce-legal-copy'
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
  const sections = commerceSections(document, lang)
  if (document === 'withdrawal') {
    const address = config ? formatServiceAddress(config) : ''
    const english = lang === 'en'
    const german = lang === 'de'
    sections.unshift({
      id: 'withdrawal-process',
      title: german ? 'Frist und Erklärung' : english ? 'Period and notification' : copy.docs.withdrawal,
      paragraphs: [
        german
          ? 'Verbraucher können einen Vertrag über digitale Inhalte grundsätzlich innerhalb von vierzehn Tagen ab Vertragsschluss ohne Angabe von Gründen widerrufen. Zur Fristwahrung genügt die rechtzeitige Absendung einer eindeutigen Erklärung, zum Beispiel über das Online-Formular oder per E-Mail.'
          : 'Consumers can generally withdraw from a contract for digital content within fourteen days after the contract is concluded, without giving reasons. Sending a clear declaration before the deadline is sufficient. You may use the online form or email.',
        german
          ? 'Wenn der Widerruf wirksam ist, werden erhaltene Zahlungen unverzüglich und spätestens vierzehn Tage nach Eingang des Widerrufs grundsätzlich über dasselbe Zahlungsmittel zurückerstattet. Hierfür werden keine Entgelte berechnet.'
          : 'Following a valid withdrawal, payments received will generally be refunded using the original payment method without fees, promptly and no later than fourteen days after receipt of the withdrawal notice.',
        german
          ? 'Bei nicht auf einem körperlichen Datenträger gelieferten digitalen Inhalten kann das Widerrufsrecht vorzeitig erlöschen, wenn sämtliche gesetzlichen Voraussetzungen des § 356 Abs. 6 BGB erfüllt sind. Ein Download allein genügt dafür nicht.'
          : 'For digital content not supplied on a tangible medium, early loss of the withdrawal right is possible only if all statutory conditions under § 356(6) BGB are satisfied. Downloading alone is not sufficient.',
      ],
    })
    sections.push({
      id: 'withdrawal-address',
      title: copy.links.notice,
      paragraphs: [
        address || (german ? 'Verkäuferanschrift siehe Impressum.' : 'Seller address: see Legal Notice.'),
        config?.email || (german ? 'Kontakt-E-Mail siehe Impressum.' : 'Contact email: see Legal Notice.'),
      ],
    })
  }
  return (
    <>
      <LegalDocumentContent title={copy.docs[document]} streamLabel={'// SOFTWARE.' + document.toUpperCase()}
        sections={sections} backHref="/" backLabel={lang === 'de' ? 'Zur Startseite' : 'Home'} />
      <nav className="mx-auto max-w-3xl space-y-4 px-5 pb-24 text-sm" aria-label="Related legal information">
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          <Link className="underline underline-offset-4" href="/legal-notice">{copy.links.notice}</Link>
          <Link className="underline underline-offset-4" href="/privacy-policy">{copy.links.privacy}</Link>
          <Link className="underline underline-offset-4" href="/withdrawal">{copy.links.withdrawal}</Link>
          <Link className="underline underline-offset-4" href="/terms">{copy.links.terms}</Link>
          <Link className="underline underline-offset-4" href="/license-terms">{copy.links.licence}</Link>
          <Link className="underline underline-offset-4" href="/purchase-info">{copy.links.purchase}</Link>
        </div>
        <p className="text-zinc-500">{lang === 'de'
          ? 'Die Angaben zum Verkäufer stammen aus der Verwaltung. Übersetzungen und produktspezifische Vertragsbedingungen müssen vor dem Verkaufsstart geprüft werden.'
          : 'Seller details come from the website settings. Translations and product-specific contractual terms must be reviewed before sales start.'}</p>
        <p className="font-mono text-xs text-zinc-500">{paths[document]}</p>
      </nav>
    </>
  )
}
