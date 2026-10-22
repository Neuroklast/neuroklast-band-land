import type { LegalLocale } from './legal-i18n'
import type { LegalConfig, LegalSection } from './legal-content'
import { formatServiceAddress } from './legal-content'
import { COMMERCE_ACTIONS } from './commerce-actions-i18n'
import { COMMERCE_LEGAL_COPY, commerceSections } from './commerce-legal-copy'
import { WITHDRAWAL_COPY } from './legal-withdrawal-i18n'

const MODEL_TITLE: Record<LegalLocale, string> = {
  de: 'Muster-Widerrufsformular', en: 'Model withdrawal form', uk: 'Зразок заяви про відмову',
  it: 'Modulo tipo di recesso', es: 'Modelo de formulario de desistimiento',
  pt: 'Modelo de formulário de livre resolução', ja: '契約撤回の書式例', ko: '계약 철회 양식 예시',
}
const ORDER_DATE: Record<LegalLocale, string> = {
  de: 'Bestellt am', en: 'Ordered on', uk: 'Дата замовлення',
  it: 'Ordinato il', es: 'Pedido el', pt: 'Encomendado em',
  ja: '注文日', ko: '주문일',
}
const FORM_DATE: Record<LegalLocale, string> = {
  de: 'Datum', en: 'Date', uk: 'Дата', it: 'Data', es: 'Fecha',
  pt: 'Data', ja: '日付', ko: '날짜',
}

/** One source for the localized public notice and the email explanation. */
export function withdrawalLegalSections(locale: LegalLocale, config?: LegalConfig): LegalSection[] {
  const translated = WITHDRAWAL_COPY[locale]
  const actions = COMMERCE_ACTIONS[locale]
  const seller = COMMERCE_LEGAL_COPY[locale]
  const address = config ? formatServiceAddress(config) : ''
  const recipient = address || seller.sections.seller[1]
  return [
    {
      id: 'full-withdrawal',
      title: translated.heading,
      paragraphs: [translated.period, translated.refunds, translated.exception, translated.details],
    },
    ...commerceSections('withdrawal', locale),
    {
      id: 'withdrawal-address',
      title: seller.links.notice,
      paragraphs: [
        recipient,
        config?.email || seller.sections.support[1],
      ],
    },
    {
      id: 'model-withdrawal',
      title: MODEL_TITLE[locale],
      paragraphs: [
        [
          recipient,
          '',
          actions.declaration,
          actions.order + ': __________________________',
          ORDER_DATE[locale] + ': __________________________',
          actions.name + ': __________________________',
          actions.email + ': __________________________',
          FORM_DATE[locale] + ': __________________________',
        ].join('\n'),
      ],
    },
  ]
}
