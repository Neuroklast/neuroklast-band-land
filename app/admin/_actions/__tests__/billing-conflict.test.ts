import { beforeEach, describe, expect, it, vi } from 'vitest'

const state=vi.hoisted(()=>({
 admin:vi.fn(),update:vi.fn(),create:vi.fn(),revalidate:vi.fn(),redirect:vi.fn(),
}))
vi.mock('next/navigation',()=>({redirect:(url:string)=>{state.redirect(url);throw new Error('NEXT_REDIRECT')}}))
vi.mock('next/cache',()=>({revalidatePath:state.revalidate}))
vi.mock('@/lib/neurokore/server',()=>({admin:state.admin}))
vi.mock('@/lib/mcp/billing',()=>({reviewBillingRequest:vi.fn()}))
vi.mock('@/lib/billing/service',()=>{
  class BillingDraftConflictError extends Error {
    constructor(){super('Invoice changed or already reserved; reload the draft');this.name='BillingDraftConflictError'}
  }
  return {
    BillingDraftConflictError,
    createBillingCustomer:vi.fn(),updateBillingCustomer:vi.fn(),updateBillingSettings:vi.fn(),
    createBillingDraft:state.create,updateBillingDraft:state.update,
    issueBillingInvoice:vi.fn(),recordBillingPayment:vi.fn(),seedBillingSequence:vi.fn(),
  }
})
import { BillingDraftConflictError } from '@/lib/billing/service'
import { saveBillingDraft } from '@/app/admin/_actions/billing'

const id='26354dad-1098-4d08-97c7-fbb52e46d63a'
function draftForm(){
  const form=new FormData()
  form.set('id',id)
  form.set('revision','0')
  form.set('lines_json','[]')
  return form
}

describe('billing stale draft action',()=>{
 beforeEach(()=>{
  state.admin.mockReset().mockResolvedValue('actor')
  state.update.mockReset()
  state.create.mockReset()
  state.redirect.mockReset()
  state.revalidate.mockReset()
 })
 it('reloads the canonical issued invoice instead of an opaque 500 for optimistic conflicts',async()=>{
  state.update.mockRejectedValue(new BillingDraftConflictError())
  await expect(saveBillingDraft(draftForm())).rejects.toThrow('NEXT_REDIRECT')
  expect(state.redirect).toHaveBeenCalledWith('/admin/billing/'+id+'?stale=1')
 })
 it('does not disguise unrelated database outages as a stale draft',async()=>{
  state.update.mockRejectedValue(new Error('Database unavailable'))
  await expect(saveBillingDraft(draftForm())).rejects.toThrow('Database unavailable')
  expect(state.redirect).not.toHaveBeenCalled()
 })
 it('keeps successful updates on the normal invoice detail path',async()=>{
  state.update.mockResolvedValue({id})
  await expect(saveBillingDraft(draftForm())).rejects.toThrow('NEXT_REDIRECT')
  expect(state.redirect).toHaveBeenCalledWith('/admin/billing/'+id)
 })
})
