import { zipSync, strToU8 } from 'fflate'
import type { InvoiceLine } from './domain'
import { calculateInvoice, formatCents, type TaxMode } from './domain'
import { renderStyledPdf } from './pdf'

export interface DocumentInvoice {
  id:string; number:string; issue_date:string; service_date:string; due_date:string
  seller:Record<string,string>; recipient:Record<string,string>
  lines:InvoiceLine[]; tax_mode:TaxMode; note:string
  buyer_reference?:string; e_invoice_profile?:'none'|'xrechnung'
}

const str=(value:unknown):string=>String(value??'')
const validXmlChar=(char:string):boolean=>{
 const cp=char.codePointAt(0)!
 return cp===9 || cp===10 || cp===13 ||
   (cp>=32 && cp<=0xD7FF) ||
   (cp>=0xE000 && cp<=0xFFFD) ||
   (cp>=0x10000 && cp<=0x10FFFF)
}
const escapeXml=(text:string)=>Array.from(text).filter(validXmlChar).join('')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&apos;')
const address=(p:Record<string,string>)=>[p.name,p.street,[p.postal_code,p.city].filter(Boolean).join(' '),p.country].filter(Boolean)
const date=(s:string)=>s.split('-').reverse().join('.')
function invoiceLines(doc:DocumentInvoice):string[] {
  const sums=calculateInvoice(doc.lines,doc.tax_mode)
  return [
    'RECHNUNG '+doc.number,
    '',
    'Rechnungssteller:',...address(doc.seller),
    'Steuerkennung: '+str(doc.seller.tax_id),
    '',
    'Rechnung an:',...address(doc.recipient),
    '',
    'Rechnungsdatum: '+date(doc.issue_date),
    'Leistungsdatum: '+date(doc.service_date),
    'Fälligkeit: '+date(doc.due_date),
    ...(doc.buyer_reference?['Käuferreferenz: '+doc.buyer_reference]:[]),
    '',
    'Positionen',
    ...doc.lines.flatMap((line,i)=>[
      String(i+1)+'. '+line.description,
      '  '+(line.quantity_milli/1000).toLocaleString('de-DE')+' x '+formatCents(line.unit_cents)+
        ' = '+formatCents(sums.line_totals_cents[i])+(doc.tax_mode==='vat_registered'?' ('+line.tax_rate+'% USt)':'')
    ]),
    '',
    'Netto: '+formatCents(sums.subtotal_cents),
    ...(doc.tax_mode==='vat_registered'?sums.tax_groups.flatMap(g=>[
      'Netto ('+g.rate+'%): '+formatCents(g.base_cents),
      'Umsatzsteuer ('+g.rate+'%): '+formatCents(g.tax_cents)
    ]):[]),
    'Gesamtbetrag: '+formatCents(sums.total_cents),
    ...(doc.tax_mode==='small_business'?['Umsatzsteuerfrei nach § 19 UStG. Es wird keine Umsatzsteuer ausgewiesen.']:[]),
    ...(doc.seller.iban?['','IBAN: '+doc.seller.iban]:[]),
    ...(doc.seller.bic?['BIC: '+doc.seller.bic]:[]),
    ...(doc.note?['','Hinweis: '+doc.note]:[])
  ]
}
/** Flat OpenDocument Text (.fodt) is an editable standard ODF document, not an e-invoice. */
export function renderFodt(doc:DocumentInvoice):Buffer {
  const lines=invoiceLines(doc)
  const paragraphs=lines.map((line,i)=>'<text:p text:style-name="'+(i===0?'Title':'Body')+'">'+escapeXml(line)+'</text:p>').join('')
  return Buffer.from('<?xml version="1.0" encoding="UTF-8"?>'+
    '<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" '+
    'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" '+
    'xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" office:version="1.3" '+
    'office:mimetype="application/vnd.oasis.opendocument.text">'+
    '<office:automatic-styles>'+
    '<style:style style:name="Title" style:family="paragraph"><style:text-properties xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" fo:font-size="18pt" fo:font-weight="bold"/></style:style>'+
    '<style:style style:name="Body" style:family="paragraph"/>'+
    '</office:automatic-styles><office:body><office:text>'+paragraphs+
    '</office:text></office:body></office:document>','utf8')
}

/** Standard compressed OpenDocument text package (.odt).
 * mimetype must be the first ZIP member and must be stored uncompressed.
 */
export function renderOdt(doc:DocumentInvoice):Buffer {
  const mimetype='application/vnd.oasis.opendocument.text'
  const flat=renderFodt(doc).toString('utf8')
  const content=flat
    .replace('<office:document ', '<office:document-content ')
    .replace(' office:mimetype="'+mimetype+'"', '')
    .replace('</office:document>', '</office:document-content>')
  const manifest='<?xml version="1.0" encoding="UTF-8"?>'+
    '<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3">'+
    '<manifest:file-entry manifest:full-path="/" manifest:media-type="'+mimetype+'"/>'+
    '<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>'+
    '</manifest:manifest>'
  return Buffer.from(zipSync({
    mimetype:[strToU8(mimetype),{level:0}],
    'content.xml':strToU8(content),
    'META-INF/manifest.xml':strToU8(manifest),
  },{level:6}))
}

export const renderPdf = renderStyledPdf
