'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveLegalLocale } from '@/lib/legal-templates'
import { COMMERCE_ACTIONS } from '@/lib/commerce-actions-i18n'
import { COMMERCE_LEGAL_COPY } from '@/lib/commerce-legal-copy'
import { localizedLegalPath } from '@/lib/legal-routes'

const paymentUnavailable: Record<ReturnType<typeof resolveLegalLocale>, string> = {
  de: "Die Zahlung kann gerade nicht gestartet werden. Bitte versuche es später erneut oder kontaktiere uns.",
  en: "We couldn't open the payment page. Please try again later or contact us.",
  uk: "Не вдалося відкрити сторінку оплати. Спробуйте пізніше або напишіть нам.",
  it: "Non è stato possibile aprire la pagina di pagamento. Riprova più tardi o contattaci.",
  es: "No pudimos abrir la página de pago. Inténtalo más tarde o contáctanos.",
  pt: "Não foi possível abrir a página de pagamento. Tenta novamente mais tarde ou contacta-nos.",
  ja: "決済ページを開けませんでした。時間をおいて再試行するか、お問い合わせください。",
  ko: "결제 페이지를 열지 못했습니다. 나중에 다시 시도하거나 문의해 주세요.",
}

export function PurchasePanel({
  slug, productTitle, price, recurring,
}: {
  slug: string; productTitle: string; price: string; recurring: boolean
}) {
  const { locale } = useLocale()
  const language = resolveLegalLocale(locale)
  const copy = COMMERCE_ACTIONS[language]
  const links = COMMERCE_LEGAL_COPY[language].links
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
    if (!reviewed || busy || recurring) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/plugins/' + encodeURIComponent(slug) + '/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: language }),
      })
      const body: { url?: string } = await response.json().catch(() => ({}))
      if (!response.ok || !body.url) throw new Error('payment_unavailable')
      const target = new URL(body.url)
      if (target.protocol !== 'https:' || target.hostname !== 'checkout.stripe.com')
        throw new Error('payment_unavailable')
      window.location.assign(target.href)
    } catch {
      // Never expose internal payment-configuration or API messages to buyers.
      setError(paymentUnavailable[language])
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4 border border-white/30 bg-zinc-950 p-6" aria-label={copy.account}>
      <h2 className="text-2xl font-semibold">{copy.account}</h2>
      <p className="font-semibold">{productTitle}: {price}</p>
      <p className="text-sm text-white/80">{copy.pricing}</p>
      <div className="flex flex-wrap gap-4 text-sm">
        <Link className="underline" href={localizedLegalPath(language, 'legal-notice')}>{links.notice}</Link>
        <Link className="underline" href={localizedLegalPath(language, 'privacy-policy')}>{links.privacy}</Link>
        <Link className="underline" href={localizedLegalPath(language, 'terms')}>{links.terms}</Link>
        <Link className="underline" href={localizedLegalPath(language, 'purchase-info')}>{links.purchase}</Link>
        <Link className="underline" href={localizedLegalPath(language, 'license-terms')}>{links.licence}</Link>
        <Link className="underline" href={localizedLegalPath(language, 'withdrawal-policy')}>{COMMERCE_LEGAL_COPY[language].docs.withdrawal}</Link>
      </div>
      {recurring ? (
        <p role="alert">Recurring subscriptions are not currently available for this product.</p>
      ) : signedIn === null ? (
        <p role="status">Loading…</p>
      ) : !signedIn ? (
        <p>{copy.missingAccount} <Link className="underline" href="/neurokore/account">{copy.account}</Link>.</p>
      ) : (
        <>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={reviewed} onChange={event => setReviewed(event.target.checked)} />
            <span>{copy.reviewDocs}</span>
          </label>
          <button className="min-h-11 border border-red-600 bg-red-900/30 px-5 py-3 font-semibold hover:bg-red-900/50 disabled:opacity-50"
            disabled={!reviewed || busy} onClick={() => void checkout()}>
            {busy ? '…' : copy.nextPayment}
          </button>
          <p className="text-xs text-white/60">{copy.total}</p>
        </>
      )}
      {error && <p role="alert" className="text-red-300">{error}</p>}
    </section>
  )
}
