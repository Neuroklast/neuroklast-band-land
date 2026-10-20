
'use client'
import { useEffect, useState } from 'react'
import { z } from 'zod'
const accountSchema = z.object({
  email: z.string(), download: z.string().nullable(),
  licenses: z.array(z.object({ id: z.string(), key: z.string(), tier: z.string(),
    expires_at: z.string().nullable(), revoked_at: z.string().nullable(),
    neurokore_devices: z.array(z.object({ device: z.string() })),
  })),
})
type Account = z.infer<typeof accountSchema>
export function LicenseAccount({ salesEnabled }: { salesEnabled: boolean }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function refresh() {
    const response = await fetch('/api/neurokore/account', { cache: 'no-store' })
    if (response.ok) setAccount(accountSchema.parse(await response.json()))
  }
  useEffect(() => { void refresh().catch(() => setMessage('Could not load licenses. Please retry.')) }, [])
  async function authenticate() {
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/neurokore/auth', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, ...(sent ? { token } : {}) }) })
      if (!response.ok) throw new Error('Sign-in failed. Check your email or code and try again.')
      if (sent) await refresh()
      else { setSent(true); setMessage('Check your email for your sign-in code.') }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Please retry.') }
    finally { setBusy(false) }
  }
  async function signOut() {
    setBusy(true)
    try {
      const response = await fetch('/api/neurokore/auth', { method: 'DELETE' })
      if (!response.ok) throw new Error('Sign-out failed. Please retry.')
      setAccount(null); setSent(false); setToken(''); setEmail(''); setMessage('')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Please retry.') }
    finally { setBusy(false) }
  }
  async function checkout() {
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/neurokore/checkout', { method: 'POST' })
      const result: unknown = await response.json()
      if (!response.ok) throw new Error('Checkout is unavailable. Please try again later.')
      const { url } = z.object({ url: z.url() }).parse(result)
      if (new URL(url).hostname !== 'checkout.stripe.com') throw new Error('Invalid checkout')
      window.location.assign(url)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Please retry.'); setBusy(false) }
  }
  const control = 'min-h-11 w-full border border-current/40 bg-transparent px-3 py-2'
  return <div className="space-y-6">
    {!account ? <form className="space-y-4" onSubmit={event => { event.preventDefault(); void authenticate() }}>
      <label className="block">Email<input required type="email" autoComplete="email" className={control}
        value={email} disabled={sent || busy} onChange={event => setEmail(event.target.value)} /></label>
      {sent && <label className="block">Email code<input required autoComplete="one-time-code" inputMode="numeric"
        className={control} value={token} onChange={event => setToken(event.target.value)} /></label>}
      <button className={control} disabled={busy}>{sent ? 'Sign in' : 'Send sign-in code'}</button>
      {sent && <button type="button" disabled={busy} onClick={() => { setSent(false); setToken('') }}>Use another email / resend</button>}
    </form> : <>
      <p>Signed in as {account.email}</p>
      <button disabled={busy} className={control} onClick={() => void signOut()}>Sign out</button>
      <p>After checkout, refresh this list. Your key appears once payment is confirmed.</p>
      <button className={control} disabled={busy} onClick={() => void refresh().catch(() => setMessage('Please retry.'))}>Refresh licenses</button>
      {account.licenses.map(license => <article key={license.id} className="space-y-3 border border-current/30 p-5">
        <h2 className="text-xl">{license.tier === 'alpha' ? 'Alpha access' : 'Full license'}</h2>
        <p>{license.revoked_at ? 'Revoked' : license.expires_at ? 'Expires ' + new Date(license.expires_at).toLocaleDateString() : 'No license expiry'}</p>
        <label className="block">License key<input readOnly className={control + ' font-mono text-sm'} value={license.key} onFocus={event => event.target.select()} /></label>
        <p>{license.neurokore_devices.length} / 2 device slots used. Contact NEUROKLAST to reset a device.</p>
      </article>)}
      {account.download && <a className={control + ' block text-center'} href={account.download} rel="noreferrer">Download NEUROKORE</a>}
      {salesEnabled ? <button className={control} disabled={busy} onClick={() => void checkout()}>View price &amp; buy securely with Stripe</button> : <p>Sales are not open yet. Alpha testers can use their free keys.</p>}
    </>}
    <p role="status" aria-live="polite" className="min-h-12">{message}</p>
  </div>
}
