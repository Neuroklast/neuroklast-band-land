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
    return Response.json({ ok: true, cutoff }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Retention cleanup failed' }, { status: 503 })
  }
}
