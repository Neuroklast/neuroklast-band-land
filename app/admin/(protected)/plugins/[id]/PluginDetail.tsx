'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { RELEASE_CHANNELS, slugifyProductTitle } from '@/lib/plugins/releases'
import { LicensePanel } from './LicensePanel'
import { ReleasePanel } from './ReleasePanel'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'

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

interface FeatureItem {
  id: string
  title: string
  body: string
}

interface MediaItem {
  id: string
  kind: 'image' | 'video' | 'audio'
  url: string
  storagePath?: string
}

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

function FeatureRow({
  feature,
  onUpdate,
  onRemove,
}: {
  feature: FeatureItem
  onUpdate: (id: string, field: 'title' | 'body', value: string) => void
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded border border-zinc-800 bg-zinc-900 p-3 space-y-2"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder feature`}
          className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 256 256"
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M108,60a16,16,0,1,1-16-16A16,16,0,0,1,108,60Zm56,16a16,16,0,1,0-16-16A16,16,0,0,0,164,76ZM92,112a16,16,0,1,0,16,16A16,16,0,0,0,92,112Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,112ZM92,176a16,16,0,1,0,16,16A16,16,0,0,0,92,176Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,176Z" />
          </svg>
        </button>
        <input
          value={feature.title}
          onChange={(e) => onUpdate(feature.id, 'title', e.target.value)}
          placeholder="Feature title"
          className="flex-1 min-w-0 font-mono text-xs bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-600"
        />
        <button
          type="button"
          onClick={() => onRemove(feature.id)}
          className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          aria-label="Remove feature"
        >
          ✕
        </button>
      </div>
      <textarea
        value={feature.body}
        onChange={(e) => onUpdate(feature.id, 'body', e.target.value)}
        rows={2}
        placeholder="Description (optional)"
        className="w-full font-mono text-xs bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-zinc-400 focus:outline-none focus:border-zinc-600"
      />
    </div>
  )
}

export function PluginDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [features, setFeatures] = useState<FeatureItem[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [importPem, setImportPem] = useState('')

  const [newFeatureTitle, setNewFeatureTitle] = useState('')
  const [newFeatureBody, setNewFeatureBody] = useState('')
  const [newMediaKind, setNewMediaKind] = useState<'image' | 'video' | 'audio'>('image')
  const [newMediaUrl, setNewMediaUrl] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function refresh() {
    const payload = await api()
    const all = z.object({ products: z.array(productSchema) }).parse(payload).products
    const found = all.find((item) => item.id === productId) ?? null
    setProduct(found)
    if (found) {
      setDescription(found.description ?? '')
      setRequirements(found.system_requirements.join('\n'))
      setFeatures(found.features.map((feature) => ({ id: crypto.randomUUID(), title: feature.title, body: feature.body })))
      setMedia(found.media.map((item) => ({ id: crypto.randomUUID(), kind: item.kind, url: item.url })))
    }
  }

  useEffect(() => {
    void refresh().catch((error) =>
      setMessage(error instanceof Error ? error.message : 'Could not load plugin.'),
    )
  }, [productId])

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
        features: features.map(({ title, body }) => ({ title, body })),
        system_requirements: lines(requirements),
        media: media.map(({ kind, url }) => ({ kind, url })).filter((item) => item.url),
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
    if (!window.confirm(
      `Delete "${product.title}" permanently?\n\nVersions, downloads and the stored build files are removed. ` +
      'This is refused if the product already has licences or orders.',
    )) return
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

  function handleFeatureDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setFeatures((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id)
      const newIndex = prev.findIndex((f) => f.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function addFeature() {
    const title = newFeatureTitle.trim()
    const body = newFeatureBody.trim()
    if (!title) return
    setFeatures([...features, { id: crypto.randomUUID(), title, body }])
    setNewFeatureTitle('')
    setNewFeatureBody('')
  }

  function updateFeature(id: string, field: 'title' | 'body', value: string) {
    setFeatures((prev) => prev.map((f) => f.id === id ? { ...f, [field]: value } : f))
  }

  function removeFeature(id: string) {
    setFeatures((prev) => prev.filter((f) => f.id !== id))
  }

  function addMedia() {
    const url = newMediaUrl.trim()
    if (!url) return
    setMedia([...media, { id: crypto.randomUUID(), kind: newMediaKind, url }])
    setNewMediaUrl('')
  }

  function updateMediaUrl(id: string, url: string) {
    setMedia((prev) => prev.map((m) => m.id === id ? { ...m, url } : m))
  }

  function removeMedia(id: string) {
    setMedia((prev) => prev.filter((m) => m.id !== id))
  }

  function resolveMedia(id: string, storagePath: string, publicUrl?: string) {
    setMedia((prev) => prev.map((m) => m.id === id ? { ...m, url: publicUrl ?? m.url, storagePath } : m))
  }

  function clearMedia(id: string) {
    setMedia((prev) => prev.filter((m) => m.id !== id))
  }

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
            <textarea name="description" rows={5} maxLength={8000} defaultValue={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass + ' mt-1'} />
          </label>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Features</h3>
            <p className="text-xs text-zinc-500">Drag to reorder, edit title and body, or remove.</p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleFeatureDragEnd}
            >
              <SortableContext items={features.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {features.map((feature) => (
                    <FeatureRow
                      key={feature.id}
                      feature={feature}
                      onUpdate={updateFeature}
                      onRemove={removeFeature}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <div className="flex gap-2">
              <input
                value={newFeatureTitle}
                onChange={(e) => setNewFeatureTitle(e.target.value)}
                placeholder="Feature title"
                className="flex-1 min-w-0 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <input
                value={newFeatureBody}
                onChange={(e) => setNewFeatureBody(e.target.value)}
                placeholder="Description"
                className="flex-1 min-w-0 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="button"
                onClick={addFeature}
                disabled={!newFeatureTitle.trim()}
                className={secondaryButton}
              >
                Add
              </button>
            </div>
          </div>

          <label className="block text-sm text-zinc-300">
            System requirements — one per line
            <textarea value={requirements} onChange={(event) => setRequirements(event.target.value)}
              rows={3} className={inputClass + ' mt-1'} />
          </label>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Media</h3>
            <p className="text-xs text-zinc-500">Upload images (stored in R2) or paste video/audio URLs.</p>
            <div className="space-y-2">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="rounded border border-zinc-800 bg-zinc-900 p-3 space-y-2"
                >
                  {item.kind === 'image' ? (
                    <MediaSourcePicker
                      label="Image"
                      currentUrl={item.url}
                      currentStoragePath={item.storagePath ?? null}
                      storagePrefix="plugins"
                      onResolved={(storagePath, publicUrl) => resolveMedia(item.id, storagePath, publicUrl)}
                      onCleared={() => clearMedia(item.id)}
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">{item.kind}</span>
                        <input
                          value={item.url}
                          onChange={(e) => updateMediaUrl(item.id, e.target.value)}
                          placeholder="https://…"
                          className="flex-1 min-w-0 font-mono text-xs bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-zinc-300 focus:outline-none focus:border-zinc-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(item.id)}
                          className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                          aria-label="Remove media"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500">Paste a direct video or audio URL.</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <select
                  value={newMediaKind}
                  onChange={(e) => setNewMediaKind(e.target.value as 'image' | 'video' | 'audio')}
                  className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
                <input
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder={newMediaKind === 'image' ? 'Upload via button below' : 'https://…'}
                  className="flex-1 min-w-0 font-mono text-xs bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
                <button
                  type="button"
                  onClick={addMedia}
                  disabled={!newMediaUrl.trim()}
                  className={secondaryButton}
                >
                  Add
                </button>
              </div>
              {newMediaKind === 'image' && (
                <MediaSourcePicker
                  label="Add image"
                  currentUrl={null}
                  currentStoragePath={null}
                  storagePrefix="plugins"
                  onResolved={(storagePath, publicUrl) => {
                    setMedia([...media, { id: crypto.randomUUID(), kind: 'image', url: publicUrl ?? '', storagePath }])
                  }}
                  onCleared={() => {}}
                />
              )}
            </div>
          </div>
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
          Removes this product, its versions, downloads and stored build files. Refused if the product
          already has licences or orders; keep those for accounting instead.
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
