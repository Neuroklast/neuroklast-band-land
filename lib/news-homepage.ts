/** One optional featured news item, stored in site_config without a database migration. */
export const NEWS_FEATURED_KEY = 'news_featured'

export function parseFeaturedNewsId(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const id = (value as { postId?: unknown }).postId
  return typeof id === 'string' && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
    ? id
    : null
}

export function selectHomepageNews<T extends { id: string; publishedAt: string | null }>(
  posts: readonly T[],
  featuredId: string | null,
): { lead: T | null; recent: T[]; isFeatured: boolean } {
  const dateValue = (post: T): number => {
    if (!post.publishedAt) return -Infinity
    const timestamp = Date.parse(post.publishedAt)
    return Number.isFinite(timestamp) ? timestamp : -Infinity
  }

  // Stable sort keeps the existing order for identical or missing dates.
  const newestFirst = [...posts].sort((a, b) => dateValue(b) - dateValue(a))
  const pinned = featuredId ? newestFirst.find((post) => post.id === featuredId) : undefined
  const lead = pinned ?? newestFirst[0] ?? null

  return {
    lead,
    isFeatured: Boolean(pinned),
    recent: newestFirst.filter((post) => post.id !== lead?.id).slice(0, 3),
  }
}
