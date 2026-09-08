'use client'

import { useRouter } from 'next/navigation'
import { createGig } from '@/app/admin/_actions/gigs'
import { useState } from 'react'
import { AdminField } from '@/app/admin/_components/AdminField'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { StreamingLinksEditor } from '@/app/admin/_components/StreamingLinksEditor'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'

const inputClass =
  'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none'

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
      <h1 className="text-xl font-bold mb-6">New Gig</h1>
      <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-4">
        <AdminField id="new-gig-title" label="Title *">
          <input id="new-gig-title" name="title" required className={inputClass} />
        </AdminField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminField id="new-gig-venue" label="Venue">
            <input id="new-gig-venue" name="venue" className={inputClass} />
          </AdminField>
          <AdminField id="new-gig-festival" label="Festival Name">
            <input id="new-gig-festival" name="festival_name" className={inputClass} />
          </AdminField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminField id="new-gig-city" label="City">
            <input id="new-gig-city" name="city" className={inputClass} />
          </AdminField>
          <AdminField id="new-gig-country" label="Country">
            <input id="new-gig-country" name="country" className={inputClass} />
          </AdminField>
        </div>
        <AdminField id="new-gig-date" label="Date & Time *">
          <input id="new-gig-date" name="event_date" type="datetime-local" required className={inputClass} />
        </AdminField>
        <AdminField id="new-gig-tickets" label="Ticket URL">
          <input id="new-gig-tickets" name="ticket_url" type="url" className={inputClass} />
        </AdminField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminField id="new-gig-type" label="Gig type">
            <select id="new-gig-type" name="gig_type" defaultValue="dj" className={inputClass}>
              <option value="dj">DJ</option>
              <option value="concert">Concert</option>
            </select>
          </AdminField>
          <AdminField id="new-gig-status" label="Status">
            <select id="new-gig-status" name="status" defaultValue="confirmed" className={inputClass}>
              <option value="confirmed">Confirmed</option>
              <option value="announced">Announced</option>
              <option value="canceled">Canceled</option>
            </select>
          </AdminField>
        </div>
        <AdminField id="new-gig-supporting" label="Supporting artists (one per line)">
          <textarea id="new-gig-supporting" name="supporting_artists" rows={3} className={inputClass} />
        </AdminField>
        <div>
          <p className="mb-1 block text-sm text-zinc-300">Event links</p>
          <StreamingLinksEditor fieldName="event_links" recordMode addLabel="+ Add event link" initialJson="{}" />
        </div>
        <MediaSourcePicker
          label="Photo"
          storagePrefix="gigs"
          onResolved={(path) => {
            setPhotoPath(path)
            setDirty(true)
          }}
          onError={setError}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors">Create Gig</button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm hover:text-white transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  )
}
