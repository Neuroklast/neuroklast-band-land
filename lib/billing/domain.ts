import { z } from 'zod'

/** Monetary amounts are integer EUR cents; quantities are integer thousandths.
 * No floating-point prices or silent rounding of user input.
 */
export const customerInput = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.union([z.email().max(254), z.literal('')]).default(''),
  street: z.string().trim().max(250).default(''),
  postal_code: z.string().trim().max(30).default(''),
  city: z.string().trim().max(120).default(''),
  country: z.string().regex(/^[A-Z]{2}$/).default('DE'),
  vat_id: z.string().trim().max(50).default(''),
  contact_name: z.string().trim().max(150).default(''),
  notes: z.string().trim().max(2000).default(''),
}).strict()

export const sellerInput = z.object({
  seller_name: z.string().trim().max(200),
  seller_street: z.string().trim().max(250),
  seller_postal_code: z.string().trim().max(30),
  seller_city: z.string().trim().max(120),
  seller_country: z.string().regex(/^[A-Z]{2}$/),
  seller_tax_id: z.string().trim().max(60),
  seller_email: z.union([z.email(), z.literal('')]),
  seller_iban: z.string().trim().max(40),
  seller_bic: z.string().trim().max(20),
  tax_mode: z.enum(['unverified','small_business','vat_registered']),
  number_prefix: z.string().regex(/^[A-Z]{2,8}$/),
}).strict()

const money = z.number().int().min(0).max(100000000000).safe()
export const invoiceLine = z.object({
  description: z.string().trim().min(1).max(500),
  quantity_milli: z.number().int().min(1).max(100000000),
  unit_cents: money,
  tax_rate: z.union([z.literal(0),z.literal(7),z.literal(19)]),
}).strict()
export const draftInput = z.object({
  customer_id: z.uuid(),
  issue_date: z.iso.date(),
  service_date: z.iso.date(),
  due_date: z.iso.date(),
  lines: z.array(invoiceLine).min(1).max(100),
  note: z.string().trim().max(2000).default(''),
}).strict()
export type InvoiceLine = z.infer<typeof invoiceLine>
export type DraftInput = z.infer<typeof draftInput>
export type TaxMode = 'unverified'|'small_business'|'vat_registered'

export function parseEurosToCents(raw: string): number {
  const input = raw.trim()
  if (!/^(?:0|[1-9]\d{0,8})(?:[.,]\d{1,2})?$/.test(input)) throw new Error('Invalid EUR amount')
  const [whole, decimal=''] = input.replace(',', '.').split('.')
  const amount = Number(whole) * 100 + Number(decimal.padEnd(2,'0'))
  if (!Number.isSafeInteger(amount)) throw new Error('Amount outside safe range')
  return amount
}
export function parseQuantityMilli(raw: string): number {
  const input=raw.trim().replace(',', '.')
  if (!/^(?:0|[1-9]\d{0,7})(?:\.\d{1,3})?$/.test(input)) throw new Error('Invalid quantity')
  const [whole,decimal='']=input.split('.')
  const amount=Number(whole)*1000+Number(decimal.padEnd(3,'0'))
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 100000000) throw new Error('Invalid quantity')
  return amount
}
export function formatCents(cents:number): string {
  return (cents/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'})
}
export function calculateInvoice(lines:InvoiceLine[],mode:TaxMode) {
  if(mode==='unverified') throw new Error('Verify the seller tax mode before creating invoices')
  const groups=new Map<number,bigint>()
  const itemTotals=lines.map(line=>{
    if (mode==='small_business' && line.tax_rate!==0) throw new Error('Kleinunternehmer invoices may not show VAT')
    if (mode==='vat_registered' && line.tax_rate===0) throw new Error('Zero-rated transactions require a separately reviewed tax category')
    const subtotal=(BigInt(line.unit_cents)*BigInt(line.quantity_milli)+BigInt(500))/BigInt(1000)
    groups.set(line.tax_rate,(groups.get(line.tax_rate)||BigInt(0))+subtotal)
    return Number(subtotal)
  })
  const subtotal=[...groups.values()].reduce((a,b)=>a+b,BigInt(0))
  const tax_groups=[...groups].sort(([a],[b])=>a-b).map(([rate,net])=>({
    rate,base_cents:Number(net),tax_cents:Number((net*BigInt(rate)+BigInt(50))/BigInt(100))
  }))
  const tax=tax_groups.reduce((sum,group)=>sum+BigInt(group.tax_cents),BigInt(0))
  const total=subtotal+tax
  if(total<=BigInt(0) || total>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('Invoice total is out of range')
  return { subtotal_cents:Number(subtotal),tax_cents:Number(tax),total_cents:Number(total),line_totals_cents:itemTotals,tax_groups }
}
export function validateDates(draft:DraftInput) {
  if(draft.due_date<draft.issue_date)throw new Error('Due date cannot precede issue date')
}

export type BillingPaymentStatus = 'draft'|'preparing'|'open'|'partial'|'overdue'|'paid'|'invalid'

/** Display-only status. Source-of-truth invoice status stays immutable after issuance. */
export function billingPaymentStatus(
  status:string,dueDate:string,totalCents:number,paidCents:number,today:string,
):BillingPaymentStatus {
  if(status==='draft')return 'draft'
  if(status==='preparing')return 'preparing'
  if(status!=='issued' || !Number.isSafeInteger(totalCents) || !Number.isSafeInteger(paidCents)
    || totalCents<0 || paidCents<0 || paidCents>totalCents) return 'invalid'
  if(paidCents===totalCents)return 'paid'
  if(dueDate<today)return 'overdue'
  if(paidCents>0)return 'partial'
  return 'open'
}
