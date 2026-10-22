import { createHash, createPrivateKey, createPublicKey, sign, verify, randomBytes, createCipheriv, createDecipheriv, generateKeyPairSync } from 'node:crypto'
import { z } from 'zod'

export const payloadSchema = z.object({
  version: z.literal(2), product: z.literal('NEUROKORE'),
  licenseId: z.uuid(), device: z.string().regex(/^v2:[a-f0-9]{64}$/),
  tier: z.enum(['alpha', 'full']), email: z.email(),
  issuedAt: z.number().int().positive(), expiresAt: z.number().int().nonnegative(),
}).strict()
export type LicensePayload = z.infer<typeof payloadSchema>
export const activationSchema = z.object({
  key: z.string().regex(/^NK-[A-F0-9]{48}$/),
  device: z.string().regex(/^v2:[a-f0-9]{64}$/),
}).strict()
const context = 'NEUROKORE-LICENSE-V2\n'
export function keyHash(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}
export function newKey(): string { return 'NK-' + randomBytes(24).toString('hex').toUpperCase() }
export function normalizeSigningPem(raw: string): string {
  const value = raw.trim().replace(/\\n/g, '\n')
  if (value.includes('BEGIN')) return value
  return `-----BEGIN PRIVATE KEY-----\n${value.replace(/\s/g, '')}\n-----END PRIVATE KEY-----\n`
}

function encryptionSecretHex(secret: string): string {
  const hex = secret.trim().replace(/^["']+|["']+$/g, '').replace(/\s/g, '')
  if (!/^[a-f0-9]{64}$/i.test(hex)) {
    throw new Error(`Invalid license encryption key (need 64 hex chars, got ${hex.length})`)
  }
  return hex
}

export function signLicense(payload: LicensePayload, pem: string): string {
  const key = createPrivateKey(normalizeSigningPem(pem))
  if (key.asymmetricKeyType !== 'ed25519') throw new Error('Invalid signing key type')
  const encoded = Buffer.from(JSON.stringify(payloadSchema.parse(payload))).toString('base64')
  const signature = sign(null, Buffer.from(context + encoded), key).toString('base64')
  return JSON.stringify({ format: 'NEUROKORE LICENSE', version: 2, payload: encoded, signature })
}
export function verifyLicense(document: string, publicPem: string): LicensePayload {
  const envelope = z.object({ format: z.literal('NEUROKORE LICENSE'), version: z.literal(2),
    payload: z.string().max(12000), signature: z.string().max(128) }).strict().parse(JSON.parse(document))
  if (!verify(null, Buffer.from(context + envelope.payload), createPublicKey(publicPem),
    Buffer.from(envelope.signature, 'base64'))) throw new Error('Invalid signature')
  return payloadSchema.parse(JSON.parse(Buffer.from(envelope.payload, 'base64').toString('utf8')))
}
// Keys are retrievable only by their owner/admin, encrypted separately from DB credentials.
// The default AAD keeps existing NEUROKORE licence keys readable.
export function encryptKey(value: string, secret: string, aad = 'neurokore-key-v1'): string {
  const hex = encryptionSecretHex(secret)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(hex, 'hex'), iv)
  cipher.setAAD(Buffer.from(aad))
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64')
}
export function decryptKey(value: string, secret: string, aad = 'neurokore-key-v1'): string {
  const hex = encryptionSecretHex(secret)
  const bytes = Buffer.from(value, 'base64')
  if (bytes.length < 29) throw new Error('Invalid encrypted key')
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(hex, 'hex'), bytes.subarray(0, 12))
  decipher.setAAD(Buffer.from(aad))
  decipher.setAuthTag(bytes.subarray(12, 28))
  return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')
}

export function validateLicenseConfiguration(pem: string, encryptionSecret: string): void {
  const key = createPrivateKey(normalizeSigningPem(pem))
  encryptionSecretHex(encryptionSecret)
  if (key.asymmetricKeyType !== 'ed25519') throw new Error('Invalid licensing configuration')
}

/**
 * Generic v3 documents for new products. NEUROKORE keeps its v2 format and
 * public key unchanged; no existing activation document is invalidated.
 */
export const genericPayloadSchema = z.object({
  version: z.literal(3),
  product: z.string().regex(/^[a-z0-9][a-z0-9-]{1,63}$/),
  licenseId: z.uuid(),
  device: z.string().regex(/^v2:[a-f0-9]{64}$/),
  tier: z.enum(['alpha', 'full']),
  email: z.email(),
  issuedAt: z.number().int().positive(),
  expiresAt: z.number().int().nonnegative(),
}).strict()
export type GenericLicensePayload = z.infer<typeof genericPayloadSchema>
const contextV3 = 'NEUROKLAST-LICENSE-V3\n'

export function signLicenseV3(payload: GenericLicensePayload, pem: string): string {
  const key = createPrivateKey(normalizeSigningPem(pem))
  if (key.asymmetricKeyType !== 'ed25519') throw new Error('Invalid signing key type')
  const encoded = Buffer.from(JSON.stringify(genericPayloadSchema.parse(payload))).toString('base64')
  const signature = sign(null, Buffer.from(contextV3 + encoded), key).toString('base64')
  return JSON.stringify({ format: 'NEUROKLAST LICENSE', version: 3, payload: encoded, signature })
}

export function verifyLicenseV3(document: string, publicPem: string): GenericLicensePayload {
  const envelope = z.object({ format: z.literal('NEUROKLAST LICENSE'), version: z.literal(3),
    payload: z.string().max(12000), signature: z.string().max(128) }).strict().parse(JSON.parse(document))
  if (!verify(null, Buffer.from(contextV3 + envelope.payload), createPublicKey(publicPem),
    Buffer.from(envelope.signature, 'base64'))) throw new Error('Invalid signature')
  return genericPayloadSchema.parse(JSON.parse(Buffer.from(envelope.payload, 'base64').toString('utf8')))
}

function rawPublicHex(privatePem: string): string {
  const key = createPrivateKey(normalizeSigningPem(privatePem))
  if (key.asymmetricKeyType !== 'ed25519') throw new Error('Invalid signing key type')
  const jwk = createPublicKey(key).export({ format: 'jwk' }) as { x?: string }
  if (!jwk.x) throw new Error('Invalid signing key')
  return Buffer.from(jwk.x, 'base64url').toString('hex')
}

export function signingPublicHex(privatePem: string): string {
  return rawPublicHex(privatePem)
}

export function generateSigningKeyPair(): { privatePem: string; publicHex: string } {
  const { privateKey } = generateKeyPairSync('ed25519')
  const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
  return { privatePem, publicHex: rawPublicHex(privatePem) }
}
