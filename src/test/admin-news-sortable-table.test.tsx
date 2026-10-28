import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { NewsSortableTable, type NewsAdminRow } from '@/app/admin/(protected)/news/NewsSortableTable'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('@/app/admin/_actions/news', () => ({
  reorderNewsPosts: vi.fn(),
  toggleNewsPostVisibility: vi.fn(),
  deleteNewsPost: vi.fn(),
}))
vi.mock('@/lib/r2', () => ({ resolveImageUrl: () => null }))
vi.mock('@/lib/image-cache', () => ({ toDirectImageUrl: () => '' }))
vi.mock('@/components/news/NewsShareActions', () => ({
  NewsShareActions: () => null,
}))

const entries: NewsAdminRow[] = [
  { id: '11111111-1111-4111-8111-111111111111', title: 'First post', slug: 'first', link: null, excerpt: null,
    cover_storage_path: null, cover_url: null, published_at: '2026-10-28T10:00:00Z', active: true, display_order: 0 },
  { id: '22222222-2222-4222-8222-222222222222', title: 'Hidden post', slug: 'hidden', link: null, excerpt: null,
    cover_storage_path: null, cover_url: null, published_at: '2026-10-27T10:00:00Z', active: false, display_order: 1 },
]

afterEach(() => cleanup())

describe('admin news ordering table', () => {
  it('renders an accessible drag handle for every row, including hidden news', () => {
    render(<NewsSortableTable initialPosts={entries} />)
    expect(screen.getByRole('button', { name: 'Drag to reorder First post' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Drag to reorder Hidden post' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Visible' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hidden' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Order' })).toBeInTheDocument()
    expect(screen.queryByText(/Saving order/)).not.toBeInTheDocument()
  })

  it('preserves admin article links while allowing ordering', () => {
    render(<NewsSortableTable initialPosts={entries} />)
    const link = screen.getAllByRole('link', { name: 'Edit' })[0]
    expect(link).toHaveAttribute('href', '/admin/news/11111111-1111-4111-8111-111111111111')
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/news/first')
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })
})
