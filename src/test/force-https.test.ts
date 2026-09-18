import { describe, expect, it } from 'vitest'
import { httpsRedirectLocation } from '@/lib/force-https'

describe('httpsRedirectLocation', () => {
  it('returns an https URL when the forwarded proto is http', () => {
    expect(httpsRedirectLocation('http://neuroklast.net/legal-notice', 'http')).toBe(
      'https://neuroklast.net/legal-notice',
    )
  })

  it('is a no-op for https and missing proto', () => {
    expect(httpsRedirectLocation('https://neuroklast.net/', 'https')).toBeNull()
    expect(httpsRedirectLocation('https://neuroklast.net/', null)).toBeNull()
  })

  it('leaves localhost on HTTP', () => {
    expect(httpsRedirectLocation('http://localhost:3000/', 'http')).toBeNull()
    expect(httpsRedirectLocation('http://127.0.0.1:3000/', 'http')).toBeNull()
  })
})
