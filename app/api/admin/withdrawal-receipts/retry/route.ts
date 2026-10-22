import { admin, db, json, sameOrigin } from '@/lib/neurokore/server'
import { attemptWithdrawalReceipt, type WithdrawalNotice } from '@/lib/withdrawal-receipt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Admin-only remediation for records whose initial Resend acceptance failed. */
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await admin()
    const client = db()
    const { data, error } = await client.from('plugin_withdrawal_notices')
      .select('id,name,email,contract_details,locale,received_at,customer_receipt_at,provider_notice_at')
      .or('customer_receipt_at.is.null,provider_notice_at.is.null')
      .order('received_at', { ascending: true })
      .limit(25)
    if (error) throw error
    let confirmed = 0
    let pending = 0
    for (const item of data ?? []) {
      const ok = await attemptWithdrawalReceipt(item as WithdrawalNotice)
      if (ok) confirmed++
      else pending++
    }
    return json({ confirmed, pending })
  } catch {
    return json({ error: 'Unable to process pending confirmations.' }, 403)
  }
}
