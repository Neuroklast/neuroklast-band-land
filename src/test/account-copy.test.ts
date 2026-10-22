import { describe, expect, it } from 'vitest'
import { LEGAL_LOCALES } from '@/lib/legal-i18n'
import { ACCOUNT_COPY } from '@/lib/plugins/account-copy'

describe('customer licence account localization', () => {
  it('has complete strings for all eight public languages', () => {
    const mandatory = Object.keys(ACCOUNT_COPY.en) as Array<keyof typeof ACCOUNT_COPY.en>
    for (const locale of LEGAL_LOCALES) {
      for (const key of mandatory) {
        expect(ACCOUNT_COPY[locale][key].trim().length, locale + '/' + key).toBeGreaterThan(1)
      }
    }
  })
})
