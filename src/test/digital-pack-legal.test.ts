import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  DIGITAL_PACK_TERMS_VERSION,
  digitalPackTermsLocale,
  digitalPackTermsSections,
  digitalPackTermsSnapshot,
} from '../../lib/digital-packs/consumer-terms'

function source(path: string) {
  return readFileSync(path, 'utf8')
}

describe('consumer purchase conditions for downloadable audio packs', () => {
  it('provides consistent separate DE/EN terms and a versioned snapshot', () => {
    expect(digitalPackTermsLocale('de-DE')).toBe('de')
    expect(digitalPackTermsLocale('it-IT')).toBe('en')
    expect(DIGITAL_PACK_TERMS_VERSION).toMatch(/^digital-pack-sale-/)
    for (const language of ['de', 'en'] as const) {
      const sections = digitalPackTermsSections(language)
      const snapshot = digitalPackTermsSnapshot(language)
      expect(sections).toHaveLength(6)
      expect(snapshot).toContain(sections[0].title)
      expect(snapshot).toContain(sections[4].title)
      expect(snapshot).not.toMatch(/AS IS|WITHOUT WARRANTY/i)
    }
  })

  it('does not substitute the software licence for a pack purchase', () => {
    const checkout = source('app/api/digital-packs/[id]/checkout/route.ts')
    const panel = source('app/soundpacks/[id]/DigitalPackBuy.tsx')
    const schema = source('supabase/schema.sql')
    expect(checkout).toContain('digitalPackTermsSnapshot(payload.locale)')
    expect(checkout).toContain('terms_accepted_at:')
    expect(checkout).toContain('pack.license_notes?.trim()')
    expect(schema).toContain('ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz')
    expect(panel).toContain('/soundpacks/terms')
    expect(panel).toContain('#pack-license')
    expect(panel).not.toContain('href="/license-terms"')
  })

  it('exposes legal notices and an emphasized withdrawal link on public pages', () => {
    const footer = source('themes/neuroklast-classic/Footer.tsx')
    expect(footer).toContain('sanitizeExternalHref(legalNoticeUrl)')
    expect(footer).toContain('sanitizeExternalHref(privacyPolicyUrl)')
    expect(footer).toContain('aria-label={shopLinks.withdrawal}')
    expect(footer).toContain('border-2 border-primary')
  })
})
