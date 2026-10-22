import 'server-only'
import { encryptKey, decryptKey } from '@/lib/neurokore/protocol'

function aad(slug: string): string {
  return `plugin-signing-key-v1:${slug}`
}

export function encryptSigningKey(privatePem: string, encryptionSecret: string, slug: string): string {
  return encryptKey(privatePem, encryptionSecret, aad(slug))
}

/**
 * Per-product signing key. NEUROKORE keeps its existing env key until an admin
 * stores a replacement, so current activation documents stay valid.
 */
export function signingKeyFor(
  product: { slug: string; signing_key_cipher?: string | null },
  encryptionSecret: string,
  legacyPem?: string,
): string {
  if (product.signing_key_cipher) {
    return decryptKey(product.signing_key_cipher, encryptionSecret, aad(product.slug))
  }
  if (product.slug === 'neurokore' && legacyPem) return legacyPem
  throw new Error('Signing key missing')
}
