import Link from 'next/link'
import { admin } from '@/lib/neurokore/server'
import { listBillingCustomers } from '@/lib/billing/service'
import { CustomerForm } from './CustomerForm'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
export const dynamic='force-dynamic'
export default async function CustomersPage() {
 await admin()
 const customers=await listBillingCustomers()
 return <main>
  <AdminPageHeader title="Kunden" description="Wiederkehrende Rechnungsempfänger und ihre Anschriften."/>
  <div className="grid gap-8 lg:grid-cols-2">
   <div className="space-y-3">
    {customers.map(c=><Link key={String(c.id)} href={'/admin/billing/customers/'+c.id} className="block border border-zinc-800 p-4 hover:bg-zinc-900">
      <strong>{String(c.name)}</strong><p className="text-sm text-zinc-400">{String(c.city??'')} · {String(c.email??'')}</p>
    </Link>)}
    {customers.length===0&&<p className="text-zinc-400">Noch keine Kunden gespeichert.</p>}
   </div>
   <CustomerForm/>
  </div>
 </main>
}
