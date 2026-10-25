import { describe, expect, it } from 'vitest'
import { LEGAL_LOCALES } from '@/lib/legal-i18n'
import {
  licenceDocumentFromActivateBody,
  normalizeLicenceKey,
  normalizeSystemId,
  offlineFieldError,
  OFFLINE_COPY,
} from '@/lib/plugins/offline-activation'

const device = 'v2:' + 'ab'.repeat(32)

describe('offline licence activation form', () => {
  it('has complete strings for all public languages', () => {
    const mandatory = Object.keys(OFFLINE_COPY.en) as Array<keyof typeof OFFLINE_COPY.en>
    for (const locale of LEGAL_LOCALES) {
      for (const key of mandatory) {
        expect(OFFLINE_COPY[locale][key].trim().length, locale + '/' + key).toBeGreaterThan(1)
      }
    }
  })

  it('accepts a pasted key and system id and rejects the old RSA file shape', () => {
    expect(normalizeLicenceKey(' nk-abcd ' + 'A'.repeat(44))).toBe('NK-' + 'ABCD' + 'A'.repeat(44))
    expect(normalizeSystemId(' V2:' + 'AB'.repeat(32) + ' ')).toBe(device)
    expect(offlineFieldError('NK-' + 'A'.repeat(48), device, OFFLINE_COPY.en)).toBeNull()
    expect(offlineFieldError('email=a@b.c', device, OFFLINE_COPY.en)).toBe(OFFLINE_COPY.en.badKey)
    expect(licenceDocumentFromActivateBody({
      license: JSON.stringify({ format: 'NEUROKORE LICENSE', version: 2 }),
    })).toContain('NEUROKORE LICENSE')
    expect(licenceDocumentFromActivateBody({ error: 'no' })).toBeNull()
  })
})
