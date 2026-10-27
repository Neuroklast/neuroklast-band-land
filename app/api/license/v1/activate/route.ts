import { activationSchema, keyHash, signLicense, signLicenseV3 } from '@/lib/neurokore/protocol'
import { body, db, json, licenseRow, limit, required, unavailable } from '@/lib/neurokore/server'
import { signingKeyFor } from '@/lib/plugins/signing'
import { activationTerms } from '@/lib/neurokore/activation-policy'
import { slugSchema } from '@/lib/plugins/releases'

export const runtime = 'nodejs'

const inputSchema = activationSchema.extend({ product: slugSchema.optional() }).strict()

export async function OPTIONS() { return json({}, 200, true) }
export async function POST(request: Request) {
  try {
    // Ungated: plugins activate here even when the public catalogue is off.
    await limit(request, 'neurokore-activate')
    const input = inputSchema.parse(await body(request))
    const slug = input.product ?? 'neurokore'
    const client = db()

    const productResult = await client.from('products')
      .select('id,slug,license_format').eq('slug', slug).eq('kind', 'plugin').maybeSingle()
    if (productResult.error || !productResult.data) return unavailable(true)
    const product = productResult.data

    const secretResult = await client.from('plugin_product_secrets')
      .select('signing_key_cipher').eq('product_id', product.id).maybeSingle()
    if (secretResult.error) return unavailable(true)

    const pem = signingKeyFor(
      { slug: product.slug, signing_key_cipher: secretResult.data?.signing_key_cipher ?? null },
      required('NEUROKORE_KEY_ENCRYPTION_SECRET'),
      process.env.NEUROKORE_SIGNING_PRIVATE_KEY,
    )

    // Validate the signing configuration before reserving a device seat.
    const sample = {
      licenseId: '00000000-0000-4000-8000-000000000000',
      device: input.device, tier: 'alpha' as const,
      email: 'config@example.invalid', issuedAt: 1, expiresAt: 1,
    }
    if (product.license_format === 'v2') {
      if (product.slug !== 'neurokore') return unavailable(true)
      signLicense({ version: 2, product: 'NEUROKORE', ...sample }, pem)
    } else {
      signLicenseV3({ version: 3, product: product.slug, ...sample }, pem)
    }

    const { data, error } = await client.rpc('plugin_activate', {
      p_key_hash: keyHash(input.key), p_device: input.device, p_product_slug: product.slug,
    })
    if (error) return unavailable(true)
    const row = licenseRow.parse(data)
    const now = Math.floor(Date.now() / 1000)
    const terms = activationTerms(row, now)
    const license = row.license_format === 'v2'
      ? signLicense({ version: 2, product: 'NEUROKORE', licenseId: row.id,
          device: input.device, tier: terms.tier, email: row.email,
          issuedAt: now, expiresAt: terms.expiresAt }, pem)
      : signLicenseV3({ version: 3, product: row.product_slug, licenseId: row.id,
          device: input.device, tier: row.tier, email: row.email,
          issuedAt: now, expiresAt: terms.expiresAt }, pem)
    return json({ license }, 200, true)
  } catch { return unavailable(true) }
}
