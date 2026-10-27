'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveLegalLocale } from '@/lib/legal-templates'
import { ACCOUNT_COPY } from '@/lib/plugins/account-copy'
import { CustomerSignIn } from '@/components/neurokore/CustomerSignIn'

const accountSchema = z.object({
  email: z.string(),
  licenses: z.array(z.object({
    id: z.string(), key: z.string(), tier: z.string(),
    expires_at: z.string().nullable(), revoked_at: z.string().nullable(),
    product_title: z.string(), product_slug: z.string().nullable(),
    plugin_devices: z.array(z.object({ device: z.string(), activated_at: z.string().optional() })),
  })),
})
type Account = z.infer<typeof accountSchema>

export function LicenseAccount() {
  const { locale } = useLocale()
  const language = resolveLegalLocale(locale)
  const copy = ACCOUNT_COPY[language]
  const [account, setAccount] = useState<Account | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  async function refresh() {
    const response = await fetch('/api/neurokore/account', { cache: 'no-store' })
    if (response.status === 401) { setAccount(null); return }
    if (!response.ok) throw new Error(copy.loadError)
    setAccount(accountSchema.parse(await response.json()))
  }

  useEffect(() => {
    let active = true
    fetch('/api/neurokore/account', { cache: 'no-store' }).then(async response => {
      if (!active) return
      if (response.status === 401) { setAccount(null); return }
      if (!response.ok) throw new Error('Account unavailable')
      const parsed = accountSchema.parse(await response.json())
      if (active) setAccount(parsed)
    }).catch(() => { if (active) setMessage(copy.loadError) })
    return () => { active = false }
    // Load the current session when the component is mounted.
  }, [])

  async function signOut() {
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/neurokore/auth', { method: 'DELETE' })
      if (!response.ok) throw new Error(copy.authError)
      setAccount(null)
      setRevealed({})
    } catch (error) { setMessage(error instanceof Error ? error.message : copy.authError) }
    finally { setBusy(false) }
  }

  async function copyKey(key: string) {
    try { await navigator.clipboard.writeText(key); setMessage(copy.copied) }
    catch { setMessage(copy.loadError) }
  }

  const control = 'min-h-11 w-full border border-white/30 bg-black/80 px-3 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500'
  const button = 'min-h-11 border border-white/40 px-4 py-2 text-sm hover:border-red-500 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500'
  const date = (value: string) => new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(value))

  return (
    <section className="space-y-6" aria-label={copy.title}>
      <h2 className="text-2xl font-semibold">{copy.title}</h2>
      <p className="text-sm text-zinc-300">
        <Link className="underline underline-offset-4 hover:text-red-400" href="/neurokore/activate">
          Create an offline licence file
        </Link>
      </p>
      {!account ? (
        <div className="space-y-4 border border-white/15 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-300">
            {language === 'de'
              ? 'Melde dich ohne Passwort an. Wir schicken dir einen sicheren Anmeldelink per E-Mail.'
              : 'Sign in without a password. We will email you a secure one-time link.'}
          </p>
          <CustomerSignIn />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>{copy.signedIn} <strong>{account.email}</strong></p>
            <button className={button} disabled={busy} onClick={() => void signOut()}>{copy.signOut}</button>
          </div>
          <button className={button} disabled={busy}
            onClick={() => void refresh().catch(() => setMessage(copy.loadError))}>{copy.refresh}</button>
          {account.licenses.length === 0 && <p className="text-zinc-400">{copy.noLicences}</p>}
          <div className="grid gap-5">
            {account.licenses.map(license => (
              <article key={license.id} className="space-y-4 border border-white/15 bg-zinc-950 p-5 sm:p-7">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold">{license.product_title}</h3>
                  <span className="font-mono text-sm text-zinc-300">
                    {license.revoked_at ? copy.revoked : license.tier === 'alpha' ? copy.alpha : copy.full}
                  </span>
                </header>
                <p className="text-sm text-zinc-400">
                  {license.expires_at ? copy.expires + ': ' + date(license.expires_at) : copy.unlimited}
                </p>
                <div className="space-y-2">
                  <label className="block text-sm" htmlFor={'key-' + license.id}>{copy.licence}</label>
                  <div className="flex flex-wrap gap-2">
                    <input id={'key-' + license.id} readOnly autoComplete="off"
                      aria-label={copy.licence}
                      type={revealed[license.id] ? 'text' : 'password'}
                      className={control + ' min-w-0 flex-1 font-mono text-xs'}
                      value={revealed[license.id] ? license.key : '••••••••••••••••'} />
                    <button type="button" className={button}
                      onClick={() => setRevealed(previous => ({ ...previous, [license.id]: !previous[license.id] }))}>
                      {revealed[license.id] ? copy.hideKey : copy.showKey}
                    </button>
                    <button type="button" className={button} onClick={() => void copyKey(license.key)}>
                      {copy.copyKey}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <h4 className="font-semibold">{copy.activations}: {license.plugin_devices.length}</h4>
                  {license.plugin_devices.length > 0 &&
                    <ul className="space-y-1 font-mono text-xs text-zinc-400">
                      {license.plugin_devices.map((device, index) =>
                        <li key={device.device}>#{index + 1} · …{device.device.slice(-8)}
                          {device.activated_at ? ' · ' + date(device.activated_at) : ''}
                        </li>)}
                    </ul>}
                  <p className="text-zinc-400">{copy.transfer}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {license.product_slug && !license.revoked_at &&
                    <Link className={button} href={'/plugins/' + encodeURIComponent(license.product_slug) + '/download'}>
                      {copy.download}
                    </Link>}
                  <Link className={button} href="/#contact">{copy.support}</Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <p role="status" aria-live="polite" className="min-h-8 text-sm text-zinc-300">{message}</p>
    </section>
  )
}
