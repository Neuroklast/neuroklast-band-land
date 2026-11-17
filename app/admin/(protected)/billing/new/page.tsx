import { admin } from '@/lib/neurokore/server'
import { getBillingSettings, listBillingCustomers } from '@/lib/billing/service'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { InvoiceForm } from '../InvoiceForm'
import Link from 'next/link'
import { billingDateInGermany, plusBillingDays } from '@/lib/billing/date'
export const dynamic='force-dynamic'
export default async function NewInvoicePage({searchParams}:{searchParams:Promise<{customer?:string}>}) {
 await admin()
 const params=await searchParams
 const customerSearch=typeof params.customer==='string'?params.customer.trim().slice(0,100):''
 const [settings,customers]=await Promise.all([getBillingSettings(),listBillingCustomers(customerSearch)])
 const mode=settings.tax_mode
 return <main>
  <AdminPageHeader title="Neuer Rechnungsentwurf" description="Noch keine Rechnungsnummer. Die Nummer wird erst bei Ausstellung reserviert."/>
  <form method="get" className="flex flex-wrap gap-2 mb-6 max-w-xl">
    <label htmlFor="billing-customer-query" className="sr-only">Kundenname suchen</label>
    <input id="billing-customer-query" type="search" name="customer" defaultValue={customerSearch}
      placeholder="Kundenname suchen, vor dem Ausfüllen des Entwurfs" maxLength={100}
      className="flex-1 border border-zinc-700 bg-black min-h-11 px-3 py-2"/>
    <button type="submit" className="border border-zinc-700 px-4 py-2 min-h-11">Kunden anzeigen</button>
  </form>
  {mode==='unverified'?<p className="text-red-400">Steuerprofil nicht geprüft. <Link href="/admin/billing/settings" className="underline">Rechnungssteller konfigurieren</Link></p>:
   customers.length===0?<p className="text-zinc-400">Keinen passenden Kunden gefunden. <Link href="/admin/billing/customers" className="underline">Adressbuch öffnen</Link>.</p>:
   <InvoiceForm dueDate={plusBillingDays(billingDateInGermany(),14)} customers={customers.map(c=>({id:String(c.id),name:String(c.name)}))}
    taxMode={mode as 'small_business'|'vat_registered'} today={billingDateInGermany()}/>}
 </main>
}
