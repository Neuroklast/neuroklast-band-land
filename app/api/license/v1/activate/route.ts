
import { activationSchema, keyHash, signLicense } from '@/lib/neurokore/protocol'
import { body, db, json, licenseRow, limit, required, unavailable } from '@/lib/neurokore/server'
export const runtime = 'nodejs'
export async function OPTIONS() { return json({}, 200, true) }
export async function POST(request: Request) {
  try {
    // Ungated: NeuroCore activates here even when the public Products section is off.
    await limit(request, 'neurokore-activate')
    const input = activationSchema.parse(await body(request))
    // Validate signing configuration before reserving a seat.
    const pem = required('NEUROKORE_SIGNING_PRIVATE_KEY')
    signLicense({ version: 2, product: 'NEUROKORE', licenseId: '00000000-0000-4000-8000-000000000000',
      device: input.device, tier: 'alpha', email: 'config@example.invalid', issuedAt: 1, expiresAt: 1 }, pem)
    const { data, error } = await db().rpc('neurokore_activate', { p_key_hash: keyHash(input.key), p_device: input.device })
    if (error) return unavailable(true)
    const row = licenseRow.parse(data)
    const now = Math.floor(Date.now() / 1000)
    // 30-day offline lease; a revoked key cannot renew. Alpha expiry caps the lease.
    const end = row.expires_at ? Math.floor(Date.parse(row.expires_at) / 1000) : now + 30 * 86400
    const license = signLicense({ version: 2, product: 'NEUROKORE', licenseId: row.id,
      device: input.device, tier: row.tier, email: row.email, issuedAt: now,
      expiresAt: Math.min(end, now + 30 * 86400) }, pem)
    return json({ license }, 200, true)
  } catch { return unavailable(true) }
}
