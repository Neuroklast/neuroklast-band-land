import Link from 'next/link'
import { admin } from '@/lib/neurokore/server'
import { previewBillingXRechnung } from '@/lib/billing/service'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'

export const dynamic='force-dynamic'
export default async function ElectronicInvoiceCheck({params}:{params:Promise<{id:string}>}) {
  await admin()
  const {id}=await params
  let result:Awaited<ReturnType<typeof previewBillingXRechnung>>|null=null
  let error=''
  try {result=await previewBillingXRechnung(id)}
  catch(e){error=e instanceof Error?e.message:'Vorprüfung fehlgeschlagen'}
  return <main className="max-w-3xl">
    <AdminPageHeader title="XRechnung-Vorprüfung" description="Prüft den gespeicherten Rechnungsentwurf ohne Rechnungsnummer zu reservieren."/>
    <div className="border border-zinc-800 p-5 space-y-4">
      {result?<><p className="text-green-400">Die lokale Struktur- und Betragsprüfung ist bestanden.</p>
        <p>Bibliotheksregelsatz: {result.ruleset}</p>
        <p>XML-Dokumentgröße: {result.byte_length} Bytes</p>
        {result.warnings.length>0&&<p className="text-amber-300">Warnungen: {result.warnings.join(', ')}</p>}
      </>:<p role="alert" className="text-red-400">{error}</p>}
      <p className="text-sm text-zinc-400">Diese Vorprüfung ist keine Bestätigung durch den offiziellen KoSIT-Validator. Die rechtliche und technische Freigabe der E-Rechnung bleibt gesondert erforderlich.</p>
      <Link href={'/admin/billing/'+id} className="underline inline-block">Zur Rechnung zurück</Link>
    </div>
  </main>
}
