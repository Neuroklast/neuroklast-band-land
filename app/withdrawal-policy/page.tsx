import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { createPublicClient } from '@/lib/supabaseServer'
import { loadLegalConfig, formatServiceAddress, DEFAULT_LEGAL_CONFIG } from '@/lib/legal-content'

export const revalidate = 60
export const metadata = { title: 'Widerrufsbelehrung', description: 'Widerrufsrecht bei Software-Lizenzen und digitalen Inhalten.' }

export default async function WithdrawalPolicyPage() {
  let config = DEFAULT_LEGAL_CONFIG
  try { config = await loadLegalConfig(createPublicClient()) } catch { /* show configured details when available */ }
  const address = formatServiceAddress(config)
  return (
    <LegalPageShell>
      <article className="mx-auto max-w-3xl space-y-6 px-6 py-32 text-white">
        <h1 className="text-3xl font-semibold">Widerrufsbelehrung für digitale Inhalte</h1>
        <h2 className="text-xl font-semibold">Widerrufsrecht</h2>
        <p>Wenn du Verbraucher bist, hast du das Recht, binnen vierzehn Tagen ohne Angabe von Gründen einen Vertrag über die Bereitstellung digitaler Inhalte zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
        <p>Um dein Widerrufsrecht auszuüben, musst du uns mittels einer eindeutigen Erklärung (zum Beispiel durch eine E-Mail oder das Online-Widerrufsformular) über deinen Entschluss informieren. Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Erklärung vor Ablauf der Frist absendest.</p>
        <div className="whitespace-pre-line border border-white/20 p-5">
          {address || 'Die Betreiberanschrift steht im Impressum.'}
          {config.email ? '\nE-Mail: ' + config.email : '\nKontakt: siehe Impressum'}
        </div>
        <Link href="/withdrawal" className="inline-flex min-h-11 items-center border border-white/50 px-5 py-3 font-semibold hover:border-red-600">Vertrag widerrufen</Link>
        <h2 className="text-xl font-semibold">Folgen des Widerrufs</h2>
        <p>Bei einem wirksamen Widerruf erstatten wir alle von dir erhaltenen Zahlungen unverzüglich und spätestens binnen vierzehn Tagen ab Eingang deiner Widerrufserklärung. Die Erstattung erfolgt grundsätzlich über dasselbe Zahlungsmittel wie die ursprüngliche Zahlung, sofern nicht ausdrücklich etwas anderes vereinbart wurde. Es entstehen dir wegen der Erstattung keine Entgelte.</p>
        <h2 className="text-xl font-semibold">Digitale Inhalte</h2>
        <p>Bei nicht auf einem körperlichen Datenträger bereitgestellten digitalen Inhalten kann das Widerrufsrecht gemäß § 356 Abs. 6 BGB unter den dort geregelten Voraussetzungen erlöschen. Eine bloße Zahlung oder das bloße Herunterladen einer kostenlosen Demo ersetzt die gesetzlich erforderlichen Erklärungen nicht. Ohne diese Voraussetzungen bleibt das gesetzliche Widerrufsrecht bestehen.</p>
        <h2 className="text-xl font-semibold">Muster-Widerrufsformular</h2>
        <p>Wenn du den Vertrag widerrufen willst, kannst du folgende Angaben formlos an die im <Link href="/legal-notice" className="underline">Impressum</Link> genannte Kontaktadresse senden:</p>
        <p className="whitespace-pre-line border border-white/20 p-5">
          An: NEUROKLAST (Kontakt siehe Impressum){'\n'}
          Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über die Bereitstellung folgender digitaler Inhalte:{'\n'}
          Produkt / Bestellung: ______{'\n'}
          Bestellt am: ______{'\n'}
          Name: ______{'\n'}
          Anschrift: ______{'\n'}
          Datum: ______
        </p>
      </article>
    </LegalPageShell>
  )
}
