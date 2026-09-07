import { afterEach, describe, expect, it } from 'vitest'
import { r2S3Endpoint } from '@/lib/r2-s3-client'

const originalJurisdiction = process.env.R2_JURISDICTION

afterEach(() => {
  if (originalJurisdiction === undefined) delete process.env.R2_JURISDICTION
  else process.env.R2_JURISDICTION = originalJurisdiction
})

describe('r2S3Endpoint', () => {
  it('defaults to the EU jurisdiction endpoint', () => {
    delete process.env.R2_JURISDICTION
    expect(r2S3Endpoint('abc123')).toBe('https://abc123.eu.r2.cloudflarestorage.com')
  })

  it('uses an explicit jurisdiction', () => {
    expect(r2S3Endpoint('abc123', 'eu')).toBe('https://abc123.eu.r2.cloudflarestorage.com')
  })

  it('omits jurisdiction for global / default', () => {
    expect(r2S3Endpoint('abc123', 'global')).toBe('https://abc123.r2.cloudflarestorage.com')
    expect(r2S3Endpoint('abc123', 'default')).toBe('https://abc123.r2.cloudflarestorage.com')
    expect(r2S3Endpoint('abc123', '  ')).toBe('https://abc123.r2.cloudflarestorage.com')
  })

  it('rejects invalid jurisdiction values', () => {
    expect(() => r2S3Endpoint('abc123', '../evil')).toThrow('Invalid R2_JURISDICTION')
  })
})
