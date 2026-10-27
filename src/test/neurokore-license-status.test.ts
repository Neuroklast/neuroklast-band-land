import { describe, it, expect } from 'vitest'
import { generateSigningKeyPair, signLicense } from '../../lib/neurokore/protocol'
import { signLicenseStatus, verifyLicenseStatus } from '../../lib/neurokore/license-status'

const device = 'v2:' + 'a'.repeat(64)
const licenseId = '123e4567-e89b-42d3-a456-426614174000'
const payload = { version: 1 as const, licenseId, device, status: 'revoked' as const, issuedAt: 1800000000 }

describe('domain-separated NEUROKORE signed status', () => {
  const { privatePem, publicHex } = generateSigningKeyPair()
  const publicPem = '-----BEGIN PUBLIC KEY-----\n' +
    Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), Buffer.from(publicHex, 'hex')]).toString('base64') +
    '\n-----END PUBLIC KEY-----'

  it('verifies explicit revoked and active for a specific ID and device', () => {
    expect(verifyLicenseStatus(signLicenseStatus(payload, privatePem), publicPem)).toEqual(payload)
    expect(verifyLicenseStatus(signLicenseStatus({...payload, status:'active'}, privatePem), publicPem).status).toBe('active')
  })
  it('rejects tampered payload, signatures and unrelated license documents', () => {
    const original = JSON.parse(signLicenseStatus(payload, privatePem))
    expect(() => verifyLicenseStatus(JSON.stringify({...original, payload: 'Zm9v'}), publicPem)).toThrow()
    expect(() => verifyLicenseStatus(JSON.stringify({...original, signature:'A'.repeat(88)}), publicPem)).toThrow()
    const license = signLicense({
      version:2, product:'NEUROKORE', licenseId, device,
      tier:'full', email:'test@example.com', issuedAt:1000, expiresAt:1801000000,
    }, privatePem)
    expect(() => verifyLicenseStatus(license, publicPem)).toThrow()
  })
  it('rejects mismatched input shapes', () => {
    expect(() => signLicenseStatus({...payload, device:'raw-hardware-id'}, privatePem)).toThrow()
  })
})
