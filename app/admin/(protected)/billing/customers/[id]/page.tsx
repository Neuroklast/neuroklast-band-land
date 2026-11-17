import { admin } from '@/lib/neurokore/server'
import { getBillingCustomer } from '@/lib/billing/service'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { CustomerForm } from '../CustomerForm'
export const dynamic='force-dynamic'
export default async function CustomerPage({params}:{params:Promise<{id:string}>}) {
 await admin()
 const {id}=await params
 const customer=await getBillingCustomer(id)
 return <main><AdminPageHeader title={String(customer.name)} description="Änderungen an Stammdaten verändern ausgestellte Rechnungen nicht."/>
  <div className="max-w-xl"><CustomerForm customer={customer}/></div></main>
}
