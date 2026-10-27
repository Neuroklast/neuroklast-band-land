import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto'
import { z } from 'zod'
import { normalizeSigningPem } from '@/lib/neurokore/protocol'

export const statusPayloadSchema = z.object({
  version: z.literal(1),
  licenseId: z.uuid(),
  device: z.string().regex(/^v2:[a-f0-9]{64}$/),
  status: z.enum(['active', 'revoked']),
  issuedAt: z.number().int().positive(),
}).strict()

const context = 'NEUROKORE-STATUS-V1\n'
const envelopeSchema = z.object({
  format: z.literal('NEUROKORE STATUS'),
  version: z.literal(1),
  payload: z.string().min(1).max(2048),
  signature: z.string().min(80).max(128),
}).strict()

/** Distinct signed protocol: an activation signature must never be valid as a status signature. */
export function signLicenseStatus(payload: z.infer<typeof statusPayloadSchema>, privatePem: string): string {
  const key = createPrivateKey(normalizeSigningPem(privatePem))
  if (key.asymmetricKeyType !== 'ed25519') throw new Error('Invalid signing key')
  const encoded = Buffer.from(JSON.stringify(statusPayloadSchema.parse(payload))).toString('base64')
  const signature = sign(null, Buffer.from(context + encoded), key).toString('base64')
  return JSON.stringify({ format: 'NEUROKORE STATUS', version: 1, payload: encoded, signature })
}

/** Test/diagnostic verifier. Native software validates this same domain-separated protocol. */
export function verifyLicenseStatus(document: string, publicPem: string) {
  const envelope = envelopeSchema.parse(JSON.parse(document))
  const encoded = Buffer.from(envelope.payload, 'base64')
  if (encoded.toString('base64') !== envelope.payload ||
      !verify(null, Buffer.from(context + envelope.payload), createPublicKey(publicPem),
        Buffer.from(envelope.signature, 'base64')))
    throw new Error('Invalid status signature')
  return statusPayloadSchema.parse(JSON.parse(encoded.toString('utf8')))
}
