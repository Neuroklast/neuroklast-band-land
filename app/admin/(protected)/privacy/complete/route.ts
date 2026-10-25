import { z } from 'zod'
import { admin, db, limit, sameOrigin } from '@/lib/neurokore/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let actor: string
  try {
    sameOrigin(request)
    await limit(request, 'privacy-complete', 10)
    actor = await admin()
  } catch {
    return Response.json({ error: 'Administrator authentication required.' }, { status: 403 })
  }
  const data = await request.formData().catch(() => null)
  const parsed = z.uuid().safeParse(data?.get('id'))
  if (!parsed.success) return Response.json({ error: 'Invalid request ID.' }, { status: 400 })

  const { error } = await db().from('privacy_requests')
    .update({ status: 'answered', responded_at: new Date().toISOString(), completed_by: actor })
    .eq('id', parsed.data).in('status', ['open', 'exported'])
  if (error) return Response.json({ error: 'Unable to update request.' }, { status: 503 })

  return new Response(null, {
    status: 303,
    headers: { Location: '/admin/privacy', 'Cache-Control': 'no-store' },
  })
}
