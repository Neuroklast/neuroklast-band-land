import { describe, it, expect } from 'vitest'
import {
  isValidLocaleCode,
  parseLanguagesConfig,
  getEnabledLocaleCodes,
} from '@/lib/languages-config'
import { PUBLIC_LOCALES } from '@/lib/i18n'

describe('isValidLocaleCode', () => {
  it('accepts ISO 639-1 and regional variants', () => {
    expect(isValidLocaleCode('en')).toBe(true)
    expect(isValidLocaleCode('de')).toBe(true)
    expect(isValidLocaleCode('pt-br')).toBe(true)
  })

  it('rejects invalid codes', () => {
    expect(isValidLocaleCode('')).toBe(false)
    expect(isValidLocaleCode('english')).toBe(false)
    expect(isValidLocaleCode('EN')).toBe(false)
    expect(isValidLocaleCode('e')).toBe(false)
  })
})

describe('parseLanguagesConfig', () => {
  it('falls back to built-in locales when input is missing', () => {
    expect(parseLanguagesConfig(null)).toEqual(PUBLIC_LOCALES)
    expect(parseLanguagesConfig([])).toEqual(PUBLIC_LOCALES)
  })

  it('ignores archived and custom locales in old configurations', () => {
    expect(parseLanguagesConfig([
      { code: 'en', label: 'English' },
      { code: 'fr', label: 'Français' },
      { code: 'uk', label: 'Українська' },
      { code: 'de', label: 'Deutsch' },
    ])).toEqual(PUBLIC_LOCALES)
  })

  it('always enables both public languages for single-language configs', () => {
    expect(parseLanguagesConfig([{ code: 'en', label: 'English' }])).toEqual(PUBLIC_LOCALES)
    expect(parseLanguagesConfig([{ code: 'de', label: 'Deutsch' }])).toEqual(PUBLIC_LOCALES)
    expect(parseLanguagesConfig([{ code: 'ja' }])).toEqual(PUBLIC_LOCALES)
  })

  it('uses built-in labels when label is omitted', () => {
    const parsed = parseLanguagesConfig([{ code: 'de' }])
    expect(parsed).toEqual(PUBLIC_LOCALES)
  })
})

describe('getEnabledLocaleCodes', () => {
  it('returns locale codes in order', () => {
    expect(
      getEnabledLocaleCodes([
        { code: 'en', label: 'English', flag: '' },
        { code: 'fr', label: 'Français', flag: '' },
      ]),
    ).toEqual(['en', 'fr'])
  })
})