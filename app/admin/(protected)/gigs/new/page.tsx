'use client'

import { useRouter } from 'next/navigation'
import { createGig } from '@/app/admin/_actions/gigs'
import { useState } from 'react'
import { GigFormFields } from '@/app/admin/_components/GigFormFields'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'

export default function NewGigPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [photoPath, setPhotoPath] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (photoPath) formData.set('photo_storage_path', photoPath)
    const result = await createGig(formData)
    if (result?.error) setError(result.error)
    else {
      setDirty(false)
      router.push('/admin/gigs')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-6">New event</h1>
      <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-4">
        <GigFormFields
          photoPath={photoPath}
          onPhoto={(path) => {
            setPhotoPath(path)
            setDirty(true)
          }}
          onError={setError}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors">
            Create event
          </button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
