'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'

const rowsSchema = z.object({
  licenses: z.array(z.object({
    id: z.string(),
    email: z.string(),
    tier: z.string(),
    expires_at: z.string().nullable(),
    revoked_at: z.string().nullable(),
  })),
})

const mutateSchema = z.object({ key: z.string().optional() })

const inputClass =
  'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600'
const primaryButton =
  'rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]'
const secondaryButton =
  'rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]'

function formatExpiry(value: string | null): string {
  if (!value) return 'No expiry'
  return 'Expires ' + new Date(value).toLocaleDateString()
}

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

export function LicensePanel({ productId }: { productId: string }) {
  const [rows, setRows] = useState<z.infer<typeof rowsSchema>['licenses']>([])
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState<'alpha' | 'full'>('alpha')
  const [days, setDays] = useState(90)
  const [message, setMessage] = useState('')
  const [key, setKey] = useState('')
  const [revealedId, setRevealedId] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const response = await fetch('/api/plugins/' + productId + '/licenses', { cache: 'no-store' })
    const payload: unknown = await response.json().catch(() => ({}))
    if (!response.ok) {
      const detail =
        payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : 'Administrator sign-in required.'
      throw new Error(detail)
    }
    setRows(rowsSchema.parse(payload).licenses)
  }

  useEffect(() => {
    void refresh().catch((error) =>
      setMessage(error instanceof Error ? error.message : 'Could not load licenses. Check your admin session.'),
    )
  }, [])

  async function mutate(input: object) {
    setBusy(true)
    setMessage('')
    const action = z.object({ action: z.string() }).passthrough().parse(input).action
    if (action !== 'reveal') {
      setKey('')
      setRevealedId('')
    }
    try {
      const response = await fetch('/api/plugins/' + productId + '/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const payload: unknown = await response.json().catch(() => ({}))
      if (!response.ok) {
        const detail =
          payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'Action failed. Check your session, MFA and licensing configuration.'
        throw new Error(detail)
      }
      const result = mutateSchema.parse(payload)
      if (result.key) {
        setKey(result.key)
        if (action === 'reveal' && 'id' in input && typeof input.id === 'string') {
          setRevealedId(input.id)
        }
      }
      setMessage(action === 'issue' ? 'Key created. Copy it now or reveal it later from this list.' : 'Saved.')
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please retry.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        role="status"
        className="rounded border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-400"
      >
        <p>
          Licences are scoped to this plugin only. Activation at{' '}
          <code className="font-mono text-xs">/api/license/v1/activate</code> stays available even while the
          public page is off.
        </p>
      </div>

      <form
        className="space-y-4 rounded border border-zinc-800 bg-zinc-950/60 p-4"
        onSubmit={(event) => {
          event.preventDefault()
          void mutate({ action: 'issue', email, tier, days: tier === 'full' ? null : days })
        }}
      >
        <h2 className="text-sm font-semibold text-zinc-200">Issue a license</h2>
        <p className="text-xs text-zinc-500">
          Alpha keys expire on the date below. Full keys do not expire. The key is shown once here and can
          be revealed again later from this list.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <label className="min-w-[16rem] flex-1 text-sm text-zinc-300">
            Customer email
            <input
              required
              type="email"
              autoComplete="email"
              className={inputClass + ' mt-1 block'}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="w-32 text-sm text-zinc-300">
            Type
            <select
              className={inputClass + ' mt-1 block'}
              value={tier}
              onChange={(event) => setTier(event.target.value as 'alpha' | 'full')}
            >
              <option value="alpha">Alpha</option>
              <option value="full">Full</option>
            </select>
          </label>
          <label className="w-32 text-sm text-zinc-300">
            Valid for days
            <input
              required={tier === 'alpha'}
              disabled={tier === 'full'}
              type="number"
              min={1}
              max={3650}
              className={inputClass + ' mt-1 block'}
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
            />
          </label>
          <button disabled={busy} className={primaryButton}>
            {busy ? 'Working…' : 'Issue key'}
          </button>
        </div>
      </form>

      {key && (
        <label className="block rounded border border-red-900/40 bg-red-950/20 p-4 text-sm text-zinc-200">
          License key
          <input
            readOnly
            className={inputClass + ' mt-1 block font-mono'}
            value={key}
            onFocus={(event) => event.target.select()}
          />
          <button
            type="button"
            className={secondaryButton + ' mt-3'}
            onClick={() => {
              void copyText(key).then((ok) => setMessage(ok ? 'Key copied.' : 'Select the key and copy it manually.'))
            }}
          >
            Copy key
          </button>
        </label>
      )}

      <p role="status" className="min-h-6 text-sm text-zinc-400">{message}</p>

      <p className="text-xs text-zinc-500">
        Most recent 100 licenses. Revocation blocks renewals; existing signed files remain valid
        for up to 30 days.
      </p>

      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center gap-3 rounded border border-zinc-800 bg-zinc-950/60 p-4"
          >
            <div className="min-w-0 flex-1 break-words text-sm text-zinc-200">
              {row.email} — {row.tier}
              {row.revoked_at ? ' (revoked)' : ''}
              <div className="mt-1 text-xs text-zinc-500">{formatExpiry(row.expires_at)}</div>
              {revealedId === row.id && key && (
                <input
                  readOnly
                  className={inputClass + ' mt-2 font-mono'}
                  value={key}
                  onFocus={(event) => event.target.select()}
                />
              )}
            </div>
            <button
              className={secondaryButton}
              disabled={busy}
              onClick={() => {
                if (window.confirm('Show the stored license key? Keep it off shared screens.')) {
                  void mutate({ action: 'reveal', id: row.id })
                }
              }}
            >
              Show key
            </button>
            <button
              className={secondaryButton}
              disabled={busy || !!row.revoked_at}
              onClick={() => {
                if (window.confirm('Revoke this license? Existing offline files expire within 30 days.')) {
                  void mutate({ action: 'revoke', id: row.id })
                }
              }}
            >
              Revoke
            </button>
            <button
              className={secondaryButton}
              disabled={busy || !!row.revoked_at}
              onClick={() => {
                if (window.confirm('Reset all device slots? Old offline files remain valid until expiry.')) {
                  void mutate({ action: 'reset', id: row.id })
                }
              }}
            >
              Reset devices
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
