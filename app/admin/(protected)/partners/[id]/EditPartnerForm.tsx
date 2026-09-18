'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updatePartner } from '@/app/admin/_actions/partners'
import { AdminField } from '@/app/admin/_components/AdminField'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { StreamingLinksEditor } from '@/app/admin/_components/StreamingLinksEditor'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'

interface EditPartnerFormProps {
  partner: {
    id: string
    name: string
    url: string | null
    category: string
    description: string | null
    socials: Record<string, unknown> | null
    logo_storage_path: string | null
    display_order: number
    active: boolean
    logo_white: boolean | null
  }
  resolvedLogoUrl?: string | null
}

const inputClass = 'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm'
const labelClass = 'mb-1 block text-xs text-zinc-400'

export function EditPartnerForm({ partner, resolvedLogoUrl }: EditPartnerFormProps) {
  const router = useRouter()
  const [logoPath, setLogoPath] = useState(partner.logo_storage_path ?? '')
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
    const result = await updatePartner(partner.id, formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setDirty(false)
      router.push('/admin/partners')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-4 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AdminField id="edit-partner-name" label="Name *" labelClassName={labelClass}>
          <input id="edit-partner-name" name="name" required defaultValue={partner.name} className={inputClass} />
        </AdminField>
        <AdminField id="edit-partner-category" label="Section" labelClassName={labelClass}>
          <select id="edit-partner-category" name="category" defaultValue={partner.category} className={inputClass}>
            <option value="credit">Credit</option>
            <option value="endorsement">Endorsement</option>
            <option value="partner">Partner / Friend</option>
          </select>
        </AdminField>
      </div>
      <AdminField id="edit-partner-url" label="Website URL" labelClassName={labelClass}>
        <input id="edit-partner-url" name="url" type="url" defaultValue={partner.url ?? ''} className={inputClass} />
      </AdminField>
      <AdminField id="edit-partner-description" label="Description" labelClassName={labelClass}>
        <textarea
          id="edit-partner-description"
          name="description"
          rows={3}
          defaultValue={partner.description ?? ''}
          className={inputClass}
        />
      </AdminField>
      <div>
        <p className="mb-1 block text-xs text-zinc-400">Socials</p>
        <StreamingLinksEditor
          fieldName="socials"
          recordMode
          addLabel="+ Add social link"
          initialJson={JSON.stringify(partner.socials ?? {})}
        />
      </div>
      <AdminField id="edit-partner-order" label="Display order" labelClassName={labelClass}>
        <input
          id="edit-partner-order"
          name="display_order"
          type="number"
          defaultValue={partner.display_order}
          className={inputClass}
        />
      </AdminField>
      <MediaSourcePicker
        label="Logo"
        currentUrl={resolvedLogoUrl}
        currentStoragePath={partner.logo_storage_path}
        storagePrefix={`partners/logos/${partner.id}`}
        onResolved={(path) => {
          setLogoPath(path)
          setDirty(true)
          setError(null)
        }}
        onError={(msg) => setError(msg)}
      />
      <label htmlFor="edit-partner-logo-white" className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
        <input
          id="edit-partner-logo-white"
          type="checkbox"
          name="logo_white"
          value="true"
          defaultChecked={partner.logo_white !== false}
          className="h-5 w-5 min-h-[20px] min-w-[20px] rounded border-zinc-600"
        />
        White logo fill (default — silhouette to white; uncheck for colour or pre-whitened logos)
      </label>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded border border-zinc-700 text-zinc-300 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
