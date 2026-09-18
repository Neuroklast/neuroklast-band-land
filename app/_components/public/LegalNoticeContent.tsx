'use client'

import type { LegalConfig } from '@/lib/legal-content'
import { getLegalCompleteness } from '@/lib/legal-content'
import { INCOMPLETE_NOTICE, NOTICE_DOC_TITLE, NOTICE_STREAM } from '@/lib/legal-i18n'
import { buildLegalNoticeSections, resolveLegalLocale, usesCustomLegalCopy } from '@/lib/legal-templates'
import { useLocale } from '@/contexts/LocaleContext'
import { LegalDocumentContent } from './LegalDocumentContent'

interface LegalNoticeContentProps {
  config: LegalConfig
}

export function LegalNoticeContent({ config }: LegalNoticeContentProps) {
  const { locale, t } = useLocale()
  const legalLocale = resolveLegalLocale(locale)
  const sections = buildLegalNoticeSections(config, legalLocale)
  const isCustom = usesCustomLegalCopy(config.legalNoticeCustom, legalLocale)
  const completeness = getLegalCompleteness(config)

  return (
    <LegalDocumentContent
      title={NOTICE_DOC_TITLE[legalLocale]}
      streamLabel={NOTICE_STREAM[legalLocale]}
      sections={sections}
      isCustom={isCustom}
      incomplete={!isCustom && !completeness.complete}
      incompleteMessage={INCOMPLETE_NOTICE[legalLocale]}
      backHref="/"
      backLabel={t('newsletter.backHome')}
    />
  )
}
