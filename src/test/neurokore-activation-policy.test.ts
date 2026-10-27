import { describe, expect, it } from 'vitest'
import { activationTerms, PERPETUAL_EXPIRY_UNIX } from '../../lib/neurokore/activation-policy'

const now = 1800000000

describe('NEUROKORE activation lease policy', () => {
  it('keeps an unbounded paid v2 licence offline-perpetual', () => {
    expect(activationTerms({tier:'full',license_format:'v2',expires_at:null},now))
      .toEqual({tier:'perpetual',expiresAt:PERPETUAL_EXPIRY_UNIX})
  })
  it('does not promote expiring full or alpha grants to perpetual', () => {
    const expires_at = new Date((now + 7*86400)*1000).toISOString()
    expect(activationTerms({tier:'full',license_format:'v2',expires_at},now))
      .toEqual({tier:'full',expiresAt:now + 7*86400})
    expect(activationTerms({tier:'alpha',license_format:'v2',expires_at:null},now))
      .toEqual({tier:'alpha',expiresAt:now + 30*86400})
  })
  it('does not change the lease model for other plugin formats', () => {
    expect(activationTerms({tier:'full',license_format:'v3',expires_at:null},now))
      .toEqual({tier:'full',expiresAt:now + 30*86400})
  })
  it('refuses invalid or expired entitlement dates', () => {
    expect(() => activationTerms({tier:'full',license_format:'v2',expires_at:'bad'},now)).toThrow()
    expect(() => activationTerms({tier:'full',license_format:'v2',expires_at:new Date((now-1)*1000).toISOString()},now)).toThrow()
  })
})
