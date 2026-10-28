'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { ArrowRight, ArrowCounterClockwise, Check, X, Warning, CaretDown, ArrowsOut, ClockCounterClockwise } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

/** Show the effective result of approval, not the older queued active=false payload. */
function effectiveReviewChanges(item: ContentReviewRow): Record<string, unknown> {
  const changes = record(item.changes)
  return item.collection === 'releases' && item.operation === 'create'
    ? { ...changes, active: true }
    : changes
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
  const changed = Object.entries(effectiveReviewChanges(item))
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
        <div className={item.operation === 'create' ? 'bg-zinc-950' : 'grid gap-px bg-zinc-800 md:grid-cols-2'}>
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


/** A compact, intentionally lossy label for the fixed-height review preview.
 * The complete, unabridged payload is always available in the details dialog. */
function previewValue(value: unknown): string {
  if (value == null || value === '') return 'Not set'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    const url = safeUrl(value)
    if (url) {
      try { return new URL(url).hostname.replace(/^www\./, '') }
      catch { return value }
    }
    return value
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Empty list'
    const names = value.slice(0, 2).map((entry) => {
      if (typeof entry === 'string') return entry
      const obj = record(entry)
      return [obj.title, obj.name, obj.platform, obj.label].find((v) => typeof v === 'string') ??
        (typeof obj.url === 'string' ? previewValue(obj.url) : 'Item')
    })
    return value.length + ' items: ' + names.join(', ') + (value.length > 2 ? '…' : '')
  }
  const object = record(value)
  const keys = Object.keys(object)
  return keys.length === 0 ? 'Empty object' : keys.length + ' properties'
}

function ChangesPreview({ item }: { item: ContentReviewRow }) {
  const changed = Object.entries(record(item.changes))
  if (item.operation === 'delete') {
    return (
      <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-4">
        <p className="text-sm font-semibold text-red-300">Permanent removal of this record</p>
        <p className="mt-1 line-clamp-2 text-xs text-zinc-300">
          Reason: {String(record(item.changes).reason ?? 'Not supplied')}
        </p>
        <p className="mt-2 text-xs text-zinc-500">Review the complete record before confirming.</p>
      </div>
    )
  }
  const before = item.operation === 'config'
    ? record(record(item.previous_snapshot).value)
    : record(item.previous_snapshot)
  // The title is already visible in the proposal header; prioritize other changes.
  const fields = changed.filter(([key]) => key !== 'title' && key !== 'name')
  const highlights = (fields.length ? fields : changed).slice(0, 4)
  if (!highlights.length) return <p className="text-sm text-zinc-500">No changes supplied.</p>

  return (
    <div className="grid min-h-0 content-start gap-2 overflow-hidden md:grid-cols-2" aria-label="Change highlights">
      {highlights.map(([field, value], index) => (
        <div key={field} className={[
          'min-w-0 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2',
          index >= 2 ? 'hidden md:block' : '',
        ].join(' ')}>
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{fieldLabel(field)}</p>
          {item.operation !== 'create' ? (
            <p className="mt-1 truncate text-xs text-zinc-500">
              <span className="sr-only">Before: </span>{previewValue(before[field])}
            </p>
          ) : null}
          <p className="mt-1 truncate text-sm font-medium text-zinc-100" title={previewValue(value)}>
            <span className="sr-only">Proposed: </span>
            {item.operation === 'create' ? '' : '→ '}{previewValue(value)}
          </p>
        </div>
      ))}
    </div>
  )
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
  const [confirmDeleteFor, setConfirmDeleteFor] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const startTouch = useRef<{ x: number; y: number } | null>(null)

  const activeIndex = queue.length ? Math.min(index, queue.length - 1) : 0
  const active = queue[activeIndex]
  const confirmDelete = confirmDeleteFor === active?.id
  const changeCount = active ? Object.keys(effectiveReviewChanges(active)).length : 0

  const navigate = useCallback((direction: number) => {
    if (busy || queue.length <= 1 || detailsOpen || historyOpen || confirmDeleteFor) return
    setIndex((current) => (current + direction + queue.length) % queue.length)
    setMessage(null)
  }, [busy, queue.length, detailsOpen, historyOpen, confirmDeleteFor])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.target instanceof HTMLElement &&
        event.target.closest('button, a, input, textarea, select, summary, [contenteditable="true"]')) return
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
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) navigate(dx < 0 ? 1 : -1)
  }

  const decide = async (decision: 'approve' | 'reject') => {
    if (!active || busy) return
    if (active.operation === 'delete' && decision === 'approve' && !confirmDelete) {
      setConfirmDeleteFor(active.id)
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
      setMessage({ kind: 'error', text: 'Review could not be completed. Check your connection and refresh to verify its status.' })
    } finally {
      setBusy(false)
      setConfirmDeleteFor(null)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-100" aria-live="polite">
            {queue.length ? (activeIndex + 1) + ' / ' + queue.length : 'All reviewed'}
          </span>
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-800"
            role="progressbar" aria-label="Position in review queue"
            aria-valuemin={0} aria-valuemax={Math.max(queue.length, 1)}
            aria-valuenow={queue.length ? activeIndex + 1 : 0}>
            <div className="h-full rounded-full bg-red-600 transition-[width] duration-200"
              style={{ width: queue.length ? ((activeIndex + 1) / queue.length) * 100 + '%' : '0%' }} />
          </div>
          <button type="button" onClick={() => setHistoryOpen(true)} disabled={!recentDecisions.length}
            className="inline-flex shrink-0 items-center gap-1.5 text-xs text-zinc-400 hover:text-white disabled:opacity-40">
            <ClockCounterClockwise size={16} /> History
          </button>
        </div>
      </div>

      {active ? (
        <article key={active.id} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          className="flex min-h-0 flex-1 touch-pan-y flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/70 shadow-xl shadow-black/20">
          <header className="shrink-0 border-b border-zinc-800 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={active.operation === 'delete'
                ? 'rounded bg-red-950 px-2 py-0.5 font-semibold uppercase text-red-300'
                : 'rounded bg-zinc-800 px-2 py-0.5 font-semibold uppercase text-zinc-300'}>{active.operation}</span>
              <span className="rounded border border-zinc-700 px-2 py-0.5 text-zinc-400">{fieldLabel(active.collection)}</span>
              <time className="ml-auto text-zinc-500" dateTime={active.created_at}>
                {new Date(active.created_at).toLocaleString('de-DE')}
              </time>
            </div>
            <h2 className="mt-2 line-clamp-2 break-words text-base font-bold sm:text-xl">{proposalTitle(active)}</h2>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-3 sm:px-5">
            {message ? <div role="status" className={message.kind === 'error'
              ? 'shrink-0 rounded border border-red-800 bg-red-950/30 px-3 py-2 text-xs text-red-200'
              : 'shrink-0 rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-200'}>
              {message.text}
            </div> : null}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Change highlights
              </p>
              {active.collection === 'releases' && active.operation === 'create' ? (
                <span className="text-[11px] font-medium text-emerald-300">Visible after Accept</span>
              ) : null}
              <button type="button" onClick={() => setDetailsOpen(true)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800">
                <ArrowsOut size={14} /> Review all {changeCount} {changeCount === 1 ? 'field' : 'fields'}
              </button>
            </div>
            <ChangesPreview item={active} />
            <p className="mt-auto shrink-0 text-[11px] text-zinc-500">
              Full values and before/after comparison are available in Review all.
            </p>
          </div>

          <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-950/50 p-3 sm:grid-cols-4 sm:px-5"
            aria-label="Review actions">
            <button type="button" onClick={() => navigate(-1)} disabled={busy || queue.length <= 1}
              aria-label="Back to previous proposal"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">
              <ArrowCounterClockwise size={17} /> Back
            </button>
            <button type="button" onClick={() => void decide('reject')} disabled={busy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-900/70 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/50 disabled:opacity-40">
              <X size={17} /> Reject
            </button>
            <button type="button" onClick={() => void decide('approve')} disabled={busy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-white disabled:opacity-40">
              <Check size={17} /> {busy ? 'Saving…' : active.operation === 'delete' ? 'Review delete' : 'Accept'}
            </button>
            <button type="button" onClick={() => navigate(1)} disabled={busy || queue.length <= 1}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">
              Skip <ArrowRight size={17} />
            </button>
          </footer>
        </article>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
          <Check className="mb-3 h-9 w-9 text-zinc-400" />
          <p className="text-lg font-semibold">No proposals waiting</p>
          <p className="mt-2 text-sm text-zinc-500">New AI proposals will appear here for your approval.</p>
          {message ? <p role="status" className="mt-2 text-xs text-zinc-300">{message.text}</p> : null}
          <button type="button" className="mt-5 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            onClick={() => router.refresh()}>Refresh queue</button>
        </div>
      )}

      <Dialog open={detailsOpen && !!active} onOpenChange={setDetailsOpen}>
        <DialogContent className="flex max-h-[90dvh] w-[min(96vw,980px)] max-w-5xl flex-col gap-0 overflow-hidden border-zinc-700 bg-zinc-950 p-0 text-zinc-100">
          <DialogHeader className="shrink-0 border-b border-zinc-800 px-5 py-4 pr-12">
            <DialogTitle>Complete proposal: {active ? proposalTitle(active) : ''}</DialogTitle>
            <p className="text-xs text-zinc-400">Review all fields before accepting or rejecting. The content is not changed by opening this view.</p>
            {active?.collection === 'releases' && active.operation === 'create' ? (
              <p className="text-xs text-emerald-300">This release becomes publicly visible after Accept. Older proposals may still contain active=false in their original technical JSON.</p>
            ) : null}
          </DialogHeader>
          {active ? <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5" data-testid="review-details-scroll">
            {active.target_id && ADMIN_PATHS[active.collection] ? (
              <Link href={'/admin/' + ADMIN_PATHS[active.collection] + '/' + active.target_id}
                className="inline-block text-xs text-zinc-400 underline hover:text-white">Open existing item</Link>
            ) : null}
            {active.target_key ? <p className="text-xs text-zinc-500">Site key: {active.target_key}</p> : null}
            <ChangeFields item={active} />
            <details className="rounded-lg border border-zinc-800">
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
          </div> : null}
          <div className="shrink-0 border-t border-zinc-800 p-3 text-right">
            <button type="button" onClick={() => setDetailsOpen(false)}
              className="min-h-11 rounded-lg border border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-800">Close details</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDeleteFor(null) }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto border-red-900 bg-zinc-950 text-zinc-100">
          <DialogHeader><DialogTitle>Confirm permanent deletion</DialogTitle></DialogHeader>
          <div role="alert" className="rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm text-red-200">
            <div className="flex items-center gap-2 font-semibold"><Warning size={18} /> Permanent deletion</div>
            <p className="mt-2">This deletes {active ? proposalTitle(active) : 'the record'} from the database. It cannot be undone here. Referenced R2 files are not automatically removed.</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" disabled={busy} onClick={() => setConfirmDeleteFor(null)}
              className="min-h-11 rounded-lg border border-zinc-700 px-4 py-2 text-sm">Cancel deletion</button>
            <button type="button" disabled={busy} onClick={() => void decide('approve')}
              className="min-h-11 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
              {busy ? 'Deleting…' : 'Confirm delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="flex max-h-[85dvh] w-[min(96vw,720px)] max-w-3xl flex-col overflow-hidden border-zinc-700 bg-zinc-950 text-zinc-100">
          <DialogHeader><DialogTitle>Recent decisions ({recentDecisions.length})</DialogTitle></DialogHeader>
          <ul className="min-h-0 space-y-2 overflow-y-auto">
            {recentDecisions.map((item) => (
              <li key={item.id} className="rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400">
                <span className="font-medium text-zinc-200">{proposalTitle(item)}</span>
                <span className="ml-2">{item.operation} · {item.status}</span>
                {item.error ? <p className="mt-1 text-red-300">{item.error}</p> : null}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  )
}
