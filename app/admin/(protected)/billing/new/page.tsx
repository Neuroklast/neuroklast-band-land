import { admin } from '@/lib/neurokore/server'
import { getBillingSettings, listBillingCustomers } from '@/lib/billing/service'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { InvoiceForm } from '../InvoiceForm'
import Link from 'next/link'
import { billingDateInGermany, plusBillingDays } from '@/lib/billing/date'
export const dynamic='force-dynamic'
export default async function NewInvoicePage() {
 await admin()
 const [settings,customers]=await Promise.all([getBillingSettings(),listBillingCustomers()])
 const mode=settings.tax_mode
 return <main>
  <AdminPageHeader title="Neuer Rechnungsentwurf" description="Noch keine Rechnungsnummer. Die Nummer wird erst bei Ausstellung reserviert."/>
  {mode==='unverified'?<p className="text-red-400">Steuerprofil nicht geprüft. <Link href="/admin/billing/settings" className="underline">Rechnungssteller konfigurieren</Link></p>:
   customers.length===0?<p className="text-zinc-400">Zuerst <Link href="/admin/billing/customers" className="underline">einen Kunden anlegen</Link>.</p>:
   <InvoiceForm dueDate={plusBillingDays(billingDateInGermany(),14)} customers={customers.map(c=>({id:String(c.id),name:String(c.name)}))}
    taxMode={mode as 'small_business'|'vat_registered'} today={billingDateInGermany()}/>}
 </main>
}
