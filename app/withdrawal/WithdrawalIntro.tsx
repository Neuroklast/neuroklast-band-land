'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { resolveLegalLocale } from '@/lib/legal-templates'
import { COMMERCE_ACTIONS } from '@/lib/commerce-actions-i18n'

export function WithdrawalIntro() {
  const { locale } = useLocale()
  const labels = COMMERCE_ACTIONS[resolveLegalLocale(locale)]
  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-semibold">{labels.start}</h1>
      <p>{labels.intro}</p>
    </header>
  )
}
