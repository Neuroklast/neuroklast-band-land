import { calculateInvoice, formatCents } from './domain'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { deflateSync } from 'node:zlib'
import type { DocumentInvoice } from './documents'

/**
 * Deterministic A4 PDF 1.4 invoice renderer. The actual NEUROKLAST logo
 * comes from the exact approved NK Logo Red Bold original rather than a substitute glyph.
 * Branded image bytes are embedded inside each archived PDF. Existing
 * issued invoice snapshots remain immutable.
 */
const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const LEFT = 42
const RIGHT = 553
const INK = '0.100 0.110 0.145'
const MUTED = '0.380 0.410 0.460'
const RED = '0.930 0.100 0.100'
const PALE = '0.960 0.963 0.970'
const WHITE = '1 1 1'

type Font = 'F1' | 'F2'
type Sheet = { commands: string[] }
type MoneyRow = { description: string; quantity: string; price: string; total: string; tax: number }

function sheet(): Sheet { return { commands: [] } }
function rect(p: Sheet, x: number, y: number, w: number, h: number, fill: string) {
  p.commands.push('q', fill + ' rg', x + ' ' + y + ' ' + w + ' ' + h + ' re f', 'Q')
}
function rule(p: Sheet, x1: number, y: number, x2: number, color = '0.85 0.86 0.88', width = 0.65) {
  p.commands.push('q', color + ' RG', width + ' w', x1 + ' ' + y + ' m ' + x2 + ' ' + y + ' l S', 'Q')
}
function encode(value: string): string {
  const aliases: Record<string, number> = {
    '€': 128, '‚': 130, '„': 132, '…': 133, '†': 134, '‡': 135,
    'ˆ': 136, '‰': 137, 'Š': 138, '‹': 139, 'Œ': 140, 'Ž': 142,
    '‘': 145, '’': 146, '“': 147, '”': 148, '•': 149, '–': 150, '—': 151,
    '˜': 152, '™': 153, 'š': 154, '›': 155, 'œ': 156, 'ž': 158, 'Ÿ': 159,
  }
  let result = ''
  for (const char of value.replace(/[\r\n\t]+/g, ' ')) {
    const cp = aliases[char] ?? char.codePointAt(0)!
    const byte = cp >= 32 && cp <= 255 ? cp : 63
    if (byte === 40 || byte === 41 || byte === 92) result += '\\' + String.fromCharCode(byte)
    else if (byte > 126) result += '\\' + byte.toString(8).padStart(3, '0')
    else result += String.fromCharCode(byte)
  }
  return result
}
function estimateWidth(s: string, size: number, bold = false) {
  let units = 0
  for (const ch of s) {
    if (ch === ' ') units += .29
    else if ('iIl!,.:;|'.includes(ch)) units += .27
    else if ('MW@%'.includes(ch)) units += .87
    else if ('mw'.includes(ch)) units += .75
    else if (/[A-Z0-9]/.test(ch)) units += .65
    else units += .54
  }
  return units * size * (bold ? 1.04 : 1)
}
function drawText(p: Sheet, value: string, x: number, y: number,
  size = 10, font: Font = 'F1', color = INK) {
  p.commands.push('BT', color + ' rg', '/' + font + ' ' + size + ' Tf',
    '1 0 0 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' Tm',
    '(' + encode(value) + ') Tj', 'ET')
}
function drawRight(p: Sheet, value: string, x: number, y: number,
  size = 10, font: Font = 'F1', color = INK) {
  drawText(p, value, x - estimateWidth(value, size, font === 'F2') - 3, y, size, font, color)
}
function wrap(value: string, width: number, size: number, font: Font = 'F1'): string[] {
  const tokens = value.trim().split(/\s+/).filter(Boolean)
  if (!tokens.length) return ['']
  const lines: string[] = []
  let line = ''
  const fits = (x: string) => estimateWidth(x, size, font === 'F2') <= width
  for (const token of tokens) {
    if (fits(line ? line + ' ' + token : token)) {
      line = line ? line + ' ' + token : token
      continue
    }
    if (line) { lines.push(line); line = '' }
    if (fits(token)) { line = token; continue }
    let fragment = ''
    for (const ch of token) {
      if (fragment && !fits(fragment + ch)) { lines.push(fragment); fragment = '' }
      fragment += ch
    }
    line = fragment
  }
  if (line) lines.push(line)
  return lines
}
type EmbeddedLogo = { bytes: Buffer; width: number; height: number }
let logoPromise:Promise<EmbeddedLogo>|undefined

/** The original NEUROKLAST wordmark is bundled into the server function. */
async function brandedLogo():Promise<EmbeddedLogo> {
  if (!logoPromise) {
    logoPromise = (async () => {
      const source = await readFile(join(process.cwd(),'public/brand/nk-logo-red-bold.png'))
      const {data,info} = await sharp(source)
        .trim()
        .resize({width:900,withoutEnlargement:true})
        .flatten({background:'#ffffff'})
        .removeAlpha()
        .raw()
        .toBuffer({resolveWithObject:true})
      if(info.width<1||info.height<1||info.channels!==3)
        throw new Error('Invalid canonical invoice logo')
      // A lossless RGB XObject preserves the original hard-edged wordmark.
      return {bytes:deflateSync(data,{level:9}),width:info.width,height:info.height}
    })().catch(error=>{logoPromise=undefined;throw error})
  }
  return logoPromise
}

function header(p: Sheet, continuation = false) {
  rect(p, 0, PAGE_HEIGHT - 6, PAGE_WIDTH, 6, RED)
  // Exact red NK bold mark (transparent padded image cropped to the artwork).
  p.commands.push('q', '112 0 0 58 ' + LEFT + ' 762 cm', '/BrandLogo Do', 'Q')
  drawText(p, 'NEUROKLAST', 168, 791, 21, 'F2')
  drawText(p, 'MUSIC  /  LIVE  /  PRODUCTION', 170, 774, 7.8, 'F1', MUTED)
  rule(p, LEFT, 740, RIGHT)
  if (continuation) {
    drawText(p, 'RECHNUNG  /  FORTSETZUNG', LEFT, 710, 16, 'F2')
  }
}
function firstPage(p: Sheet, doc: DocumentInvoice) {
  header(p)
  drawText(p, 'RECHNUNG', LEFT, 706, 23, 'F2')
  drawText(p, 'Rechnungsnummer', 364, 713, 8, 'F1', MUTED)
  drawText(p, doc.number, 364, 692, 15, 'F2')
  drawText(p, 'RECHNUNGSEMPFÄNGER', LEFT, 644, 9.2, 'F2', RED)
  drawText(p, 'RECHNUNGSAUSSTELLER', 332, 644, 9.2, 'F2', RED)
  const address = (v: Record<string, string>) => [
    v.name, v.street, [v.postal_code, v.city].filter(Boolean).join(' '),
    v.country === 'DE' ? 'Deutschland' : v.country,
  ].filter(Boolean)
  let y = 624
  for (const entry of address(doc.recipient)) {
    for (const line of wrap(entry, 255, 10.1)) {
      drawText(p, line, LEFT, y, 10.1)
      y -= 15
    }
  }
  y = 624
  for (const entry of address(doc.seller)) {
    for (const line of wrap(entry, 218, 9.5)) {
      drawText(p, line, 332, y, 9.5)
      y -= 14
    }
  }
  if (doc.seller.tax_id) drawText(p, 'St.-Nr. / USt-ID: ' + doc.seller.tax_id, 332, y - 2, 8, 'F1', MUTED)
  rect(p, LEFT, 475, RIGHT - LEFT, 59, PALE)
  const values: [string, string, number][] = [
    ['RECHNUNGSDATUM', doc.issue_date, 57],
    ['LEISTUNGSDATUM', doc.service_date, 231],
    ['ZAHLUNGSZIEL', doc.due_date, 409],
  ]
  for (const [label, rawDate, x] of values) {
    drawText(p, label, x, 512, 8, 'F2', MUTED)
    drawText(p, germanDate(rawDate), x, 493, 12, 'F2')
  }
}
function germanDate(value: string) {
  const parts = value.split('-')
  return parts.length === 3 ? parts.reverse().join('.') : value
}
function tableHeader(p: Sheet, top: number) {
  rect(p, LEFT, top - 29, RIGHT - LEFT, 29, INK)
  drawText(p, 'LEISTUNG', LEFT + 11, top - 19, 8.5, 'F2', WHITE)
  drawRight(p, 'MENGE', 400, top - 19, 8, 'F2', WHITE)
  drawRight(p, 'EINZELPREIS', 483, top - 19, 8, 'F2', WHITE)
  drawRight(p, 'BETRAG', RIGHT - 9, top - 19, 8, 'F2', WHITE)
}
function rowHeight(row: MoneyRow) {
  return Math.max(45, wrap(row.description, 276, 9.6).length * 13.8 + (row.tax ? 23 : 12))
}
function tableRow(p: Sheet, row: MoneyRow, top: number, index: number) {
  const lines = wrap(row.description, 276, 9.6)
  const height = rowHeight(row)
  if (index % 2) rect(p, LEFT, top - height, RIGHT - LEFT, height, PALE)
  lines.forEach((line, n) => drawText(p, line, LEFT + 11, top - 17 - n * 13.8, 9.6))
  if (row.tax) drawText(p, String(row.tax) + ' % Umsatzsteuer', LEFT + 11, top - 19 - lines.length * 13.8, 7.5, 'F1', MUTED)
  drawRight(p, row.quantity, 400, top - 17, 9.2)
  drawRight(p, row.price, 483, top - 17, 9.2)
  drawRight(p, row.total, RIGHT - 9, top - 17, 9.2, 'F2')
  rule(p, LEFT, top - height, RIGHT)
  return top - height
}
function summary(p: Sheet, doc: DocumentInvoice, top: number) {
  const amounts = calculateInvoice(doc.lines, doc.tax_mode)
  let y = top - 3
  drawText(p, 'ZWISCHENSUMME', 346, y, 8, 'F2', MUTED)
  drawRight(p, formatCents(amounts.subtotal_cents), RIGHT - 8, y, 10)
  y -= 21
  if (doc.tax_mode === 'vat_registered') {
    for (const g of amounts.tax_groups) {
      drawText(p, 'UMSATZSTEUER ' + g.rate + ' %', 346, y, 8, 'F1', MUTED)
      drawRight(p, formatCents(g.tax_cents), RIGHT - 8, y, 10)
      y -= 20
    }
  }
  rect(p, 338, y - 43, 215, 54, INK)
  rect(p, 338, y - 43, 4, 54, RED)
  drawText(p, 'GESAMTBETRAG', 351, y - 7, 8, 'F2', WHITE)
  drawRight(p, formatCents(amounts.total_cents), RIGHT - 9, y - 28, 17, 'F2', WHITE)
  y -= 70
  if (doc.tax_mode === 'small_business') {
    rect(p, LEFT, y - 28, RIGHT - LEFT, 35, PALE)
    drawText(p, 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet oder ausgewiesen.',
      LEFT + 9, y - 8, 9.1)
    y -= 49
  }
  if (doc.seller.iban) {
    drawText(p, 'ZAHLUNGSINFORMATIONEN', LEFT, y, 9, 'F2', RED)
    y -= 18
    drawText(p, 'Bitte überweisen Sie den Gesamtbetrag bis zum ' + germanDate(doc.due_date) + '.', LEFT, y, 9.3)
    y -= 17
    drawText(p, 'IBAN: ' + doc.seller.iban, LEFT, y, 9.3, 'F2')
    y -= 17
    if (doc.seller.bic) { drawText(p, 'BIC: ' + doc.seller.bic, LEFT, y, 9.1); y -= 17 }
    drawText(p, 'Verwendungszweck: ' + doc.number, LEFT, y, 9.3)
    y -= 23
  }
  if (doc.buyer_reference) {
    for (const line of wrap('Käuferreferenz: ' + doc.buyer_reference, RIGHT - LEFT, 8.7)) {
      drawText(p, line, LEFT, y, 8.7)
      y -= 13
    }
  }
  if (doc.note) {
    for (const line of wrap('Hinweis: ' + doc.note, RIGHT - LEFT, 8.7)) {
      drawText(p, line, LEFT, y, 8.7)
      y -= 13
    }
  }
  if (y < 58) throw new Error('PDF summary exceeds the printable footer area')
}
function footer(p: Sheet, doc: DocumentInvoice, pageNo: number, count: number) {
  rule(p, LEFT, 64, RIGHT)
  const seller = doc.seller
  const legal = [seller.name, seller.email, seller.phone].filter(Boolean).join('  |  ')
  const line = wrap(legal, 425, 7.5)[0]
  drawText(p, line, LEFT, 45, 7.5, 'F1', MUTED)
  drawRight(p, 'SEITE ' + pageNo + ' / ' + count, RIGHT, 45, 7.5, 'F2', MUTED)
}
function pdfFromPages(pages: Sheet[], logo:EmbeddedLogo): Buffer {
  const objects: string[] = []
  const add = (object: string) => { objects.push(object); return objects.length }
  const catalog = add('')
  const pagesRef = add('')
  const regular = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  const bold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
  // Lossless compressed RGB image XObject preserves the actual branded artwork.
  const image = add('<< /Type /XObject /Subtype /Image /Width ' + logo.width +
    ' /Height ' + logo.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8' +
    ' /Filter /FlateDecode /Length ' + logo.bytes.length + ' >>\nstream\n' +
    logo.bytes.toString('latin1') + '\nendstream')
  const references: number[] = []
  for (const p of pages) {
    const stream = p.commands.join('\n') + '\n'
    const contents = add('<< /Length ' + Buffer.byteLength(stream, 'latin1') + ' >>\nstream\n' + stream + 'endstream')
    const page = add('<< /Type /Page /Parent ' + pagesRef + ' 0 R /MediaBox [0 0 ' +
      PAGE_WIDTH + ' ' + PAGE_HEIGHT + '] /Resources << /Font << /F1 ' + regular +
      ' 0 R /F2 ' + bold + ' 0 R >> /XObject << /BrandLogo ' + image + ' 0 R >> >> /Contents ' + contents + ' 0 R >>')
    references.push(page)
  }
  objects[catalog - 1] = '<< /Type /Catalog /Pages ' + pagesRef + ' 0 R >>'
  objects[pagesRef - 1] = '<< /Type /Pages /Kids [' + references.map(x => x + ' 0 R').join(' ') +
    '] /Count ' + references.length + ' >>'
  let output = '%PDF-1.4\n%NK01\n'
  const offsets = [0]
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(output, 'latin1'))
    output += (i + 1) + ' 0 obj\n' + objects[i] + '\nendobj\n'
  }
  const xrefStart = Buffer.byteLength(output, 'latin1')
  output += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n'
  for (let i = 1; i < offsets.length; i++) output += String(offsets[i]).padStart(10, '0') + ' 00000 n \n'
  output += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root ' + catalog +
    ' 0 R >>\nstartxref\n' + xrefStart + '\n%%EOF'
  return Buffer.from(output, 'latin1')
}
export async function renderStyledPdf(doc: DocumentInvoice): Promise<Buffer> {
  const logo=await brandedLogo()
  const amounts = calculateInvoice(doc.lines, doc.tax_mode)
  if (doc.lines.length === 0) throw new Error('Invoice must have positions')
  const rows = doc.lines.map((line, index): MoneyRow => ({
    description: line.description,
    quantity: (line.quantity_milli / 1000).toLocaleString('de-DE', {maximumFractionDigits:3}),
    price: formatCents(line.unit_cents),
    total: formatCents(amounts.line_totals_cents[index]),
    tax: doc.tax_mode === 'vat_registered' ? line.tax_rate : 0,
  }))
  const pages: Sheet[] = [sheet()]
  firstPage(pages[0], doc)
  let current = pages[0]
  let top = 457
  tableHeader(current, top)
  top -= 29
  rows.forEach((row, index) => {
    if (top - rowHeight(row) < 150) {
      current = sheet()
      pages.push(current)
      header(current, true)
      top = 681
      tableHeader(current, top)
      top -= 29
    }
    top = tableRow(current, row, top, index)
  })
  const additional = (doc.note ? wrap('Hinweis: ' + doc.note, RIGHT - LEFT, 8.7).length * 13 : 0) +
    (doc.buyer_reference ? wrap('Käuferreferenz: ' + doc.buyer_reference, RIGHT - LEFT, 8.7).length * 13 : 0) +
    (doc.tax_mode === 'vat_registered' ? amounts.tax_groups.length * 20 : 0) +
    (doc.seller.bic ? 17 : 0)
  if (top < 365 + additional) {
    current = sheet()
    pages.push(current)
    header(current, true)
    top = 690
  }
  summary(current, doc, Math.min(405, top - 20))
  pages.forEach((p, i) => footer(p, doc, i + 1, pages.length))
  return pdfFromPages(pages,logo)
}
