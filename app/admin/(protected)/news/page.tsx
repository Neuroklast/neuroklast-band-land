import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { NewsSortableTable, type NewsAdminRow } from './NewsSortableTable'

export default async function NewsAdminPage() {
  let posts: NewsAdminRow[] = []

  let loadError = false
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('news_posts')
      .select(
        'id, title, slug, excerpt, link, cover_storage_path, cover_url, published_at, active, display_order',
      )
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: true })
    if (error) loadError = true
    else posts = data ?? []
  } catch {
    loadError = true
  }

  return (
    <div>
      <AdminPageHeader
        title="News / Blog"
        description="Drag posts into the order they should appear on the website. Changes save automatically."
        action={
          <Link
            href="/admin/news/new"
            className="rounded bg-zinc-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-600"
          >
            + New Post
          </Link>
        }
      />

      {loadError ? (
        <p role="alert" className="text-sm text-red-400">Could not load news. Check the database connection.</p>
      ) : posts.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            No posts yet. Create one, then ensure the News section is visible under Look &amp; Feel →
            Sections.
          </p>
          <Link href="/admin/news/new" className="inline-flex min-h-[44px] items-center text-sm text-zinc-300 underline hover:text-white">
            Create first post
          </Link>
        </div>
      ) : (
        <NewsSortableTable initialPosts={posts} />
      )}
    </div>
  )
}
