'use client'

import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { RELEASE_CHANNELS, slugifyProductTitle } from '@/lib/plugins/releases'
import { LicensePanel } from './LicensePanel'
import { ReleasePanel } from './ReleasePanel'

const featureSchema = z.object({ title: z.string(), body: z.string() })
const mediaSchema = z.object({ kind: z.enum(['image', 'video', 'audio']), url: z.string() })

const productSchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
  title: z.string(),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  features: z.array(featureSchema),
  system_requirements: z.array(z.string()),
  media: z.array(mediaSchema),
  default_channel: z.enum(RELEASE_CHANNELS),
  pricing_mode: z.enum(['paid', 'free']),
  sales_enabled: z.boolean(),
  demo_downloads_enabled: z.boolean(),
  license_required: z.boolean(),
  license_format: z.enum(['v2', 'v3']),
  stripe_price_id: z.string().nullable(),
  signing_public_key_hex: z.string().nullable(),
  has_signing_key: z.boolean(),
  display_order: z.number(),
  active: z.boolean(),
  release_count: z.number(),
  published_count: z.number(),
  license_count: z.number(),
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

function lines(value: string): string[] {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}

export function PluginDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [features, setFeatures] = useState('')
  const [requirements, setRequirements] = useState('')
  const [media, setMedia] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [importPem, setImportPem] = useState('')

  async function refresh() {
    const payload = await api()
    const all = z.object({ products: z.array(productSchema) }).parse(payload).products
    const found = all.find((item) => item.id === productId) ?? null
    setProduct(found)
    if (found) {
      setFeatures(found.features.map((feature) => `${feature.title} | ${feature.body}`).join('\n'))
      setRequirements(found.system_requirements.join('\n'))
      setMedia(found.media.map((item) => `${item.kind}|${item.url}`).join('\n'))
    }
  }

  useEffect(() => {
    void refresh().catch((error) =>
      setMessage(error instanceof Error ? error.message : 'Could not load plugin.'),
    )
  }, [productId])

  const parsedFeatures = useMemo(() => lines(features).map((line) => {
    const [title, ...rest] = line.split('|')
    return { title: title.trim(), body: rest.join('|').trim() }
  }).filter((feature) => feature.title), [features])

  const parsedRequirements = useMemo(() => lines(requirements), [requirements])

  const parsedMedia = useMemo(() => lines(media).flatMap((line) => {
    const [kind, ...rest] = line.split('|')
    const url = rest.join('|').trim()
    const allowed = ['image', 'video', 'audio'] as const
    if (!allowed.includes(kind.trim() as (typeof allowed)[number]) || !url) return []
    return [{ kind: kind.trim() as (typeof allowed)[number], url }]
  }), [media])

  async function save(form: HTMLFormElement) {
    if (!product) return
    const data = new FormData(form)
    const titleValue = String(data.get('title') ?? '').trim()
    const rawSlug = String(data.get('slug') ?? '').trim()
    const slugValue = rawSlug || slugifyProductTitle(titleValue)
    if (!slugValue) {
      setMessage('Add a title or a URL slug.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      await api({
        action: 'update',
        id: product.id,
        title: titleValue,
        slug: slugValue,
        short_description: String(data.get('short_description') ?? '') || null,
        description: String(data.get('description') ?? '') || null,
        features: parsedFeatures,
        system_requirements: parsedRequirements,
        media: parsedMedia,
        default_channel: String(data.get('default_channel') ?? 'stable'),
        pricing_mode: String(data.get('pricing_mode') ?? 'paid'),
        sales_enabled: data.get('sales_enabled') === 'on',
        demo_downloads_enabled: data.get('demo_downloads_enabled') === 'on',
        license_required: data.get('license_required') === 'on',
        license_format: String(data.get('license_format') ?? 'v3'),
        stripe_price_id: String(data.get('stripe_price_id') ?? '') || null,
        display_order: Number(data.get('display_order') ?? 0),
        active: product.active,
      })
      await refresh()
      setMessage('Saved. The public page uses these values after revalidation.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please retry.')
    } finally {
      setBusy(false)
    }
  }

  if (!product) {
    return <p role="status" className="text-sm text-zinc-400">{message || 'Loading plugin…'}</p>
  }

  async function setPublic(active: boolean) {
    if (!product) return
    setBusy(true)
    setMessage('')
    try {
      await api({ action: 'set_active', id: product.id, active })
      await refresh()
      setMessage(active
        ? 'Page is public. The product and its published downloads are now reachable.'
        : 'Page hidden. The public page and downloads return 404 until you make it public again.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please retry.')
    } finally {
      setBusy(false)
    }
  }

  async function removeProduct() {
    if (!product) return
    const expected = product.slug ?? product.title
    const typed = window.prompt(
      `Delete "${product.title}" permanently?\n\n` +
      'Removes versions, downloads, licences, audit rows and stored build files.\n' +
      'Only allowed while the product is hidden and has no paid orders.\n\n' +
      `Type ${expected} to confirm:`,
    )
    if (typed !== expected) return
    setBusy(true)
    setMessage('')
    try {
      await api({ action: 'delete_product', id: product.id })
      window.location.assign('/admin/plugins')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please retry.')
      setBusy(false)
    }
  }

  const publicLive = product.active && Boolean(product.slug)

  return (
    <div className="space-y-8">
      <p role="status" className="min-h-6 text-sm text-zinc-400">{message}</p>

      <div className={`rounded border p-4 text-sm ${publicLive ? 'border-emerald-900/60 bg-emerald-950/20 text-emerald-200' : 'border-amber-900/60 bg-amber-950/20 text-amber-200'}`}>
        <p className="font-medium">
          {publicLive
            ? 'Public: the product page and downloads are reachable.'
            : product.slug
              ? 'Not public: the product page returns 404.'
              : 'No page yet: add a URL slug and save.'}
        </p>
        <p className="mt-1 text-xs opacity-80">
          {product.slug
            ? <>URL: <a className="underline" href={`/plugins/${product.slug}`} target="_blank" rel="noreferrer">/plugins/{product.slug}</a></>
            : 'The slug is generated from the name when you leave it empty.'}
          {' '}Sales and the free/paid choice are separate: they never hide the page or the demo download.
        </p>
        <button
          type="button"
          className={secondaryButton + ' mt-3'}
          disabled={busy || (!product.slug && !product.active)}
          onClick={() => void setPublic(!product.active)}
        >
          {product.active ? 'Hide page' : 'Make public'}
        </button>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          void save(event.currentTarget)
        }}
      >
        <section className="space-y-3 rounded border border-zinc-800 bg-zinc-950/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Product page</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-zinc-300">
              Name
              <input name="title" required defaultValue={product.title} className={inputClass + ' mt-1'} />
            </label>
            <label className="text-sm text-zinc-300">
              URL slug (leave empty to generate)
              <input name="slug" pattern="[a-z0-9][a-z0-9-]*" defaultValue={product.slug ?? ''}
                placeholder="generated from the name"
                className={inputClass + ' mt-1 font-mono'} />
            </label>
          </div>
          <label className="block text-sm text-zinc-300">
            Short description
            <input name="short_description" maxLength={500} defaultValue={product.short_description ?? ''}
              className={inputClass + ' mt-1'} />
          </label>
          <label className="block text-sm text-zinc-300">
            Long description
            <textarea name="description" rows={5} maxLength={8000} defaultValue={product.description ?? ''}
              className={inputClass + ' mt-1'} />
          </label>
          <label className="block text-sm text-zinc-300">
            Features — one per line as <code className="font-mono text-xs">Title | description</code>
            <textarea value={features} onChange={(event) => setFeatures(event.target.value)}
              rows={5} className={inputClass + ' mt-1'} />
          </label>
          <label className="block text-sm text-zinc-300">
            System requirements — one per line
            <textarea value={requirements} onChange={(event) => setRequirements(event.target.value)}
              rows={3} className={inputClass + ' mt-1'} />
          </label>
          <label className="block text-sm text-zinc-300">
            Media — one per line as <code className="font-mono text-xs">image|https://…</code> (image, video or audio)
            <textarea value={media} onChange={(event) => setMedia(event.target.value)}
              rows={3} className={inputClass + ' mt-1'} />
          </label>
        </section>

        <section className="space-y-4 rounded border border-zinc-800 bg-zinc-950/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Visibility, pricing and licensing</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm text-zinc-300">
              Default channel
              <select name="default_channel" defaultValue={product.default_channel} className={inputClass + ' mt-1'}>
                {RELEASE_CHANNELS.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
              </select>
            </label>
            <label className="text-sm text-zinc-300">
              Pricing
              <select name="pricing_mode" defaultValue={product.pricing_mode} className={inputClass + ' mt-1'}>
                <option value="paid">Paid</option>
                <option value="free">Free</option>
              </select>
            </label>
            <label className="text-sm text-zinc-300">
              Licence format
              <select name="license_format" defaultValue={product.license_format} className={inputClass + ' mt-1'}>
                <option value="v3">v3 (new plugins)</option>
                <option value="v2">v2 (NEUROKORE)</option>
              </select>
            </label>
            <label className="text-sm text-zinc-300 sm:col-span-2">
              Stripe price ID
              <input name="stripe_price_id" defaultValue={product.stripe_price_id ?? ''}
                placeholder="price_… (required for paid plugins)" className={inputClass + ' mt-1 font-mono'} />
            </label>
            <label className="text-sm text-zinc-300">
              Sort order
              <input name="display_order" type="number" min={0} max={9999} defaultValue={product.display_order}
                className={inputClass + ' mt-1'} />
            </label>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="demo_downloads_enabled" defaultChecked={product.demo_downloads_enabled} /> Downloads enabled
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="sales_enabled" defaultChecked={product.sales_enabled} /> Sales enabled
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="license_required" defaultChecked={product.license_required} /> Licence required
            </label>
          </div>
          <p className="text-xs text-zinc-500">
            Free plugins need no licence and no Stripe price. Sales stay blocked globally by
            <code className="mx-1 font-mono">NEUROKORE_SALES_ENABLED</code>.
          </p>
        </section>

        <button className={primaryButton} disabled={busy}>{busy ? 'Saving…' : 'Save plugin'}</button>
      </form>

      <section className="space-y-3 rounded border border-zinc-800 bg-zinc-950/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Signing key</h2>
        <p className="text-xs text-zinc-500">
          Each plugin gets its own Ed25519 key. The public key must be compiled into that plugin.
          {product.slug === 'neurokore' && ' NEUROKORE falls back to its existing environment key until a key is stored here.'}
        </p>
        {product.signing_public_key_hex ? (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400">Public key (hex), embed in the plugin build:</p>
            <input readOnly value={product.signing_public_key_hex}
              className={inputClass + ' font-mono text-xs'} onFocus={(event) => event.target.select()} />
          </div>
        ) : (
          <p className="text-xs text-amber-300">
            {product.has_signing_key ? 'Key stored, public key unknown.' : 'No key stored yet.'}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={secondaryButton}
            disabled={busy}
            onClick={() => {
              if (window.confirm('Generate a new key? Only do this before the plugin embeds a public key; existing signed files stay valid only if the plugin still trusts the new key.')) {
                setBusy(true)
                setMessage('')
                void api({ action: 'generate_key', id: product.id })
                  .then(async () => { await refresh(); setMessage('New signing key generated.') })
                  .catch((error) => setMessage(error instanceof Error ? error.message : 'Please retry.'))
                  .finally(() => setBusy(false))
              }
            }}
          >
            Generate new key
          </button>
          <button
            type="button"
            className={secondaryButton}
            disabled={busy || !product.signing_public_key_hex}
            onClick={() => {
              void navigator.clipboard.writeText(product.signing_public_key_hex ?? '').then(
                () => setMessage('Public key copied.'),
                () => setMessage('Select and copy the key manually.'),
              )
            }}
          >
            Copy public key
          </button>
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-zinc-300">
            Import an existing private key (PEM)
            <textarea value={importPem} onChange={(event) => setImportPem(event.target.value)}
              rows={3} className={inputClass + ' mt-1 font-mono text-xs'} />
          </label>
          <button
            type="button"
            className={secondaryButton}
            disabled={busy || importPem.trim().length < 32}
            onClick={() => {
              setBusy(true)
              setMessage('')
              void api({ action: 'import_key', id: product.id, private_pem: importPem })
                .then(async () => { setImportPem(''); await refresh(); setMessage('Signing key imported.') })
                .catch((error) => setMessage(error instanceof Error ? error.message : 'Please retry.'))
                .finally(() => setBusy(false))
            }}
          >
            Import key
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-100">Versions &amp; downloads</h2>
        <ReleasePanel productId={product.id} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-100">Licences</h2>
        <LicensePanel productId={product.id} />
      </section>

      <section className="space-y-3 rounded border border-red-900/60 bg-red-950/10 p-4">
        <h2 className="text-sm font-semibold text-red-300">Delete product</h2>
        <p className="text-xs text-zinc-400">
          Removes versions, downloads, licences, audit rows and stored build files. Allowed while the
          product is hidden and has no paid orders. Hide it first if it is public.
        </p>
        <button
          type="button"
          className="min-h-[44px] rounded border border-red-800 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={busy}
          onClick={() => void removeProduct()}
        >
          Delete “{product.title}”
        </button>
      </section>
    </div>
  )
}


