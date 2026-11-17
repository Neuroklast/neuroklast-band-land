'use client'
import { useMemo, useState, type FormEvent } from 'react'
import { saveBillingDraft } from '@/app/admin/_actions/billing'
import { calculateInvoice, formatCents, parseEurosToCents, parseQuantityMilli, type TaxMode } from '@/lib/billing/domain'

type Entry={description:string;quantity:string;price:string;rate:0|7|19}
type Customer={id:string;name:string}
type Existing={
 id:string; revision:number; customer_id:string; issue_date:string;service_date:string;due_date:string;note:string;
 lines:{description:string;quantity_milli:number;unit_cents:number;tax_rate:0|7|19}[]
}
export function InvoiceForm({customers,taxMode,today,initial}:{
 customers:Customer[];taxMode:TaxMode;today:string;initial?:Existing
}) {
 const [rows,setRows]=useState<Entry[]>(initial?.lines.map(l=>({
  description:l.description,quantity:String(l.quantity_milli/1000),price:(l.unit_cents/100).toFixed(2),rate:l.tax_rate
 }))??[{description:'',quantity:'1',price:'',rate:taxMode==='small_business'?0:19}])
 const rateList=taxMode==='small_business'?[0]:[7,19]
 const [error,setError]=useState('')
 const prepared=useMemo(()=>{
  try {
   const lines=rows.map(r=>({
    description:r.description.trim(),quantity_milli:parseQuantityMilli(r.quantity),
    unit_cents:parseEurosToCents(r.price),tax_rate:r.rate
   }))
   if(lines.some(l=>!l.description||l.unit_cents===0))throw new Error('Beschreibung und positiver Preis sind erforderlich')
   const totals=calculateInvoice(lines,taxMode)
   return {lines,totals,error:''}
  }catch(e){return {lines:[],totals:null,error:e instanceof Error?e.message:'Ungültige Position'}}
 },[rows,taxMode])
 const patch=(index:number,field:keyof Entry,value:string|number)=>{
  setRows(old=>old.map((r,i)=>i===index?{...r,[field]:value}:r))
 }
 const submit=(event:FormEvent<HTMLFormElement>)=>{
  if(prepared.error||!prepared.lines.length){event.preventDefault();setError(prepared.error||'Mindestens eine Position angeben')}
 }
 const input='w-full min-h-11 border border-zinc-700 bg-black text-white px-3 py-2'
 return <form action={saveBillingDraft} onSubmit={submit} className="space-y-6 max-w-5xl">
  {initial&&<><input type="hidden" name="id" value={initial.id}/><input type="hidden" name="revision" value={initial.revision}/></>}
  <input type="hidden" name="lines_json" value={JSON.stringify(prepared.lines)}/>
  <div className="grid gap-4 sm:grid-cols-2">
   <label className="space-y-2 text-sm"><span>Kunde</span><select className={input} name="customer_id" required defaultValue={initial?.customer_id??''}>
     <option value="" disabled>Kunde wählen</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
   </select></label>
   <div className="text-sm text-zinc-400 self-end pb-2">Umsatzsteuer-Modus: {taxMode==='small_business'?'Kleinunternehmer § 19 UStG':'Regelbesteuerung'}</div>
   <label className="space-y-2 text-sm"><span>Rechnungsdatum</span><input className={input} type="date" required name="issue_date" defaultValue={initial?.issue_date??today}/></label>
   <label className="space-y-2 text-sm"><span>Leistungsdatum</span><input className={input} type="date" required name="service_date" defaultValue={initial?.service_date??today}/></label>
   <label className="space-y-2 text-sm"><span>Fällig am</span><input className={input} type="date" required name="due_date" defaultValue={initial?.due_date??today}/></label>
  </div>
  <section className="space-y-3">
   <h2 className="text-lg font-semibold">Rechnungspositionen</h2>
   {rows.map((r,i)=><div key={i} className="grid gap-3 bg-zinc-950 border border-zinc-800 p-4 sm:grid-cols-12">
    <label className="text-sm space-y-2 sm:col-span-5"><span>Leistung</span><input className={input} value={r.description} onChange={e=>patch(i,'description',e.target.value)} maxLength={500} required placeholder="z. B. DJ-Auftritt"/></label>
    <label className="text-sm space-y-2 sm:col-span-2"><span>Menge</span><input className={input} value={r.quantity} onChange={e=>patch(i,'quantity',e.target.value)} inputMode="decimal" required/></label>
    <label className="text-sm space-y-2 sm:col-span-2"><span>Einzelpreis €</span><input className={input} value={r.price} onChange={e=>patch(i,'price',e.target.value)} inputMode="decimal" required placeholder="600,00"/></label>
    <label className="text-sm space-y-2 sm:col-span-2"><span>USt</span><select className={input} value={r.rate} onChange={e=>patch(i,'rate',Number(e.target.value))}>{rateList.map(rate=><option value={rate} key={rate}>{rate}%</option>)}</select></label>
    <button type="button" onClick={()=>setRows(old=>old.filter((_,j)=>i!==j))} disabled={rows.length===1} aria-label="Position entfernen" className="sm:col-span-1 text-zinc-300 hover:text-white disabled:opacity-30 self-end min-h-11">×</button>
   </div>)}
   <button type="button" className="border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900" disabled={rows.length>=100}
     onClick={()=>setRows(old=>[...old,{description:'',quantity:'1',price:'',rate:taxMode==='small_business'?0:19}])}>+ Position</button>
  </section>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm space-y-2"><span>Zusätzliche Hinweise</span><textarea name="note" className={input} rows={5} maxLength={2000} defaultValue={initial?.note??''}/></label>
   <div className="border border-zinc-800 p-4 space-y-2 text-sm" aria-live="polite">
    <p>Netto: {prepared.totals?formatCents(prepared.totals.subtotal_cents):'–'}</p>
    {taxMode==='vat_registered'&&<p>Umsatzsteuer: {prepared.totals?formatCents(prepared.totals.tax_cents):'–'}</p>}
    <p className="font-bold text-xl">Gesamt: {prepared.totals?formatCents(prepared.totals.total_cents):'–'}</p>
    <p className="text-xs text-zinc-400">Die finale Berechnung erfolgt auf dem Server.</p>
   </div>
  </div>
  {(error||prepared.error)&&<p role="alert" className="text-red-400 text-sm">{error||prepared.error}</p>}
  <button type="submit" disabled={!prepared.totals} className="min-h-11 bg-red-800 text-white px-6 py-2 font-medium disabled:opacity-40">
   {initial?'Änderungen speichern':'Rechnungsentwurf erstellen'}
  </button>
 </form>
}
