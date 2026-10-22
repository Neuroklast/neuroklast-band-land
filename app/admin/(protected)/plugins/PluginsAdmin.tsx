'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { z } from 'zod'

const productSchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
  kind: z.enum(['plugin', 'other']),
  title: z.string(),
  pricing_mode: z.enum(['paid', 'free']),
  sales_enabled: z.boolean(),
  demo_downloads_enabled: z.boolean(),
  license_required: z.boolean(),
  license_format: z.string(),
  active: z.boolean(),
  release_count: z.number(),
  published_count: z.number(),
  license_count: z.number(),
  has_signing_key: z.boolean(),
  signing_public_key_hex: z.string().nullable(),
})

type Product = z.infer<typeof productSchema>

const inputClass =
  'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600'
const primaryButton =
  'rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]'
const secondaryButton =
  'rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]'

async function api(body?: object): Promise<unknown> {
  const response = await fetch('/api/plugins', body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : { cache: 'no-store' })
  const payload: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Action failed. Check your session and plugin data.',
    )
  }
  return payload
}

export function PluginsAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [pricing, setPricing] = useState<'paid' | 'free'>('paid')
  const [busy, setBusy] = useState(false)
  const [schemaBusy, setSchemaBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function refresh() {
    const payload = await api()
    setProducts(z.object({ products: z.array(productSchema) }).parse(payload).products)
  }

  async function toggle(product: Product) {
    setBusy(true)
    setMessage('')
    try {
      await api({ action: 'set_active', id: product.id, active: !product.active })
      await refresh()
      setMessage(!product.active
        ? 'Public. The product page and its published downloads are reachable.'
        : 'Hidden. The product page returns 404 until you make it public again.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please retry.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(product: Product) {
    if (!window.confirm(
      `Delete "${product.title}" permanently?\n\nVersions, downloads and the stored build files are removed. ` +
      'This is refused if the product already has licences or orders.',
    )) return
    setBusy(true)
    setMessage('')
    try {
      await api({ action: 'delete_product', id: product.id })
      await refresh()
      setMessage(`"${product.title}" deleted.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please retry.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void refresh().catch((error) =>
      setMessage(error instanceof Error ? error.message : 'Could not load plugins.'),
    )
  }, [])

  async function applySchema() {
    if (!window.confirm('Apply supabase/schema.sql to the database now? The file is idempotent.')) return
    setSchemaBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/apply-schema', { method: 'POST' })
      const payload: unknown = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'Schema apply failed.',
        )
      }
      await refresh()
      setMessage('Database schema applied from supabase/schema.sql.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Schema apply failed.')
    } finally {
      setSchemaBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 rounded border border-zinc-800 bg-zinc-950/60 p-4">
        <p className="text-sm font-semibold text-zinc-200">Database schema</p>
        <p className="text-xs text-zinc-500">
          Missing database functions (for example after a preview deploy) come from the database, not
          the app. Apply the current <code className="font-mono">supabase/schema.sql</code> here. It is
          idempotent and keeps all existing data.
        </p>
        <button type="button" className={secondaryButton} disabled={schemaBusy} onClick={() => void applySchema()}>
          {schemaBusy ? 'Applying…' : 'Apply schema.sql'}
        </button>
      </div>

      <form
        className="space-y-3 rounded border border-zinc-800 bg-zinc-950/60 p-4"
        onSubmit={(event) => {
          event.preventDefault()
          setBusy(true)
          setMessage('')
          void api({ action: 'create', title, slug, pricing_mode: pricing })
            .then(async () => {
              setTitle('')
              setSlug('')
              setPricing('paid')
              await refresh()
              setMessage('Plugin created. Open it to set up its page, downloads and licence key.')
            })
            .catch((error) => setMessage(error instanceof Error ? error.message : 'Please retry.'))
            .finally(() => setBusy(false))
        }}
      >
        <h2 className="text-sm font-semibold text-zinc-200">New plugin</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[14rem] flex-1 text-sm text-zinc-300">
            Name
            <input required className={inputClass + ' mt-1'} value={title}
              placeholder="NEUROMETER"
              onChange={(event) => {
                setTitle(event.target.value)
                if (!slug) {
                  setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                }
              }} />
          </label>
          <label className="min-w-[12rem] flex-1 text-sm text-zinc-300">
            URL slug
            <input required pattern="[a-z0-9][a-z0-9-]*" className={inputClass + ' mt-1 font-mono'} value={slug}
              placeholder="neurometer"
              onChange={(event) => setSlug(event.target.value.toLowerCase())} />
          </label>
          <label className="w-36 text-sm text-zinc-300">
            Pricing
            <select className={inputClass + ' mt-1'} value={pricing}
              onChange={(event) => setPricing(event.target.value as 'paid' | 'free')}>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </select>
          </label>
          <button className={primaryButton} disabled={busy}>{busy ? 'Working…' : 'Create'}</button>
        </div>
      </form>

      <p role="status" className="min-h-6 text-sm text-zinc-400">{message}</p>

      {products.length === 0 ? (
        <p className="rounded border border-zinc-800 p-4 text-sm text-zinc-500">
          No products yet. Create one to add its page, versions and downloads.
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => {
            const isPublic = product.active && !!product.slug
            return (
            <li key={product.id} className="rounded border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <Link href={`/admin/plugins/${product.id}`} className="text-lg font-semibold text-zinc-100 hover:underline">
                  {product.title}
                </Link>
                <span className="font-mono text-xs text-zinc-500">{product.slug ? '/plugins/' + product.slug : 'No URL slug yet'}</span>
                <span className={`rounded border px-2 py-0.5 text-xs ${isPublic ? 'border-emerald-800 text-emerald-300' : 'border-amber-800 text-amber-300'}`}>
                  {isPublic ? 'Public' : product.slug ? 'Not public (404)' : 'No page yet'}
                </span>
                <span className="rounded border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                  {product.pricing_mode === 'free' ? 'Free' : product.sales_enabled ? 'On sale' : 'Paid · sale off'}
                </span>
                {product.license_required && (
                  <span className="rounded border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">Licence</span>
                )}
                {!product.has_signing_key && product.slug !== 'neurokore' && product.license_required && (
                  <span className="text-xs text-amber-300">No signing key yet</span>
                )}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {product.published_count} published / {product.release_count} versions · {product.license_count} licences
                {product.demo_downloads_enabled ? ' · downloads on' : ' · downloads off'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link className={secondaryButton} href={`/admin/plugins/${product.id}`}>Manage</Link>
                {product.slug && (
                  <button type="button" className={secondaryButton} disabled={busy} onClick={() => void toggle(product)}>
                    {product.active ? 'Hide' : 'Make public'}
                  </button>
                )}
                {isPublic && (
                  <Link className={secondaryButton} href={`/plugins/${product.slug}`} target="_blank">View page</Link>
                )}
                <button
                  type="button"
                  className="min-h-[44px] rounded border border-red-900 px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={busy}
                  onClick={() => void remove(product)}
                >
                  Delete
                </button>
              </div>
            </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}



