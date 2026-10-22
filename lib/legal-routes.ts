import { LEGAL_LOCALES, type LegalLocale } from './legal-i18n'

export const LEGAL_DOCUMENTS = ['terms', 'purchase-info', 'license-terms', 'withdrawal-policy', 'legal-notice', 'privacy-policy'] as const
export type LegalDocument = (typeof LEGAL_DOCUMENTS)[number]

export function validLegalLocale(value: string): value is LegalLocale {
  return (LEGAL_LOCALES as readonly string[]).includes(value)
}

export function validLegalDocument(value: string): value is LegalDocument {
  return (LEGAL_DOCUMENTS as readonly string[]).includes(value)
}

export function localizedLegalPath(locale: LegalLocale, document: LegalDocument): string {
  return '/legal/' + locale + '/' + document
}

/** Each locale has its own indexable URL with a self-referencing canonical. */
export function legalLanguageAlternates(document: LegalDocument): Record<string, string> {
  return {
    ...Object.fromEntries(LEGAL_LOCALES.map(locale => [locale, localizedLegalPath(locale, document)])),
    'x-default': localizedLegalPath('en', document),
  }
}

/** Existing unprefixed URLs remain usable for backward compatibility. */
export const LEGACY_LEGAL_PATHS: Record<LegalDocument, string> = {
  'terms': '/terms',
  'purchase-info': '/purchase-info',
  'license-terms': '/license-terms',
  'withdrawal-policy': '/withdrawal-policy',
  'legal-notice': '/legal-notice',
  'privacy-policy': '/privacy-policy',
}
