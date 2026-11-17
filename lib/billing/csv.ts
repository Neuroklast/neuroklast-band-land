import { billingPaymentStatus } from './domain'

export interface LedgerCsvInvoice {
  number?:unknown; status?:unknown; recipient?:unknown; issue_date?:unknown
  service_date?:unknown; due_date?:unknown; total_cents?:unknown; paid_cents?:unknown
}

/** UTF-8, semicolon-delimited for German spreadsheet applications.
 * Every untrusted cell is quoted, including formulas protected from CSV injection.
 */
function csvCell(value:unknown):string {
  let text=String(value??'')
  if (/^[\s]*[=+\-@\t\r\n]/.test(text)) text="'"+text
  return '"'+text.replace(/"/g,'""')+'"'
}
function euro(cents:number):string {
  if(!Number.isSafeInteger(cents)||cents<0)throw new Error('Invalid monetary value in ledger')
  return String(Math.floor(cents/100))+','+String(cents%100).padStart(2,'0')
}
export function billingLedgerCsv(rows:LedgerCsvInvoice[],today:string):string {
  const header=['Rechnungsnummer','Rechnungsdatum','Leistungsdatum','Faelligkeit','Kunde',
    'Rechnungsstatus','Zahlungsstatus','Betrag_EUR','Bezahlt_EUR','Offen_EUR']
  const data=rows.map(row=>{
    const total=Number(row.total_cents),paid=Number(row.paid_cents??0)
    if(paid>total)throw new Error('Ledger export contains an overpayment inconsistency')
    const status=String(row.status)
    const payment=billingPaymentStatus(status,String(row.due_date),total,paid,today)
    const name=String((row.recipient as {name?:unknown}|null)?.name??'')
    const values=[row.number??'',row.issue_date??'',row.service_date??'',row.due_date??'',
      name,status,payment,euro(total),euro(paid),euro(Math.max(0,total-paid))]
    return values.map(csvCell).join(';')
  })
  return '\uFEFF'+[header.map(csvCell).join(';'),...data].join('\r\n')+'\r\n'
}
