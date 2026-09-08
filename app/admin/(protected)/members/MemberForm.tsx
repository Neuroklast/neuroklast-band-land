'use client'

import { useState } from 'react'
import { createMember } from '@/app/admin/_actions/members'
import { AdminField } from '@/app/admin/_components/AdminField'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { useRouter } from 'next/navigation'

const inputClass =
  'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none'
const labelClass = 'mb-1 block text-xs text-zinc-400'

export default function MemberForm() {
  const router = useRouter()
  const [photoPath, setPhotoPath] = useState('')
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
    const result = await createMember(formData)
    if (result?.error) setError(result.error)
    else {
      ;(e.target as HTMLFormElement).reset()
      setPhotoPath('')
      setError(null)
      setDirty(false)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AdminField id="member-name" label="Name *" labelClassName={labelClass}>
          <input id="member-name" name="name" required className={inputClass} />
        </AdminField>
        <AdminField id="member-role" label="Role" labelClassName={labelClass}>
          <input id="member-role" name="role" placeholder="Vocals, Guitar, …" className={inputClass} />
        </AdminField>
      </div>
      <AdminField id="member-bio" label="Short bio" labelClassName={labelClass}>
        <textarea id="member-bio" name="bio" rows={3} className={inputClass} />
      </AdminField>
      <MediaSourcePicker
        label="Photo"
        storagePrefix="members/photos"
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
        className="px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors"
      >
        Add Member
      </button>
    </form>
  )
}
