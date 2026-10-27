import { describe, expect, it } from 'vitest'
import { LEGAL_LOCALES } from '@/lib/legal-i18n'
import { COMMERCE_LEGAL_COPY, commerceSections } from '@/lib/commerce-legal-copy'
import { WITHDRAWAL_COPY } from '@/lib/legal-withdrawal-i18n'
import { COMMERCE_PRIVACY } from '@/lib/commerce-privacy-i18n'
import { COMMERCE_ACTIONS } from '@/lib/commerce-actions-i18n'

describe('localized B2C documents', () => {
  for (const language of LEGAL_LOCALES) {
    it(language + ': has all commerce documents and localized customer actions', () => {
      const copy = COMMERCE_LEGAL_COPY[language]
      for (const doc of ['terms', 'purchase', 'withdrawal', 'license'] as const) {
        expect(copy.docs[doc].length).toBeGreaterThan(7)
        expect(commerceSections(doc, language).length).toBeGreaterThanOrEqual(3)
        expect(commerceSections(doc, language).every(s => s.title && s.paragraphs[0].length > 40)).toBe(true)
      }
      expect(copy.links.terms.length).toBeGreaterThan(1)
      expect(COMMERCE_ACTIONS[language].confirm.length).toBeGreaterThan(1)
      expect(WITHDRAWAL_COPY[language].period.length).toBeGreaterThan(30)
      expect(COMMERCE_PRIVACY[language].paragraphs).toHaveLength(3)
      const plainText = COMMERCE_PRIVACY[language].paragraphs.join(' ')
      expect(plainText).toContain('Stripe')
      expect(plainText).toContain('Resend')
      expect(plainText).not.toMatch(/localStorage|IndexedDB|HttpOnly|webhook|Supabase|API|backend/i)
    })
  }
})
