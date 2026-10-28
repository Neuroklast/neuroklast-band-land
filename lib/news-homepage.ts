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
  // The existing admin drag-and-drop order is canonical; new posts are inserted first.
  const ordered = [...posts]
  const pinned = featuredId ? ordered.find((post) => post.id === featuredId) : undefined
  const lead = pinned ?? ordered[0] ?? null

  return {
    lead,
    isFeatured: Boolean(pinned),
    recent: ordered.filter((post) => post.id !== lead?.id).slice(0, 3),
  }
}
