import { z } from 'zod'
import { db, json, limit, user } from '@/lib/neurokore/server'
import { loadDigitalPack } from '@/lib/digital-packs/store'
import { signedPackDownload } from '@/lib/digital-packs/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Free ZIP: rate-limited short-lived URL, no sign-in.
 * Purchased ZIP: verified customer + paid order + immutable order archive.
 * Stripe success URL alone never grants download access.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.uuid().safeParse(id).success) return json({ error: 'Pack not found.' }, 404)
  try {
    await limit(request, 'digital-pack-download', 15)
    const pack = await loadDigitalPack(id)
    let archive: { archive_key: string; archive_filename: string } | null = null
    if (pack?.is_free && pack.archive_key && pack.archive_filename) {
      archive = { archive_key: pack.archive_key, archive_filename: pack.archive_filename }
    } else {
      // A withdrawn pack remains available to customers with a paid entitlement.
      const buyer = await user().catch(() => null)
      if (!buyer) return json({ error: 'Sign in with your purchase email.' }, 401)
      const { data, error } = await db().from('digital_pack_orders')
        .select('archive_key,archive_filename')
        .eq('pack_id', id).eq('user_id', buyer.id)
        .eq('email',buyer.email).eq('status','paid')
        .order('created_at',{ascending:false}).limit(1).maybeSingle()
      if (error) throw error
      if (!data) return json({ error: 'No completed purchase for this account.' }, 403)
      archive = data
    }
    const url = await signedPackDownload(archive.archive_key, archive.archive_filename)
    return new Response(null, { status: 303, headers: {
      Location: url, 'Cache-Control': 'private, no-store',
      'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff',
    } })
  } catch {
    return json({ error: 'Download unavailable. Please retry or contact support.' }, 503)
  }
}
