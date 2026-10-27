import { admin, db } from '@/lib/neurokore/server'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'

export const dynamic = 'force-dynamic'

interface Order {
  id: string; email: string; created_at: string
  price_id: string; stripe_session: string | null
  payment_intent: string | null; license_id: string | null
  payment_state: string; payment_state_at: string | null
  confirmation_sent_at: string | null
  products: { title: string; slug: string } | null
}

export default async function PluginOrdersPage() {
  await admin() // Existing admin role and MFA required.
  let orders: Order[] = []
  let errorMessage = ''
  try {
    const { data, error } = await db().from('plugin_orders')
      .select('id,email,created_at,price_id,stripe_session,payment_intent,license_id,confirmation_sent_at,payment_state,payment_state_at,products(title,slug)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    orders = (data ?? []).map(row => ({
      ...row,
      products: Array.isArray(row.products) ? (row.products[0] ?? null) : row.products ?? null,
    })) as Order[]
  } catch {
    errorMessage = 'Orders could not be loaded. Verify that the canonical Supabase schema is deployed and accessible.'
  }
  return (
    <main className="space-y-6">
      <AdminPageHeader title="Plugin orders"
        description="Recent purchases and fulfilment status. This page does not initiate charges or refunds." />
      {errorMessage && <p role="alert" className="border border-red-700 p-4 text-red-300">{errorMessage}</p>}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="border border-zinc-700 bg-zinc-950 p-5"><p className="text-xs text-zinc-400">Last 100 orders</p><p className="text-3xl">{orders.length}</p></div>
        <div className="border border-zinc-700 bg-zinc-950 p-5"><p className="text-xs text-zinc-400">Licence assigned</p><p className="text-3xl">{orders.filter(o => o.license_id).length}</p></div>
        <div className="border border-zinc-700 bg-zinc-950 p-5"><p className="text-xs text-zinc-400">Confirmation accepted</p><p className="text-3xl">{orders.filter(o => o.confirmation_sent_at).length}</p></div>
        <div className="border border-zinc-700 bg-zinc-950 p-5"><p className="text-xs text-zinc-400">Payment incidents</p><p className="text-3xl">{orders.filter(o => ['refunded','partially_refunded','disputed','dispute_closed','failed','expired'].includes(o.payment_state)).length}</p></div>
      </div>
      <p className="text-sm text-zinc-400">
        Payment incidents are reconciled from signed Stripe webhooks. Verify disputed payments, pending refunds and invoice issuance in Stripe. A licence assignment is not proof of settlement.
      </p>
      <div className="overflow-x-auto border border-zinc-700">
        <table className="w-full min-w-[50rem] text-sm">
          <thead><tr className="border-b border-zinc-700 bg-zinc-900 text-zinc-300">
            <th className="px-4 py-3 text-left">Order</th>
            <th className="px-4 py-3 text-left">Product</th>
            <th className="px-4 py-3 text-left">Customer</th>
            <th className="px-4 py-3 text-left">Created</th>
            <th className="px-4 py-3 text-left">Payment</th>
            <th className="px-4 py-3 text-left">Licence</th>
            <th className="px-4 py-3 text-left">Contract email</th>
          </tr></thead>
          <tbody>{orders.map(order =>
            <tr key={order.id} className="border-b border-zinc-800 text-zinc-300">
              <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
              <td className="px-4 py-3">{order.products?.title ?? 'Unknown'}</td>
              <td className="px-4 py-3 break-words">{order.email}</td>
              <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString('de-DE')}</td>
              <td className="px-4 py-3">
                <span className={['refunded','partially_refunded','disputed','dispute_closed','failed'].includes(order.payment_state)
                  ? 'text-amber-300' : 'text-zinc-300'}>{order.payment_state}</span>
              </td>
              <td className="px-4 py-3">{order.license_id ? (
                ['refunded','disputed','dispute_closed'].includes(order.payment_state) ? 'Blocked for new activations' : 'Assigned'
              ) : 'Pending'}</td>
              <td className="px-4 py-3">{order.confirmation_sent_at ? 'Accepted by provider' : 'Pending'}</td>
            </tr>)}</tbody>
        </table>
      </div>
    </main>
  )
}
