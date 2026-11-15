import { z } from 'zod'
import { adminFailureMessage, adminFailureStatus } from '@/lib/neurokore/admin-error'
import { admin, assertDurablePluginAudit, body, db, json, limit, sameOrigin } from '@/lib/neurokore/server'

export const runtime = 'nodejs'
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'admin-contact-case-status', 30)
    const actor = await admin()
    const input = z.object({ id:z.uuid(), closed:z.boolean() }).strict().parse(await body(request))
    const client=db(actor)
    await assertDurablePluginAudit(client)
    const result=await client.from('plugin_contact_requests')
      .update({closed_at:input.closed?new Date().toISOString():null}).eq('id',input.id).select('id').maybeSingle()
    if(result.error)throw result.error
    if(!result.data)return json({error:'Request not found'},404)
    return json({ok:true})
  } catch (error) {
    console.error('[contact-inbox] case status failed:', error instanceof Error ? error.name : 'unknown')
    return json({error:'Unable to change contact status. Check administrator MFA and the database audit status.'},503)
  }
}
