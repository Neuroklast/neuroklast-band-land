import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'

export const metadata = {
  title: 'Informationen zum Softwarekauf',
  description: 'Zahlung, Lieferung, Aktivierung, Widerruf und Support für NEUROKLAST Software.',
}

export default function PurchaseInfoPage() {
  return (
    <LegalPageShell>
      <article className="mx-auto max-w-3xl space-y-7 px-6 py-32 text-white">
        <h1 className="text-3xl font-semibold">Informationen zum Softwarekauf</h1>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Anbieter und Produkte</h2>
          <p>Der Verkäufer ist der im <Link href="/legal-notice" className="underline">Impressum</Link> genannte Websitebetreiber. Produktbeschreibung, Funktionen, Systemvoraussetzungen, Lizenzmodell und gegebenenfalls die Dauer einer Lizenz findest du auf der jeweiligen Produktseite. Bitte prüfe diese Angaben vor dem Kauf.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Bestellung und Bezahlung</h2>
          <p>Für kostenpflichtige Software ist ein E-Mail-basiertes Kundenkonto nötig. Der Kauf wird über Stripe Checkout abgewickelt. Unterstützte Zahlungsmittel, Rechnungsangaben und der Gesamtbetrag inklusive anfallender Steuern werden vor der verbindlichen Bestellung im Checkout angezeigt. Eine Zahlung erfolgt erst mit der dort eindeutig als zahlungspflichtig gekennzeichneten Bestätigung.</p>
          <p>Der derzeitige Checkout unterstützt ausschließlich einmalige Zahlungen. Ein Abonnement wird über diesen Bestellablauf nicht abgeschlossen.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Bereitstellung und Aktivierung</h2>
          <p>Die Software wird digital zum Download bereitgestellt. Es fallen keine Versandkosten für physische Waren an. Nach bestätigtem Zahlungseingang wird die Lizenz deinem Kundenkonto zugeordnet. Der Download der kostenlosen Demoversion ist unabhängig davon möglich, soweit für das jeweilige Produkt freigegeben.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Widerruf und Verbraucherrechte</h2>
          <p>Als Verbraucher hast du grundsätzlich das gesetzliche Widerrufsrecht nach der <Link href="/withdrawal-policy" className="underline">Widerrufsbelehrung</Link>. Einen Widerruf kannst du jederzeit über die <Link href="/withdrawal" className="underline">elektronische Widerrufsfunktion</Link> erklären. Das gilt unabhängig von gesetzlichen Gewährleistungsrechten und etwaigen Ansprüchen auf notwendige Aktualisierungen.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Hilfe</h2>
          <p>Bei Problemen mit Zahlungen, Lizenzaktivierung oder Software nutze bitte das <Link href="/#contact" className="underline">Kontaktformular</Link> oder die Kontaktdaten im Impressum. Die <Link href="/privacy-policy" className="underline">Datenschutzerklärung</Link> enthält Informationen zur Datenverarbeitung bei Bestellungen.</p>
        </section>
      </article>
    </LegalPageShell>
  )
}
