import { timingSafeEqual } from 'node:crypto'
import { db } from '@/lib/neurokore/server'
import { attemptWithdrawalReceipt, type WithdrawalNotice } from '@/lib/withdrawal-receipt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Recover delayed durable-medium acknowledgements after transient mail failures. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization') ?? ''
  const supplied = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!secret || Buffer.byteLength(supplied) !== Buffer.byteLength(secret) ||
      !timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))) {
    return new Response(null, { status: 401 })
  }
  try {
    const client = db()
    const { data, error } = await client.from('plugin_withdrawal_notices')
      .select('id,name,email,contract_details,locale,received_at,customer_receipt_at,provider_notice_at')
      .or('customer_receipt_at.is.null,provider_notice_at.is.null')
      .order('received_at', { ascending: true }).limit(25)
    if (error) throw error
    let sent = 0
    let failed = 0
    for (const item of data ?? []) {
      if (await attemptWithdrawalReceipt(item as WithdrawalNotice).catch(() => false)) sent++
      else failed++
    }
    // Vercel runtime alerting should monitor this error; never log personal data.
    if (failed) console.error('[withdrawal-receipts] pending confirmations', { failed })
    return Response.json({ checked: (data ?? []).length, sent, failed }, {
      status: failed ? 503 : 200, headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    console.error('[withdrawal-receipts] automatic retry failed')
    return Response.json({ error: 'Retry unavailable' }, { status: 503 })
  }
}
