import Link from 'next/link'
import { admin } from '@/lib/neurokore/server'
import { listBillingCustomers } from '@/lib/billing/service'
import { CustomerForm } from './CustomerForm'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
export const dynamic='force-dynamic'
export default async function CustomersPage({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}) {
 await admin()
 const params=await searchParams
 const q=typeof params.q==='string'?params.q.trim().slice(0,100):''
 const requested=Number(params.page??'1')
 const page=Number.isSafeInteger(requested)&&requested>=1&&requested<=40000?requested:1
 const perPage=25
 const customers=await listBillingCustomers(q,perPage,(page-1)*perPage)
 const href=(p:number)=>'/admin/billing/customers?q='+encodeURIComponent(q)+'&page='+p
 return <main>
  <AdminPageHeader title="Kunden" description="Wiederkehrende Rechnungsempfänger, Adressen und Ansprechpartner."/>
  <div className="grid gap-8 lg:grid-cols-2">
   <div className="space-y-4">
    <form method="get" className="flex gap-2">
      <input type="search" name="q" defaultValue={q} maxLength={100} placeholder="Kunde suchen"
        aria-label="Kundenname" className="flex-1 min-w-0 border border-zinc-700 bg-black px-3 py-2 min-h-11"/>
      <button type="submit" className="border border-zinc-700 px-4 min-h-11">Suchen</button>
    </form>
    {customers.map(c=><Link key={String(c.id)} href={'/admin/billing/customers/'+String(c.id)}
      className="block border border-zinc-800 p-4 hover:bg-zinc-900">
      <strong>{String(c.name)}</strong><p className="text-sm text-zinc-400">{String(c.city??'')} · {String(c.email??'')}</p>
    </Link>)}
    {customers.length===0&&<p className="text-zinc-400">{q?'Keine passenden Kunden.':'Noch keine Kunden gespeichert.'}</p>}
    <nav aria-label="Adressbuchseiten" className="flex gap-4 text-sm">
      {page>1&&<Link className="underline" href={href(page-1)}>Zurück</Link>}
      <span>Seite {page}</span>
      {customers.length===perPage&&<Link className="underline" href={href(page+1)}>Weiter</Link>}
    </nav>
   </div>
   <CustomerForm/>
  </div>
 </main>
}
