'use client'

import { useState } from 'react'
import Link from 'next/link'

type WithdrawalData = { name: string; email: string; orderReference: string }
const EMPTY: WithdrawalData = { name: '', email: '', orderReference: '' }

export function WithdrawalForm() {
  const [details, setDetails] = useState<WithdrawalData>(EMPTY)
  const [step, setStep] = useState<'edit' | 'review' | 'sent'>('edit')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [receivedAt, setReceivedAt] = useState('')

  async function submit() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      })
      if (!response.ok) throw new Error('Übermittlung fehlgeschlagen. Bitte erneut versuchen oder den Widerruf per E-Mail erklären.')
      const result: { receivedAt: string } = await response.json()
      setReceivedAt(result.receivedAt)
      setStep('sent')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Übermittlung fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }

  const inputStyle = 'mt-2 w-full min-h-11 border border-white/30 bg-black p-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500'
  const buttonStyle = 'min-h-11 border border-white/40 px-5 py-3 text-white hover:border-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:opacity-50'

  if (step === 'sent') return (
    <section role="status" className="space-y-4 border border-white/30 bg-zinc-950 p-6">
      <h2 className="text-2xl font-semibold">Widerruf übermittelt</h2>
      <p>Wir haben deine Widerrufserklärung am {new Date(receivedAt).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })} entgegengenommen und eine Eingangsbestätigung an {details.email} gesendet.</p>
      <p>Die Eingangsbestätigung dokumentiert deine Erklärung, sie ist noch keine Entscheidung über die Wirksamkeit des Widerrufs oder eine Rückerstattungszusage.</p>
      <Link href="/" className="inline-block underline">Zur Startseite</Link>
    </section>
  )

  return (
    <div className="max-w-2xl border border-white/25 bg-zinc-950 p-5 sm:p-8">
      {step === 'edit' ? (
        <form className="space-y-5" onSubmit={event => { event.preventDefault(); setError(''); setStep('review') }}>
          <p>Du kannst deinen Widerruf ohne Anmeldung erklären. Ein Grund ist nicht erforderlich.</p>
          <label className="block">Vollständiger Name
            <input autoComplete="name" required maxLength={160} className={inputStyle}
              value={details.name} onChange={event => setDetails({ ...details, name: event.target.value })} />
          </label>
          <label className="block">E-Mail-Adresse für die Eingangsbestätigung
            <input type="email" autoComplete="email" required maxLength={254} className={inputStyle}
              value={details.email} onChange={event => setDetails({ ...details, email: event.target.value })} />
          </label>
          <label className="block">Bestellnummer oder andere Angaben zur Identifizierung des Vertrags
            <textarea required rows={3} maxLength={500} className={inputStyle}
              placeholder="Zum Beispiel Bestellnummer, Produkt und ungefährer Kaufzeitpunkt"
              value={details.orderReference} onChange={event => setDetails({ ...details, orderReference: event.target.value })} />
          </label>
          <p className="text-sm text-white/70">Deine Angaben werden ausschließlich für die Bearbeitung dieser Erklärung und die Eingangsbestätigung genutzt. Weitere Informationen stehen in der <Link className="underline" href="/privacy-policy">Datenschutzerklärung</Link>.</p>
          <button type="submit" className={buttonStyle}>Weiter zur Bestätigung</button>
        </form>
      ) : (
        <section className="space-y-5">
          <h2 className="text-xl font-semibold">Widerruf prüfen</h2>
          <p>Ich widerrufe den nachfolgend bezeichneten Vertrag.</p>
          <dl className="space-y-3 break-words">
            <div><dt className="text-white/60">Name</dt><dd>{details.name}</dd></div>
            <div><dt className="text-white/60">E-Mail-Adresse</dt><dd>{details.email}</dd></div>
            <div><dt className="text-white/60">Vertrag</dt><dd className="whitespace-pre-wrap">{details.orderReference}</dd></div>
          </dl>
          <div className="flex flex-wrap gap-3">
            <button className={buttonStyle} type="button" onClick={() => setStep('edit')} disabled={busy}>Angaben bearbeiten</button>
            <button className={buttonStyle + ' border-red-600 bg-red-800/30'} type="button" onClick={() => void submit()} disabled={busy}>
              {busy ? 'Wird übermittelt…' : 'Widerruf bestätigen'}
            </button>
          </div>
        </section>
      )}
      {error && <p role="alert" className="mt-4 text-red-300">{error}</p>}
    </div>
  )
}
