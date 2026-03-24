/**
 * Tests for the i18n infrastructure.
 * Verifies JSON dictionary completeness, i18next configuration,
 * and backward-compatible t() function behavior.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { t } from '@/lib/i18n'
import { t as secT, tip as secTip, LOCALES } from '@/lib/i18n-security'
import i18n from '@/lib/i18n-config'
import fs from 'fs'
import path from 'path'

const LOCALES_DIR = path.resolve(__dirname, '../../public/locales')

// Pre-load JSON resources into i18next for testing (HTTP backend unavailable in vitest)
beforeAll(() => {
  const namespaces = ['common', 'security', 'admin'] as const
  const langs = ['en', 'de'] as const
  for (const lang of langs) {
    for (const ns of namespaces) {
      const filePath = path.join(LOCALES_DIR, lang, `${ns}.json`)
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        i18n.addResourceBundle(lang, ns, data, true, true)
      }
    }
  }
})

// ── JSON Dictionary Validation ──────────────────────────────────────

describe('JSON dictionary files', () => {
  const namespaces = ['common', 'security', 'admin'] as const

  for (const ns of namespaces) {
    it(`${ns}.json exists for both en and de`, () => {
      expect(fs.existsSync(path.join(LOCALES_DIR, 'en', `${ns}.json`))).toBe(true)
      expect(fs.existsSync(path.join(LOCALES_DIR, 'de', `${ns}.json`))).toBe(true)
    })

    it(`${ns}.json has matching keys in en and de`, () => {
      const en = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'en', `${ns}.json`), 'utf8'))
      const de = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'de', `${ns}.json`), 'utf8'))
      const enKeys = Object.keys(en).sort()
      const deKeys = Object.keys(de).sort()
      expect(enKeys).toEqual(deKeys)
    })

    it(`${ns}.json has no empty values in en`, () => {
      const en = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'en', `${ns}.json`), 'utf8'))
      for (const [key, value] of Object.entries(en)) {
        expect(value, `Key "${key}" in en/${ns}.json should not be empty`).toBeTruthy()
      }
    })

    it(`${ns}.json has no empty values in de`, () => {
      const de = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'de', `${ns}.json`), 'utf8'))
      for (const [key, value] of Object.entries(de)) {
        expect(value, `Key "${key}" in de/${ns}.json should not be empty`).toBeTruthy()
      }
    })
  }
})

// ── i18next Configuration ───────────────────────────────────────────

describe('i18next configuration', () => {
  it('supports en language only', () => {
    expect(i18n.options.supportedLngs).toContain('en')
    expect(i18n.options.supportedLngs).not.toContain('de')
  })

  it('uses en as fallback language', () => {
    expect(i18n.options.fallbackLng).toContain('en')
  })

  it('has keySeparator disabled for flat keys', () => {
    expect(i18n.options.keySeparator).toBe(false)
  })

  it('has common, security, and admin namespaces', () => {
    const ns = i18n.options.ns
    expect(ns).toContain('common')
    expect(ns).toContain('security')
    expect(ns).toContain('admin')
  })
})

// ── t() backward compatibility ──────────────────────────────────────

describe('t() function (common namespace)', () => {
  it('returns English translation for common keys', () => {
    expect(t('footer.section', 'en')).toBe('FOOTER_SECTION')
    expect(t('nav.home', 'en')).toBe('HOME')
    expect(t('cookie.accept', 'en')).toBe('ACCEPT')
  })

  it('returns the key itself for unknown keys', () => {
    expect(t('nonexistent.key', 'en')).toBe('nonexistent.key')
  })

  it('resolves admin namespace keys', () => {
    expect(t('impressum.editTitle', 'en')).toBe('Edit legal notice')
    expect(t('export.close', 'en')).toBe('Close')
  })
})

// ── Security t() backward compatibility ─────────────────────────────

describe('security t() function', () => {
  it('returns English translation for security keys', () => {
    expect(secT('sec.title', 'en')).toBe('SECURITY CENTER')
    expect(secT('sec.total', 'en')).toBe('Total')
  })

  it('returns key for unknown security keys', () => {
    expect(secT('nonexistent', 'en')).toBe('nonexistent')
  })
})

describe('security tip() function', () => {
  it('returns tooltip for keys with Tip suffix', () => {
    expect(secTip('sec.total', 'en')).toBe('Total number of security incidents recorded')
  })

  it('returns undefined for keys without tooltip', () => {
    expect(secTip('nonexistent', 'en')).toBeUndefined()
  })
})

describe('security LOCALES constant', () => {
  it('exports only en locale', () => {
    expect(LOCALES).toEqual([
      { value: 'en', label: 'EN' },
    ])
  })
})
