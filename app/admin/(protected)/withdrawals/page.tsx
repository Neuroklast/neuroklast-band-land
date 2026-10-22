import { admin, db } from '@/lib/neurokore/server'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { RetryReceiptsButton } from './RetryReceiptsButton'

export const dynamic = 'force-dynamic'

type Notice = {
  id: string; received_at: string; locale: string
  customer_receipt_at: string | null; provider_notice_at: string | null
}

export default async function WithdrawalAdminPage() {
  await admin() // Require the existing administrative session and MFA.
  let notices: Notice[] = []
  let errorMessage: string | null = null
  try {
    const { data, error } = await db().from('plugin_withdrawal_notices')
      .select('id,received_at,locale,customer_receipt_at,provider_notice_at')
      .order('received_at', { ascending: false })
      .limit(100)
    if (error) throw error
    notices = data ?? []
  } catch {
    errorMessage = 'Withdrawal records unavailable. Verify the canonical Supabase schema was applied and the database connection works.'
  }
  const pending = notices.filter(item => !item.customer_receipt_at || !item.provider_notice_at)
  return (
    <main className="space-y-6">
      <AdminPageHeader title="Withdrawal confirmations"
        description="Electronic declarations are recorded before sending customer and operator receipts. No payment or licence is changed automatically." />
      {errorMessage && <p role="alert" className="border border-red-700 p-4 text-red-300">{errorMessage}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-zinc-700 bg-zinc-950 p-5"><p className="text-xs text-zinc-500">Recent notices</p><p className="text-3xl">{notices.length}</p></div>
        <div className="border border-zinc-700 bg-zinc-950 p-5"><p className="text-xs text-zinc-500">Pending receipt email</p><p className="text-3xl">{pending.length}</p></div>
        <div className="border border-zinc-700 bg-zinc-950 p-5"><p className="text-xs text-zinc-500">Both receipts accepted</p><p className="text-3xl">{notices.length - pending.length}</p></div>
      </div>
      <p className="text-sm text-zinc-400">
        Showing the 100 most recent declarations. Pending count covers these 100 records only.
        A receipt indicates the email provider accepted the message, not that the recipient has read it.
      </p>
      <RetryReceiptsButton pending={pending.length} />
      {pending.length > 0 && <p role="alert" className="border border-amber-700/60 p-4 text-amber-200">
        Unconfirmed notices need prompt handling. Verify Resend, the operator mailbox and the pending declaration references.
      </p>}
      <div className="overflow-x-auto border border-zinc-700">
        <table className="w-full min-w-[42rem] text-sm">
          <thead><tr className="border-b border-zinc-700 bg-zinc-900 text-zinc-300">
            <th className="px-4 py-3 text-left">Reference</th>
            <th className="px-4 py-3 text-left">Received (UTC)</th>
            <th className="px-4 py-3 text-left">Language</th>
            <th className="px-4 py-3 text-left">Customer receipt</th>
            <th className="px-4 py-3 text-left">Operator receipt</th>
          </tr></thead>
          <tbody>{notices.map(item =>
            <tr key={item.id} className="border-b border-zinc-800 text-zinc-300">
              <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
              <td className="px-4 py-3">{new Date(item.received_at).toISOString()}</td>
              <td className="px-4 py-3">{item.locale}</td>
              <td className="px-4 py-3">{item.customer_receipt_at ? 'Accepted' : 'Pending'}</td>
              <td className="px-4 py-3">{item.provider_notice_at ? 'Accepted' : 'Pending'}</td>
            </tr>)}</tbody>
        </table>
      </div>
    </main>
  )
}
