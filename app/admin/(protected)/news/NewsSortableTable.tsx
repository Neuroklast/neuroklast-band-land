'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DotsSixVertical } from '@phosphor-icons/react'
import { deleteNewsPost, reorderNewsPosts, toggleNewsPostVisibility } from '@/app/admin/_actions/news'
import { ConfirmDeleteButton } from '@/app/admin/_components/ConfirmDeleteButton'
import { resolveImageUrl } from '@/lib/r2'
import { toDirectImageUrl } from '@/lib/image-cache'
import { NewsShareActions } from '@/components/news/NewsShareActions'
import { sanitizeExternalHref } from '@/lib/sanitize-href'

export interface NewsAdminRow {
  id: string
  title: string
  slug: string
  link: string | null
  excerpt: string | null
  cover_storage_path: string | null
  cover_url: string | null
  published_at: string | null
  active: boolean
  display_order: number
}

function NewsSortableRow({
  post,
  disabled,
  onToggle,
  onDelete,
}: {
  post: NewsAdminRow
  disabled: boolean
  onToggle: (post: NewsAdminRow) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: post.id,
    disabled,
  })
  const cover = resolveImageUrl(post.cover_storage_path, post.cover_url)
  const externalHref = sanitizeExternalHref(post.link)
  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
      }}
      className={'border-b border-zinc-800/50 ' + (isDragging ? 'bg-zinc-900 shadow-lg' : 'bg-zinc-950')}
      data-testid={'news-row-' + post.id}
    >
      <td className="py-2 pr-2">
        <button type="button" {...attributes} {...listeners} disabled={disabled}
          aria-label={'Drag to reorder ' + post.title}
          title="Drag to reorder. Space and arrow keys also work."
          className="inline-flex size-10 touch-none cursor-grab items-center justify-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40">
          <DotsSixVertical size={20} weight="bold" aria-hidden="true" />
        </button>
      </td>
      <td className="py-2 pr-4">
        <div className="relative size-12 overflow-hidden rounded bg-zinc-800">
          {cover ? <img src={toDirectImageUrl(cover, { w: 96 }) || cover}
            alt="" className="h-full w-full object-cover" /> : null}
        </div>
      </td>
      <td className="py-2 pr-4 font-medium text-zinc-200">{post.title}</td>
      <td className="py-2 pr-4 font-mono text-xs text-zinc-500">{post.slug}</td>
      <td className="py-2 pr-4 text-xs">
        {externalHref ? (
          <a href={externalHref} target="_blank" rel="noopener noreferrer"
            className="inline-block max-w-44 truncate align-middle text-zinc-300 underline hover:text-white"
            title={externalHref}>{new URL(externalHref).hostname}</a>
        ) : <span className="text-zinc-600">—</span>}
      </td>
      <td className="py-2 pr-4 text-zinc-400">
        {post.published_at ? new Date(post.published_at).toLocaleDateString('de-DE') : '—'}
      </td>
      <td className="py-2 pr-4">
        <button type="button" onClick={() => onToggle(post)}
          className={'min-h-10 text-xs ' + (post.active ? 'text-green-400' : 'text-zinc-500')}>
          {post.active ? 'Visible' : 'Hidden'}
        </button>
      </td>
      <td className="py-2 text-right">
        <div className="flex flex-wrap items-center justify-end gap-3">
          {post.active ? (
            <>
              <Link href={'/news/' + encodeURIComponent(post.slug)}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center text-xs text-zinc-300 hover:text-white">View</Link>
              <NewsShareActions slug={post.slug} title={post.title} variant="admin" />
            </>
          ) : null}
          <Link href={'/admin/news/' + post.id}
            className="inline-flex min-h-10 items-center text-xs text-zinc-400 hover:text-white">Edit</Link>
          <form onSubmit={(event) => { event.preventDefault(); onDelete(post.id) }}>
            <ConfirmDeleteButton
              message={'Delete "' + post.title + '"?'}
              className="inline-flex min-h-10 items-center text-xs text-red-400 hover:text-red-300"
            />
          </form>
        </div>
      </td>
    </tr>
  )
}

export function NewsSortableTable({ initialPosts }: { initialPosts: NewsAdminRow[] }) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [mutatingId, setMutatingId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => { setPosts(initialPosts) }, [initialPosts])

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (status === 'saving' || !over || active.id === over.id) return
    const from = posts.findIndex((item) => item.id === active.id)
    const to = posts.findIndex((item) => item.id === over.id)
    if (from < 0 || to < 0) return

    const previous = posts
    const next = arrayMove(previous, from, to)
    setPosts(next)
    setStatus('saving')
    setError(null)
    try {
      const result = await reorderNewsPosts(next.map((item) => item.id), previous.map((item) => item.id))
      if (result.error) throw new Error(result.error)
      setStatus('saved')
      router.refresh()
    } catch (caught) {
      setPosts(previous)
      setStatus('error')
      setError(caught instanceof Error ? caught.message : 'Could not save news order.')
      router.refresh()
    }
  }

  async function handleVisibility(post: NewsAdminRow) {
    if (mutatingId) return
    setMutatingId(post.id)
    setError(null)
    try {
      const result = await toggleNewsPostVisibility(post.id, !post.active)
      if (result.error) throw new Error(result.error)
      setPosts((current) => current.map((item) =>
        item.id === post.id ? { ...item, active: !post.active } : item))
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not change visibility.')
    } finally {
      setMutatingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (mutatingId || status === 'saving') return
    setMutatingId(id)
    setError(null)
    try {
      const result = await deleteNewsPost(id)
      if (result.error) throw new Error(result.error)
      setPosts((current) => current.filter((item) => item.id !== id))
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete post.')
    } finally {
      setMutatingId(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-zinc-400">
          Drag the handle to reorder news. Use Space and arrow keys for keyboard sorting.
        </span>
        <span role="status" aria-live="polite" className={
          status === 'error' ? 'text-red-400' : status === 'saved' ? 'text-green-400' : 'text-zinc-400'
        }>
          {status === 'saving' ? 'Saving order…' : status === 'saved' ? 'Order saved' : ''}
        </span>
      </div>
      {error ? <p role="alert" className="rounded border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">
        {error} Refresh the list if it was changed elsewhere.
      </p> : null}
      <div className="overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => void handleDragEnd(event)}>
          <SortableContext items={posts.map((post) => post.id)} strategy={verticalListSortingStrategy}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-400">
                  <th scope="col" className="py-2 pr-2">Order</th>
                  <th scope="col" className="py-2 pr-4">Cover</th>
                  <th scope="col" className="py-2 pr-4">Title</th>
                  <th scope="col" className="py-2 pr-4">Slug</th>
                  <th scope="col" className="py-2 pr-4">External link</th>
                  <th scope="col" className="py-2 pr-4">Published</th>
                  <th scope="col" className="py-2 pr-4">Active</th>
                  <th scope="col" className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <NewsSortableRow key={post.id} post={post}
                    disabled={status === 'saving' || mutatingId !== null}
                    onToggle={(item) => void handleVisibility(item)}
                    onDelete={(id) => void handleDelete(id)}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
