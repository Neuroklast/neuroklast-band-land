'use client'

import { useRouter } from 'next/navigation'
import { updateGig } from '@/app/admin/_actions/gigs'
import { useState } from 'react'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { resolveImageUrl } from '@/lib/r2'

interface Props { gig: Record<string, unknown> }

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
    else router.push('/admin/gigs')
  }

  const eventDate = gig.event_date
    ? new Date(gig.event_date as string).toISOString().slice(0, 16)
    : ''

  const currentPhoto = resolveImageUrl(
    (gig.photo_storage_path as string | null) ?? null,
    (gig.photo_url as string | null) ?? null,
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Title *</label>
        <input name="title" required defaultValue={gig.title as string} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Venue</label>
          <input name="venue" defaultValue={gig.venue as string ?? ''} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Festival Name</label>
          <input name="festival_name" defaultValue={gig.festival_name as string ?? ''} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-300 mb-1">City</label>
          <input name="city" defaultValue={gig.city as string ?? ''} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Country</label>
          <input name="country" defaultValue={gig.country as string ?? ''} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Gig type</label>
          <select name="gig_type" defaultValue={gig.gig_type as string ?? 'dj'} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none">
            <option value="dj">DJ</option>
            <option value="concert">Concert</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Status</label>
          <select name="status" defaultValue={gig.status as string ?? 'confirmed'} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none">
            <option value="confirmed">Confirmed</option>
            <option value="announced">Announced</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Date & Time *</label>
        <input name="event_date" type="datetime-local" required defaultValue={eventDate} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Ticket URL</label>
        <input name="ticket_url" type="url" defaultValue={gig.ticket_url as string ?? ''} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Supporting artists (one per line)</label>
        <textarea
          name="supporting_artists"
          rows={3}
          defaultValue={asStringArray(gig.supporting_artists).join('\n')}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Event links (JSON)</label>
        <textarea
          name="event_links"
          rows={3}
          defaultValue={JSON.stringify((gig.event_links as Record<string, unknown>) ?? {}, null, 2)}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm font-mono focus:outline-none"
        />
      </div>
      <MediaSourcePicker
        label="Photo"
        storagePrefix="gigs"
        currentUrl={currentPhoto}
        onResolved={(path) => setPhotoPath(path)}
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
