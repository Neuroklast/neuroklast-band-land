'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { admin } from '@/lib/neurokore/server'
import { parseEurosToCents } from '@/lib/billing/domain'
import { reviewBillingRequest } from '@/lib/mcp/billing'
import { createBillingCustomer, updateBillingCustomer, updateBillingSettings,
  createBillingDraft, updateBillingDraft, issueBillingInvoice, recordBillingPayment } from '@/lib/billing/service'

const text=(form:FormData,key:string)=>String(form.get(key)??'').trim()
const requireId=(form:FormData,key:string)=>text(form,key)
const touch=()=>{revalidatePath('/admin/billing')}
const customer=(form:FormData)=>({
  name:text(form,'name'),email:text(form,'email'),street:text(form,'street'),
  postal_code:text(form,'postal_code'),city:text(form,'city'),country:text(form,'country').toUpperCase()||'DE',
  vat_id:text(form,'vat_id'),contact_name:text(form,'contact_name'),notes:text(form,'notes'),
})
export async function saveBillingCustomer(form:FormData) {
  const actor=await admin()
  const id=text(form,'id')
  if(id)await updateBillingCustomer(id,customer(form),actor)
  else await createBillingCustomer(customer(form),actor)
  touch()
  redirect('/admin/billing/customers')
}
export async function saveBillingSettings(form:FormData) {
  const actor=await admin()
  await updateBillingSettings({
    seller_name:text(form,'seller_name'),seller_street:text(form,'seller_street'),
    seller_postal_code:text(form,'seller_postal_code'),seller_city:text(form,'seller_city'),
    seller_country:text(form,'seller_country').toUpperCase(),seller_tax_id:text(form,'seller_tax_id'),
    seller_email:text(form,'seller_email'),seller_iban:text(form,'seller_iban'),seller_bic:text(form,'seller_bic'),
    tax_mode:text(form,'tax_mode'),number_prefix:text(form,'number_prefix').toUpperCase(),
  },actor)
  touch()
  redirect('/admin/billing/settings?saved=1')
}
export async function saveBillingDraft(form:FormData) {
  const actor=await admin()
  const lines=JSON.parse(text(form,'lines_json'))
  const input={
    customer_id:text(form,'customer_id'),issue_date:text(form,'issue_date'),service_date:text(form,'service_date'),
    due_date:text(form,'due_date'),note:text(form,'note'),lines,
  }
  const id=text(form,'id')
  const result=id?await updateBillingDraft(id,input,actor,Number(text(form,'revision'))):
    await createBillingDraft(input,actor)
  touch()
  redirect('/admin/billing/'+String(result.id))
}
export async function issueBillingDraft(form:FormData) {
  const actor=await admin()
  const id=requireId(form,'id')
  await issueBillingInvoice(id,actor)
  touch()
  redirect('/admin/billing/'+id)
}
export async function saveBillingPayment(form:FormData) {
  const actor=await admin()
  const id=requireId(form,'id')
  await recordBillingPayment(id,actor,parseEurosToCents(text(form,'amount')),text(form,'paid_on'),text(form,'reference'))
  touch()
  redirect('/admin/billing/'+id)
}

export async function reviewBillingMcpAction(form:FormData) {
  const actor=await admin()
  const decision=text(form,'decision')
  if(decision!=='approve'&&decision!=='reject')throw new Error('Invalid review decision')
  await reviewBillingRequest(text(form,'request_id'),actor,decision)
  revalidatePath('/admin/billing/review')
  redirect('/admin/billing/review')
}
