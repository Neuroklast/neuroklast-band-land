'use client'

import { useRouter } from 'next/navigation'
import { updateGig } from '@/app/admin/_actions/gigs'
import { useState } from 'react'
import { AdminField } from '@/app/admin/_components/AdminField'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { StreamingLinksEditor } from '@/app/admin/_components/StreamingLinksEditor'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { resolveImageUrl } from '@/lib/r2'

interface Props { gig: Record<string, unknown> }

const inputClass =
  'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none'

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
  }
  return []
}

export default function EditGigForm({ gig }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [photoPath, setPhotoPath] = useState<string | null>((gig.photo_storage_path as string) || null)
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set(
      'supporting_artists',
      JSON.stringify(asStringArray((formData.get('supporting_artists') as string | null)?.split('\n') ?? [])),
    )
    const eventLinksRaw = formData.get('event_links')
    if (eventLinksRaw && typeof eventLinksRaw === 'string' && eventLinksRaw.trim()) {
      formData.set('event_links', eventLinksRaw.trim())
    } else {
      formData.set('event_links', '{}')
    }
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

  const eventDate = gig.event_date
    ? new Date(gig.event_date as string).toISOString().slice(0, 16)
    : ''

  const currentPhoto = resolveImageUrl(
    (gig.photo_storage_path as string | null) ?? null,
    (gig.photo_url as string | null) ?? null,
  )

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="space-y-4">
      <AdminField id="edit-gig-title" label="Title *">
        <input id="edit-gig-title" name="title" required defaultValue={gig.title as string} className={inputClass} />
      </AdminField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminField id="edit-gig-venue" label="Venue">
          <input id="edit-gig-venue" name="venue" defaultValue={gig.venue as string ?? ''} className={inputClass} />
        </AdminField>
        <AdminField id="edit-gig-festival" label="Festival Name">
          <input id="edit-gig-festival" name="festival_name" defaultValue={gig.festival_name as string ?? ''} className={inputClass} />
        </AdminField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminField id="edit-gig-city" label="City">
          <input id="edit-gig-city" name="city" defaultValue={gig.city as string ?? ''} className={inputClass} />
        </AdminField>
        <AdminField id="edit-gig-country" label="Country">
          <input id="edit-gig-country" name="country" defaultValue={gig.country as string ?? ''} className={inputClass} />
        </AdminField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminField id="edit-gig-type" label="Gig type">
          <select id="edit-gig-type" name="gig_type" defaultValue={gig.gig_type as string ?? 'dj'} className={inputClass}>
            <option value="dj">DJ</option>
            <option value="concert">Concert</option>
          </select>
        </AdminField>
        <AdminField id="edit-gig-status" label="Status">
          <select id="edit-gig-status" name="status" defaultValue={gig.status as string ?? 'confirmed'} className={inputClass}>
            <option value="confirmed">Confirmed</option>
            <option value="announced">Announced</option>
            <option value="canceled">Canceled</option>
          </select>
        </AdminField>
      </div>
      <AdminField id="edit-gig-date" label="Date & Time *">
        <input id="edit-gig-date" name="event_date" type="datetime-local" required defaultValue={eventDate} className={inputClass} />
      </AdminField>
      <AdminField id="edit-gig-tickets" label="Ticket URL">
        <input id="edit-gig-tickets" name="ticket_url" type="url" defaultValue={gig.ticket_url as string ?? ''} className={inputClass} />
      </AdminField>
      <AdminField id="edit-gig-supporting" label="Supporting artists (one per line)">
        <textarea
          id="edit-gig-supporting"
          name="supporting_artists"
          rows={3}
          defaultValue={asStringArray(gig.supporting_artists).join('\n')}
          className={inputClass}
        />
      </AdminField>
      <div>
        <p className="mb-1 block text-sm text-zinc-300">Event links</p>
        <StreamingLinksEditor
          fieldName="event_links"
          recordMode
          addLabel="+ Add event link"
          initialJson={JSON.stringify((gig.event_links as Record<string, unknown>) ?? {})}
        />
      </div>
      <MediaSourcePicker
        label="Photo"
        storagePrefix="gigs"
        currentUrl={currentPhoto}
        onResolved={(path) => {
          setPhotoPath(path)
          setDirty(true)
        }}
        onError={setError}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors">Save Changes</button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm hover:text-white transition-colors">Cancel</button>
      </div>
    </form>
  )
}
