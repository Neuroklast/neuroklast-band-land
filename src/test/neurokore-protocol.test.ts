import { describe, it, expect } from 'vitest'
import { generateKeyPairSync } from 'node:crypto'
import { signLicense, verifyLicense, newKey, keyHash, encryptKey, decryptKey, activationSchema } from '../../lib/neurokore/protocol'
describe('NEUROKORE activation contract', () => {
  it('verifies signed payload bytes and rejects tampering or another signing key', () => {
    const keys = generateKeyPairSync('ed25519')
    const privateKey = keys.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    const publicKey = keys.publicKey.export({ type: 'spki', format: 'pem' }).toString()
    const payload = { version: 2 as const, product: 'NEUROKORE' as const,
      licenseId: '11111111-1111-4111-8111-111111111111', device: 'v2:' + 'a'.repeat(64),
      tier: 'alpha' as const, email: 'tester@example.com', issuedAt: 1000, expiresAt: 2000 }
    const doc = signLicense(payload, privateKey)
    expect(verifyLicense(doc, publicKey)).toEqual(payload)
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
    expect(() => decryptKey(encrypted, 'cd'.repeat(32))).toThrow()
  })
})
