import { describe,expect,it } from 'vitest'
import { renderPdf,renderFodt,renderOdt,type DocumentInvoice } from '../documents'
import { unzipSync,strFromU8 } from 'fflate'
const invoice:DocumentInvoice={
 id:'sample',number:'RE-2026-000001',issue_date:'2026-11-17',service_date:'2026-11-14',due_date:'2026-12-01',
 tax_mode:'small_business',note:'Bitte mit Referenz <NK&1> zahlen.',
 seller:{name:'Neuroklast',street:'Beispielstraße 1',postal_code:'40000',city:'Düsseldorf',country:'DE',tax_id:'DE-TEST',iban:'DE00'},
 recipient:{name:'Muster & Partner',street:'Bühnenweg 2',postal_code:'10000',city:'Berlin',country:'DE'},
 lines:[{description:'DJ-Auftritt',quantity_milli:1000,unit_cents:60000,tax_rate:0}]
}
describe('billing renderers',()=>{
 it('generates a PDF with an xref and immutable invoice number',()=>{
  const bytes=renderPdf(invoice)
  expect(bytes.subarray(0,8).toString('latin1')).toBe('%PDF-1.4')
  expect(bytes.toString('latin1')).toContain('RE-2026-000001')
  expect(bytes.toString('latin1')).toContain('startxref')
  expect(bytes.toString('latin1')).toContain('%%EOF')
 })
 it('exports editable flat ODF with XML-escaped user text',()=>{
  const xml=renderFodt(invoice).toString('utf8')
  expect(xml).toContain('office:mimetype="application/vnd.oasis.opendocument.text"')
  expect(xml).toContain('Muster &amp; Partner')
  expect(xml).toContain('&lt;NK&amp;1&gt;')
  expect(xml).toContain('Umsatzsteuerfrei nach § 19 UStG')
 })
 it('packages a real editable ODT with mimetype first and a manifest',()=>{
  const archive=renderOdt(invoice)
  const content=unzipSync(new Uint8Array(archive))
  expect(Object.keys(content)).toContain('content.xml')
  expect(Object.keys(content)).toContain('META-INF/manifest.xml')
  expect(strFromU8(content.mimetype)).toBe('application/vnd.oasis.opendocument.text')
  expect(strFromU8(content['content.xml'])).toContain('Muster &amp; Partner')
  expect(strFromU8(content['content.xml'])).toContain('office:document-content')
  expect(strFromU8(content['META-INF/manifest.xml'])).toContain('manifest:manifest')
 })
 it('supports multi-page PDFs without breaking the trailer',()=>{
  const doc={...invoice,lines:Array.from({length:100},(_,i)=>({...invoice.lines[0],description:'Service '+i}))}
  const pdf=renderPdf(doc).toString('latin1')
  expect(pdf).toContain('/Count ')
  expect(pdf).toContain('xref')
  expect(pdf).toContain('%%EOF')
 })
})
