import 'server-only'
import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { getStorageProvider } from '@/lib/storage'
import { headR2Object } from '@/lib/storage/r2'
import { customerInput, sellerInput, draftInput, calculateInvoice, validateDates, type InvoiceLine } from './domain'
import { renderPdf, renderFodt, type DocumentInvoice } from './documents'
import { z } from 'zod'

const uuid=z.uuid()
const db=()=>createAdminClient()
type Row=Record<string,unknown>
const assert=(error:{message:string}|null,context:string)=>{if(error)throw new Error(context)}
const dataRow=(v:unknown):Row=>v as Row
const str=(x:unknown)=>String(x??'')
const bucket=()=>{
  const value=process.env.R2_BUCKET_BILLING
  if(!value||!/^[-a-zA-Z0-9]{3,64}$/.test(value))throw new Error('Private R2_BUCKET_BILLING not configured')
  if(value===process.env.R2_BUCKET_MEDIA)throw new Error('Billing bucket must be separate from media')
  return value
}
const issuer=(x:Row)=>({
  name:str(x.seller_name),street:str(x.seller_street),postal_code:str(x.seller_postal_code),
  city:str(x.seller_city),country:str(x.seller_country),tax_id:str(x.seller_tax_id),
  email:str(x.seller_email),iban:str(x.seller_iban),bic:str(x.seller_bic),
})
const recipient=(x:Row)=>({
  name:str(x.name),street:str(x.street),postal_code:str(x.postal_code),city:str(x.city),
  country:str(x.country),email:str(x.email),vat_id:str(x.vat_id),contact_name:str(x.contact_name),
})
async function settingsRow() {
  const {data,error}=await db().from('billing_settings').select('*').eq('id',1).maybeSingle()
  assert(error,'Billing settings unavailable')
  return (data??{
    id:1,seller_name:'',seller_street:'',seller_postal_code:'',seller_city:'',
    seller_country:'DE',seller_tax_id:'',seller_email:'',seller_iban:'',seller_bic:'',
    tax_mode:'unverified',number_prefix:'RE'
  }) as Row
}
export async function getBillingSettings() { return settingsRow() }
export async function updateBillingSettings(input:unknown,actorId:string) {
  uuid.parse(actorId)
  const clean=sellerInput.parse(input)
  // Changing the tax mode affects only new drafts. Previously reserved numbers stay immutable.
  const {data,error}=await db().from('billing_settings').upsert({id:1,...clean,updated_at:new Date().toISOString()}).select('*').single()
  assert(error,'Could not save seller settings')
  return data
}
export async function listBillingCustomers(q='',limit=100) {
  const search=q.trim().slice(0,100).replace(/[%_,()]/g,'')
  let query=db().from('billing_customers').select('*').eq('archived',false).order('name').limit(Math.min(Math.max(limit,1),100))
  if(search)query=query.ilike('name','%'+search+'%')
  const {data,error}=await query
  assert(error,'Customer lookup failed')
  return (data??[]) as Row[]
}
export async function getBillingCustomer(id:string) {
  uuid.parse(id)
  const {data,error}=await db().from('billing_customers').select('*').eq('id',id).maybeSingle()
  assert(error,'Customer lookup failed')
  if(!data)throw new Error('Customer not found')
  return data as Row
}
export async function createBillingCustomer(input:unknown,actorId:string) {
  uuid.parse(actorId)
  const clean=customerInput.parse(input)
  const {data,error}=await db().from('billing_customers').insert(clean).select('*').single()
  assert(error,'Customer creation failed')
  return data
}
export async function updateBillingCustomer(id:string,input:unknown,actorId:string) {
  uuid.parse(actorId); uuid.parse(id)
  const clean=customerInput.parse(input)
  const {data,error}=await db().from('billing_customers').update({...clean,updated_at:new Date().toISOString()}).eq('id',id).select('*').single()
  assert(error,'Customer update failed')
  return data
}
export async function listBillingInvoices(limit=100,offset=0) {
  if(!Number.isInteger(offset)||offset<0||offset>1000000)throw new Error('Invalid invoice offset')
  const pageSize=Math.max(1,Math.min(limit,100))
  const {data,error}=await db().from('billing_invoices').select('id,number,status,recipient,issue_date,due_date,total_cents,created_at,customer_id,document_error_at')
    .order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+pageSize-1)
  assert(error,'Invoice listing failed')
  return (data??[]) as Row[]
}
export async function billingInvoiceCounts() {
  const states=['draft','preparing','issued'] as const
  const results=await Promise.all(states.map(state=>db().from('billing_invoices')
    .select('id',{count:'exact',head:true}).eq('status',state)))
  if(results.some(result=>result.error))throw new Error('Invoice counts unavailable')
  return Object.fromEntries(states.map((s,i)=>[s,results[i].count??0])) as Record<typeof states[number],number>
}
export async function getBillingInvoice(id:string) {
  uuid.parse(id)
  const {data,error}=await db().from('billing_invoices').select('*').eq('id',id).maybeSingle()
  assert(error,'Invoice lookup failed')
  if(!data)throw new Error('Invoice not found')
  const {data:payments,error:paymentError}=await db().from('billing_payments')
    .select('id,amount_cents,paid_on,reference,created_at').eq('invoice_id',id).order('paid_on',{ascending:false})
  assert(paymentError,'Payments unavailable')
  return {invoice:data as Row,payments:(payments??[]) as Row[]}
}
async function buildDraft(input:unknown) {
  const parsed=draftInput.parse(input)
  validateDates(parsed)
  const [customer,seller]=await Promise.all([getBillingCustomer(parsed.customer_id),settingsRow()])
  if(customer.archived)throw new Error('Customer archived')
  const mode=seller.tax_mode
  if(mode!=='small_business'&&mode!=='vat_registered')throw new Error('Verify the seller tax mode first')
  const total=calculateInvoice(parsed.lines,mode)
  return {...parsed,recipient:recipient(customer),seller:issuer(seller),tax_mode:mode,...{
    subtotal_cents:total.subtotal_cents,tax_cents:total.tax_cents,total_cents:total.total_cents
  }}
}
export async function createBillingDraft(input:unknown,actorId:string) {
  uuid.parse(actorId)
  const fields=await buildDraft(input)
  const {data,error}=await db().from('billing_invoices').insert({...fields,created_by:actorId}).select('*').single()
  assert(error,'Invoice draft could not be created')
  return data as Row
}
export async function updateBillingDraft(id:string,input:unknown,actorId:string,expectedRevision:number) {
  uuid.parse(id);uuid.parse(actorId)
  if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0)throw new Error('Invalid draft version')
  const fields=await buildDraft(input)
  const {data,error}=await db().from('billing_invoices').update({...fields,updated_at:new Date().toISOString(),revision:expectedRevision+1})
    .eq('id',id).eq('status','draft').eq('revision',expectedRevision).select('*').maybeSingle()
  assert(error,'Invoice update failed')
  if(!data)throw new Error('Invoice changed or already reserved; reload the draft')
  return data as Row
}
export async function issueBillingInvoice(id:string,actorId:string) {
  uuid.parse(id);uuid.parse(actorId)
  const {data,error}=await db().rpc('billing_prepare_issue',{p_id:id,p_actor:actorId})
  assert(error,'Invoice cannot be issued: check settings, recipient and numbers')
  const row=dataRow(data)
  if(row.status!=='preparing')throw new Error('Unexpected invoice state')
  const number=str(row.number)
  const invoice:DocumentInvoice={
    id,number,issue_date:str(row.issue_date),service_date:str(row.service_date),
    due_date:str(row.due_date),seller:row.seller as Record<string,string>,
    recipient:row.recipient as Record<string,string>,lines:row.lines as InvoiceLine[],
    tax_mode:row.tax_mode as DocumentInvoice['tax_mode'],note:str(row.note)
  }
  const pdf=renderPdf(invoice),fodt=renderFodt(invoice)
  const pdfKey='billing/'+id+'/'+number+'.pdf',fodtKey='billing/'+id+'/'+number+'.fodt'
  const hashes={pdf:createHash('sha256').update(pdf).digest('hex'),fodt:createHash('sha256').update(fodt).digest('hex')}
  try {
    const name=bucket(),storage=getStorageProvider()
    await storage.uploadObject(name,pdfKey,pdf,'application/pdf')
    await storage.uploadObject(name,fodtKey,fodt,'application/vnd.oasis.opendocument.text-flat-xml')
    const [p,f]=await Promise.all([headR2Object(name,pdfKey),headR2Object(name,fodtKey)])
    if(p?.size!==pdf.length||f?.size!==fodt.length)throw new Error('Archive verification failed')
    const {data:issued,error:finalError}=await db().rpc('billing_finalize_issue',{
      p_id:id,p_actor:actorId,p_pdf_key:pdfKey,p_fodt_key:fodtKey,p_hashes:hashes
    })
    assert(finalError,'Invoice archive commit failed')
    return issued as Row
  } catch {
    // The number remains reserved in "preparing". Retrying this ID is safe.
    await db().from('billing_invoices').update({document_error_at:new Date().toISOString()}).eq('id',id).eq('status','preparing')
    throw new Error('Document archive unavailable. Number reserved. Retry issuing this invoice; do not create another.')
  }
}
export async function invoiceDocumentUrl(id:string,format:'pdf'|'fodt') {
  const {invoice}=await getBillingInvoice(id)
  if(invoice.status!=='issued')throw new Error('Invoice not issued')
  const key=invoice[format==='pdf'?'pdf_object_key':'fodt_object_key']
  if(typeof key!=='string')throw new Error('Document not ready')
  return getStorageProvider().createSignedDownloadUrl(bucket(),key,90)
}
export async function recordBillingPayment(id:string,actorId:string,amountCents:number,date:string,reference:string) {
  uuid.parse(id);uuid.parse(actorId)
  if(!Number.isSafeInteger(amountCents)||amountCents<=0)throw new Error('Invalid amount')
  z.iso.date().parse(date)
  const {data,error}=await db().rpc('billing_record_payment',{
    p_id:id,p_actor:actorId,p_amount:amountCents,p_paid_on:date,p_reference:reference.slice(0,240)
  })
  assert(error,'Could not record payment; check remaining balance')
  return data
}
