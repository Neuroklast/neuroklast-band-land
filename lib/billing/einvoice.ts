import { generateXRechnungUbl, validateUblXml, type Invoice as EnInvoice } from '@stampbench/core'
import { calculateInvoice } from './domain'
import type { DocumentInvoice } from './documents'

/** Construct a German domestic UBL invoice from the frozen, integer-cent billing model.
 *
 * The dependency checks a documented SUBSET of EN16931/XRechnung rules.
 * A passing result is not a KoSIT certification and must not be represented as such.
 */
const euro = (cents: number): number => {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new Error('Invalid invoice amount')
  return cents / 100
}
function mandatory(name: string, value: string | undefined): string {
  const result = (value ?? '').trim()
  if (!result) throw new Error('XRechnung missing required field: ' + name)
  return result
}
const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export interface XRechnungResult {
  xml: Buffer
  ruleset: string
  warnings: string[]
}

export function renderXRechnung(doc: DocumentInvoice): XRechnungResult {
  if (doc.tax_mode !== 'vat_registered') {
    throw new Error('XRechnung is not enabled for this seller tax mode; review §19 VAT category mapping first')
  }
  if (doc.seller.country !== 'DE' || doc.recipient.country !== 'DE') {
    throw new Error('Only domestic German seller/buyer invoices are supported')
  }
  const sellerEmail = mandatory('seller email (BT-34/43)', doc.seller.email)
  const sellerPhone = mandatory('seller phone (BT-42)', doc.seller.phone)
  const contactName = mandatory('seller contact (BT-41)', doc.seller.contact_name)
  const buyerEmail = mandatory('buyer email (BT-49)', doc.recipient.email)
  const buyerReference = mandatory('buyer reference (BT-10)', doc.buyer_reference)
  const iban = mandatory('IBAN (BT-84)', doc.seller.iban).replace(/\s+/g, '').toUpperCase()
  const taxId = mandatory('seller tax ID (BT-31 or BT-32)', doc.seller.tax_id)
  if (!emailShape.test(sellerEmail) || !emailShape.test(buyerEmail)) {
    throw new Error('E-invoicing requires valid sender and recipient electronic addresses')
  }
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)) {
    throw new Error('E-invoicing requires a valid-format IBAN')
  }
  const sums = calculateInvoice(doc.lines, doc.tax_mode)
  const isVatId = /^DE\d{9}$/.test(taxId)
  const model: EnInvoice = {
    number: doc.number,
    issueDate: doc.issue_date,
    dueDate: doc.due_date,
    taxPointDate: doc.service_date,
    buyerReference,
    currencyCode: 'EUR',
    typeCode: '380',
    ...(doc.note ? { notes: [doc.note] } : {}),
    seller: {
      name: mandatory('seller name', doc.seller.name),
      ...(isVatId ? { vatId: taxId } : { taxRegistrationId: taxId }),
      electronicAddress: sellerEmail,
      electronicAddressScheme: 'EM',
      contact: { name: contactName, phone: sellerPhone, email: sellerEmail },
      address: {
        streetName: mandatory('seller street', doc.seller.street),
        postCode: mandatory('seller postcode', doc.seller.postal_code),
        city: mandatory('seller city', doc.seller.city), countryCode: 'DE',
      },
    },
    buyer: {
      name: mandatory('recipient name', doc.recipient.name),
      electronicAddress: buyerEmail,
      electronicAddressScheme: 'EM',
      address: {
        streetName: mandatory('buyer street', doc.recipient.street),
        postCode: mandatory('buyer postcode', doc.recipient.postal_code),
        city: mandatory('buyer city', doc.recipient.city), countryCode: 'DE',
      },
    },
    payment: {
      meansTypeCode: '58',
      remittanceInformation: doc.number,
      creditTransfers: [{ iban, ...(doc.seller.bic ? { bic: doc.seller.bic } : {}) }],
    },
    paymentTerms: 'Zahlbar bis ' + doc.due_date,
    lines: doc.lines.map((line, index) => ({
      id: String(index + 1),
      quantity: line.quantity_milli / 1000,
      unitCode: 'C62',
      netAmount: euro(sums.line_totals_cents[index]),
      item: { name: line.description },
      price: { netPrice: euro(line.unit_cents) },
      vat: { categoryCode: 'S', rate: line.tax_rate },
    })),
    totals: {
      sumOfLineNet: euro(sums.subtotal_cents),
      taxExclusive: euro(sums.subtotal_cents),
      taxTotal: euro(sums.tax_cents),
      taxInclusive: euro(sums.total_cents),
      amountDue: euro(sums.total_cents),
    },
    vatBreakdown: sums.tax_groups.map(group => ({
      categoryCode: 'S', rate: group.rate,
      taxableAmount: euro(group.base_cents),
      taxAmount: euro(group.tax_cents),
    })),
  }
  const xml = generateXRechnungUbl(model)
  const validation = validateUblXml(xml, { profile: 'xrechnung' })
  if (!validation.valid) {
    // Do not leak customer addresses or invoice amounts into operational error logs.
    const issues = validation.violations.filter(item => item.severity === 'error')
    throw new Error('XRechnung validation failed: ' + issues.slice(0, 8).map(x => x.ruleId).join(', '))
  }
  const parsedTotal = validation.invoice?.totals?.taxInclusive
  if (parsedTotal === undefined || Math.round(parsedTotal * 100) !== sums.total_cents) {
    throw new Error('XRechnung totals differ from immutable invoice totals')
  }
  if (!xml.includes(doc.number) || Buffer.byteLength(xml, 'utf8') > 8 * 1024 * 1024) {
    throw new Error('Unexpected electronic invoice document')
  }
  return {
    xml: Buffer.from(xml, 'utf8'),
    ruleset: validation.meta.rulesetVersion,
    warnings: validation.violations.filter(x => x.severity !== 'error').map(x => x.ruleId),
  }
}
