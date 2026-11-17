import { admin } from '@/lib/neurokore/server'
import { listBillingInvoices } from '@/lib/billing/service'
import { billingDateInGermany } from '@/lib/billing/date'
import { billingLedgerCsv } from '@/lib/billing/csv'
export const runtime='nodejs'
export const dynamic='force-dynamic'

/** Read-only bookkeeping overview; not a DATEV or certified tax filing export. */
export async function GET(request:Request) {
  try {
    await admin()
    const requested=new URL(request.url).searchParams.get('year')??billingDateInGermany().slice(0,4)
    if(!/^\d{4}$/.test(requested))return Response.json({error:'Invalid year'},{status:400})
    const year=Number(requested)
    if(year<2000||year>2200)return Response.json({error:'Invalid year'},{status:400})
    const rows:Awaited<ReturnType<typeof listBillingInvoices>>=[]
    const perPage=100
    for(let offset=0;offset<=10000;offset+=perPage) {
      const page=await listBillingInvoices(perPage,offset,{year})
      if(offset===10000 && page.length>0)throw new Error('Too many invoices for CSV export')
      rows.push(...page)
      if(page.length<perPage)break
    }
    const csv=billingLedgerCsv(rows,billingDateInGermany())
    return new Response(csv,{status:200,headers:{
      'Content-Type':'text/csv; charset=utf-8',
      'Content-Disposition':'attachment; filename="neuroklast-rechnungen-'+year+'.csv"',
      'Cache-Control':'private, no-store',
      'X-Content-Type-Options':'nosniff',
    }})
  }catch{
    return Response.json({error:'Billing export unavailable or administrator access denied'},
      {status:503,headers:{'Cache-Control':'no-store'}})
  }
}
