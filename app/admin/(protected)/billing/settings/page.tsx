import { admin } from '@/lib/neurokore/server'
import { getBillingSettings, getBillingSequence } from '@/lib/billing/service'
import { saveBillingSettings, seedBillingSequenceAction } from '@/app/admin/_actions/billing'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { billingDateInGermany } from '@/lib/billing/date'
export const dynamic='force-dynamic'
export default async function BillingSettingsPage({searchParams}:{searchParams:Promise<{saved?:string;sequence?:string}>}) {
 await admin()
 const currentYear=Number(billingDateInGermany().slice(0,4))
 const [settings,sequence]=await Promise.all([getBillingSettings(),getBillingSequence(currentYear)])
 const params=await searchParams
 const field=(key:string,label:string,required=false)=><label className="text-sm space-y-1" key={key}>
  <span>{label}</span><input name={key} required={required} defaultValue={String(settings[key]??'')}
   className="block w-full bg-black border border-zinc-700 p-3 min-h-11"/></label>
 return <main className="max-w-2xl">
  <AdminPageHeader title="Rechnungssteller & Steuerprofil" description="Vor Ausstellung der ersten Rechnung sorgfältig prüfen. Keine automatischen steuerlichen Annahmen."/>
  {params.saved==='1'&&<p className="text-green-400 mb-4">Einstellungen gespeichert.</p>}
  {params.sequence==='1'&&<p className="text-green-400 mb-4">Nummernkreis initialisiert.</p>}
  <form action={saveBillingSettings} className="space-y-4">
   {field('seller_name','Vollständiger Name / Firma',true)}
   {field('seller_street','Straße und Hausnummer',true)}
   <div className="grid grid-cols-2 gap-3">{field('seller_postal_code','PLZ',true)}{field('seller_city','Ort',true)}</div>
   {field('seller_country','Ländercode',true)}{field('seller_tax_id','Steuernummer oder USt-IdNr.',true)}
   {field('seller_email','Kontakt-E-Mail')}{field('seller_iban','IBAN')}{field('seller_bic','BIC')}
   <label className="block text-sm space-y-1"><span>Verifizierte Steuerart</span><select name="tax_mode" defaultValue={String(settings.tax_mode)} className="block w-full min-h-11 p-3 border border-zinc-700 bg-black">
    <option value="unverified">Nicht geprüft, Ausstellung gesperrt</option>
    <option value="small_business">Kleinunternehmer nach § 19 UStG</option>
    <option value="vat_registered">Regelbesteuerung (nur DE-Standardfälle)</option>
   </select></label>
   {field('number_prefix','Rechnungsnummer-Präfix (2–8 Großbuchstaben)',true)}
   <p className="text-sm text-zinc-400">Vorhandene Rechnungsnummern müssen vor dem ersten Ausstellen abgeglichen werden. Der Nummernkreis kann in der Datenbank initialisiert werden. R2_BUCKET_BILLING muss als privater Bucket konfiguriert sein.</p>
   <button className="bg-red-800 min-h-11 px-5 py-3" type="submit">Einstellungen speichern</button>
  </form>
  <section className="border-t border-zinc-700 mt-8 pt-6 space-y-3">
    <h2 className="text-lg font-semibold">Nummernkreis initialisieren</h2>
    <p className="text-sm text-zinc-400">Für jedes Rechnungsjahr ist eine ausdrückliche Bestätigung des Startwerts erforderlich. Vorhandene externe Rechnungsnummern müssen dabei berücksichtigt werden. Ein bestätigter Nummernkreis kann nicht zurückgesetzt werden.</p>
    <p className={sequence.confirmed?'text-sm text-green-400':'text-sm text-amber-300'}>
      {currentYear}: {sequence.confirmed?'Bestätigt':'Noch nicht bestätigt'}.
      Nächste laufende Nummer: {String(sequence.next_value)}.
    </p>
    <form action={seedBillingSequenceAction} className="flex flex-wrap gap-3 items-end">
      <label className="text-sm space-y-1"><span>Jahr</span><input name="year" type="number" min={2000} max={2200} required defaultValue={currentYear} className="block bg-black border border-zinc-700 p-3"/></label>
      <label className="text-sm space-y-1"><span>Nächste Nummer</span><input name="next_number" type="number" min={1} max={999999} required className="block bg-black border border-zinc-700 p-3"/></label>
      <button className="border border-zinc-700 min-h-11 px-4" type="submit">Einmalig setzen</button>
    </form>
  </section>
 </main>
}
