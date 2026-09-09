'use client'

import type { LegalConfig } from '@/lib/legal-content'
import { PRIVACY_DOC_TITLE, PRIVACY_STREAM } from '@/lib/legal-i18n'
import { buildPrivacyPolicySections, resolveLegalLocale, usesCustomLegalCopy } from '@/lib/legal-templates'
import { useLocale } from '@/contexts/LocaleContext'
import { LegalDocumentContent } from './LegalDocumentContent'

interface PrivacyPolicyContentProps {
  config: LegalConfig
}

export function PrivacyPolicyContent({ config }: PrivacyPolicyContentProps) {
  const { locale, t } = useLocale()
  const legalLocale = resolveLegalLocale(locale)
  const sections = buildPrivacyPolicySections(config, legalLocale)
  const isCustom = usesCustomLegalCopy(config.privacyPolicyCustom, legalLocale)

  return (
    <LegalDocumentContent
      title={PRIVACY_DOC_TITLE[legalLocale]}
      streamLabel={PRIVACY_STREAM[legalLocale]}
      sections={sections}
      isCustom={isCustom}
      backHref="/"
      backLabel={t('newsletter.backHome')}
    />
  )
}
