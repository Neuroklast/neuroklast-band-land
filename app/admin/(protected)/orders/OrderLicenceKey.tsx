'use client'

import { useEffect, useState } from 'react'

export function OrderLicenceKey({ orderId, licenceId }: { orderId: string; licenceId: string }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => () => setKey(''), [orderId])

  async function reveal() {
    if (!window.confirm('Reveal this licence key? Avoid sharing the screen while it is visible.')) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/admin/plugin-orders/reveal-key', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }), cache: 'no-store',
      })
      const body: { key?: string; error?: string; revoked?: boolean } = await response.json()
      if (!response.ok || !body.key) throw new Error(body.error || 'Unable to reveal the key.')
      setKey(body.key)
      if (body.revoked) setError('This licence has been revoked.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to reveal the key.')
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-2 min-w-44">
      <p className="font-mono text-[11px] text-zinc-400" title={licenceId}>
        {licenceId.slice(0,8)}…{licenceId.slice(-4)}
      </p>
      {key ? (
        <div className="space-y-2">
          <input readOnly aria-label="Full licence key" value={key}
            className="w-64 max-w-full border border-red-700 bg-black px-2 py-2 font-mono text-xs text-white"
            onFocus={event => event.target.select()} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void navigator.clipboard.writeText(key)}
              className="min-h-9 border border-zinc-700 px-3 text-xs hover:border-red-700">Copy</button>
            <button type="button" onClick={() => setKey('')}
              className="min-h-9 border border-zinc-700 px-3 text-xs hover:border-red-700">Hide</button>
          </div>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={() => void reveal()}
          className="min-h-9 border border-zinc-700 px-3 text-xs hover:border-red-700 disabled:opacity-40">
          {busy ? 'Verifying…' : 'Show key'}
        </button>
      )}
      {error && <p role="alert" className="text-xs text-amber-300">{error}</p>}
    </div>
  )
}
