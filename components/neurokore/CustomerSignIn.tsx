'use client'

import { useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveLegalLocale } from '@/lib/legal-templates'
import { ACCOUNT_COPY } from '@/lib/plugins/account-copy'

/** Same passwordless customer login in checkout and the licence account. */
export function CustomerSignIn() {
  const { locale } = useLocale()
  const copy = ACCOUNT_COPY[resolveLegalLocale(locale)]
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function sendEmail() {
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/neurokore/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error(copy.authError)
      setSent(true)
      setMessage(copy.checkEmail)
    } catch {
      setMessage(copy.authError)
    } finally {
      setBusy(false)
    }
  }

  const button = 'min-h-11 border border-red-600 bg-red-900/30 px-5 py-2 text-sm font-semibold text-white hover:bg-red-900/50 disabled:opacity-50'
  return (
    <div className="space-y-3">
      {!sent ? (
        <form onSubmit={event => { event.preventDefault(); void sendEmail() }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 space-y-1 text-sm text-zinc-200">
            <span className="block">{copy.email}</span>
            <input type="email" autoComplete="email" required value={email}
              onChange={event => setEmail(event.target.value)} disabled={busy}
              className="min-h-11 w-full border border-white/30 bg-black px-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500" />
          </label>
          <button className={button} type="submit" disabled={busy}>
            {busy ? copy.sending : copy.sendCode}
          </button>
        </form>
      ) : (
        <div className="space-y-3 border border-white/15 bg-black/50 p-4">
          <p className="text-sm text-zinc-200">{copy.checkEmail}</p>
          <p className="break-all font-mono text-xs text-zinc-400">{email}</p>
          <button type="button" onClick={() => { setSent(false); setMessage('') }}
            className="min-h-11 text-sm text-zinc-200 underline underline-offset-4">
            {copy.changeEmail}
          </button>
        </div>
      )}
      {message && !sent && <p role="alert" className="text-sm text-red-300">{message}</p>}
    </div>
  )
}
