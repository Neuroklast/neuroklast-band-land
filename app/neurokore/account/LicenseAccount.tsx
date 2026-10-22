'use client'
import { useEffect, useState } from 'react'
import { z } from 'zod'
const accountSchema = z.object({
  email: z.string(),
  licenses: z.array(z.object({
    id: z.string(), key: z.string(), tier: z.string(),
    expires_at: z.string().nullable(), revoked_at: z.string().nullable(),
    product_title: z.string(), product_slug: z.string().nullable(),
    plugin_devices: z.array(z.object({ device: z.string() })),
  })),
})
type Account = z.infer<typeof accountSchema>
export function LicenseAccount() {
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
      <p>Your licences appear here once a purchase is confirmed. Free plugins do not need a licence.</p>
      <button className={control} disabled={busy} onClick={() => void refresh().catch(() => setMessage('Please retry.'))}>Refresh licences</button>
      {account.licenses.length === 0 && <p>No licences yet.</p>}
      {account.licenses.map(license => <article key={license.id} className="space-y-3 border border-current/30 p-5">
        <h2 className="text-xl">{license.product_title}</h2>
        <p>{license.tier === 'alpha' ? 'Alpha access' : 'Full licence'} — {license.revoked_at ? 'Revoked' : license.expires_at ? 'Expires ' + new Date(license.expires_at).toLocaleDateString() : 'No expiry'}</p>
        <label className="block">Licence key<input readOnly className={control + ' font-mono text-sm'} value={license.key} onFocus={event => event.target.select()} /></label>
        <p>{license.plugin_devices.length} device activations. Contact NEUROKLAST to reset a device.</p>
        {license.product_slug && (
          <a className={control + ' block text-center'} href={`/plugins/${license.product_slug}/download`}>Download {license.product_title}</a>
        )}
      </article>)}
    </>}
    <p role="status" aria-live="polite" className="min-h-12">{message}</p>
  </div>
}
