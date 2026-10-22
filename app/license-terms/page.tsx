import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { SOFTWARE_LICENSE_CONDITIONS } from '@/lib/plugins/consumer-license-terms'

export const metadata = {
  title: 'Lizenzbedingungen für Audio-Software',
  description: 'Nutzung, Aktivierung, gesetzliche Verbraucherrechte und Widerruf.',
}

export default function LicenseTermsPage() {
  return (
    <LegalPageShell>
      <article className="mx-auto max-w-3xl space-y-8 px-6 py-32 text-white">
        <h1 className="text-3xl font-semibold">Lizenzbedingungen für Audio-Software</h1>
        <p className="text-sm text-white/70">Diese Bedingungen gelten ergänzend zu den beim jeweiligen Produkt und bei der Bestellung ausgewiesenen Einzelheiten. Zwingende gesetzliche Verbraucherrechte gehen vor.</p>
        {SOFTWARE_LICENSE_CONDITIONS.map(section => (
          <section key={section.title} className="space-y-2 border-b border-white/15 pb-5">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="leading-relaxed">{section.body}</p>
          </section>
        ))}
        <p>Weitere Informationen: <Link href="/purchase-info" className="underline">Softwarekauf</Link>,
          {' '}<Link href="/withdrawal-policy" className="underline">Widerrufsbelehrung</Link> und
          {' '}<Link href="/legal-notice" className="underline">Impressum</Link>.
        </p>
      </article>
    </LegalPageShell>
  )
}
