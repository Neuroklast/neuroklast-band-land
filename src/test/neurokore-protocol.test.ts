import { describe, it, expect } from 'vitest'
import { generateKeyPairSync } from 'node:crypto'
import { signLicense, verifyLicense, newKey, keyHash, encryptKey, decryptKey, activationSchema, validateLicenseConfiguration } from '../../lib/neurokore/protocol'
describe('NEUROKORE activation contract', () => {
  it('refuses checkout configuration that cannot issue retrievable licenses', () => {
    const pem = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    expect(() => validateLicenseConfiguration(pem, 'ab'.repeat(32))).not.toThrow()
    expect(() => validateLicenseConfiguration(pem, 'invalid')).toThrow()
    expect(() => validateLicenseConfiguration('invalid pem', 'ab'.repeat(32))).toThrow()
  })
  it('verifies signed payload bytes and rejects tampering or another signing key', () => {
    const keys = generateKeyPairSync('ed25519')
    const privateKey = keys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    const derB64 = keys.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64')
    const publicKey = keys.publicKey.export({ type: 'spki', format: 'pem' }).toString()
    const payload = { version: 2 as const, product: 'NEUROKORE' as const,
      licenseId: '11111111-1111-4111-8111-111111111111', device: 'v2:' + 'a'.repeat(64),
      tier: 'alpha' as const, email: 'tester@example.com', issuedAt: 1000, expiresAt: 2000 }
    const doc = signLicense(payload, privateKey)
    expect(verifyLicense(doc, publicKey)).toEqual(payload)
    expect(verifyLicense(signLicense(payload, derB64), publicKey)).toEqual(payload)
    const bad = JSON.parse(doc)
    bad.payload = Buffer.from(JSON.stringify({ ...payload, tier: 'full' })).toString('base64')
    expect(() => verifyLicense(JSON.stringify(bad), publicKey)).toThrow()
    const other = generateKeyPairSync('ed25519').publicKey.export({ type: 'spki', format: 'pem' }).toString()
    expect(() => verifyLicense(doc, other)).toThrow()
  })
  it('keeps activation secrets out of hashes and authenticates stored ciphertext', () => {
    const key = newKey(), secret = 'ab'.repeat(32)
    expect(activationSchema.safeParse({ key, device: 'v2:' + '0'.repeat(64) }).success).toBe(true)
    expect(keyHash(key)).not.toContain(key)
    const encrypted = encryptKey(key, secret)
    expect(decryptKey(encrypted, secret)).toBe(key)
    expect(decryptKey(encrypted, `"${secret}"\n`)).toBe(key)
    expect(() => decryptKey(encrypted, 'cd'.repeat(32))).toThrow()
    expect(() => encryptKey(key, 'abc')).toThrow(/got 3/)
  })
})

describe('generic v3 licence contract', () => {
  it('signs per-product documents and rejects a foreign key or format', async () => {
    const { createPublicKey } = await import('node:crypto')
    const { signLicenseV3, verifyLicenseV3, generateSigningKeyPair } = await import('../../lib/neurokore/protocol')
    const first = generateSigningKeyPair()
    const second = generateSigningKeyPair()
    const publicFromHex = (hex: string) => createPublicKey({
      key: { kty: 'OKP', crv: 'Ed25519', x: Buffer.from(hex, 'hex').toString('base64url') },
      format: 'jwk',
    }).export({ type: 'spki', format: 'pem' }).toString()
    const payload = {
      version: 3 as const, product: 'neurometer',
      licenseId: '22222222-2222-4222-8222-222222222222', device: 'v2:' + 'b'.repeat(64),
      tier: 'full' as const, email: 'buyer@example.com', issuedAt: 1000, expiresAt: 2000,
    }
    const doc = signLicenseV3(payload, first.privatePem)
    expect(verifyLicenseV3(doc, publicFromHex(first.publicHex))).toEqual(payload)
    expect(() => verifyLicenseV3(doc, publicFromHex(second.publicHex))).toThrow()
    expect(first.publicHex).toMatch(/^[a-f0-9]{64}$/)
    const wrong = JSON.parse(doc)
    wrong.format = 'NEUROKORE LICENSE'
    expect(() => verifyLicenseV3(JSON.stringify(wrong), publicFromHex(first.publicHex))).toThrow()
  })

  it('binds encrypted signing keys to their product AAD', async () => {
    const { encryptKey, decryptKey } = await import('../../lib/neurokore/protocol')
    const secret = 'ef'.repeat(32)
    const value = 'private-key-material'
    const cipher = encryptKey(value, secret, 'plugin-signing-key-v1:neurometer')
    expect(decryptKey(cipher, secret, 'plugin-signing-key-v1:neurometer')).toBe(value)
    expect(() => decryptKey(cipher, secret, 'plugin-signing-key-v1:neurokore')).toThrow()
  })
})
