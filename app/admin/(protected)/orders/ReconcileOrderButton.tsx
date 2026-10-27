'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ReconcileOrderButton({ orderId, hasSession }: { orderId: string; hasSession: boolean }) {
  const router = useRouter()
  const [working, setWorking] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [status, setStatus] = useState('')
  async function reconcile() {
    setWorking(true)
    setStatus('')
    try {
      const response = await fetch('/api/admin/plugin-orders/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...(!hasSession && sessionId.trim() ? { sessionId: sessionId.trim() } : {}) }),
      })
      const data: { status?: string; error?: string } = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to reconcile order.')
      setStatus(data.status || 'Verified')
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to reconcile')
    } finally {
      setWorking(false)
    }
  }
  return (
    <div className="flex min-w-56 flex-col gap-2">
      {!hasSession && (
        <input
          aria-label="Stripe Checkout Session ID"
          placeholder="cs_test_… / cs_live_…"
          value={sessionId} onChange={event => setSessionId(event.target.value)}
          className="w-full border border-zinc-600 bg-black px-2 py-2 font-mono text-xs text-white"
          autoComplete="off" spellCheck={false}
        />
      )}
      <button type="button" disabled={working || (!hasSession && !sessionId.trim())}
        onClick={() => void reconcile()}
        className="min-h-10 border border-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-900/40 disabled:opacity-40">
        {working ? 'Verifying…' : 'Verify / retry'}
      </button>
      {status && <span role="status" className="text-xs text-zinc-300">{status}</span>}
    </div>
  )
}
