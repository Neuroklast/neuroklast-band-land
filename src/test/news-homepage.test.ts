import { describe, expect, it } from 'vitest'
import { parseFeaturedNewsId, selectHomepageNews } from '@/lib/news-homepage'

const posts = [
  { id: 'older', publishedAt: '2026-10-10T12:00:00Z' },
  { id: 'latest', publishedAt: '2026-10-28T12:00:00Z' },
  { id: 'third', publishedAt: '2026-10-25T12:00:00Z' },
  { id: 'second', publishedAt: '2026-10-27T12:00:00Z' },
  { id: 'fourth', publishedAt: '2026-10-20T12:00:00Z' },
]

describe('homepage news selection', () => {
  it('highlights the newest post and only three preceding posts', () => {
    const selected = selectHomepageNews(posts, null)
    expect(selected.lead?.id).toBe('latest')
    expect(selected.isFeatured).toBe(false)
    expect(selected.recent.map(({ id }) => id)).toEqual(['second', 'third', 'fourth'])
    expect(posts[0].id).toBe('older') // Never mutate the original list.
  })

  it('pins one featured post, then shows three newest distinct posts', () => {
    const selected = selectHomepageNews(posts, 'older')
    expect(selected.lead?.id).toBe('older')
    expect(selected.isFeatured).toBe(true)
    expect(selected.recent.map(({ id }) => id)).toEqual(['latest', 'second', 'third'])
  })

  it('falls back to the latest entry when featured is hidden or deleted', () => {
    expect(selectHomepageNews(posts, 'not-active').lead?.id).toBe('latest')
    expect(selectHomepageNews(posts, 'not-active').isFeatured).toBe(false)
  })

  it('handles missing dates and empty content without duplicating cards', () => {
    expect(selectHomepageNews([], null)).toEqual({ lead: null, recent: [], isFeatured: false })
    expect(selectHomepageNews([{ id: 'a', publishedAt: null }], null).recent).toEqual([])
  })
})

describe('featured news config', () => {
  it('accepts only a UUID from the selected config row', () => {
    const id = 'c942931f-4bef-44a0-85f0-09ad0f6a1ab0'
    expect(parseFeaturedNewsId({ postId: id })).toBe(id)
    expect(parseFeaturedNewsId({ postId: 'other' })).toBe(null)
    expect(parseFeaturedNewsId({ postId: null })).toBe(null)
    expect(parseFeaturedNewsId(null)).toBe(null)
  })
})
