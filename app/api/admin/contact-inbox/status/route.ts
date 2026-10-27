import { z } from 'zod'
import { admin, body, db, json, limit, sameOrigin } from '@/lib/neurokore/server'

export const runtime = 'nodejs'
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'admin-contact-case-status', 30)
    const actor = await admin()
    const input = z.object({ id:z.uuid(), closed:z.boolean() }).strict().parse(await body(request))
    const client=db()
    const result=await client.from('plugin_contact_requests')
      .update({closed_at:input.closed?new Date().toISOString():null}).eq('id',input.id).select('id').maybeSingle()
    if(result.error)throw result.error
    if(!result.data)return json({error:'Request not found'},404)
    await client.from('plugin_admin_audit').insert({
      actor,action:input.closed?'contact.close':'contact.reopen',
      target:input.id,detail:{},
    })
    return json({ok:true})
  } catch {
    return json({error:'Not authorized or request unavailable'},403)
  }
}
