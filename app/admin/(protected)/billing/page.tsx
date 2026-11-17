import Link from 'next/link'
import { admin } from '@/lib/neurokore/server'
import { listBillingInvoices, billingInvoiceCounts } from '@/lib/billing/service'
import { formatCents, billingPaymentStatus } from '@/lib/billing/domain'
import { billingDateInGermany } from '@/lib/billing/date'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'

export const dynamic='force-dynamic'
export default async function BillingPage({searchParams}:{searchParams:Promise<{page?:string;year?:string;status?:string;number?:string}>}) {
 await admin()
 const params=await searchParams
 const requested=Number(params.page??'1')
 const page=Number.isSafeInteger(requested)&&requested>=1&&requested<=10000?requested:1
 const pageSize=50
 const today=billingDateInGermany()
 const yearCandidate=params.year?Number(params.year):undefined
 const year=yearCandidate!==undefined && Number.isInteger(yearCandidate) && yearCandidate>=2000 && yearCandidate<=2200?yearCandidate:undefined
 const status=['draft','preparing','issued'].includes(params.status??'')?params.status as 'draft'|'preparing'|'issued':undefined
 const number=typeof params.number==='string'?params.number.trim().slice(0,80):''
 const pageHref=(nextPage:number)=>{
   const search=new URLSearchParams({page:String(nextPage)})
   if(year)search.set('year',String(year))
   if(status)search.set('status',status)
   if(number)search.set('number',number)
   return '/admin/billing?'+search
 }
 let invoices:Awaited<ReturnType<typeof listBillingInvoices>>=[],counts={draft:0,preparing:0,issued:0},error=''
 try {
   [invoices,counts]=await Promise.all([listBillingInvoices(pageSize,(page-1)*pageSize,{year,status,number}),billingInvoiceCounts()])
 }catch{error='Rechnungen konnten nicht geladen werden. Datenbankschema prüfen.'}
 return <main>
  <AdminPageHeader title="Rechnungen" description="Eigene Rechnungen und Dokumentenarchiv. Stripe-Managed-Payments-Belege werden hier nicht erneut ausgestellt."
   action={<div className="flex gap-2 flex-wrap">
     <Link href={'/api/admin/billing/export?year='+String(year??Number(today.slice(0,4)))}
       className="border border-zinc-700 px-4 py-2 min-h-11 text-white">CSV-Export</Link>
     <Link href="/admin/billing/new" className="bg-red-800 px-4 py-2 min-h-11 text-white">+ Rechnung</Link>
   </div>}/>
  <div className="flex flex-wrap gap-3 text-sm mb-6">
    <div className="border border-zinc-800 p-4">Entwürfe: {counts.draft}</div>
    <div className="border border-zinc-800 p-4">Archivierung offen: {counts.preparing}</div>
    <div className="border border-zinc-800 p-4">Ausgestellt: {counts.issued}</div>
  </div>
  <form method="get" className="flex flex-wrap gap-3 border border-zinc-800 p-4 mb-5 text-sm items-end">
    <label className="space-y-1 min-w-40 flex-1"><span>Rechnungsnummer</span>
      <input type="search" name="number" defaultValue={number} maxLength={80}
        className="block w-full border border-zinc-700 bg-black px-3 py-2 min-h-11"/>
    </label>
    <label className="space-y-1"><span>Jahr</span>
      <input type="number" name="year" defaultValue={year} min={2000} max={2200}
        className="block w-28 border border-zinc-700 bg-black px-3 py-2 min-h-11"/>
    </label>
    <label className="space-y-1"><span>Rechnungsstatus</span>
      <select name="status" defaultValue={status??''} className="block border border-zinc-700 bg-black px-3 py-2 min-h-11">
        <option value="">Alle</option><option value="draft">Entwurf</option>
        <option value="preparing">Archivierung offen</option><option value="issued">Ausgestellt</option>
      </select>
    </label>
    <button type="submit" className="border border-zinc-700 px-4 min-h-11">Filtern</button>
    <Link className="underline px-2 py-3" href="/admin/billing">Zurücksetzen</Link>
  </form>
  {error?<p role="alert" className="text-red-400">{error}</p>:<div className="overflow-x-auto border border-zinc-800">
   <table className="w-full text-sm"><thead><tr className="text-zinc-400 border-b border-zinc-800">
    <th className="p-3 text-left">Nummer</th><th className="p-3 text-left">Kunde</th>
    <th className="p-3 text-left">Datum</th><th className="p-3 text-left">Fälligkeit</th>
    <th className="p-3 text-right">Betrag</th><th className="p-3 text-right">Offen</th><th className="p-3 text-left">Status</th></tr></thead>
    <tbody>{invoices.map(i=>{
      const total=Number(i.total_cents)
      const paid=Number(i.paid_cents??0)
      const status=billingPaymentStatus(String(i.status),String(i.due_date),total,paid,today)
      const names:Record<typeof status,string>={
        draft:'Entwurf',preparing:'Archivierung offen',open:'Offen',
        partial:'Teilbezahlt',overdue:'Überfällig',paid:'Bezahlt',invalid:'Prüfung erforderlich',
      }
      return <tr key={String(i.id)} className="border-b border-zinc-800 hover:bg-zinc-900">
        <td className="p-3"><Link className="underline" href={'/admin/billing/'+String(i.id)}>{String(i.number??'Entwurf')}</Link></td>
        <td className="p-3">{String((i.recipient as Record<string,string>)?.name??'')}</td>
        <td className="p-3">{String(i.issue_date)}</td><td className="p-3">{String(i.due_date)}</td>
        <td className="p-3 text-right">{formatCents(total)}</td>
        <td className="p-3 text-right">{i.status==='issued'?formatCents(Math.max(0,total-paid)):'–'}</td>
        <td className={'p-3 '+(status==='overdue'||status==='invalid'?'text-red-400':'')}>{names[status]}</td>
      </tr>
    })}</tbody></table>
    {invoices.length===0&&<p className="p-5 text-zinc-400">Noch keine Rechnungen.</p>}
   </div>}
  {!error&&<nav aria-label="Rechnungsseiten" className="flex gap-4 items-center mt-4 text-sm">
    {page>1&&<Link href={pageHref(page-1)} className="underline">Vorherige</Link>}
    <span>Seite {page}</span>
    {invoices.length===pageSize&&<Link href={pageHref(page+1)} className="underline">Nächste</Link>}
  </nav>}
 </main>
}
