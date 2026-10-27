'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveLegalLocale } from '@/lib/legal-templates'
import { COMMERCE_ACTIONS } from '@/lib/commerce-actions-i18n'
import { COMMERCE_LEGAL_COPY } from '@/lib/commerce-legal-copy'
import { localizedLegalPath } from '@/lib/legal-routes'
import { CustomerSignIn } from '@/components/neurokore/CustomerSignIn'

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
    fetch('/api/neurokore/session', { cache: 'no-store' })
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
      const body: { url?: string; error?: string } = await response.json().catch(() => ({}))
      if (!response.ok || !body.url) throw new Error(body.error || 'Checkout is currently unavailable.')
      const target = new URL(body.url)
      if (target.protocol !== 'https:' || target.hostname !== 'checkout.stripe.com')
        throw new Error('Invalid checkout destination.')
      window.location.assign(target.href)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Checkout is unavailable.')
      setBusy(false)
    }
  }

  return (
    <section className="space-y-5 border border-white/20 bg-zinc-950 p-6 sm:p-8" aria-label={copy.account}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">{language === 'de' ? 'Bestellung' : 'Your order'}</h2>
        {!recurring && (
          <span className="border border-white/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-zinc-300">
            {language === 'de' ? 'Einmaliger Kauf' : 'One-time purchase'}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 border-y border-white/15 py-4">
        <div>
          <p className="font-semibold text-white">{productTitle}</p>
          <p className="mt-1 text-sm text-zinc-400">{language === 'de' ? 'Softwarelizenz' : 'Software licence'}</p>
        </div>
        <p className="text-xl font-bold tabular-nums text-white">{price}</p>
      </div>
      <p className="text-sm leading-6 text-zinc-400">{copy.pricing}</p>
      {recurring ? (
        <p role="alert">Recurring subscriptions are not currently available for this product.</p>
      ) : signedIn === null ? (
        <p role="status">Loading…</p>
      ) : !signedIn ? (
        <div className="space-y-4 border-t border-white/15 pt-5">
          <h3 className="text-lg font-semibold">1. {language === 'de' ? 'Mit E-Mail anmelden' : 'Sign in with email'}</h3>
          <p className="text-sm text-zinc-300">
            {language === 'de'
              ? 'Gib deine E-Mail-Adresse ein. Du erhältst einen einmaligen Anmeldelink und kannst danach mit dem Kauf fortfahren. Kein Passwort erforderlich.'
              : 'Enter your email to get a one-time sign-in link. No password needed. Continue your purchase once signed in.'}
          </p>
          <CustomerSignIn />
          <Link className="inline-block text-sm text-zinc-300 underline underline-offset-4" href="/neurokore/account">
            {language === 'de' ? 'Bereits Kunde? Meine Lizenzen öffnen' : 'Already a customer? Open my licences'}
          </Link>
        </div>
      ) : (
        <>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={reviewed} onChange={event => setReviewed(event.target.checked)} />
            <span>{copy.reviewDocs}</span>
          </label>
          <button className="min-h-11 border border-red-600 bg-red-900/30 px-5 py-3 font-semibold hover:bg-red-900/50 disabled:opacity-50"
            disabled={!reviewed || busy} onClick={() => void checkout()}>
            {busy ? '…' : language === 'de' ? 'Weiter zur sicheren Zahlung' : language === 'en' ? 'Continue to secure checkout' : copy.nextPayment}
          </button>
          <p className="text-xs text-white/60">{copy.total}</p>
        </>
      )}
      <details className="group border-t border-white/15 pt-4">
        <summary className="w-fit cursor-pointer text-sm text-zinc-300 underline underline-offset-4 hover:text-white">
          {language === 'de' ? 'Rechtliche Informationen ansehen' : 'View purchase and legal information'}
        </summary>
        <nav aria-label={language === 'de' ? 'Rechtliche Informationen' : 'Purchase and legal information'}
          className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm text-zinc-300">
          <Link className="underline hover:text-white" href={localizedLegalPath(language, 'legal-notice')}>{links.notice}</Link>
          <Link className="underline hover:text-white" href={localizedLegalPath(language, 'privacy-policy')}>{links.privacy}</Link>
          <Link className="underline hover:text-white" href={localizedLegalPath(language, 'terms')}>{links.terms}</Link>
          <Link className="underline hover:text-white" href={localizedLegalPath(language, 'purchase-info')}>{links.purchase}</Link>
          <Link className="underline hover:text-white" href={localizedLegalPath(language, 'license-terms')}>{links.licence}</Link>
          <Link className="underline hover:text-white" href={localizedLegalPath(language, 'withdrawal-policy')}>{COMMERCE_LEGAL_COPY[language].docs.withdrawal}</Link>
        </nav>
      </details>
      {slug === 'neurokore' && (
        <aside className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-5">
          <div className="space-y-1">
            <p className="font-semibold text-white">{language === 'de' ? 'Schon NEUROMETER ausprobiert?' : 'Have you tried NEUROMETER?'}</p>
            <p className="text-sm text-zinc-400">
              {language === 'de'
                ? 'Unser weiteres Audio-Plugin ist kostenlos – ganz ohne Kauf.'
                : 'Our other audio plugin is free to download. No purchase required.'}
            </p>
          </div>
          <Link href="/plugins/neurometer"
            className="inline-flex min-h-11 items-center border border-white/30 px-4 py-2 text-sm font-semibold text-zinc-100 hover:border-red-500 hover:text-white">
            {language === 'de' ? 'NEUROMETER gratis ansehen' : 'Get NEUROMETER free'}
            <span aria-hidden="true" className="ml-2">↗</span>
          </Link>
        </aside>
      )}
      {error && <p role="alert" className="text-red-300">{error}</p>}
    </section>
  )
}
