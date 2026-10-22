'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function PurchasePanel({
  slug,
  productTitle,
  price,
  recurring,
}: {
  slug: string
  productTitle: string
  price: string
  recurring: boolean
}) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [reviewed, setReviewed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    fetch('/api/neurokore/account', { cache: 'no-store' })
      .then(result => { if (mounted) setSignedIn(result.ok) })
      .catch(() => { if (mounted) setSignedIn(false) })
    return () => { mounted = false }
  }, [])

  async function checkout() {
    if (!reviewed || busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/plugins/' + encodeURIComponent(slug) + '/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const body: { url?: string; error?: string } = await response.json().catch(() => ({}))
      if (!response.ok || !body.url) throw new Error(body.error || 'Checkout ist derzeit nicht verfügbar.')
      const target = new URL(body.url)
      if (target.protocol !== 'https:' || target.hostname !== 'checkout.stripe.com')
        throw new Error('Ungültiges Zahlungsziel.')
      window.location.assign(target.href)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Checkout fehlgeschlagen.')
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4 border border-white/30 bg-zinc-950 p-6" aria-label="Kaufinformationen">
      <h2 className="text-2xl font-semibold">Lizenz kaufen</h2>
      <p className="font-semibold">{productTitle}: {price}{recurring ? ' / Abrechnungszeitraum' : ' einmalig'}</p>
      <p className="text-sm text-white/80">
        Ein digital bereitgestellter Lizenzschlüssel für die Vollversion.
        Anfallende Steuern und der verbindliche Gesamtbetrag werden vor der Zahlung im Stripe-Checkout ausgewiesen.
        Es erfolgt kein Versand physischer Waren.
      </p>
      <p className="text-sm text-white/80">
        Das gesetzliche Widerrufsrecht bleibt nach Maßgabe der <Link className="underline" href="/withdrawal-policy">Widerrufsbelehrung</Link> bestehen.
        Keine automatische Verzichtserklärung durch diesen Kauf.
      </p>
      <div className="flex flex-wrap gap-4 text-sm">
        <Link className="underline" href="/legal-notice">Anbieter</Link>
        <Link className="underline" href="/privacy-policy">Datenschutz</Link>
        <Link className="underline" href="/purchase-info">Kaufbedingungen</Link>
        <Link className="underline" href="/withdrawal">Vertrag widerrufen</Link>
      </div>
      {recurring ? (
        <p role="alert">Abonnementpreise können mit diesem derzeit einmalig ausgelegten Checkout nicht gekauft werden.</p>
      ) : signedIn === null ? (
        <p role="status">Kundenkonto wird überprüft…</p>
      ) : !signedIn ? (
        <p>
          Für den Kauf brauchst du ein Kundenkonto, damit wir deine Lizenz zuordnen können.
          {' '}<Link className="underline" href="/neurokore/account">Mit E-Mail-Code anmelden</Link>.
          Danach hierher zurückkehren.
        </p>
      ) : (
        <>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={reviewed} onChange={event => setReviewed(event.target.checked)} />
            <span>Ich habe die Widerrufsbelehrung und die Informationen zur Verarbeitung meiner Kaufdaten gelesen. Damit erkläre ich keinen Verzicht auf das Widerrufsrecht.</span>
          </label>
          <button className="min-h-11 border border-red-600 bg-red-900/30 px-5 py-3 font-semibold hover:bg-red-900/50 disabled:opacity-50"
            disabled={!reviewed || busy} onClick={() => void checkout()}>
            {busy ? 'Wird weitergeleitet…' : 'Weiter zur Zahlungsübersicht'}
          </button>
          <p className="text-xs text-white/60">Die zahlungspflichtige Bestellung erfolgt erst im anschließenden Stripe-Checkout.</p>
        </>
      )}
      {error && <p role="alert" className="text-red-300">{error}</p>}
    </section>
  )
}
