import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
const mocks=vi.hoisted(()=>({
 from:vi.fn(),select:vi.fn(),update:vi.fn(),eq:vi.fn(),maybeSingle:vi.fn(),
}))
vi.mock('@/lib/supabaseAdmin',()=>({createAdminClient:()=>({from:mocks.from})}))
vi.mock('@/lib/billing/service',()=>({
 createBillingCustomer:vi.fn(),updateBillingCustomer:vi.fn(),createBillingDraft:vi.fn(),
 updateBillingDraft:vi.fn(),getBillingCustomer:vi.fn(),listBillingCustomers:vi.fn(),
 listBillingInvoices:vi.fn(),getBillingInvoice:vi.fn(),issueBillingInvoice:vi.fn(),
 invoiceDocumentUrl:vi.fn(),previewBillingXRechnung:vi.fn(),
}))
vi.mock('../server',()=>({
 McpAccessError:class extends Error {
  constructor(message:string,public readonly status=401){super(message)}
 }
}))
import { BILLING_MCP_TOOLS, callBillingMcp } from '../billing'

const ctx={userId:'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',clientId:'test'}
const email='info@neuroklast.net'
const old='old@example.com'

describe('MCP seller contact email',()=>{
 beforeEach(()=>{
  vi.resetAllMocks()
  const query={select:mocks.select,update:mocks.update,eq:mocks.eq,maybeSingle:mocks.maybeSingle}
  mocks.from.mockReturnValue(query)
  mocks.select.mockReturnValue(query)
  mocks.update.mockReturnValue(query)
  mocks.eq.mockReturnValue(query)
  mocks.maybeSingle.mockResolvedValue({data:{seller_email:email},error:null})
 })
 it('advertises strictly scoped tools',()=>{
  const read=BILLING_MCP_TOOLS.find(t=>t.name==='billing_seller_email_get')
  const write=BILLING_MCP_TOOLS.find(t=>t.name==='billing_seller_email_update')
  expect(read?.annotations.readOnlyHint).toBe(true)
  expect(write?.inputSchema.additionalProperties).toBe(false)
  expect(write?.annotations.readOnlyHint).toBe(false)
 })
 it('returns only the configured contact email',async()=>{
  expect(await callBillingMcp('billing_seller_email_get',{},ctx)).toEqual({email})
  expect(mocks.from).toHaveBeenCalledWith('billing_settings')
  expect(mocks.select).toHaveBeenCalledWith('seller_email')
  expect(mocks.eq).toHaveBeenCalledWith('id',1)
  expect(mocks.update).not.toHaveBeenCalled()
 })
 it('updates only the settings email and audit fields with a stale-write guard',async()=>{
  expect(await callBillingMcp('billing_seller_email_update',{email,expected_email:old},ctx))
   .toEqual({email,applies_to:'future_invoice_drafts'})
  expect(mocks.from).toHaveBeenCalledTimes(1)
  expect(mocks.from).toHaveBeenCalledWith('billing_settings')
  expect(mocks.update).toHaveBeenCalledWith({seller_email:email,updated_by:ctx.userId,updated_at:expect.any(String)})
  expect(mocks.eq.mock.calls).toEqual([['id',1],['seller_email',old]])
  expect(mocks.select).toHaveBeenCalledWith('seller_email')
 })
 it('rejects invalid addresses, missing expected values and extra fields before database access',async()=>{
  for(const args of [{email:'invalid',expected_email:old},{email},{email,expected_email:old,seller_iban:'anything'}]){
   await expect(callBillingMcp('billing_seller_email_update',args,ctx)).rejects.toMatchObject({status:400})
  }
  expect(mocks.from).not.toHaveBeenCalled()
 })
 it('fails closed on a concurrent change or missing settings',async()=>{
  mocks.maybeSingle.mockResolvedValue({data:null,error:null})
  await expect(callBillingMcp('billing_seller_email_update',{email,expected_email:old},ctx)).rejects.toMatchObject({status:409})
  await expect(callBillingMcp('billing_seller_email_get',{},ctx)).rejects.toThrow('Seller settings unavailable')
 })
 it('fails closed on a database error',async()=>{
  mocks.maybeSingle.mockResolvedValue({data:null,error:{message:'failure'}})
  await expect(callBillingMcp('billing_seller_email_update',{email,expected_email:old},ctx)).rejects.toThrow('Seller contact email update failed')
 })
})
