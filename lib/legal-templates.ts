import type { LegalConfig, LegalSection } from '@/lib/legal-content'
import {
  formatServiceAddress,
  getDataControllerLabel,
  hasEditorialResponsible,
} from '@/lib/legal-content'
import {
  FIELD_LABEL,
  LEGAL_LOCALES,
  NOTICE_COPY,
  NOTICE_DOC_TITLE,
  NOTICE_SECTION_ORDER,
  PRIVACY_COPY,
  PRIVACY_DOC_TITLE,
  PRIVACY_SECTION_ORDER,
  type LegalLocale,
} from '@/lib/legal-i18n'

export type { LegalLocale }

export function resolveLegalLocale(locale?: string | null): LegalLocale {
  if (!locale) return 'en'
  const base = locale.toLowerCase().split('-')[0]
  return (LEGAL_LOCALES as readonly string[]).includes(base)
    ? (base as LegalLocale)
    : 'en'
}

export function legalNoticeTitle(locale: LegalLocale): string {
  return NOTICE_DOC_TITLE[locale]
}

export function privacyPolicyTitle(locale: LegalLocale): string {
  return PRIVACY_DOC_TITLE[locale]
}

function fillPlaceholders(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`)
}

/**
 * Admin custom copy is a single German blob. Using it for every locale
 * replaced translated templates (ES title + DE body). Keep it on `de` only.
 */
export function usesCustomLegalCopy(custom: string | undefined, locale: LegalLocale): boolean {
  return Boolean(custom?.trim()) && locale === 'de'
}

export function buildLegalNoticeSections(
  config: LegalConfig,
  locale: LegalLocale = 'en',
): LegalSection[] {
  if (usesCustomLegalCopy(config.legalNoticeCustom, locale) && config.legalNoticeCustom) {
    return [
      {
        id: 'custom',
        title: legalNoticeTitle(locale),
        paragraphs: [config.legalNoticeCustom],
      },
    ]
  }

  const copy = NOTICE_COPY[locale]
  const labels = FIELD_LABEL[locale]
  const address = formatServiceAddress(config)

  const operatorLines: string[] = []
  if (address) operatorLines.push(address)
  if (config.phone) operatorLines.push(`${labels.phone}: ${config.phone}`)
  if (config.email) operatorLines.push(`${labels.email}: ${config.email}`)
  if (config.vatId) operatorLines.push(`${labels.vat}: ${config.vatId}`)

  const sections: LegalSection[] = []
  for (const id of NOTICE_SECTION_ORDER) {
    const section = copy[id]
    if (id === 'operator') {
      sections.push({
        id,
        title: section.title,
        paragraphs: operatorLines.length > 0 ? operatorLines : [labels.configureOperator],
      })
      continue
    }
    if (id === 'responsible') {
      const name = config.responsibleName?.trim()
      const responsibleAddress = config.responsibleAddress?.trim()
      if (!hasEditorialResponsible(config) || !name || !responsibleAddress) continue
      sections.push({
        id,
        title: section.title,
        paragraphs: [name, responsibleAddress],
      })
      continue
    }
    sections.push({
      id,
      title: section.title,
      paragraphs: section.paragraphs,
    })
  }
  return sections
}


/** Checkout and withdrawal processing must be disclosed even with custom policy copy. */
function commercePrivacySection(locale: LegalLocale): LegalSection {
  if (locale === 'de') {
    return {
      id: 'digital-commerce',
      title: 'Kundenkonto, Software-Lizenzen, Zahlungen und Widerruf',
      paragraphs: [
        'Beim Anmelden am Lizenzkonto verarbeiten wir deine E-Mail-Adresse und eine von Supabase verwaltete Benutzerkennung. Der Einmalcode dient der Anmeldung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO zur Verwaltung deiner Lizenz und zur Durchführung vorvertraglicher Maßnahmen.',
        'Bei Bestellungen speichern wir die Zuordnung zum Produkt, Kundenkennung, E-Mail-Adresse, Preisreferenz, Bestellstatus sowie Stripe-Checkout- und Zahlungsreferenzen. Bei Lizenzaktivierung verarbeiten wir Lizenzkennung, Lizenzstatus, Aktivierungszeitpunkte und gerätebezogene Kennungen. Das dient der Vertragserfüllung und dem Schutz gegen unberechtigte Mehrfachaktivierungen (Art. 6 Abs. 1 lit. b DSGVO).',
        'Zahlungen werden über Stripe abgewickelt. Stripe erhält die zur Zahlungsabwicklung notwendigen Bestell-, Kontakt- und Rechnungsdaten und erhebt gegebenenfalls weitere Zahlungsdaten direkt. Wir speichern keine vollständigen Kartendaten. Hinweise zur eigenständigen Datenverarbeitung durch Stripe findest du unter https://stripe.com/de/privacy. Abhängig von der Verarbeitung können Daten in Drittländer übertragen werden.',
        'Bestell- und Rechnungsunterlagen werden nach den jeweils geltenden handels- und steuerrechtlichen Aufbewahrungspflichten gespeichert. Lizenz- und Gerätedaten werden grundsätzlich für die Vertragsdauer sowie die notwendige Abwicklung verbleibender Ansprüche benötigt. Nicht mehr benötigte Kundendaten werden gelöscht, soweit keine Aufbewahrungspflichten entgegenstehen. Für Lösch-, Auskunfts- und Berichtigungsanfragen gilt die Kontaktadresse im Impressum.',
        'Bei einer elektronischen Widerrufserklärung verarbeiten wir Name, E-Mail-Adresse, Vertragsidentifikationsdaten, Eingangszeitpunkt und eine Referenznummer zur Bearbeitung und Nachweisführung gemäß Art. 6 Abs. 1 lit. c DSGVO in Verbindung mit den verbraucherrechtlichen Pflichten. Die Eingangsbestätigung und die Benachrichtigung an den Anbieter werden über Resend per E-Mail versendet. Diese Korrespondenz wird nach dem notwendigen Bearbeitungs- und Aufbewahrungszeitraum gelöscht.',
      ],
    }
  }
  return {
    id: 'digital-commerce',
    title: 'Customer accounts, digital licences, payments and withdrawal',
    paragraphs: [
      'Email-based customer sign-in uses a Supabase user identifier and your email address. Sign-in codes enable access to licence management. Legal basis: Art. 6(1)(b) GDPR (contract performance and pre-contractual steps).',
      'Orders associate the product, user ID, email, price reference, order status and Stripe payment/session references. Licence management processes licence IDs, status, activation timestamps and device identifiers to provide the licensed software and enforce activation limits. Legal basis: Art. 6(1)(b) GDPR.',
      'Stripe handles payments and receives billing, contact and order information necessary to process them. Payment card details are collected by Stripe, not stored by us. Stripe information: https://stripe.com/privacy. Cross-border processing may occur.',
      'Orders and invoicing records are retained where applicable law requires. Licence and activation records are held for the relevant contractual period and any necessary handling of outstanding claims. Other personal data is deleted when no longer necessary, unless statutory retention duties apply. Requests for access or deletion can be sent to the contact in our Legal Notice.',
      'When submitting an online withdrawal, we process your name, email, contract identifier, timestamp and reference number to receive and document the declaration (Art. 6(1)(c) GDPR). Resend sends the provider notification and customer receipt. Related correspondence is retained only for the necessary processing and statutory retention period.',
    ],
  }
}

export function buildPrivacyPolicySections(
  config: LegalConfig,
  locale: LegalLocale = 'en',
): LegalSection[] {
  if (usesCustomLegalCopy(config.privacyPolicyCustom, locale) && config.privacyPolicyCustom) {
    return [
      {
        id: 'custom',
        title: privacyPolicyTitle(locale),
        paragraphs: [config.privacyPolicyCustom],
      },
      commercePrivacySection(locale),
    ]
  }

  const copy = PRIVACY_COPY[locale]
  const labels = FIELD_LABEL[locale]
  const controller = getDataControllerLabel(config)
  const address = formatServiceAddress(config)
  const vars = { controller }

  const sections: LegalSection[] = PRIVACY_SECTION_ORDER.map((id) => {
    const section = copy[id]
    let paragraphs = section.paragraphs.map((p) => fillPlaceholders(p, vars))
    if (id === 'controller' && address) {
      paragraphs = [
        paragraphs[0],
        `${labels.postal}:\n${address}`,
        ...paragraphs.slice(1),
      ]
    }
    return { id, title: section.title, paragraphs }
  })
  return [...sections, commercePrivacySection(locale)]
}
