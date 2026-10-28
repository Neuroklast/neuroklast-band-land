'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CustomerSignIn } from '@/components/neurokore/CustomerSignIn'
import { useLocale } from '@/contexts/LocaleContext'
import { digitalPackTermsLocale } from '@/lib/digital-packs/consumer-terms'

export function DigitalPackBuy({ id, title, price }: { id: string; title: string; price: string }) {
  const { locale } = useLocale()
  const lang = digitalPackTermsLocale(locale)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void fetch('/api/neurokore/session', { cache: 'no-store' })
      .then(response => setSignedIn(response.ok)).catch(() => setSignedIn(false))
  }, [])

  async function buy() {
    if (!accepted || busy) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/digital-packs/' + encodeURIComponent(id) + '/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptedTerms: true, locale: lang }),
      })
      const data: { url?: string; error?: string } = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'Checkout unavailable.')
      const target = new URL(data.url)
      if (target.protocol !== 'https:' || target.hostname !== 'checkout.stripe.com')
        throw new Error('Invalid checkout destination.')
      window.location.assign(target.href)
    } catch {
      setMessage(lang === 'de'
        ? 'Die Zahlung kann gerade nicht geöffnet werden. Bitte versuche es erneut.'
        : 'Checkout is unavailable. Please try again.')
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4 border border-white/20 bg-zinc-950 p-5 sm:p-8" aria-label={lang === 'de' ? 'Bestellung' : 'Your order'}>
      <h2 className="text-xl font-semibold">{lang === 'de' ? 'Kaufen' : 'Buy'} {title}</h2>
      <p className="font-mono text-2xl font-bold text-white">{price}</p>
      {signedIn === false && (
        <div className="space-y-3 border-t border-zinc-700 pt-4">
          <p className="text-sm text-zinc-300">{lang === 'de'
            ? 'Melde dich mit deiner E-Mail-Adresse an, um den Kauf abzuschließen und die Downloads aufzurufen.'
            : 'Sign in using your email to purchase and access your downloads.'}</p>
          <CustomerSignIn />
        </div>
      )}
      {signedIn && (
        <>
          <p className="text-sm text-zinc-300">{lang === 'de'
            ? 'Einmaliger Kauf ohne Abonnement. Nach bestätigter Zahlung findest du die ZIP-Datei unter Meine Downloads.'
            : 'One-time purchase without subscription. After payment confirmation your ZIP will appear in My Downloads.'}</p>
          <div className="space-y-3 border-t border-zinc-700 pt-4 text-sm text-zinc-300">
            <nav aria-label={lang === 'de' ? 'Kaufbedingungen' : 'Purchase information'} className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/soundpacks/terms" className="underline underline-offset-4">{lang === 'de' ? 'Kaufbedingungen für Audiopakete' : 'Audio pack purchase terms'}</Link>
              <Link href="/withdrawal-policy" className="underline underline-offset-4">{lang === 'de' ? 'Widerrufsbelehrung' : 'Withdrawal notice'}</Link>
              <a href="#pack-license" className="underline underline-offset-4">{lang === 'de' ? 'Produktspezifische Nutzungshinweise' : 'Product usage notes'}</a>
            </nav>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
              <span>{lang === 'de'
                ? 'Ich habe die Kaufbedingungen, die Nutzungshinweise des Produkts und die Widerrufsbelehrung gelesen. Damit verzichte ich nicht auf mein gesetzliches Widerrufsrecht.'
                : 'I have read the pack purchase terms, this product’s usage notes and the withdrawal notice. This does not waive my statutory withdrawal rights.'}</span>
            </label>
          </div>
          <button type="button" disabled={!accepted || busy} onClick={() => void buy()}
            className="min-h-12 border border-red-600 bg-red-900/70 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-40">
            {busy ? '…' : lang === 'de' ? 'Weiter zur Zahlungsübersicht' : 'Continue to secure checkout'}
          </button>
          <p className="text-xs text-zinc-400">{lang === 'de'
            ? 'Die zahlungspflichtige Bestellung erfolgt erst auf der folgenden Zahlungsseite. Dort wird der verbindliche Gesamtpreis angezeigt.'
            : 'Your binding payment is placed only on the following checkout page, where the final total is shown.'}</p>
        </>
      )}
      {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
    </section>
  )
}
