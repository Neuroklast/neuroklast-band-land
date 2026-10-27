import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { PUBLIC_LEGAL_LOCALES } from '@/lib/legal-routes'
import { body, db, json, limit, sameOrigin } from '@/lib/neurokore/server'
import { attemptWithdrawalReceipt, type WithdrawalNotice } from '@/lib/withdrawal-receipt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.email().max(254).transform(value => value.toLowerCase()),
  orderReference: z.string().trim().min(3).max(500),
  locale: z.enum(PUBLIC_LEGAL_LOCALES).default('en'),
}).strict()

/**
 * Record the legally relevant receipt time before attempting external email.
 * A provider outage must not make the consumer's declaration disappear.
 */
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'withdrawal-request', 5)
  } catch {
    return json({ error: 'Too many requests or invalid origin.' }, 429)
  }
  const parsed = inputSchema.safeParse(await body(request).catch(() => null))
  if (!parsed.success) return json({ error: 'Please check all required fields.' }, 400)

  const { name, email, orderReference, locale } = parsed.data
  const client = db()
  const { data, error } = await client.from('plugin_withdrawal_notices')
    .insert({ id: randomUUID(), name, email, contract_details: orderReference, locale })
    .select('id,name,email,contract_details,locale,received_at,customer_receipt_at,provider_notice_at')
    .single()
  if (error || !data) {
    // Never claim receipt when persistence was not confirmed.
    return json({ error: 'Submission could not be recorded. Please contact the seller by email.' }, 503)
  }

  const record = data as WithdrawalNotice
  const confirmationSent = await attemptWithdrawalReceipt(record).catch(() => false)
  return json({
    accepted: true,
    receivedAt: record.received_at,
    reference: record.id,
    confirmationSent,
  })
}
