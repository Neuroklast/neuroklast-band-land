'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateMember } from '@/app/admin/_actions/members'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'

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

export function EditMemberForm({ member, resolvedPhotoUrl }: EditMemberFormProps) {
  const router = useRouter()
  const [photoPath, setPhotoPath] = useState(member.photo_storage_path ?? '')
  const [error, setError] = useState<string | null>(null)

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
      router.push('/admin/members')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Name *</label>
          <input
            name="name"
            required
            defaultValue={member.name}
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Role</label>
          <input
            name="role"
            defaultValue={member.role ?? ''}
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Short bio</label>
        <textarea
          name="bio"
          rows={4}
          defaultValue={member.bio ?? ''}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Display order</label>
        <input
          name="display_order"
          type="number"
          defaultValue={member.display_order}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input type="checkbox" name="active" value="true" defaultChecked={member.active} />
        Visible on site
      </label>
      <MediaSourcePicker
        label="Photo"
        storagePrefix="members/photos"
        currentUrl={resolvedPhotoUrl}
        onResolved={(path) => {
          setPhotoPath(path)
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
