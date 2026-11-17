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
 it('generates a PDF with an xref and immutable invoice number',async()=>{
  const bytes=await renderPdf(invoice)
  expect(bytes.subarray(0,8).toString('latin1')).toBe('%PDF-1.4')
  expect(bytes.toString('latin1')).toContain('RE-2026-000001')
  expect(bytes.toString('latin1')).toContain('startxref')
  expect(bytes.toString('latin1')).toContain('%%EOF')
 })
 it('embeds the real NEUROKLAST logo and an A4, branded table',async()=>{
  const pdf=(await renderPdf(invoice)).toString('latin1')
  expect(pdf).toContain('/MediaBox [0 0 595 842]')
  expect(pdf).toContain('/Subtype /Image')
  expect(pdf).toContain('/BrandLogo Do')
  expect(pdf).toContain('/FlateDecode')
  expect(pdf).not.toContain('72 96 m 160 96 l 272 264 l')
  expect(pdf).toContain('(RECHNUNGSEMPF\\304NGER) Tj'.replace('\\304','\\304'))
  expect(pdf).toContain('(GESAMTBETRAG) Tj')
  expect(pdf).toContain('(IBAN: DE00) Tj')
  expect(pdf).toContain('600,00')
  expect(pdf).toContain('19 UStG')
 })
 it('escapes arbitrary customer PDF text and repeats headers for long invoices',async()=>{
  const altered={...invoice,recipient:{...invoice.recipient,name:'ACME (Hamburg) \\\\ GmbH'},lines:Array.from({length:100},(_,i)=>({...invoice.lines[0],description:'DJ-Auftritt / Service '+i+' mit Zusatzausstattung'}))}
  const pdf=(await renderPdf(altered)).toString('latin1')
  const n=Number(/\/Count (\d+)/.exec(pdf)?.[1])
  expect(n).toBeGreaterThan(2)
  expect(pdf.match(/\/BrandLogo Do/g)?.length).toBe(n)
  expect(pdf).toContain('ACME \\(Hamburg\\)')
  expect(pdf).toContain('startxref')
  expect(pdf).toContain('%%EOF')
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
 it('supports multi-page PDFs without breaking the trailer',async()=>{
  const doc={...invoice,lines:Array.from({length:100},(_,i)=>({...invoice.lines[0],description:'Service '+i}))}
  const pdf=(await renderPdf(doc)).toString('latin1')
  expect(pdf).toContain('/Count ')
  expect(pdf).toContain('xref')
  expect(pdf).toContain('%%EOF')
 })
})
