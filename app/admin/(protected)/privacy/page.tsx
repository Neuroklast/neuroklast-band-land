import Link from 'next/link'
import { admin, db } from '@/lib/neurokore/server'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'

export const dynamic = 'force-dynamic'

type RequestRow = {
  id: string
  email: string
  status: 'open' | 'exported' | 'answered'
  created_at: string
  exported_at: string | null
  responded_at: string | null
}

export default async function PrivacyAdminPage() {
  await admin()
  const { data, error } = await db().from('privacy_requests')
    .select('id,email,status,created_at,exported_at,responded_at')
    .order('created_at', { ascending: false }).limit(100)
  const requests = (data ?? []) as RequestRow[]
  const now = Date.now()
  return (
    <main className="max-w-5xl space-y-6 pb-20">
      <AdminPageHeader
        title="DSGVO-Auskunft & Export"
        description="Betroffenenanfragen nach Art. 15 DSGVO vorbereiten und die Bearbeitung nachhalten."
      />
      <section className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-950 p-5">
        <h2 className="font-semibold">Auskunft für eine Person erstellen</h2>
        <p className="text-sm text-zinc-400">
          Prüfe zuerst die Identität des Antragstellers. Der Export enthält Kontodaten, Bestellungen,
          Lizenzen und Widerrufe aus unserer Datenbank. Externe Daten bei Stripe, Resend und
          Hosting-Anbietern müssen anschließend getrennt kontrolliert werden.
        </p>
        <form action="/admin/privacy/export" method="post" className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="privacy-email" className="block text-sm font-medium">E-Mail-Adresse der betroffenen Person</label>
            <input id="privacy-email" name="email" type="email" required maxLength={254}
              autoComplete="off" placeholder="kunde@example.com"
              className="min-h-11 w-full rounded border border-zinc-700 bg-black px-3 py-2 text-white focus:border-red-500" />
          </div>
          <label className="flex items-start gap-3 text-sm text-zinc-300">
            <input type="checkbox" name="identity_verified" value="yes" required className="mt-1" />
            <span>Ich habe die Identität bzw. die Berechtigung des Antragstellers überprüft.
              Mir ist bekannt, dass der Export vertrauliche personenbezogene Daten enthält.</span>
          </label>
          <button type="submit" className="min-h-11 rounded bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-600">
            DSGVO-Auskunft als JSON exportieren
          </button>
        </form>
        <p className="text-xs text-zinc-500">
          Es werden keine vollständigen Lizenzschlüssel oder API-Geheimnisse exportiert.
          Die Datei wird nicht dauerhaft auf dem Server abgelegt. Vor der Herausgabe Daten Dritter prüfen.
        </p>
      </section>
      <section className="space-y-3 rounded-lg border border-zinc-700 bg-zinc-950 p-5">
        <h2 className="font-semibold">Anfragen und Fristen</h2>
        {error ? (
          <p role="alert" className="text-sm text-amber-300">
            Anfragen konnten nicht geladen werden. Bitte zuerst das aktuelle Supabase-Schema anwenden.
          </p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-zinc-400">Noch keine Auskunftsanfragen erfasst.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead><tr className="border-b border-zinc-700 text-zinc-400">
                <th className="py-2 pr-3">E-Mail</th>
                <th className="py-2 pr-3">Eingang</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Aktion</th>
              </tr></thead>
              <tbody>
                {requests.map(row => {
                  const daysOpen = Math.floor((now - new Date(row.created_at).getTime()) / 86400000)
                  return (
                    <tr key={row.id} className="border-b border-zinc-800">
                      <td className="py-3 pr-3 break-all">{row.email}</td>
                      <td className="py-3 pr-3">{new Date(row.created_at).toLocaleDateString('de-DE')}
                        {row.status !== 'answered' && daysOpen >= 25 && (
                          <span className="block text-xs text-amber-300">{daysOpen} Tage offen, Frist prüfen</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {row.status === 'answered' ? 'Beantwortet' :
                          row.status === 'exported' ? 'Exportiert, noch nicht versendet' : 'Offen'}
                      </td>
                      <td className="py-3 pr-3">
                        {row.status !== 'answered' && (
                          <form action="/admin/privacy/complete" method="post">
                            <input type="hidden" name="id" value={row.id} />
                            <button className="min-h-11 rounded border border-zinc-600 px-3 hover:bg-zinc-900"
                              type="submit">Antwort versendet</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-zinc-500">
          Der Status „Beantwortet“ darf erst gesetzt werden, wenn die Auskunft sicher zugestellt wurde.
          Die Monatsfrist beginnt beim tatsächlichen Eingang der Anfrage, nicht zwingend beim Export.
          Extern eingegangene Anfragen müssen deshalb zusätzlich dokumentiert werden.
        </p>
      </section>
      <p className="text-sm text-zinc-400">
        Der <Link href="/admin/data" className="underline hover:text-white">Website-Datenexport</Link>
        {' '}ist ein separates redaktionelles Backup und nicht für DSGVO-Auskunftsanfragen geeignet.
      </p>
    </main>
  )
}
