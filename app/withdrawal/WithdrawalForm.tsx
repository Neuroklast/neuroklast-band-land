'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveLegalLocale } from '@/lib/legal-templates'
import { COMMERCE_ACTIONS } from '@/lib/commerce-actions-i18n'
import { COMMERCE_LEGAL_COPY } from '@/lib/commerce-legal-copy'
import { WITHDRAWAL_RECEIPT_PENDING } from '@/lib/legal-withdrawal-i18n'
import { localizedLegalPath } from '@/lib/legal-routes'

type WithdrawalData = { name: string; email: string; orderReference: string }
const EMPTY: WithdrawalData = { name: '', email: '', orderReference: '' }

export function WithdrawalForm() {
  const { locale } = useLocale()
  const lang = resolveLegalLocale(locale)
  const labels = COMMERCE_ACTIONS[lang]
  const legal = COMMERCE_LEGAL_COPY[lang].links
  const [details, setDetails] = useState<WithdrawalData>(EMPTY)
  const [step, setStep] = useState<'edit' | 'review' | 'sent'>('edit')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [receivedAt, setReceivedAt] = useState('')
  const [reference, setReference] = useState('')
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function submit() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...details, locale: lang }),
      })
      if (!response.ok) throw new Error('Transmission failed. Please retry or contact the seller by email.')
      const result: { receivedAt: string; reference: string; confirmationSent: boolean } = await response.json()
      setReference(result.reference)
      setConfirmationSent(result.confirmationSent)
      setReceivedAt(result.receivedAt)
      setStep('sent')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Transmission failed.')
    } finally {
      setBusy(false)
    }
  }

  const inputStyle = 'mt-2 w-full min-h-11 border border-white/30 bg-black p-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500'
  const buttonStyle = 'min-h-11 border border-white/40 px-5 py-3 text-white hover:border-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:opacity-50'

  if (step === 'sent') return (
    <section role="status" className="space-y-4 border border-white/30 bg-zinc-950 p-6">
      <h2 className="text-2xl font-semibold">{labels.done}</h2>
      <p>{new Date(receivedAt).toLocaleString(lang, { timeZone: 'Europe/Berlin' })} · {details.email}</p>
      <p className="font-mono text-xs break-all">Reference: {reference}</p>
      {confirmationSent
        ? <p>{labels.receipt}</p>
        : <p role="alert">
            {WITHDRAWAL_RECEIPT_PENDING[lang]}
            {' '}<Link href={localizedLegalPath(lang, "legal-notice")} className="underline">{legal.notice}</Link>
          </p>}
      <p>{labels.notDecision}</p>
      <Link href="/" className="inline-block underline">Home</Link>
    </section>
  )

  return (
    <div className="max-w-2xl border border-white/25 bg-zinc-950 p-5 sm:p-8">
      {step === 'edit' ? (
        <form className="space-y-5" onSubmit={event => { event.preventDefault(); setError(''); setStep('review') }}>
          <p>{labels.intro}</p>
          <label className="block">{labels.name}
            <input autoComplete="name" required maxLength={160} className={inputStyle}
              value={details.name} onChange={event => setDetails({ ...details, name: event.target.value })} />
          </label>
          <label className="block">{labels.email}
            <input type="email" autoComplete="email" required maxLength={254} className={inputStyle}
              value={details.email} onChange={event => setDetails({ ...details, email: event.target.value })} />
          </label>
          <label className="block">{labels.order}
            <textarea required rows={3} maxLength={500} className={inputStyle}
              placeholder={labels.placeholder}
              value={details.orderReference} onChange={event => setDetails({ ...details, orderReference: event.target.value })} />
          </label>
          <p className="text-sm text-white/70">
            <Link className="underline" href={localizedLegalPath(lang, "privacy-policy")}>{legal.privacy}</Link>
          </p>
          <button type="submit" className={buttonStyle}>{labels.submit}</button>
        </form>
      ) : (
        <section className="space-y-5">
          <h2 className="text-xl font-semibold">{labels.review}</h2>
          <p>{labels.declaration}</p>
          <dl className="space-y-3 break-words">
            <div><dt className="text-white/60">{labels.name}</dt><dd>{details.name}</dd></div>
            <div><dt className="text-white/60">{labels.email}</dt><dd>{details.email}</dd></div>
            <div><dt className="text-white/60">{labels.order}</dt><dd className="whitespace-pre-wrap">{details.orderReference}</dd></div>
          </dl>
          <div className="flex flex-wrap gap-3">
            <button className={buttonStyle} type="button" onClick={() => setStep('edit')} disabled={busy}>{labels.edit}</button>
            <button className={buttonStyle + ' border-red-600 bg-red-800/30'} type="button" onClick={() => void submit()} disabled={busy}>
              {busy ? labels.sending : labels.confirm}
            </button>
          </div>
        </section>
      )}
      {error && <p role="alert" className="mt-4 text-red-300">{error}</p>}
    </div>
  )
}
