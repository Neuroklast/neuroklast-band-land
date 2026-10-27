import Link from 'next/link'
import { admin, db } from '@/lib/neurokore/server'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { ContactCaseActions } from './ContactCaseActions'

export const dynamic = 'force-dynamic'

type ContactCase = {
  id: string; name: string; email: string; subject: string; message: string
  delivery_state: string; created_at: string; closed_at: string | null
}
type OrderMatch = { id: string; email: string; license_id: string | null; test_deleted_at: string | null }

export default async function ContactInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; show?: string }>
}) {
  await admin()
  const query = await searchParams
  const q = typeof query.q === 'string' ? query.q.trim().slice(0,254) : ''
  const showAll = query.show === 'all'
  let cases: ContactCase[] = []
  let orders: OrderMatch[] = []
  let errorMessage = ''
  try {
    const client = db()
    let builder = client.from('plugin_contact_requests')
      .select('id,name,email,subject,message,delivery_state,created_at,closed_at')
    if (!showAll) builder = builder.is('closed_at', null)
    if (q) builder = builder.ilike('email', '%' + q.replace(/[%_,()]/g, '') + '%')
    const result = await builder.order('created_at', { ascending: false }).limit(100)
    if (result.error) throw result.error
    cases = result.data || []
    const emails = [...new Set(cases.map(c => c.email.toLowerCase()))]
    if (emails.length) {
      const matched = await client.from('plugin_orders')
        .select('id,email,license_id,test_deleted_at').in('email', emails)
        .not('license_id','is',null).limit(1000)
      if (matched.error) throw matched.error
      orders = matched.data || []
    }
  } catch {
    errorMessage = 'Support inbox unavailable. Verify Supabase service-role access and schema migration.'
  }
  const countFor = (email: string) =>
    orders.filter(o => o.email.toLowerCase() === email.toLowerCase() && !o.test_deleted_at).length
  return (
    <main className="space-y-6">
      <AdminPageHeader title="Contact inbox"
        description="Customer requests linked to existing orders by self-reported email. Matches help triage; they do not verify ownership." />
      {errorMessage && <p role="alert" className="border border-red-700 p-4 text-red-300">{errorMessage}</p>}
      <form method="get" className="flex flex-wrap items-end gap-3 border border-zinc-700 bg-zinc-950 p-4">
        <label className="min-w-56 flex-1 text-sm text-zinc-300">
          Contact email
          <input type="search" name="q" defaultValue={q} placeholder="customer@example.com"
            className="mt-2 min-h-11 w-full border border-zinc-700 bg-black px-3 text-white" />
        </label>
        <label className="text-sm text-zinc-300">
          Show
          <select name="show" defaultValue={showAll?'all':'open'} className="mt-2 block min-h-11 border border-zinc-700 bg-black px-3 text-white">
            <option value="open">Open only</option><option value="all">All requests</option>
          </select>
        </label>
        <button className="min-h-11 border border-red-700 px-5 text-sm font-semibold hover:bg-red-900/30">Search</button>
        <Link href="/admin/contact-inbox" className="min-h-11 px-3 py-3 text-sm underline">Clear</Link>
      </form>
      <p className="text-xs text-zinc-400">
        Showing {cases.length} request(s). Matching means the sender typed the same email; verify the customer's identity before changing any licence.
      </p>
      <div className="space-y-4">
        {cases.map(item => {
          const count = countFor(item.email)
          return (
            <article key={item.id} className="space-y-3 border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-white">{item.subject}</p>
                  <p className="break-all text-sm text-zinc-300">{item.name} · {item.email}</p>
                  <p className="text-xs text-zinc-500">{new Date(item.created_at).toLocaleString('de-DE')} · Mail {item.delivery_state} · {item.closed_at?'Closed':'Open'}</p>
                </div>
                <div className="space-y-2 text-right">
                  <p className={count ? 'text-sm text-emerald-300' : 'text-sm text-zinc-400'}>
                    {count ? count + ' matching licence order(s)' : 'No matching licence order'}
                  </p>
                  <Link href={'/admin/orders?q=' + encodeURIComponent(item.email)}
                    className="inline-block min-h-10 border border-zinc-700 px-3 py-2 text-xs hover:border-red-700">
                    Find customer orders
                  </Link>
                </div>
              </div>
              <p className="whitespace-pre-wrap break-words border-t border-zinc-800 pt-3 text-sm leading-7 text-zinc-200">{item.message}</p>
              <ContactCaseActions id={item.id} email={item.email} isClosed={Boolean(item.closed_at)} />
            </article>
          )
        })}
        {!cases.length && !errorMessage && <p className="border border-zinc-800 p-5 text-sm text-zinc-400">No matching requests.</p>}
      </div>
    </main>
  )
}
