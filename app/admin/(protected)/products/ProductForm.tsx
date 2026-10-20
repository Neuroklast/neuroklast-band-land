'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { createProduct, updateProduct } from '@/app/admin/_actions/products'
import { r2Url } from '@/lib/r2'

export interface ProductFormItem {
  id: string
  title: string
  description: string | null
  image_storage_path: string | null
  image_url: string | null
  href: string | null
  price_label: string | null
  display_order: number
}

export function ProductForm({ item }: { item?: ProductFormItem }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [storagePath, setStoragePath] = useState<string | null>(item?.image_storage_path ?? null)
  const currentImageUrl = r2Url(storagePath) ?? item?.image_url ?? undefined

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    if (storagePath) {
      fd.set('image_storage_path', storagePath)
      fd.set('image_url', '')
    }
    const result = item ? await updateProduct(item.id, fd) : await createProduct(fd)
    if (result.error) {
      setError(result.error)
      setSaving(false)
    } else {
      router.push('/admin/products')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Title</label>
        <input
          name="title"
          defaultValue={item?.title ?? ''}
          required
          maxLength={200}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-zinc-500"
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Description</label>
        <textarea
          name="description"
          defaultValue={item?.description ?? ''}
          rows={4}
          maxLength={4000}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-zinc-500"
        />
      </div>
      <MediaSourcePicker
        label="Cover Image"
        currentUrl={currentImageUrl}
        storagePrefix={item ? `products/${item.id}` : 'products'}
        onResolved={(path) => {
          setStoragePath(path)
          setError(null)
        }}
        onError={setError}
      />
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Link</label>
        <input
          name="href"
          type="text"
          defaultValue={item?.href ?? ''}
          placeholder="/neurokore or https://…"
          maxLength={2000}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-zinc-500"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Site path such as <code className="font-mono">/neurokore</code>, or an http(s) URL.
        </p>
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Price label</label>
        <input
          name="price_label"
          defaultValue={item?.price_label ?? ''}
          placeholder="optional, e.g. 99 €"
          maxLength={80}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-zinc-500"
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Display Order</label>
        <input
          name="display_order"
          type="number"
          defaultValue={item?.display_order ?? 0}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-zinc-500"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
