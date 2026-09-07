'use client'

import { useState } from 'react'
import { createMember } from '@/app/admin/_actions/members'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { useRouter } from 'next/navigation'

export default function MemberForm() {
  const router = useRouter()
  const [photoPath, setPhotoPath] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Name *</label>
          <input
            name="name"
            required
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Role</label>
          <input
            name="role"
            placeholder="Vocals, Guitar, …"
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Short bio</label>
        <textarea
          name="bio"
          rows={3}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none"
        />
      </div>
      <MediaSourcePicker
        label="Photo"
        storagePrefix="members/photos"
        onResolved={(path) => {
          setPhotoPath(path)
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
