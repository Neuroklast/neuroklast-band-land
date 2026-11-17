import 'server-only'
import { z, ZodError } from 'zod'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { createBillingCustomer, updateBillingCustomer, createBillingDraft, updateBillingDraft,
  getBillingCustomer, listBillingCustomers, listBillingInvoices, getBillingInvoice,
  issueBillingInvoice, invoiceDocumentUrl } from '@/lib/billing/service'
import { McpAccessError } from './server'

const db=()=>createAdminClient()
const uuid=z.uuid()
const contextSchema=z.object({userId:uuid,clientId:z.string().min(1).max(250)})
export type BillingMcpContext=z.infer<typeof contextSchema>

const id={type:'string',format:'uuid'}
const object={type:'object',additionalProperties:true}
const readonly={readOnlyHint:true,destructiveHint:false}
const write={readOnlyHint:false,destructiveHint:false,idempotentHint:false}
export const BILLING_MCP_TOOLS=[
 {name:'billing_customers_list',description:'Private admin-only customer address book. Personal data, do not expose to others.',inputSchema:{type:'object',properties:{q:{type:'string',maxLength:100}},additionalProperties:false},annotations:readonly},
 {name:'billing_customer_get',description:'Read a customer record.',inputSchema:{type:'object',properties:{id},required:['id'],additionalProperties:false},annotations:readonly},
 {name:'billing_customer_create',description:'Create customer address book entry. Admin-only.',inputSchema:{type:'object',properties:{customer:object},required:['customer'],additionalProperties:false},annotations:write},
 {name:'billing_customer_update',description:'Update a customer. Issued invoice snapshots stay frozen.',inputSchema:{type:'object',properties:{id,customer:object},required:['id','customer'],additionalProperties:false},annotations:write},
 {name:'billing_invoices_list',description:'List own seller invoices, not Stripe Merchant-of-Record receipts.',inputSchema:{type:'object',properties:{limit:{type:'integer',minimum:1,maximum:100}},additionalProperties:false},annotations:readonly},
 {name:'billing_invoice_get',description:'Read invoice and payment history (financial personal data).',inputSchema:{type:'object',properties:{id},required:['id'],additionalProperties:false},annotations:readonly},
 {name:'billing_invoice_create_draft',description:'Create an editable invoice draft without assigning a legal invoice number.',inputSchema:{type:'object',properties:{draft:object},required:['draft'],additionalProperties:false},annotations:write},
 {name:'billing_invoice_update_draft',description:'Edit an unissued draft using revision-based concurrency control.',inputSchema:{type:'object',properties:{id,revision:{type:'integer',minimum:0},draft:object},required:['id','revision','draft'],additionalProperties:false},annotations:write},
 {name:'billing_invoice_request_issue',description:'Queue issuance for separate MFA-verified human approval. Does not issue now.',inputSchema:{type:'object',properties:{id},required:['id'],additionalProperties:false},annotations:write},
 {name:'billing_invoice_request_payment',description:'Queue a recorded payment for human approval. No funds are transferred.',inputSchema:{type:'object',properties:{id,amount_cents:{type:'integer',minimum:1},paid_on:{type:'string'},reference:{type:'string'}},required:['id','amount_cents','paid_on'],additionalProperties:false},annotations:write},
 {name:'billing_invoice_document',description:'Get short-lived signed document URL for an issued invoice.',inputSchema:{type:'object',properties:{id,format:{type:'string',enum:['pdf','fodt']}},required:['id','format'],additionalProperties:false},annotations:readonly},
 {name:'billing_review_requests',description:'List the current pending MCP billing approvals.',inputSchema:{type:'object',properties:{limit:{type:'integer',minimum:1,maximum:50}},additionalProperties:false},annotations:readonly}
] as const

export async function listBillingReviewRequests(limit=50) {
 const {data,error}=await db().from('billing_mcp_requests').select('*').order('created_at',{ascending:false}).limit(Math.max(1,Math.min(limit,50)))
 if(error)throw new Error('Billing approvals unavailable')
 return data??[]
}
async function queue(context:BillingMcpContext,operation:'issue_invoice'|'record_payment',id:string,payload:Record<string,unknown>) {
 const {invoice}=await getBillingInvoice(id)
 if(operation==='issue_invoice' && invoice.status!=='draft' && invoice.status!=='preparing')throw new Error('Only draft/reserved invoices can be issued')
 if(operation==='record_payment'&&invoice.status!=='issued')throw new Error('Payment can only be recorded on an issued invoice')
 const {data,error}=await db().from('billing_mcp_requests').insert({
  operation,invoice_id:id,payload,requested_by:context.userId,client_id:context.clientId
 }).select('id,status,created_at').single()
 if(error||!data)throw new Error('Approval request unavailable')
 return {request_id:data.id,status:data.status,created_at:data.created_at,
  needs_admin_approval:true,review_url:'https://neuroklast.net/admin/billing/review'}
}
export async function reviewBillingRequest(id:string,actorId:string,decision:'approve'|'reject') {
 uuid.parse(id);uuid.parse(actorId)
 const {data,error}=await db().from('billing_mcp_requests').select('*').eq('id',id).maybeSingle()
 if(error||!data)throw new Error('Approval request not found')
 if(data.status!=='pending')throw new Error('Review request already processed')
 if(decision==='reject'){
  const {data:done,error:rejected}=await db().from('billing_mcp_requests')
    .update({status:'rejected',reviewed_by:actorId,reviewed_at:new Date().toISOString()})
    .eq('id',id).eq('status','pending').select('id').maybeSingle()
  if(rejected||!done)throw new Error('Request changed during review')
  return {id,status:'rejected'}
 }
 if(data.operation==='record_payment'){
  const {data:result,error:approveError}=await db().rpc('billing_approve_mcp_payment',{p_request_id:id,p_actor:actorId})
  if(approveError)throw new Error('Payment approval failed; invoice or balance may have changed')
  return {id,status:'approved',payment_id:result}
 }
 if(data.operation!=='issue_invoice')throw new Error('Unknown financial operation')
 const {data:claimed,error:claimError}=await db().from('billing_mcp_requests').update({
  status:'processing',reviewed_by:actorId,reviewed_at:new Date().toISOString()
 }).eq('id',id).eq('status','pending').select('id').maybeSingle()
 if(claimError||!claimed)throw new Error('Request already being processed')
 try{
  const invoice=await issueBillingInvoice(data.invoice_id,actorId)
  const {error:finishError}=await db().from('billing_mcp_requests').update({status:'approved'}).eq('id',id).eq('status','processing')
  if(finishError)throw new Error('Issued but review status update failed. Investigate before retry.')
  return {id,status:'approved',invoice_number:invoice.number}
 }catch(error){
  await db().from('billing_mcp_requests').update({status:'pending',reviewed_by:null,reviewed_at:null}).eq('id',id).eq('status','processing')
  throw error
 }
}
export async function callBillingMcp(name:string,raw:Record<string,unknown>,ctx:BillingMcpContext) {
 try{
  const context=contextSchema.parse(ctx)
  switch(name) {
   case 'billing_customers_list': return listBillingCustomers(z.object({q:z.string().max(100).optional()}).strict().parse(raw).q??'')
   case 'billing_customer_get': return getBillingCustomer(uuid.parse(raw.id))
   case 'billing_customer_create': return createBillingCustomer(raw.customer,context.userId)
   case 'billing_customer_update': return updateBillingCustomer(uuid.parse(raw.id),raw.customer,context.userId)
   case 'billing_invoices_list': return listBillingInvoices(z.object({limit:z.number().int().min(1).max(100).optional()}).strict().parse(raw).limit??50)
   case 'billing_invoice_get': return getBillingInvoice(uuid.parse(raw.id))
   case 'billing_invoice_create_draft':return createBillingDraft(raw.draft,context.userId)
   case 'billing_invoice_update_draft':return updateBillingDraft(uuid.parse(raw.id),raw.draft,context.userId,z.number().int().min(0).parse(raw.revision))
   case 'billing_invoice_request_issue':return queue(context,'issue_invoice',uuid.parse(raw.id),{})
   case 'billing_invoice_request_payment':{
    const value=z.object({id:uuid,amount_cents:z.number().int().positive().safe(),paid_on:z.iso.date(),reference:z.string().max(240).optional()}).strict().parse(raw)
    return queue(context,'record_payment',value.id,{amount_cents:value.amount_cents,paid_on:value.paid_on,reference:value.reference??''})
   }
   case 'billing_invoice_document':{
    const value=z.object({id:uuid,format:z.enum(['pdf','fodt'])}).strict().parse(raw)
    return {url:await invoiceDocumentUrl(value.id,value.format),expires_in_seconds:90}
   }
   case 'billing_review_requests':{
    const value=z.object({limit:z.number().int().min(1).max(50).optional()}).strict().parse(raw)
    return listBillingReviewRequests(value.limit??30)
   }
   default:throw new McpAccessError('Unknown billing tool',404)
  }
 }catch(error){
  if(error instanceof ZodError)throw new McpAccessError('Invalid billing parameters: '+error.issues.map(i=>i.path.join('.')).join(', '),400)
  throw error
 }
}
