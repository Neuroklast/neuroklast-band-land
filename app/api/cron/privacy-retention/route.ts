import { timingSafeEqual } from 'node:crypto'
import { db } from '@/lib/neurokore/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Daily retention for first-party, opt-in analytics.
 * Protected by Vercel CRON_SECRET; never expose a public deletion endpoint.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization') ?? ''
  const provided = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!secret || !provided) return new Response(null, { status: 401 })
  const expectedBuffer = Buffer.from(secret)
  const actualBuffer = Buffer.from(provided)
  if (expectedBuffer.length !== actualBuffer.length ||
      !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return new Response(null, { status: 401 })
  }

  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const { error } = await db().from('analytics_events')
      .delete().lt('created_at', cutoff)
    if (error) throw error
    const { error: diagError } = await db().from('plugin_beta_diagnostics')
      .delete().lt('created_at', cutoff)
    if (diagError) throw diagError
    // Support messages are not accounting records. Remove resolved cases after
    // six months and any remaining unclosed cases after one year.
    const resolvedCutoff = new Date(Date.now() - 180 * 86400000).toISOString()
    const contactCutoff = new Date(Date.now() - 365 * 86400000).toISOString()
    const client = db()
    const closed = await client.from('plugin_contact_requests').delete()
      .not('closed_at', 'is', null).lt('closed_at', resolvedCutoff)
    if (closed.error) throw closed.error
    const stale = await client.from('plugin_contact_requests').delete()
      .lt('created_at', contactCutoff)
    if (stale.error) throw stale.error
    return Response.json({ ok: true, cutoff }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Retention cleanup failed' }, { status: 503 })
  }
}
