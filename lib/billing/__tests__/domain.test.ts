import { describe, expect, it } from 'vitest'
import { calculateInvoice, parseEurosToCents, parseQuantityMilli, draftInput, billingPaymentStatus } from '../domain'

describe('invoice money invariants',()=>{
 it('parses decimal money without binary floating-point rounding',()=>{
  expect(parseEurosToCents('600,00')).toBe(60000)
  expect(parseEurosToCents('0.01')).toBe(1)
  expect(parseEurosToCents('19,9')).toBe(1990)
  expect(()=>parseEurosToCents('19,999')).toThrow()
  expect(()=>parseEurosToCents('-10.00')).toThrow()
  expect(()=>parseEurosToCents('1e9')).toThrow()
 })
 it('uses thousandths for quantities and rejects zero',()=>{
  expect(parseQuantityMilli('1,250')).toBe(1250)
  expect(()=>parseQuantityMilli('0')).toThrow()
  expect(()=>parseQuantityMilli('1,0001')).toThrow()
 })
 it('groups same-rate totals before VAT rounding',()=>{
  const lines=[
   {description:'Service A',quantity_milli:1500,unit_cents:100,tax_rate:19 as const},
   {description:'Service B',quantity_milli:1000,unit_cents:200,tax_rate:19 as const}
  ]
  expect(calculateInvoice(lines,'vat_registered')).toEqual({
   subtotal_cents:350,tax_cents:67,total_cents:417,line_totals_cents:[150,200],tax_groups:[{rate:19,base_cents:350,tax_cents:67}]
  })
 })
 it('does not show VAT for Kleinunternehmer',()=>{
  expect(calculateInvoice([{description:'Show',quantity_milli:1000,unit_cents:60000,tax_rate:0}],'small_business').total_cents).toBe(60000)
  expect(()=>calculateInvoice([{description:'Show',quantity_milli:1000,unit_cents:60000,tax_rate:19}],'small_business')).toThrow()
 })
 it('fails closed for unchecked zero-tax and unverified seller modes',()=>{
  const lines=[{description:'Test',quantity_milli:1000,unit_cents:100,tax_rate:0 as const}]
  expect(()=>calculateInvoice(lines,'vat_registered')).toThrow()
  expect(()=>calculateInvoice(lines,'unverified')).toThrow()
 })
 it('requires valid customer ID, dates and at least one line',()=>{
  expect(draftInput.safeParse({customer_id:'x',issue_date:'2026-11-17',service_date:'2026-11-17',due_date:'2026-11-30',lines:[]}).success).toBe(false)
 })
})

describe('invoice payment display state',()=>{
 it('keeps drafts separate from funds',()=>{
  expect(billingPaymentStatus('draft','2026-11-01',60000,0,'2026-11-17')).toBe('draft')
  expect(billingPaymentStatus('preparing','2026-11-01',60000,0,'2026-11-17')).toBe('preparing')
 })
 it('shows overdue, partial, and settled invoices',()=>{
  expect(billingPaymentStatus('issued','2026-11-01',60000,10000,'2026-11-17')).toBe('overdue')
  expect(billingPaymentStatus('issued','2026-12-01',60000,10000,'2026-11-17')).toBe('partial')
  expect(billingPaymentStatus('issued','2026-12-01',60000,60000,'2026-11-17')).toBe('paid')
  expect(billingPaymentStatus('issued','2026-12-01',60000,0,'2026-11-17')).toBe('open')
 })
 it('flags overpayments as inconsistent instead of showing negative outstanding',()=>{
  expect(billingPaymentStatus('issued','2026-12-01',60000,70000,'2026-11-17')).toBe('invalid')
 })
})
