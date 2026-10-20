
'use client'
import { useEffect, useState } from 'react'
import { z } from 'zod'
const rowsSchema = z.object({ licenses: z.array(z.object({
  id: z.string(), email: z.string(), tier: z.string(), revoked_at: z.string().nullable(),
})) })
export function LicenseAdmin() {
  const [rows, setRows] = useState<z.infer<typeof rowsSchema>['licenses']>([])
  const [email, setEmail] = useState('')
  const [days, setDays] = useState(90)
  const [message, setMessage] = useState('')
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  async function refresh() {
    const response = await fetch('/api/neurokore/admin', { cache: 'no-store' })
    if (!response.ok) throw new Error('Administrator sign-in required.')
    setRows(rowsSchema.parse(await response.json()).licenses)
  }
  useEffect(() => { void refresh().catch(() => setMessage('Could not load licenses. Check your admin session.')) }, [])
  async function mutate(input: object) {
    setBusy(true); setMessage(''); setKey('')
    try {
      const response = await fetch('/api/neurokore/admin', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      if (!response.ok) throw new Error('Action failed. Check your session, MFA and licensing configuration.')
      const result = z.object({ key: z.string().optional() }).parse(await response.json())
      setKey(result.key || ''); setMessage('Saved.')
      await refresh()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Please retry.') }
    finally { setBusy(false) }
  }
  const control = 'min-h-11 border border-current/30 bg-transparent px-3 py-2'
  return <div className="space-y-5">
    <form className="flex flex-wrap items-end gap-4" onSubmit={event => { event.preventDefault(); void mutate({ action: 'issue', email, days }) }}>
      <label>Email<input required type="email" className={control + ' block'} value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label>Valid for days<input required type="number" min={1} max={365} className={control + ' block w-32'} value={days} onChange={event => setDays(Number(event.target.value))} /></label>
      <button disabled={busy} className={control}>Create free alpha key</button>
    </form>
    {key && <label className="block">New alpha key<input readOnly className={control + ' block w-full font-mono'} value={key} onFocus={event => event.target.select()} /></label>}
    <p role="status" className="min-h-12">{message}</p>
    <p>Most recent 100 licenses. Revocation blocks renewals; existing signed files remain valid for up to 30 days.</p>
    <ul className="space-y-3">{rows.map(row => <li key={row.id} className="flex flex-wrap items-center gap-3 border border-current/20 p-4">
      <div className="min-w-0 flex-1 break-words">{row.email} — {row.tier}{row.revoked_at ? ' (revoked)' : ''}</div>
      <button className={control} disabled={busy || !!row.revoked_at}
        onClick={() => { if (window.confirm('Revoke this license? Existing offline files expire within 30 days.')) void mutate({ action: 'revoke', id: row.id }) }}>Revoke</button>
      <button className={control} disabled={busy || !!row.revoked_at}
        onClick={() => { if (window.confirm('Reset all device slots? Old offline files remain valid until expiry.')) void mutate({ action: 'reset', id: row.id }) }}>Reset devices</button>
    </li>)}</ul>
  </div>
}
