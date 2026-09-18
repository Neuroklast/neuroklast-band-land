'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateMember } from '@/app/admin/_actions/members'
import { AdminField } from '@/app/admin/_components/AdminField'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'

interface EditMemberFormProps {
  member: {
    id: string
    name: string
    role: string | null
    bio: string | null
    photo_storage_path: string | null
    display_order: number
    active: boolean
  }
  resolvedPhotoUrl?: string | null
}

const inputClass = 'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm'
const labelClass = 'mb-1 block text-xs text-zinc-400'

export function EditMemberForm({ member, resolvedPhotoUrl }: EditMemberFormProps) {
  const router = useRouter()
  const [photoPath, setPhotoPath] = useState(member.photo_storage_path ?? '')
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (photoPath) {
      formData.set('photo_storage_path', photoPath)
      formData.set('photo_url', '')
    }
    const result = await updateMember(member.id, formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setDirty(false)
      router.push('/admin/members')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-4 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AdminField id="edit-member-name" label="Name *" labelClassName={labelClass}>
          <input id="edit-member-name" name="name" required defaultValue={member.name} className={inputClass} />
        </AdminField>
        <AdminField id="edit-member-role" label="Role" labelClassName={labelClass}>
          <input id="edit-member-role" name="role" defaultValue={member.role ?? ''} className={inputClass} />
        </AdminField>
      </div>
      <AdminField id="edit-member-bio" label="Short bio" labelClassName={labelClass}>
        <textarea id="edit-member-bio" name="bio" rows={4} defaultValue={member.bio ?? ''} className={inputClass} />
      </AdminField>
      <AdminField id="edit-member-order" label="Display order" labelClassName={labelClass}>
        <input
          id="edit-member-order"
          name="display_order"
          type="number"
          defaultValue={member.display_order}
          className={inputClass}
        />
      </AdminField>
      <label htmlFor="edit-member-active" className="flex items-center gap-2 text-xs text-zinc-400">
        <input id="edit-member-active" type="checkbox" name="active" value="true" defaultChecked={member.active} />
        Visible on site
      </label>
      <MediaSourcePicker
        label="Photo"
        storagePrefix="members/photos"
        currentUrl={resolvedPhotoUrl}
        onResolved={(path) => {
          setPhotoPath(path)
          setDirty(true)
          setError(null)
        }}
        onError={(msg) => setError(msg)}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        className="px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm"
      >
        Save
      </button>
    </form>
  )
}
