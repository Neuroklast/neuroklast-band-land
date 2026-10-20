import { createHash, createPrivateKey, createPublicKey, sign, verify, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'
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
export function signLicense(payload: LicensePayload, pem: string): string {
  const key = createPrivateKey(pem.replace(/\\n/g, '\n'))
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
export function encryptKey(value: string, secret: string): string {
  if (!/^[a-f0-9]{64}$/i.test(secret)) throw new Error('Invalid license encryption key')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(secret, 'hex'), iv)
  cipher.setAAD(Buffer.from('neurokore-key-v1'))
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64')
}
export function decryptKey(value: string, secret: string): string {
  if (!/^[a-f0-9]{64}$/i.test(secret)) throw new Error('Invalid license encryption key')
  const bytes = Buffer.from(value, 'base64')
  if (bytes.length < 29) throw new Error('Invalid encrypted key')
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(secret, 'hex'), bytes.subarray(0, 12))
  decipher.setAAD(Buffer.from('neurokore-key-v1'))
  decipher.setAuthTag(bytes.subarray(12, 28))
  return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')
}
