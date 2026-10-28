import type { LegalSection } from '@/lib/legal-content'

/**
 * Separate purchase conditions for downloadable sample and preset packs.
 * These do not grant rights to third-party samples or presets. A product's
 * individually reviewed usage notes must be disclosed before checkout.
 */
export const DIGITAL_PACK_TERMS_VERSION = 'digital-pack-sale-2026-10-28'

export type DigitalPackTermsLocale = 'de' | 'en'
export function digitalPackTermsLocale(value: string | null | undefined): DigitalPackTermsLocale {
  return value?.toLowerCase().startsWith('de') ? 'de' : 'en'
}

const sections: Record<DigitalPackTermsLocale, LegalSection[]> = {
  de: [
    { id: 'scope', title: 'Geltungsbereich', paragraphs: [
      'Diese Kaufbedingungen gelten für einmalig erworbene, digital bereitgestellte Sound- und Preset-Pakete im NEUROKLAST-Shop. Es handelt sich nicht um eine Softwarelizenz für das NEUROKORE-Plug-in.',
    ] },
    { id: 'seller', title: 'Vertragspartner und Zahlung', paragraphs: [
      'Die Angaben zum verantwortlichen Inhalteanbieter und Ansprechpartner stehen im Impressum. Falls Stripe Managed Payments eingesetzt wird, ist der im Stripe-Checkout ausgewiesene Merchant of Record Vertragspartner der Verkaufstransaktion und für die dort ausgewiesene Rechnungsstellung zuständig. Der Inhalteanbieter bleibt Ansprechpartner für die Bereitstellung und die angegebenen Nutzungsrechte. Maßgeblich sind die Angaben unmittelbar vor der zahlungspflichtigen Bestellung.',
    ] },
    { id: 'product', title: 'Inhalt und Nutzungsrechte', paragraphs: [
      'Vertragsgegenstand ist die auf der jeweiligen Produktseite beschriebene ZIP-Datei. Dateiformate, Voraussetzungen und gegebenenfalls erforderliche Plug-ins stehen dort. Die auf der Produktseite angegebenen Nutzungshinweise müssen vor dem Kauf gelesen werden. Diese allgemeinen Kaufbedingungen ersetzen keine produktspezifische Rechteklärung und räumen keine darüber hinausgehenden Rechte an fremden Inhalten ein.',
    ] },
    { id: 'price', title: 'Preis, Bestellung und Bereitstellung', paragraphs: [
      'Der verbindliche Gesamtpreis einschließlich anfallender Steuern wird im Checkout vor Abgabe der zahlungspflichtigen Bestellung angezeigt. Der Kauf ist einmalig und beinhaltet kein Abonnement. Nach bestätigter Zahlung steht das Paket im Kundenkonto zum Herunterladen bereit. Ein körperlicher Versand erfolgt nicht.',
    ] },
    { id: 'rights', title: 'Gesetzliche Rechte', paragraphs: [
      'Gesetzliche Verbraucherrechte bei Mängeln digitaler Produkte und notwendige Aktualisierungen bleiben unberührt. Für Verbraucher gilt grundsätzlich das gesetzliche Widerrufsrecht. Ein Download allein führt nicht zum Erlöschen dieses Rechts. Die Widerrufsbelehrung und die elektronische Widerrufsfunktion sind über die Website erreichbar.',
    ] },
    { id: 'support', title: 'Kontakt und anwendbares Recht', paragraphs: [
      'Kontaktinformationen stehen im Impressum. Es gilt deutsches Recht, soweit zwingende Verbraucherrechte am gewöhnlichen Aufenthaltsort dadurch nicht eingeschränkt werden.',
    ] },
  ],
  en: [
    { id: 'scope', title: 'Scope', paragraphs: [
      'These purchase terms apply to one-time purchases of downloadable sound and preset packs from the NEUROKLAST store. A pack purchase does not include a NEUROKORE software licence.',
    ] },
    { id: 'seller', title: 'Seller and payment', paragraphs: [
      'The legal notice identifies the content provider and support contact. Where Stripe Managed Payments is used, the merchant of record identified in Stripe Checkout is the seller for the payment transaction and associated invoice. The content provider remains responsible for supplying the digital content and its stated usage permissions. The final checkout identifies the applicable contracting parties.',
    ] },
    { id: 'product', title: 'Product and permitted use', paragraphs: [
      'You purchase the downloadable ZIP archive described on the product page. Formats, requirements and required plug-ins are disclosed there. The product-specific usage notes must be reviewed before purchase. These general purchase terms do not replace rights clearance or grant additional rights to third-party content.',
    ] },
    { id: 'price', title: 'Price, order and delivery', paragraphs: [
      'The final total including applicable tax is shown before you place the binding order. This is a one-time purchase, not a subscription. After payment is confirmed, the pack is made available in your customer downloads. No physical goods are shipped.',
    ] },
    { id: 'rights', title: 'Statutory rights', paragraphs: [
      'Mandatory statutory rights concerning defective digital products and necessary updates are not excluded. Consumers generally have statutory withdrawal rights. Downloading alone does not automatically extinguish those rights. The withdrawal notice and online withdrawal function remain available on the website.',
    ] },
    { id: 'support', title: 'Contact and governing law', paragraphs: [
      'Contact details are in the legal notice. German law applies without depriving consumers of mandatory protections in their country of habitual residence.',
    ] },
  ],
}

export function digitalPackTermsSections(locale: DigitalPackTermsLocale): LegalSection[] {
  return sections[locale]
}

export function digitalPackTermsSnapshot(locale: DigitalPackTermsLocale): string {
  return sections[locale].map(section => section.title + '\n' + section.paragraphs.join('\n')).join('\n\n')
}
