import { z } from 'zod'
import { body, db, json, limit, required, unavailable } from '@/lib/neurokore/server'
import { signingKeyFor } from '@/lib/plugins/signing'
import { signLicenseStatus } from '@/lib/neurokore/license-status'

export const runtime = 'nodejs'

const inputSchema = z.object({
  licenseId: z.uuid(),
  device: z.string().regex(/^v2:[a-f0-9]{64}$/),
}).strict()

export async function OPTIONS() { return json({}, 200, true) }

/**
 * Read-only, bearer-free status check for an already issued device-bound v2 license.
 * Unknown IDs, unregistered devices and unavailable databases must NOT produce
 * a revocation: the client fails open on all transport/application failures.
 */
export async function POST(request: Request) {
  try {
    await limit(request, 'neurokore-status', 30)
    const input = inputSchema.parse(await body(request))
    const client = db()
    const { data: license, error } = await client.from('plugin_licenses')
      .select('id,product_id,revoked_at,license_format,plugin_devices(device)')
      .eq('id', input.licenseId).eq('license_format', 'v2').maybeSingle()
    if (error || !license ||
      !Array.isArray(license.plugin_devices) ||
      !license.plugin_devices.some((entry: { device: string }) => entry.device === input.device))
      return unavailable(true)

    const { data: product, error: productError } = await client.from('products')
      .select('slug').eq('id', license.product_id).eq('slug', 'neurokore').maybeSingle()
    if (productError || !product) return unavailable(true)

    const { data: secrets, error: secretsError } = await client.from('plugin_product_secrets')
      .select('signing_key_cipher').eq('product_id', license.product_id).maybeSingle()
    if (secretsError) return unavailable(true)
    const privatePem = signingKeyFor(
      { slug: product.slug, signing_key_cipher: secrets?.signing_key_cipher ?? null },
      required('NEUROKORE_KEY_ENCRYPTION_SECRET'),
      process.env.NEUROKORE_SIGNING_PRIVATE_KEY,
    )
    const document = signLicenseStatus({
      version: 1,
      licenseId: license.id,
      device: input.device,
      status: license.revoked_at ? 'revoked' : 'active',
      issuedAt: Math.floor(Date.now() / 1000),
    }, privatePem)
    return json({ document }, 200, true)
  } catch {
    return unavailable(true)
  }
}
