import { admin } from '@/lib/neurokore/server'
import { getBillingInvoice,listBillingCustomers } from '@/lib/billing/service'
import { formatCents } from '@/lib/billing/domain'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { saveBillingPayment,issueBillingDraft } from '@/app/admin/_actions/billing'
import { InvoiceForm } from '../InvoiceForm'
import Link from 'next/link'
export const dynamic='force-dynamic'
export default async function InvoiceDetail({params}:{params:Promise<{id:string}>}) {
 await admin()
 const {id}=await params
 const [{invoice,payments},customers]=await Promise.all([getBillingInvoice(id),listBillingCustomers()])
 const total=Number(invoice.total_cents)
 const paid=payments.reduce((sum,p)=>sum+Number(p.amount_cents),0)
 const status=String(invoice.status)
 const recipient=invoice.recipient as Record<string,string>
 return <main>
  <AdminPageHeader title={invoice.number?String(invoice.number):'Rechnungsentwurf'} description={'Kunde: '+String(recipient?.name??'')}/>
  {status==='draft'?<>
    <InvoiceForm customers={customers.map(c=>({id:String(c.id),name:String(c.name)}))}
      taxMode={invoice.tax_mode as 'small_business'|'vat_registered'} today={String(invoice.issue_date)}
      initial={{
        id, revision:Number(invoice.revision),customer_id:String(invoice.customer_id),
        issue_date:String(invoice.issue_date),service_date:String(invoice.service_date),due_date:String(invoice.due_date),
        note:String(invoice.note??''),lines:invoice.lines as {description:string;quantity_milli:number;unit_cents:number;tax_rate:0|7|19}[]
      }}/>
    <form action={issueBillingDraft} className="mt-8 border-t border-zinc-800 pt-6 space-y-3">
      <input type="hidden" name="id" value={id}/>
      <p className="text-zinc-300 text-sm">Vor dem Ausstellen alle Angaben prüfen. Danach sind Rechnungsinhalt und Nummer gesperrt.</p>
      <button className="border border-red-700 min-h-11 px-5 text-white" type="submit">Verbindlich ausstellen und archivieren</button>
    </form>
  </>:status==='preparing'?<div className="space-y-4">
    <p className="text-amber-300">Nummer ist bereits reserviert. Dokumentarchivierung steht noch aus.</p>
    <form action={issueBillingDraft}><input type="hidden" name="id" value={id}/>
      <button type="submit" className="border border-zinc-700 p-3 min-h-11">Archivierung erneut versuchen</button>
    </form>
  </div>:<div className="space-y-5">
    <div className="flex gap-3 flex-wrap">
      <Link className="border border-zinc-700 px-5 py-3" href={'/api/admin/billing/'+id+'/document?format=pdf'}>PDF anzeigen</Link>
      <Link className="border border-zinc-700 px-5 py-3" href={'/api/admin/billing/'+id+'/document?format=fodt'}>ODF (FODT) herunterladen</Link>
    </div>
    <section className="border border-zinc-800 p-4 space-y-2">
      <h2 className="font-semibold">Zahlungen</h2>
      <p>Rechnungsbetrag: {formatCents(total)}. Eingegangen: {formatCents(paid)}. Offen: {formatCents(total-paid)}</p>
      {payments.map(p=><p key={String(p.id)} className="text-sm text-zinc-400">{String(p.paid_on)}: {formatCents(Number(p.amount_cents))} {String(p.reference||'')}</p>)}
      {paid<total&&<form action={saveBillingPayment} className="flex flex-wrap items-end gap-3 pt-3">
        <input type="hidden" name="id" value={id}/>
        <label className="text-sm space-y-1"><span>Betrag (€)</span><input name="amount" inputMode="decimal" required className="block border border-zinc-700 bg-black p-3"/></label>
        <label className="text-sm space-y-1"><span>Datum</span><input name="paid_on" type="date" required defaultValue={new Date().toISOString().slice(0,10)} className="block border border-zinc-700 bg-black p-3"/></label>
        <label className="text-sm space-y-1"><span>Referenz</span><input name="reference" maxLength={240} className="block border border-zinc-700 bg-black p-3"/></label>
        <button type="submit" className="border border-zinc-700 px-4 min-h-11">Zahlung erfassen</button>
      </form>}
    </section>
    <p className="text-zinc-400 text-sm">Ausgestellte Rechnungen können nicht überschrieben werden. Korrekturen werden als gesonderter Geschäftsvorfall umgesetzt.</p>
  </div>}
 </main>
}
