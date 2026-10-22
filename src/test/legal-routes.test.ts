import { describe, expect, it } from 'vitest'
import { LEGAL_LOCALES } from '@/lib/legal-i18n'
import { LEGAL_DOCUMENTS, legalLanguageAlternates, localizedLegalPath, validLegalLocale, validLegalDocument } from '@/lib/legal-routes'
import { withdrawalLegalSections } from '@/lib/withdrawal-legal-sections'
import { parseLegalConfig } from '@/lib/legal-content'
import { WITHDRAWAL_RECEIPT_PENDING } from '@/lib/legal-withdrawal-i18n'

describe('SEO-addressable legal pages', () => {
  it('exposes every legal document once per language with reciprocal alternates', () => {
    const urls = new Set<string>()
    for (const lang of LEGAL_LOCALES) {
      expect(validLegalLocale(lang)).toBe(true)
      for (const document of LEGAL_DOCUMENTS) {
        expect(validLegalDocument(document)).toBe(true)
        const path = localizedLegalPath(lang, document)
        expect(path).toMatch(new RegExp('^/legal/' + lang + '/'))
        expect(urls.has(path)).toBe(false)
        urls.add(path)
        const alternatives = legalLanguageAlternates(document)
        expect(alternatives[lang]).toBe(path)
        expect(alternatives['x-default']).toBe(localizedLegalPath('en', document))
        expect(Object.keys(alternatives)).toHaveLength(LEGAL_LOCALES.length + 1)
      }
    }
    expect(urls.size).toBe(LEGAL_LOCALES.length * LEGAL_DOCUMENTS.length)
    expect(validLegalLocale('invalid')).toBe(false)
    expect(validLegalDocument('admin')).toBe(false)
  })

  it('renders model withdrawal and seller details in each locale', () => {
    const config = parseLegalConfig({
      operatorName: 'Example Seller', street: 'Sample Street 1',
      zipCity: '12345 Sample', email: 'test@example.invalid',
    })
    for (const locale of LEGAL_LOCALES) {
      const sections = withdrawalLegalSections(locale, config)
      expect(sections.some(s => s.id === 'full-withdrawal')).toBe(true)
      const model = sections.find(s => s.id === 'model-withdrawal')
      expect(model?.paragraphs.join('\n')).toContain('Example Seller')
      expect(model?.paragraphs.join('\n')).toContain('__________________________')
      expect(WITHDRAWAL_RECEIPT_PENDING[locale].length).toBeGreaterThan(50)
    }
  })
})
