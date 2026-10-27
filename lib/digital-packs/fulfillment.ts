import 'server-only'
import { z } from 'zod'
import { db } from '@/lib/neurokore/server'
import { assertStripeFulfillmentEnvironment } from '@/lib/neurokore/stripe'
import { getApiSecret } from '@/lib/api-secrets'
import { formatServiceAddress, loadLegalConfig } from '@/lib/legal-content'
import { origin } from '@/lib/neurokore/server'

export const paidPackSessionSchema = z.object({
  id: z.string().regex(/^cs_(test|live)_[A-Za-z0-9_]+$/),
  livemode: z.boolean(),
  mode: z.literal('payment'),
  payment_status: z.literal('paid'),
  client_reference_id: z.uuid(),
  customer_email: z.email(),
  payment_intent: z.string().regex(/^pi_[A-Za-z0-9_]+$/),
  amount_total: z.number().int().min(1),
  currency: z.literal('eur'),
  metadata: z.object({
    digital_pack_order: z.uuid(),
    environment: z.string(),
  }),
})

type Session = z.infer<typeof paidPackSessionSchema>

function escapeHtml(input: string): string {
  return input.replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
async function mailConfirmation(order: {
  id: string; email: string; pack_title: string | null; terms_snapshot: string | null;
  license_snapshot: string | null; terms_version: string | null;
}, session: Session) {
  const key = await getApiSecret('resend_api_key')
  if (!key) throw new Error('Transactional mail unavailable')
  const legal = await loadLegalConfig(db())
  const total = new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(session.amount_total/100)
  const seller = formatServiceAddress(legal)
  const account = origin()+'/soundpacks/library'
  const body = [
    'NEUROKLAST AUDIO — Digital pack purchase confirmation',
    'Order: '+order.id,
    'Product: '+(order.pack_title || 'Digital sound pack'),
    'Amount paid (including applicable tax): '+total,
    'Date: '+new Date().toISOString(),
    'Contract version: '+(order.terms_version||'current'),
    'Your ZIP is available in your NEUROKLAST customer account: '+account,
    'No physical shipment.',
    '',
    'Seller:',seller,'Contact: '+legal.email,
    '',
    'License and permitted uses:',order.license_snapshot||'See product page.',
    '',
    'Terms of purchase:',order.terms_snapshot||'See website terms.',
    '',
    'Withdrawal information: '+origin()+'/withdrawal-policy',
    'Online withdrawal: '+origin()+'/withdrawal',
    'Privacy: '+origin()+'/privacy-policy',
  ].join('\n')
  const html = `<!doctype html><html><head><meta charset="utf-8"></head>
  <body style="margin:0;background:#08080b;color:#eee;font:15px Arial,sans-serif">
  <div style="max-width:600px;margin:auto;padding:42px 24px">
  <p style="color:#ef384a;letter-spacing:4px;font-weight:800">NK / NEUROKLAST</p>
  <h1 style="font-size:29px;color:#fff">YOUR SOUND PACK IS READY.</h1>
  <p style="color:#ccc">Your payment was confirmed. Your pack is now in your downloads.</p>
  <p style="font-size:22px;color:#fff">${escapeHtml(order.pack_title||'Digital pack')} · ${escapeHtml(total)}</p>
  <p><a href="${escapeHtml(account)}" style="display:inline-block;background:#b4192a;color:#fff;padding:17px 26px;text-decoration:none;font-weight:bold">MY DOWNLOADS</a></p>
  <hr style="border:0;border-top:1px solid #333;margin:32px 0">
  <div style="white-space:pre-wrap;color:#b7b7c0;font-size:12px;line-height:1.8">${escapeHtml(body)}</div>
  </div></body></html>`
  const response = await fetch('https://api.resend.com/emails',{
    method:'POST',cache:'no-store',signal:AbortSignal.timeout(15000),
    headers:{ Authorization:'Bearer '+key,'Content-Type':'application/json',
      'Idempotency-Key':'digital-pack-contract-'+order.id },
    body:JSON.stringify({
      from:process.env.CONTACT_FROM_EMAIL||'NEUROKLAST <noreply@neuroklast.net>',
      to:[order.email],subject:'Your NEUROKLAST sound pack — '+(order.pack_title||'Download'),
      text:body,html,
    }),
  })
  if (!response.ok) throw new Error('Purchase email delivery pending')
}

/** Only invoke with a paid Checkout Session just fetched from Stripe. */
export async function fulfillDigitalPackSession(session: Session, eventLivemode: boolean) {
  assertStripeFulfillmentEnvironment({
    eventLivemode,sessionLivemode:session.livemode,sessionId:session.id,
    environment:session.metadata.environment,
    clientReferenceId:session.client_reference_id,
    metadataOrderId:session.metadata.digital_pack_order,
  })
  const client=db()
  const result=await client.from('digital_pack_orders')
    .select('id,user_id,email,amount_cents,currency,pack_id,pack_title,archive_key,archive_filename,stripe_session,payment_intent,status,confirmation_sent_at,email_claimed_at,email_attempts,terms_snapshot,license_snapshot,terms_version')
    .eq('id',session.client_reference_id).single()
  if(result.error||!result.data)throw new Error('Digital order not found')
  const order=result.data
  if(order.email!==session.customer_email.toLowerCase() ||
    order.amount_cents!==session.amount_total ||order.currency!==session.currency)
    throw new Error('Pack checkout price or customer mismatch')
  if(order.status==='refunded'||order.status==='disputed')return 'payment-review'
  if(order.stripe_session && order.stripe_session!==session.id)
    throw new Error('Checkout session does not match order')
  if(order.payment_intent && order.payment_intent!==session.payment_intent)
    throw new Error('PaymentIntent does not match order')
  if(order.status==='pending'){
    const updated=await client.from('digital_pack_orders').update({
      status:'paid',paid_at:new Date().toISOString(),
      stripe_session:session.id,payment_intent:session.payment_intent,
    }).eq('id',order.id).eq('status','pending')
      .or('stripe_session.is.null,stripe_session.eq.'+session.id)
      .select('id').maybeSingle()
    if(updated.error)throw updated.error
    if(!updated.data){
      const current=await client.from('digital_pack_orders').select('status,stripe_session,payment_intent')
        .eq('id',order.id).single()
      if(current.error||current.data?.status!=='paid'||
        current.data?.stripe_session!==session.id||
        current.data?.payment_intent!==session.payment_intent)
        throw new Error('Payment state conflict')
    }
  } else if(order.status!=='paid')throw new Error('Unexpected payment state')
  if(order.confirmation_sent_at)return 'paid'
  // The 2 minute lease prevents concurrent Stripe retries sending duplicate mail.
  const stale=new Date(Date.now()-120000).toISOString()
  const claimed=await client.from('digital_pack_orders')
    .update({email_claimed_at:new Date().toISOString(),email_attempts:order.email_attempts+1})
    .eq('id',order.id).eq('status','paid').is('confirmation_sent_at',null)
    .or('email_claimed_at.is.null,email_claimed_at.lt.'+stale)
    .lt('email_attempts',20).select('id').maybeSingle()
  if(claimed.error)throw claimed.error
  if(!claimed.data)return 'confirmation-in-progress'
  try{
    await mailConfirmation(order,session)
    const marked=await client.from('digital_pack_orders')
      .update({confirmation_sent_at:new Date().toISOString(),email_claimed_at:null})
      .eq('id',order.id).eq('status','paid')
    if(marked.error)throw marked.error
  }catch{
    await client.from('digital_pack_orders')
      .update({email_claimed_at:null}).eq('id',order.id).eq('status','paid')
    throw new Error('Digital pack order paid; confirmation email pending')
  }
  return 'paid'
}

/** Signed Stripe refund/dispute notification only; entitlement stops on incident. */
export async function recordDigitalPackPaymentIncident(event: {
  type:string;livemode:boolean;data:{object:Record<string,unknown>}
}) {
  if(event.livemode!==(process.env.VERCEL_ENV==='production'))throw new Error('Cross environment incident')
  const value=event.data.object.payment_intent
  if(typeof value!=='string'||!/^pi_[A-Za-z0-9_]+$/.test(value))return false
  const client=db()
  const row=await client.from('digital_pack_orders').select('id,status')
    .eq('payment_intent',value).maybeSingle()
  if(row.error)throw row.error
  if(!row.data)return false
  const status=event.type==='charge.refunded'?'refunded':'disputed'
  if(row.data.status===status)return true
  const updated=await client.from('digital_pack_orders')
    .update({status}).eq('id',row.data.id).eq('status','paid')
  if(updated.error)throw updated.error
  return true
}
