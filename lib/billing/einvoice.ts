import { InvoiceService, type Invoice, type Logger } from '@e-invoice-eu/core'
import { calculateInvoice } from './domain'
import type { DocumentInvoice } from './documents'

/** Generate German domestic XRechnung UBL via the e-invoice-eu library.
 * JSON Schema validation is performed by that library. Official KoSIT
 * XRechnung + EN16931 rule validation remains an independent release gate.
 */
const silentLogger: Logger = { log:()=>{}, warn:()=>{}, error:()=>{} }
const euro=(cents:number):string=>{
  if(!Number.isSafeInteger(cents)||cents<0)throw new Error('Invalid invoice amount')
  return (cents/100).toFixed(2)
}
function mandatory(name:string,value:string|undefined):string {
  const clean=(value??'').trim()
  if(!clean)throw new Error('XRechnung missing required field: '+name)
  return clean
}
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
export interface XRechnungResult { xml:Buffer;ruleset:string;warnings:string[] }

export async function renderXRechnung(doc:DocumentInvoice):Promise<XRechnungResult> {
  if(doc.tax_mode!=='vat_registered')
    throw new Error('XRechnung requires a reviewed VAT treatment; §19 support has not passed external validation')
  if(doc.seller.country!=='DE'||doc.recipient.country!=='DE')
    throw new Error('Only domestic German seller/buyer invoices are supported')
  const sellerEmail=mandatory('seller email (BT-34/43)',doc.seller.email)
  const sellerPhone=mandatory('seller phone (BT-42)',doc.seller.phone)
  const contactName=mandatory('seller contact (BT-41)',doc.seller.contact_name)
  const buyerEmail=mandatory('buyer email (BT-49)',doc.recipient.email)
  const buyerReference=mandatory('buyer reference (BT-10)',doc.buyer_reference)
  const iban=mandatory('IBAN (BT-84)',doc.seller.iban).replace(/\s+/g,'').toUpperCase()
  const taxId=mandatory('seller tax ID (BT-31/32)',doc.seller.tax_id)
  if(!emailPattern.test(sellerEmail)||!emailPattern.test(buyerEmail))
    throw new Error('E-invoicing requires valid seller and buyer email addresses')
  if(!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban))
    throw new Error('E-invoicing requires a valid-format IBAN')
  const amounts=calculateInvoice(doc.lines,doc.tax_mode)
  const isVatId=/^DE\d{9}$/.test(taxId)
  const taxScheme={ 'cbc:CompanyID':taxId,'cac:TaxScheme':{'cbc:ID':isVatId?'VAT':'FC'} }
  const supplier={
    'cbc:EndpointID':sellerEmail,
    'cbc:EndpointID@schemeID':'EM',
    'cac:PostalAddress':{
      'cbc:StreetName':mandatory('seller street',doc.seller.street),
      'cbc:CityName':mandatory('seller city',doc.seller.city),
      'cbc:PostalZone':mandatory('seller postcode',doc.seller.postal_code),
      'cac:Country':{'cbc:IdentificationCode':'DE'},
    },
    'cac:PartyTaxScheme':[taxScheme],
    'cac:PartyLegalEntity':{'cbc:RegistrationName':mandatory('seller name',doc.seller.name)},
    'cac:Contact':{
      'cbc:Name':contactName,'cbc:Telephone':sellerPhone,'cbc:ElectronicMail':sellerEmail,
    },
  }
  const buyer={
    'cbc:EndpointID':buyerEmail,
    'cbc:EndpointID@schemeID':'EM',
    'cac:PostalAddress':{
      'cbc:StreetName':mandatory('buyer street',doc.recipient.street),
      'cbc:CityName':mandatory('buyer city',doc.recipient.city),
      'cbc:PostalZone':mandatory('buyer postcode',doc.recipient.postal_code),
      'cac:Country':{'cbc:IdentificationCode':'DE'},
    },
    'cac:PartyLegalEntity':{'cbc:RegistrationName':mandatory('buyer name',doc.recipient.name)},
  }
  const totals={
    'cbc:LineExtensionAmount':euro(amounts.subtotal_cents),
    'cbc:LineExtensionAmount@currencyID':'EUR',
    'cbc:TaxExclusiveAmount':euro(amounts.subtotal_cents),
    'cbc:TaxExclusiveAmount@currencyID':'EUR',
    'cbc:TaxInclusiveAmount':euro(amounts.total_cents),
    'cbc:TaxInclusiveAmount@currencyID':'EUR',
    'cbc:PayableAmount':euro(amounts.total_cents),
    'cbc:PayableAmount@currencyID':'EUR',
  }
  const invoiceData={
    'ubl:Invoice':{
      'cbc:ID':doc.number,'cbc:IssueDate':doc.issue_date,'cbc:DueDate':doc.due_date,
      'cbc:InvoiceTypeCode':'380','cbc:TaxPointDate':doc.service_date,
      'cbc:DocumentCurrencyCode':'EUR','cbc:BuyerReference':buyerReference,
      ...(doc.note?{'cbc:Note':[doc.note]}:{}),
      'cac:AccountingSupplierParty':{'cac:Party':supplier},
      'cac:AccountingCustomerParty':{'cac:Party':buyer},
      'cac:PaymentMeans':[{
        'cbc:PaymentMeansCode':'58',
        'cbc:PaymentID':doc.number,
        'cac:PayeeFinancialAccount':{
          'cbc:ID':iban,
          ...(doc.seller.bic?{
            'cac:FinancialInstitutionBranch':{'cbc:ID':doc.seller.bic},
          }:{}),
        },
      }],
      'cac:PaymentTerms':{'cbc:Note':'Zahlbar bis '+doc.due_date},
      'cac:TaxTotal':[{
        'cbc:TaxAmount':euro(amounts.tax_cents),
        'cbc:TaxAmount@currencyID':'EUR',
        'cac:TaxSubtotal':amounts.tax_groups.map(group=>({
          'cbc:TaxableAmount':euro(group.base_cents),
          'cbc:TaxableAmount@currencyID':'EUR',
          'cbc:TaxAmount':euro(group.tax_cents),
          'cbc:TaxAmount@currencyID':'EUR',
          'cac:TaxCategory':{
            'cbc:ID':'S','cbc:Percent':String(group.rate),
            'cac:TaxScheme':{'cbc:ID':'VAT'},
          },
        })),
      }],
      'cac:LegalMonetaryTotal':totals,
      'cac:InvoiceLine':doc.lines.map((line,index)=>({
        'cbc:ID':String(index+1),
        'cbc:InvoicedQuantity':String(line.quantity_milli/1000),
        'cbc:InvoicedQuantity@unitCode':'C62',
        'cbc:LineExtensionAmount':euro(amounts.line_totals_cents[index]),
        'cbc:LineExtensionAmount@currencyID':'EUR',
        'cac:Item':{
          'cbc:Name':line.description,
          'cac:ClassifiedTaxCategory':{
            'cbc:ID':'S','cbc:Percent':String(line.tax_rate),
            'cac:TaxScheme':{'cbc:ID':'VAT'},
          },
        },
        'cac:Price':{
          'cbc:PriceAmount':euro(line.unit_cents),
          'cbc:PriceAmount@currencyID':'EUR',
        },
      })),
    },
  } as unknown as Invoice

  const service=new InvoiceService(silentLogger)
  const generated=await service.generate(invoiceData,{format:'XRECHNUNG-UBL',lang:'de-DE'})
  if(typeof generated!=='string')throw new Error('XRechnung generator did not produce XML')
  const match=generated.match(/<cbc:PayableAmount\b[^>]*>(\d+(?:\.\d{1,2})?)<\/cbc:PayableAmount>/)
  if(!match||Number(match[1])!==amounts.total_cents/100)
    throw new Error('XRechnung payable total differs from the frozen invoice model')
  if(!generated.includes(doc.number)||!generated.includes('xrechnung'))
    throw new Error('XRechnung specification identifier or invoice number missing')
  if(Buffer.byteLength(generated,'utf8')>8*1024*1024)
    throw new Error('Electronic invoice exceeds archive size limit')
  return {
    xml:Buffer.from(generated,'utf8'),
    ruleset:'E-Invoice-EU/XRechnung-UBL (local JSON Schema)',
    warnings:['Official KoSIT Schematron/EN16931 check must pass before production'],
  }
}
