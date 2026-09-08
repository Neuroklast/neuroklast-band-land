'use client'

import { useState } from 'react'
import { createPartner } from '@/app/admin/_actions/partners'
import { AdminField } from '@/app/admin/_components/AdminField'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { StreamingLinksEditor } from '@/app/admin/_components/StreamingLinksEditor'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { useRouter } from 'next/navigation'

const inputClass =
  'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none'
const labelClass = 'mb-1 block text-xs text-zinc-400'

export default function PartnerForm() {
  const router = useRouter()
  const [logoPath, setLogoPath] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (logoPath) {
      formData.set('logo_storage_path', logoPath)
      formData.set('logo_url', '')
    }
    const result = await createPartner(formData)
    if (result?.error) setError(result.error)
    else {
      ;(e.target as HTMLFormElement).reset()
      setLogoPath('')
      setError(null)
      setDirty(false)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AdminField id="partner-name" label="Name *" labelClassName={labelClass}>
          <input id="partner-name" name="name" required className={inputClass} />
        </AdminField>
        <AdminField id="partner-category" label="Section" labelClassName={labelClass}>
          <select id="partner-category" name="category" className={inputClass}>
            <option value="credit">Credit (Credits grid)</option>
            <option value="endorsement">Endorsement (Endorsements grid)</option>
            <option value="partner">Partner / Friend</option>
          </select>
        </AdminField>
      </div>
      <AdminField id="partner-url" label="Website URL" labelClassName={labelClass}>
        <input id="partner-url" name="url" type="url" placeholder="https://…" className={inputClass} />
      </AdminField>
      <AdminField id="partner-description" label="Description" labelClassName={labelClass}>
        <textarea id="partner-description" name="description" rows={3} className={inputClass} />
      </AdminField>
      <div>
        <p className="mb-1 block text-xs text-zinc-400">Socials</p>
        <StreamingLinksEditor fieldName="socials" recordMode addLabel="+ Add social link" initialJson="{}" />
      </div>
      <MediaSourcePicker
        label="Logo"
        storagePrefix="partners/logos"
        onResolved={(path) => {
          setLogoPath(path)
          setDirty(true)
          setError(null)
        }}
        onError={(msg) => setError(msg)}
      />
      <label htmlFor="partner-logo-white" className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
        <input
          id="partner-logo-white"
          type="checkbox"
          name="logo_white"
          value="true"
          defaultChecked
          className="h-5 w-5 min-h-[20px] min-w-[20px] rounded border-zinc-600"
        />
        White logo fill (default — silhouette to white; uncheck for colour or pre-whitened logos)
      </label>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        className="px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors"
      >
        Add Partner
      </button>
    </form>
  )
}
