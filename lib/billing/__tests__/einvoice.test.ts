import { describe,expect,it } from 'vitest'
import { renderXRechnung } from '../einvoice'
import type { DocumentInvoice } from '../documents'

const example: DocumentInvoice={
 id:'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
 number:'RE-2026-000001',
 issue_date:'2026-11-17',service_date:'2026-11-14',due_date:'2026-12-01',
 tax_mode:'vat_registered',e_invoice_profile:'xrechnung',buyer_reference:'PO-2026-123',
 note:'Lieferung von Tonaufnahmen',
 seller:{
  name:'Sample Recording Studio',street:'Beispielweg 3',postal_code:'40210',city:'Düsseldorf',country:'DE',
  tax_id:'DE123456789',email:'accounting@example.org',phone:'+49 211 123456',
  contact_name:'Rechnungsabteilung',iban:'DE89370400440532013000',bic:'COBADEFFXXX',
 },
 recipient:{
  name:'Demo Distribution GmbH',street:'Musterallee 2',postal_code:'50667',city:'Köln',
  country:'DE',email:'rechnung@example.net',
 },
 lines:[
  {description:'Studioarbeit',quantity_milli:1500,unit_cents:15000,tax_rate:19},
  {description:'Tonträger',quantity_milli:2000,unit_cents:2500,tax_rate:7},
 ],
}
describe('XRechnung 3.0 UBL',()=>{
 it('generates structured XML from schema-validated UBL with correct VAT groups',async()=>{
  const result=await renderXRechnung(example)
  const xml=result.xml.toString('utf8')
  expect(xml).toContain('RE-2026-000001')
  expect(xml).toContain('PO-2026-123')
  expect(xml).toContain('321.25')
  expect(xml).toContain('cbc:CustomizationID')
  expect(xml).toContain('xrechnung_3.0')
  expect(result.ruleset).toContain('XRechnung')
  expect(xml).toContain('<cbc:PayableAmount currencyID="EUR">321.25</cbc:PayableAmount>')
 })
 it('fails closed if essential B2B identities are absent',async()=>{
  await expect(renderXRechnung({...example,buyer_reference:''})).rejects.toThrow('BT-10')
  await expect(renderXRechnung({...example,seller:{...example.seller,phone:''}})).rejects.toThrow('BT-42')
  await expect(renderXRechnung({...example,recipient:{...example.recipient,email:''}})).rejects.toThrow('BT-49')
 })
 it('does not silently map §19 exemption to regular VAT',async()=>{
  await expect(renderXRechnung({...example,tax_mode:'small_business'})).rejects.toThrow()
 })
 it('rejects foreign and unverified tax configurations',async()=>{
  await expect(renderXRechnung({...example,recipient:{...example.recipient,country:'FR'}})).rejects.toThrow()
 })
})
