'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveLegalLocale } from '@/lib/legal-templates'
import {
  licenceDocumentFromActivateBody,
  normalizeLicenceKey,
  normalizeSystemId,
  offlineFieldError,
  OFFLINE_COPY,
} from '@/lib/plugins/offline-activation'

export function OfflineActivate() {
  const { locale } = useLocale()
  const copy = OFFLINE_COPY[resolveLegalLocale(locale)]
  const [key, setKey] = useState('')
  const [device, setDevice] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const control = 'min-h-11 w-full border border-white/30 bg-black/80 px-3 py-2 font-mono text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500'
  const button = 'min-h-11 border border-white/40 px-4 py-2 text-sm hover:border-red-500 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500'

  async function createFile() {
    setMessage('')
    const problem = offlineFieldError(key, device, copy)
    if (problem) {
      setMessage(problem)
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/license/v1/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify({
          key: normalizeLicenceKey(key),
          device: normalizeSystemId(device),
        }),
      })
      const body: unknown = await response.json().catch(() => null)
      const license = response.ok ? licenceDocumentFromActivateBody(body) : null
      if (!license) {
        setMessage(copy.failed)
        return
      }
      const blob = new Blob([license], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'neurokore.lic'
      link.click()
      URL.revokeObjectURL(url)
      setMessage(copy.success)
    } catch {
      setMessage(copy.failed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-6" aria-label={copy.title}>
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-300">
        <li>{copy.step1}</li>
        <li>{copy.step2}</li>
        <li>{copy.step3}</li>
      </ol>
      <form className="space-y-4 border border-white/15 bg-zinc-950 p-5 sm:p-7" onSubmit={event => { event.preventDefault(); void createFile() }}>
        <label className="block space-y-1 text-sm">{copy.keyLabel}
          <input required autoComplete="off" spellCheck={false} className={control}
            value={key} disabled={busy} onChange={event => setKey(event.target.value)} />
        </label>
        <label className="block space-y-1 text-sm">{copy.deviceLabel}
          <input required autoComplete="off" spellCheck={false} className={control}
            value={device} disabled={busy} onChange={event => setDevice(event.target.value)} />
        </label>
        <button className={button} disabled={busy}>{busy ? copy.working : copy.submit}</button>
        <p className="text-sm text-zinc-400">{copy.note}</p>
      </form>
      <p role="status" aria-live="polite" className="min-h-8 text-sm text-zinc-300">{message}</p>
      <p><Link className="underline underline-offset-4 hover:text-red-400" href="/neurokore/account">{copy.account}</Link></p>
    </section>
  )
}
