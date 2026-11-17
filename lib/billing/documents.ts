import type { InvoiceLine } from './domain'
import { calculateInvoice, formatCents, type TaxMode } from './domain'

export interface DocumentInvoice {
  id:string; number:string; issue_date:string; service_date:string; due_date:string
  seller:Record<string,string>; recipient:Record<string,string>
  lines:InvoiceLine[]; tax_mode:TaxMode; note:string
}

const str=(value:unknown):string=>String(value??'')
const escapeXml=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')
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
    'Faelligkeit: '+date(doc.due_date),
    '',
    'Positionen',
    ...doc.lines.flatMap((line,i)=>[
      String(i+1)+'. '+line.description,
      '  '+(line.quantity_milli/1000).toLocaleString('de-DE')+' x '+formatCents(line.unit_cents)+
        ' = '+formatCents(sums.line_totals_cents[i])+(doc.tax_mode==='vat_registered'?' ('+line.tax_rate+'% USt)':'')
    ]),
    '',
    'Netto: '+formatCents(sums.subtotal_cents),
    ...(doc.tax_mode==='vat_registered'?['Umsatzsteuer: '+formatCents(sums.tax_cents)]:[]),
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

/** Conservative one-column PDF 1.4 with WinAnsi Helvetica. No PDF/A or EN16931 claim.
 * Keeps issuance independent from browsers, headless processes and external APIs.
 */
function winAnsi(text:string):Buffer {
  const aliases:Record<string,number>={'€':128,'–':150,'—':151,'‘':145,'’':146,'“':147,'”':148,'•':149}
  const bytes:number[]=[]
  for(const ch of text) {
    const c=ch.codePointAt(0)!
    bytes.push(aliases[ch]??(c>=32&&c<=255?c:63))
  }
  return Buffer.from(bytes)
}
function pdfEscape(s:Buffer):string {
  let out=''
  for(const b of s){
    if(b===40||b===41||b===92)out+='\\'+String.fromCharCode(b)
    else if(b<32||b>126)out+='\\'+b.toString(8).padStart(3,'0')
    else out+=String.fromCharCode(b)
  }
  return out
}
function wrap(line:string,max=88):string[] {
  if(!line)return ['']
  const parts:string[]=[]
  let remaining=line
  while(remaining.length>max) {
    let pos=remaining.lastIndexOf(' ',max)
    if(pos<12)pos=max
    parts.push(remaining.slice(0,pos))
    remaining=remaining.slice(pos).trimStart()
  }
  parts.push(remaining)
  return parts
}
export function renderPdf(doc:DocumentInvoice):Buffer {
  const lines=invoiceLines(doc).flatMap(x=>wrap(x))
  const pages:string[][]=[]
  for(let i=0;i<lines.length;i+=47)pages.push(lines.slice(i,i+47))
  if(!pages.length)pages.push([])
  const objects:string[]=[]
  const add=(s:string)=>{objects.push(s);return objects.length}
  const catalog=add('')
  const pagesRef=add('')
  const font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  const ids:number[]=[]
  for(let index=0;index<pages.length;index++){
    const textLines=pages[index].map((line,j)=>
      'BT /F1 '+(index===0&&j===0?'16':'10')+' Tf 48 '+(790-j*15)+' Td ('+pdfEscape(winAnsi(line))+') Tj ET').join('\n')
    const stream=Buffer.from(textLines,'latin1')
    const content=add('<< /Length '+stream.length+' >>\nstream\n'+stream.toString('latin1')+'\nendstream')
    const page=add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 '+font+' 0 R >> >> /Contents '+content+' 0 R >>')
    ids.push(page)
  }
  objects[catalog-1]='<< /Type /Catalog /Pages 2 0 R >>'
  objects[pagesRef-1]='<< /Type /Pages /Kids ['+ids.map(x=>x+' 0 R').join(' ')+'] /Count '+ids.length+' >>'
  let pdf='%PDF-1.4\n%NK01\n'
  const offsets=[0]
  for(let i=0;i<objects.length;i++){
    offsets.push(Buffer.byteLength(pdf,'latin1'))
    pdf+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n'
  }
  const start=Buffer.byteLength(pdf,'latin1')
  pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n'
  for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n'
  pdf+='trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF'
  return Buffer.from(pdf,'latin1')
}
