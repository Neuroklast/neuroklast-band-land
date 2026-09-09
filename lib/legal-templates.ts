import type { LegalConfig, LegalSection } from '@/lib/legal-content'
import {
  formatServiceAddress,
  getDataControllerLabel,
  getResponsibleAddress,
  getResponsibleName,
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
  const responsibleName = getResponsibleName(config)
  const responsibleAddress = getResponsibleAddress(config)

  const operatorLines: string[] = []
  if (address) operatorLines.push(address)
  if (config.phone) operatorLines.push(`${labels.phone}: ${config.phone}`)
  if (config.email) operatorLines.push(`${labels.email}: ${config.email}`)
  if (config.vatId) operatorLines.push(`${labels.vat}: ${config.vatId}`)

  return NOTICE_SECTION_ORDER.map((id) => {
    const section = copy[id]
    if (id === 'operator') {
      return {
        id,
        title: section.title,
        paragraphs: operatorLines.length > 0 ? operatorLines : [labels.configureOperator],
      }
    }
    if (id === 'responsible') {
      return {
        id,
        title: section.title,
        paragraphs: [
          responsibleName || labels.configureResponsible,
          ...(responsibleAddress ? [responsibleAddress] : []),
        ],
      }
    }
    return {
      id,
      title: section.title,
      paragraphs: section.paragraphs,
    }
  })
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
    ]
  }

  const copy = PRIVACY_COPY[locale]
  const labels = FIELD_LABEL[locale]
  const controller = getDataControllerLabel(config)
  const address = formatServiceAddress(config)
  const vars = { controller }

  return PRIVACY_SECTION_ORDER.map((id) => {
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
}
