import { admin } from '@/lib/neurokore/server'
import { invoiceDocumentUrl } from '@/lib/billing/service'
export const runtime='nodejs'
export const dynamic='force-dynamic'
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
 try {
  await admin()
  const {id}=await params
  const format=new URL(request.url).searchParams.get('format')
  if(format!=='pdf'&&format!=='fodt')return Response.json({error:'Unsupported format'},{status:400})
  const url=await invoiceDocumentUrl(id,format)
  return Response.redirect(url,302)
 }catch{return Response.json({error:'Document unavailable or access denied'},{status:403,headers:{'Cache-Control':'no-store'}})}
}
