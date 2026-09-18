import { createClient } from '@/lib/supabaseServer'
import { resolveImageUrl } from '@/lib/r2'
import { deleteGalleryImage } from '@/app/admin/_actions/gallery'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { ConfirmDeleteButton } from '@/app/admin/_components/ConfirmDeleteButton'
import { GalleryVisibilityToggle } from './GalleryVisibilityToggle'
import Link from 'next/link'
import { toDirectImageUrl } from '@/lib/image-cache'

export default async function GalleryPage() {
  let images: Array<{
    id: string
    alt: string | null
    storage_path: string | null
    image_url: string | null
    display_order: number
    active: boolean
  }> = []

  let loadError = false
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('gallery')
      .select('id, alt, storage_path, image_url, display_order, active')
      .order('display_order', { ascending: true })
    if (error) loadError = true
    else images = data ?? []
  } catch {
    loadError = true
  }

  return (
    <div>
      <AdminPageHeader
        title="Gallery"
        description="Manage public gallery images. Upload, link, or import from Google Drive — all cached to R2."
        action={
          <Link href="/admin/gallery/new" className="px-3 py-1.5 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors">
            + Upload Image
          </Link>
        }
      />
      {loadError ? (
        <p role="alert" className="text-sm text-red-400">Could not load gallery. Check the database connection.</p>
      ) : images.length === 0 ? (
        <div className="space-y-3">
          <p className="text-zinc-400 text-sm">No images yet.</p>
          <Link href="/admin/gallery/new" className="inline-flex min-h-[44px] items-center text-sm text-zinc-300 underline hover:text-white">
            Upload first image
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => {
            const src = resolveImageUrl(img.storage_path, img.image_url)
            return (
              <div key={img.id} className="bg-zinc-900 rounded border border-zinc-800 overflow-hidden">
                <div className="relative aspect-square bg-zinc-800">
                  {src ? (
                    <img
                      src={toDirectImageUrl(src, { w: 400 }) || src}
                      alt={img.alt ?? ''}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
                      NO IMAGE
                    </div>
                  )}
                </div>
                <div className="p-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-400 truncate">{img.alt ?? 'No alt'}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <GalleryVisibilityToggle imageId={img.id} active={img.active ?? true} />
                    <Link href={`/admin/gallery/${img.id}`} className="text-xs text-zinc-400 hover:text-white transition-colors">
                      Edit
                    </Link>
                    <form action={async () => { 'use server'; await deleteGalleryImage(img.id) }}>
                      <ConfirmDeleteButton message="Delete this image?" className="inline-flex min-h-[44px] items-center text-xs text-red-400 hover:text-red-300" />
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
