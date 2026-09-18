'use client'

import { useRouter } from 'next/navigation'
import { updateGig } from '@/app/admin/_actions/gigs'
import { useState } from 'react'
import { GigFormFields } from '@/app/admin/_components/GigFormFields'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'

interface Props { gig: Record<string, unknown> }

export default function EditGigForm({ gig }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [photoPath, setPhotoPath] = useState<string | null>(
    typeof gig.photo_storage_path === 'string' ? gig.photo_storage_path : null,
  )
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (photoPath) {
      formData.set('photo_storage_path', photoPath)
      formData.set('photo_url', '')
    }
    const result = await updateGig(gig.id as string, formData)
    if (result?.error) setError(result.error)
    else {
      setDirty(false)
      router.push('/admin/gigs')
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-4">
      <GigFormFields
        gig={gig}
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
          Save changes
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
