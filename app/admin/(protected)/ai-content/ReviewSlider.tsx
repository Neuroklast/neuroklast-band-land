'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { ArrowRight, ArrowCounterClockwise, Check, X, Warning, CaretDown } from '@phosphor-icons/react'
import { reviewMcpContent } from '@/app/admin/_actions/mcpContent'

export type ContentReviewRow = {
  id: string
  collection: string
  operation: string
  target_id: string | null
  target_key: string | null
  changes: unknown
  previous_snapshot: unknown
  status: string
  created_at: string
  requested_by: string
  reviewed_at: string | null
  error: string | null
}

const ADMIN_PATHS: Record<string, string> = {
  news_posts: 'news', gigs: 'gigs', releases: 'releases', bio: 'bio',
  members: 'members', gallery: 'gallery', media_downloads: 'media',
  partners: 'partners', social_links: 'social', music_highlights: 'music-highlights',
  merchandise: 'merchandise', products: 'plugins', soundpacks: 'soundpacks',
}

const FIELD_NAMES: Record<string, string> = {
  type: 'Release type',
  streaming_links: 'Streaming platforms',
  custom_links: 'Other links',
  release_date: 'Release date',
  cover_storage_path: 'Cover artwork',
  display_order: 'Display order',
  event_date: 'Event date',
  published_at: 'Publication date',
  active: 'Visible on website',
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {}
}

function fieldLabel(field: string) {
  return FIELD_NAMES[field] ?? field.replaceAll('_', ' ').replace(/(^|\s)\S/g, (part) => part.toUpperCase())
}

function safeUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

function Value({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === undefined || value === null || value === '') {
    return <span className="italic text-zinc-600">Not set</span>
  }
  if (typeof value === 'boolean') return <span>{value ? 'Yes' : 'No'}</span>
  if (typeof value === 'string' || typeof value === 'number') {
    const text = String(value)
    const url = typeof value === 'string' ? safeUrl(text) : null
    return url ? (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="break-all text-red-300 underline decoration-red-500/40 hover:text-red-200">{text}</a>
    ) : <span className="whitespace-pre-wrap break-words">{text}</span>
  }
  if (Array.isArray(value)) {
    if (!value.length) return <span className="italic text-zinc-600">Empty</span>
    return <ul className="space-y-2">
      {value.map((item, index) => (
        <li key={index} className="rounded-md border border-zinc-800/70 bg-black/20 px-3 py-2">
          <Value value={item} depth={depth + 1} />
        </li>
      ))}
    </ul>
  }
  if (depth > 4) return <span className="text-zinc-500">See technical details</span>
  return <dl className="space-y-1.5">
    {Object.entries(record(value)).map(([key, item]) => (
      <div key={key} className="flex flex-wrap items-start gap-x-2">
        <dt className="text-zinc-500">{fieldLabel(key)}:</dt>
        <dd className="min-w-0 flex-1 text-zinc-200"><Value value={item} depth={depth + 1} /></dd>
      </div>
    ))}
  </dl>
}

function proposalTitle(row: ContentReviewRow) {
  const after = record(row.changes)
  const before = record(row.previous_snapshot)
  const title = after.title ?? after.name ?? before.title ?? before.name
  if (typeof title === 'string' && title.trim()) return title
  if (row.target_key) return fieldLabel(row.target_key)
  return fieldLabel(row.collection)
}

function ChangeFields({ item }: { item: ContentReviewRow }) {
  const changed = Object.entries(record(item.changes))
  const previous = item.operation === 'config' ? record(record(item.previous_snapshot).value) : record(item.previous_snapshot)
  if (item.operation === 'delete') {
    return <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-4">
      <p className="mb-3 text-sm font-medium text-red-300">This record will be permanently deleted.</p>
      <Value value={previous} />
      <p className="mt-3 text-xs text-zinc-400">Reason: {String(record(item.changes).reason ?? 'Not supplied')}</p>
    </div>
  }
  if (!changed.length) return <p className="text-sm text-zinc-500">No changes supplied.</p>
  return <div className="space-y-3">
    {changed.map(([field, value]) => (
      <section key={field} className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/70">
        <h3 className="border-b border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
          {fieldLabel(field)}
        </h3>
        <div className="grid gap-px bg-zinc-800 md:grid-cols-2">
          {item.operation !== 'create' ? (
            <div className="min-w-0 bg-zinc-950 px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase text-zinc-500">Before</p>
              <div className="max-h-44 overflow-y-auto text-sm text-zinc-400"><Value value={previous[field]} /></div>
            </div>
          ) : null}
          <div className="min-w-0 bg-zinc-950 px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase text-red-400">Proposed</p>
            <div className="max-h-44 overflow-y-auto text-sm text-zinc-100"><Value value={value} /></div>
          </div>
        </div>
      </section>
    ))}
  </div>
}

export function ReviewSlider({
  initialPending,
  recentDecisions,
}: {
  initialPending: ContentReviewRow[]
  recentDecisions: ContentReviewRow[]
}) {
  const router = useRouter()
  const [reviewedIds, setReviewedIds] = useState<string[]>([])
  const queue = useMemo(() => initialPending.filter((row) => !reviewedIds.includes(row.id)), [initialPending, reviewedIds])
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const startTouch = useRef<{ x: number; y: number } | null>(null)

  const activeIndex = queue.length ? Math.min(index, queue.length - 1) : 0
  const active = queue[activeIndex]
  const navigate = useCallback((direction: number) => {
    if (busy || queue.length <= 1) return
    setIndex((current) => (current + direction + queue.length) % queue.length)
    setMessage(null)
  }, [busy, queue.length])

  useEffect(() => {
    setConfirmDelete(false)
  }, [active?.id])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.target instanceof HTMLElement &&
        (event.target.closest('button, a, input, textarea, select, summary, [contenteditable="true"]'))) return
      if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1) }
      if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    if (touch) startTouch.current = { x: touch.clientX, y: touch.clientY }
  }
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = startTouch.current
    const touch = event.changedTouches[0]
    startTouch.current = null
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) {
      navigate(dx < 0 ? 1 : -1)
    }
  }

  const decide = async (decision: 'approve' | 'reject') => {
    if (!active || busy) return
    if (active.operation === 'delete' && decision === 'approve' && !confirmDelete) {
      setConfirmDelete(true)
      return
    }
    const id = active.id
    setBusy(true)
    setMessage(null)
    try {
      const result = await reviewMcpContent(id, decision)
      if (!result.success) {
        setMessage({ kind: 'error', text: result.error ?? 'The decision could not be saved. Nothing was applied.' })
        return
      }
      setReviewedIds((ids) => [...ids, id])
      setIndex((current) => Math.min(current, Math.max(0, queue.length - 2)))
      setMessage({ kind: 'success', text: decision === 'approve' ? 'Change approved and applied.' : 'Proposal rejected.' })
      router.refresh()
    } catch {
      setMessage({ kind: 'error', text: 'The review request could not be completed. Check your connection and refresh the page to confirm its status.' })
    } finally {
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  return <div className="space-y-5">
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Review queue</p>
          <p className="mt-1 text-lg font-semibold text-white" aria-live="polite">
            {queue.length ? String(activeIndex + 1) + ' / ' + String(queue.length) : 'All caught up'}
          </p>
        </div>
        <p className="text-xs text-zinc-500">Swipe to navigate · Arrow keys: Back / Skip</p>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800" role="progressbar"
        aria-label="Position in review queue" aria-valuemin={0}
        aria-valuemax={Math.max(queue.length, 1)} aria-valuenow={queue.length ? activeIndex + 1 : 0}>
        <div className="h-full rounded-full bg-red-600 transition-[width] duration-200"
          style={{ width: queue.length ? String(((activeIndex + 1) / queue.length) * 100) + '%' : '0%' }} />
      </div>
    </div>

    {message ? <div role="status" className={message.kind === 'error'
      ? 'rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-200'
      : 'rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-200'}>{message.text}</div> : null}

    {active ? (
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="touch-pan-y">
        <article key={active.id} className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/70 shadow-xl shadow-black/20">
          <header className="border-b border-zinc-800 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={active.operation === 'delete'
                ? 'rounded bg-red-950 px-2 py-1 font-semibold uppercase text-red-300'
                : 'rounded bg-zinc-800 px-2 py-1 font-semibold uppercase text-zinc-300'}>
                {active.operation}
              </span>
              <span className="rounded border border-zinc-700 px-2 py-1 text-zinc-400">{fieldLabel(active.collection)}</span>
              <time className="ml-auto text-zinc-500" dateTime={active.created_at}>
                {new Date(active.created_at).toLocaleString('de-DE')}
              </time>
            </div>
            <h2 className="mt-4 break-words text-xl font-bold sm:text-2xl">{proposalTitle(active)}</h2>
            {active.target_id && ADMIN_PATHS[active.collection] ? (
              <Link href={'/admin/' + ADMIN_PATHS[active.collection] + '/' + active.target_id}
                className="mt-2 inline-block text-xs text-zinc-400 underline hover:text-white">
                Open existing item
              </Link>
            ) : null}
            {active.target_key ? <p className="mt-2 text-xs text-zinc-500">Site key: {active.target_key}</p> : null}
          </header>
          <div className="p-4 sm:p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {active.operation === 'delete' ? 'Record to delete' : 'Changes to review'}
            </p>
            <ChangeFields item={active} />
            <details className="mt-5 rounded-lg border border-zinc-800">
              <summary className="flex cursor-pointer items-center gap-2 p-3 text-xs text-zinc-400 hover:text-white">
                <CaretDown size={14} aria-hidden="true" /> Technical JSON details
              </summary>
              <div className="space-y-3 border-t border-zinc-800 p-3">
                {active.previous_snapshot != null ? (
                  <div><p className="mb-2 text-xs font-semibold text-zinc-500">Previous snapshot</p>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded bg-black/60 p-3 text-xs">{JSON.stringify(active.previous_snapshot, null, 2)}</pre>
                  </div>
                ) : null}
                <div><p className="mb-2 text-xs font-semibold text-zinc-500">Proposed payload</p>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded bg-black/60 p-3 text-xs">{JSON.stringify(active.changes, null, 2)}</pre>
                </div>
              </div>
            </details>
          </div>
          {confirmDelete ? (
            <div role="alert" className="mx-4 mb-4 rounded-lg border border-red-700 bg-red-950/40 p-4 text-sm text-red-200 sm:mx-6">
              <div className="flex items-center gap-2 font-semibold"><Warning size={18} /> Permanent deletion</div>
              <p className="mt-2">This deletes the database record and cannot be undone in this review screen. Referenced R2 files are not automatically deleted.</p>
              <button type="button" onClick={() => setConfirmDelete(false)} className="mt-3 underline" disabled={busy}>Cancel deletion</button>
            </div>
          ) : null}
          <footer className="flex flex-wrap items-center gap-2 border-t border-zinc-800 bg-zinc-950/40 p-4 sm:p-5">
            <button type="button" onClick={() => navigate(-1)} disabled={busy || queue.length <= 1}
              aria-label="Back to previous proposal"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">
              <ArrowCounterClockwise size={17} /> Back
            </button>
            <div className="flex-1" />
            <button type="button" onClick={() => void decide('reject')} disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-900/70 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/50 disabled:opacity-40">
              <X size={17} /> Reject
            </button>
            <button type="button" onClick={() => void decide('approve')} disabled={busy}
              className={confirmDelete
                ? 'inline-flex min-h-11 items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-40'
                : 'inline-flex min-h-11 items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white disabled:opacity-40'}>
              <Check size={17} /> {busy ? 'Saving…' : confirmDelete ? 'Confirm delete' : active.operation === 'delete' ? 'Review delete' : 'Accept'}
            </button>
            <button type="button" onClick={() => navigate(1)} disabled={busy || queue.length <= 1}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">
              Skip <ArrowRight size={17} />
            </button>
          </footer>
        </article>
        <p className="mt-3 text-center text-xs text-zinc-500">
          Back and Skip only navigate. Accept and Reject are saved immediately and cannot be undone here.
        </p>
      </div>
    ) : (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-16 text-center">
        <Check className="mx-auto mb-3 h-9 w-9 text-zinc-400" />
        <p className="text-lg font-semibold">No proposals waiting</p>
        <p className="mt-2 text-sm text-zinc-500">New AI proposals will appear here for your approval.</p>
        <button type="button" className="mt-5 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          onClick={() => router.refresh()}>Refresh queue</button>
      </div>
    )}

    {recentDecisions.length > 0 ? (
      <details className="rounded-xl border border-zinc-800 bg-zinc-900/30">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-zinc-300">
          Recent decisions ({recentDecisions.length})
        </summary>
        <ul className="space-y-1 border-t border-zinc-800 p-3">
          {recentDecisions.map((item) => (
            <li key={item.id} className="rounded-md px-3 py-2 text-xs text-zinc-400">
              <span className="font-medium text-zinc-200">{proposalTitle(item)}</span>
              <span className="ml-2">{item.operation} · {item.status}</span>
              {item.error ? <p className="mt-1 text-red-300">{item.error}</p> : null}
            </li>
          ))}
        </ul>
      </details>
    ) : null}
  </div>
}
