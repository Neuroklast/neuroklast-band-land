import { admin } from '@/lib/neurokore/server'
import { invoiceDocumentFile } from '@/lib/billing/service'
import type { BillingFormat } from '@/lib/billing/archive'

export const runtime='nodejs'
export const dynamic='force-dynamic'
const formats:BillingFormat[]=['pdf','odt','fodt','xrechnung']
const noStore={'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff'}

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    await admin()
  } catch {
    return Response.json({error:'Access denied'},{status:403,headers:noStore})
  }

  const format=new URL(request.url).searchParams.get('format')
  if(!format || !formats.includes(format as BillingFormat))
    return Response.json({error:'Unsupported format'},{status:400,headers:noStore})

  try {
    const {id}=await params
    const {bytes,fileName,contentType}=await invoiceDocumentFile(id,format as BillingFormat)
    const disposition=format==='pdf'?'inline':'attachment'
    return new Response(new Uint8Array(bytes),{
      status:200,
      headers:{
        ...noStore,
        'Content-Type':contentType,
        'Content-Length':String(bytes.byteLength),
        'Content-Disposition':disposition+'; filename="'+fileName+'"',
      },
    })
  } catch {
    return Response.json({error:'Document unavailable'},{status:404,headers:noStore})
  }
}
