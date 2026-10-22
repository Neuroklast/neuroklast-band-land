'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RetryReceiptsButton({ pending }: { pending: number }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  async function retry() {
    setBusy(true)
    setStatus('')
    try {
      const response = await fetch('/api/admin/withdrawal-receipts/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (!response.ok) throw new Error('Retry unsuccessful. Check operator email, Resend and database health.')
      const result: { confirmed: number; pending: number } = await response.json()
      setStatus(result.confirmed + ' confirmations accepted, ' + result.pending + ' still pending.')
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to retry confirmations.')
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-3">
      <button type="button" disabled={busy || pending === 0}
        className="min-h-11 border border-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-900/30 disabled:opacity-50"
        onClick={() => void retry()}>
        {busy ? 'Retrying…' : 'Retry pending confirmations'}
      </button>
      <p role="status" className="text-sm text-zinc-400">{status}</p>
    </div>
  )
}
