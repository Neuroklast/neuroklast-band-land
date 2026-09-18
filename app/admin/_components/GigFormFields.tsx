'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminField } from '@/app/admin/_components/AdminField'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { GIG_TYPE_OPTIONS, eventPageUrlFromLinks } from '@/lib/gig-public-mapper'
import { resolveImageUrl } from '@/lib/r2'

const inputClass =
  'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none min-h-[44px]'

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const LOCATION_DEBOUNCE_MS = 800

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
  }
  return []
}

function splitEventDateTime(iso: string): { date: string; time: string } {
  const trimmed = iso.trim()
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/)
  if (match) {
    return { date: match[1], time: match[2] === '00:00' ? '' : match[2] }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return { date: trimmed, time: '' }
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return { date: '', time: '' }
  const stamp = parsed.toISOString()
  const time = stamp.slice(11, 16)
  return { date: stamp.slice(0, 10), time: time === '00:00' ? '' : time }
}

function LocationOsmField({
  id,
  name,
  defaultValue,
}: {
  id: string
  name: string
  defaultValue?: string
}) {
  const [value, setValue] = useState(defaultValue ?? '')
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const validate = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!query.trim()) {
      setStatus('idle')
      return
    }
    setStatus('checking')
    timerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(
            `${NOMINATIM_SEARCH_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`,
            { headers: { Accept: 'application/json' } },
          )
          if (!res.ok) {
            setStatus('idle')
            return
          }
          const data: unknown = await res.json()
          setStatus(Array.isArray(data) && data.length > 0 ? 'ok' : 'bad')
        } catch {
          setStatus('idle')
        }
      })()
    }, LOCATION_DEBOUNCE_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const hint =
    status === 'checking'
      ? 'Checking OpenStreetMap…'
      : status === 'ok'
        ? 'OpenStreetMap found this place.'
        : status === 'bad'
          ? 'OpenStreetMap found nothing — add club name + street, ZIP, city, country.'
          : 'One line: club and address. Example: P8, Schauenburgstraße 5, 76135 Karlsruhe, Germany'

  return (
    <AdminField id={id} label="Location (club + address)">
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          validate(e.target.value)
        }}
        className={inputClass}
        placeholder="P8, Schauenburgstraße 5, 76135 Karlsruhe, Germany"
        autoComplete="off"
      />
      <p className={`mt-1 text-xs ${status === 'bad' ? 'text-amber-300' : 'text-zinc-500'}`}>{hint}</p>
    </AdminField>
  )
}

export function GigFormFields({
  gig,
  photoPath,
  onPhoto,
  onError,
}: {
  gig?: Record<string, unknown>
  photoPath: string | null
  onPhoto: (path: string) => void
  onError: (message: string) => void
}) {
  const eventName =
    (typeof gig?.festival_name === 'string' && gig.festival_name.trim()) ||
    (typeof gig?.title === 'string' ? gig.title : '')
  const locationDefault =
    (typeof gig?.venue === 'string' && gig.venue.trim()) ||
    [gig?.city, gig?.country].filter((part) => typeof part === 'string' && part.trim()).join(', ')
  const { date, time } = splitEventDateTime(
    typeof gig?.event_date === 'string' ? gig.event_date : '',
  )
  const eventUrl = eventPageUrlFromLinks(
    gig?.event_links && typeof gig.event_links === 'object' && !Array.isArray(gig.event_links)
      ? (gig.event_links as Record<string, unknown>)
      : null,
  )
  const currentPhoto = resolveImageUrl(
    photoPath ?? (typeof gig?.photo_storage_path === 'string' ? gig.photo_storage_path : null),
    typeof gig?.photo_url === 'string' ? gig.photo_url : null,
  )

  return (
    <>
      <AdminField id="gig-title" label="Event name *">
        <input
          id="gig-title"
          name="title"
          required
          defaultValue={eventName}
          className={inputClass}
          placeholder="Samhain Ritual"
        />
        <p className="mt-1 text-xs text-zinc-500">Shown large on the site. Club name does not go here.</p>
      </AdminField>

      <LocationOsmField id="gig-venue" name="venue" defaultValue={locationDefault} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminField id="gig-date" label="Date *">
          <input id="gig-date" name="event_date" type="date" required defaultValue={date} className={inputClass} />
        </AdminField>
        <AdminField id="gig-time" label="Time (optional)">
          <input id="gig-time" name="event_time" type="time" defaultValue={time} className={inputClass} />
        </AdminField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminField id="gig-type" label="Type">
          <select
            id="gig-type"
            name="gig_type"
            defaultValue={(typeof gig?.gig_type === 'string' && gig.gig_type) || 'gig'}
            className={inputClass}
          >
            {GIG_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField id="gig-status" label="Status">
          <select
            id="gig-status"
            name="status"
            defaultValue={(typeof gig?.status === 'string' && gig.status) || 'confirmed'}
            className={inputClass}
          >
            <option value="confirmed">Confirmed</option>
            <option value="announced">Announced</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </AdminField>
      </div>

      <AdminField id="gig-soldout" label="Ticket status">
        <label className="flex min-h-[44px] items-center gap-3 text-sm text-zinc-300">
          <input
            id="gig-soldout"
            name="sold_out"
            type="checkbox"
            defaultChecked={gig?.sold_out === true}
            className="h-4 w-4"
          />
          Sold out
        </label>
      </AdminField>

      <AdminField id="gig-tickets" label="Ticket link">
        <input
          id="gig-tickets"
          name="ticket_url"
          type="url"
          defaultValue={typeof gig?.ticket_url === 'string' ? gig.ticket_url : ''}
          className={inputClass}
          placeholder="https://"
        />
      </AdminField>

      <AdminField id="gig-page" label="Event page URL">
        <input
          id="gig-page"
          name="event_url"
          type="url"
          defaultValue={eventUrl ?? ''}
          className={inputClass}
          placeholder="https://club.example/event"
        />
      </AdminField>

      <AdminField id="gig-supporting" label="Supporting artists (optional, one per line)">
        <textarea
          id="gig-supporting"
          name="supporting_artists"
          rows={3}
          defaultValue={asStringArray(gig?.supporting_artists).join('\n')}
          className={inputClass}
        />
      </AdminField>

      <MediaSourcePicker
        label="Photo (optional)"
        storagePrefix="gigs"
        currentUrl={currentPhoto}
        onResolved={onPhoto}
        onError={onError}
      />
    </>
  )
}
