import { saveBillingCustomer } from '@/app/admin/_actions/billing'

export function CustomerForm({customer}:{customer?:Record<string,unknown>}) {
 const field=(key:string,label:string,required=false)=><label key={key} className="text-sm space-y-1">
  <span>{label}</span><input className="block w-full border border-zinc-700 bg-black min-h-11 p-3"
    name={key} required={required} defaultValue={String(customer?.[key]??'')}/>
 </label>
 return <form action={saveBillingCustomer} className="border border-zinc-800 p-5 space-y-4">
  <h2 className="text-lg font-semibold">{customer?'Kunde bearbeiten':'Neuer Kunde'}</h2>
  {customer&&<input type="hidden" name="id" value={String(customer.id)}/>}
  {field('name','Kunde / Firma',true)}{field('contact_name','Ansprechpartner')}
  {field('email','E-Mail')}{field('street','Straße und Hausnummer',true)}
  <div className="grid grid-cols-2 gap-3">{field('postal_code','PLZ',true)}{field('city','Ort',true)}</div>
  <label className="block text-sm space-y-1"><span>Ländercode (ISO 3166-1)</span>
    <input className="w-full bg-black border border-zinc-700 p-3" name="country" required maxLength={2}
      defaultValue={String(customer?.country??'DE')}/></label>
  {field('vat_id','USt-IdNr. (optional)')}
  <label className="block text-sm space-y-1"><span>Notizen</span><textarea name="notes" rows={3} maxLength={2000}
    className="block w-full border border-zinc-700 bg-black p-3" defaultValue={String(customer?.notes??'')}/></label>
  <button type="submit" className="bg-red-800 px-5 py-3 min-h-11">Speichern</button>
 </form>
}
