import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { ConfirmDeleteButton } from '@/app/admin/_components/ConfirmDeleteButton'
import { deleteNewsPost, toggleNewsPostVisibility, setFeaturedNewsPost } from '@/app/admin/_actions/news'
import { NEWS_FEATURED_KEY, parseFeaturedNewsId } from '@/lib/news-homepage'
import { resolveImageUrl } from '@/lib/r2'
import { toDirectImageUrl } from '@/lib/image-cache'
import { NewsShareActions } from '@/components/news/NewsShareActions'
import { sanitizeExternalHref } from '@/lib/sanitize-href'

export default async function NewsAdminPage() {
  let posts: Array<{
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
  }> = []

  let featuredNewsId: string | null = null
  let loadError = false
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('news_posts')
      .select(
        'id, title, slug, excerpt, link, cover_storage_path, cover_url, published_at, active, display_order',
      )
      .order('display_order', { ascending: true })
      .order('published_at', { ascending: false })
    if (error) loadError = true
    else posts = data ?? []

    const { data: featuredConfig, error: configError } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', NEWS_FEATURED_KEY)
      .maybeSingle()
    if (configError) loadError = true
    else featuredNewsId = parseFeaturedNewsId(featuredConfig?.value)
  } catch {
    loadError = true
  }

  return (
    <div>
      <AdminPageHeader
        title="News / Blog"
        description="Edit posts, open published articles and copy their share links."
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-400">
                <th className="py-2 pr-4">Cover</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Slug</th>
                <th className="py-2 pr-4">External link</th>
                <th className="py-2 pr-4">Published</th>
                <th className="py-2 pr-4">Active</th>
                <th className="py-2 pr-4">Homepage</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const cover = resolveImageUrl(post.cover_storage_path, post.cover_url)
                const externalHref = sanitizeExternalHref(post.link)
                return (
                  <tr key={post.id} className="border-b border-zinc-800/50">
                    <td className="py-2 pr-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded bg-zinc-800">
                        {cover ? (
                          <img
                            src={toDirectImageUrl(cover, { w: 96 }) || cover}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-zinc-200">{post.title}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-zinc-500">{post.slug}</td>
                    <td className="py-2 pr-4 text-xs">
                      {externalHref ? (
                        <a href={externalHref} target="_blank" rel="noopener noreferrer"
                          className="inline-block max-w-44 truncate align-middle text-zinc-300 underline hover:text-white"
                          title={externalHref}
                        >
                          {new URL(externalHref).hostname}
                        </a>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-zinc-400">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-2 pr-4">
                      <form
                        action={async () => {
                          'use server'
                          await toggleNewsPostVisibility(post.id, !post.active)
                        }}
                      >
                        <button
                          type="submit"
                          className={`text-xs ${post.active ? 'text-green-400' : 'text-zinc-500'}`}
                        >
                          {post.active ? 'Visible' : 'Hidden'}
                        </button>
                      </form>
                    </td>
                    <td className="py-2 pr-4">
                      <form action={async () => {
                        'use server'
                        await setFeaturedNewsPost(post.id, featuredNewsId !== post.id)
                      }}>
                        <button
                          type="submit"
                          disabled={!post.active && featuredNewsId !== post.id}
                          aria-label={featuredNewsId === post.id ? `Remove ${post.title} from featured` : `Feature ${post.title} on homepage`}
                          title={featuredNewsId === post.id ? 'Remove feature: newest news will lead' : 'Feature this news above the latest stories'}
                          className={`min-h-10 whitespace-nowrap font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${featuredNewsId === post.id ? 'font-bold text-red-400 hover:text-red-300' : 'text-zinc-400 hover:text-white'}`}
                        >
                          {featuredNewsId === post.id ? 'FEATURED' : 'Feature'}
                        </button>
                      </form>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        {post.active ? (
                          <>
                            <Link
                              href={'/news/' + encodeURIComponent(post.slug)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-10 items-center text-xs text-zinc-300 hover:text-white"
                            >
                              View
                            </Link>
                            <NewsShareActions slug={post.slug} title={post.title} variant="admin" />
                          </>
                        ) : null}
                        <Link
                          href={`/admin/news/${post.id}`}
                          className="text-xs text-zinc-400 hover:text-white"
                        >
                          Edit
                        </Link>
                        <form
                          action={async () => {
                            'use server'
                            await deleteNewsPost(post.id)
                          }}
                        >
                          <ConfirmDeleteButton message="Delete this post?" className="inline-flex min-h-[44px] items-center px-2 text-xs text-red-400 hover:text-red-300" />
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
