import Link from 'next/link'
import { admin } from '@/lib/neurokore/server'
import { listBillingInvoices } from '@/lib/billing/service'
import { formatCents } from '@/lib/billing/domain'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'

export const dynamic='force-dynamic'
export default async function BillingPage() {
 await admin()
 let invoices:Awaited<ReturnType<typeof listBillingInvoices>>=[],error=''
 try {invoices=await listBillingInvoices()}catch{error='Rechnungen konnten nicht geladen werden. Datenbankschema prüfen.'}
 const count=(s:string)=>invoices.filter(i=>i.status===s).length
 return <main>
  <AdminPageHeader title="Rechnungen" description="Eigene Rechnungen und Dokumentenarchiv. Stripe-Managed-Payments-Belege werden hier nicht erneut ausgestellt."
   action={<Link href="/admin/billing/new" className="bg-red-800 px-4 py-2 min-h-11 text-white">+ Rechnung</Link>}/>
  <div className="flex flex-wrap gap-3 text-sm mb-6">
    <div className="border border-zinc-800 p-4">Entwürfe: {count('draft')}</div>
    <div className="border border-zinc-800 p-4">Archivierung offen: {count('preparing')}</div>
    <div className="border border-zinc-800 p-4">Ausgestellt: {count('issued')}</div>
  </div>
  {error?<p role="alert" className="text-red-400">{error}</p>:<div className="overflow-x-auto border border-zinc-800">
   <table className="w-full text-sm"><thead><tr className="text-zinc-400 border-b border-zinc-800">
    <th className="p-3 text-left">Nummer</th><th className="p-3 text-left">Kunde</th>
    <th className="p-3 text-left">Datum</th><th className="p-3 text-left">Fälligkeit</th>
    <th className="p-3 text-right">Betrag</th><th className="p-3 text-left">Status</th></tr></thead>
    <tbody>{invoices.map(i=><tr key={String(i.id)} className="border-b border-zinc-800 hover:bg-zinc-900">
      <td className="p-3"><Link className="underline" href={'/admin/billing/'+String(i.id)}>{String(i.number??'Entwurf')}</Link></td>
      <td className="p-3">{String((i.recipient as Record<string,string>)?.name??'')}</td>
      <td className="p-3">{String(i.issue_date)}</td><td className="p-3">{String(i.due_date)}</td>
      <td className="p-3 text-right">{formatCents(Number(i.total_cents))}</td>
      <td className="p-3">{i.status==='preparing'?'Archivierung ausstehend':i.status==='issued'?'Ausgestellt':'Entwurf'}</td>
    </tr>)}</tbody></table>
    {invoices.length===0&&<p className="p-5 text-zinc-400">Noch keine Rechnungen.</p>}
   </div>}
 </main>
}
