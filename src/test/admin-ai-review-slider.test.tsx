import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReviewSlider, type ContentReviewRow } from '@/app/admin/(protected)/ai-content/ReviewSlider'
import { ADMIN_NAV_GROUPS } from '@/app/admin/_config/nav-groups'

const { save, refresh } = vi.hoisted(() => ({
  save: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock('@/app/admin/_actions/mcpContent', () => ({
  reviewMcpContent: save,
}))

function request(id: string, title: string, operation = 'update'): ContentReviewRow {
  return {
    id,
    collection: 'releases',
    operation,
    target_id: '11111111-1111-4111-8111-111111111111',
    target_key: null,
    changes: operation === 'delete' ? { reason: 'Duplicate release' } : { title, type: 'song' },
    previous_snapshot: { title: 'Original title', type: 'single', id: '11111111-1111-4111-8111-111111111111' },
    status: 'pending',
    created_at: '2026-10-28T14:30:00.000Z',
    requested_by: '22222222-2222-4222-8222-222222222222',
    reviewed_at: null,
    error: null,
  }
}

const first = request('33333333-3333-4333-8333-333333333333', 'First track')
const second = request('44444444-4444-4444-8444-444444444444', 'Second track')

beforeEach(() => {
  vi.clearAllMocks()
  save.mockResolvedValue({ success: true })
})
afterEach(() => cleanup())

describe('AI content review carousel', () => {
  it('displays only one proposal and hides technical JSON by default', () => {
    render(<ReviewSlider initialPending={[first, second]} recentDecisions={[]} />)
    expect(screen.getByRole('heading', { name: 'First track' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Second track' })).not.toBeInTheDocument()
    expect(screen.getByText('Release type')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Review all 2 fields' })).toBeInTheDocument()
    expect(screen.queryByText('Original title')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Review all 2 fields' }))
    expect(screen.getByText('Original title')).toBeInTheDocument()
    expect(screen.getByText('Technical JSON details')).toBeInTheDocument()
  })

  it('keeps all review actions in a fixed-height card while allowing a separate full-details view', () => {
    const manyFields = { ...first, changes: {
      title: 'First track', type: 'ep', active: false, tracks: [{ title: 'First mix' }, { title: 'Second mix' }],
      artists: ['Neuroklast', 'Mechanical Vein'], streaming_links: [{ platform: 'spotify', url: 'https://spotify.com/example' }],
    } }
    const { container } = render(<ReviewSlider initialPending={[manyFields]} recentDecisions={[]} />)
    const root = container.firstElementChild
    expect(root).toHaveClass('overflow-hidden', 'flex-1')
    const card = screen.getByRole('article')
    expect(card).toHaveClass('min-h-0', 'flex-1', 'overflow-hidden')
    expect(container.querySelector('footer[aria-label="Review actions"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Review all 6 fields' })).toBeInTheDocument()
    expect(screen.queryByText('First mix')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Review all 6 fields' }))
    expect(screen.getByTestId('review-details-scroll')).toHaveClass('overflow-y-auto')
    expect(screen.getByText('First mix')).toBeInTheDocument()
  })

  it('skips and returns without submitting a review', () => {
    render(<ReviewSlider initialPending={[first, second]} recentDecisions={[]} />)
    fireEvent.click(screen.getByRole('button', { name: /Skip/ }))
    expect(screen.getByRole('heading', { name: 'Second track' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Back/ }))
    expect(screen.getByRole('heading', { name: 'First track' })).toBeInTheDocument()
    expect(save).not.toHaveBeenCalled()
  })

  it('advances immediately while saving and does not report success before the server', async () => {
    let complete: (value: { success: boolean }) => void = () => { throw new Error('Deferred not initialized') }
    save.mockImplementationOnce(() => new Promise((resolve) => { complete = resolve }))
    render(<ReviewSlider initialPending={[first, second]} recentDecisions={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }))
    expect(save).toHaveBeenCalledWith(first.id, 'approve')
    expect(screen.getByRole('heading', { name: 'Second track' })).toBeInTheDocument()
    expect(screen.getByText('1 saving…')).toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
    complete({ success: true })
    await waitFor(() => {
      expect(refresh).toHaveBeenCalled()
      expect(screen.queryByText('1 saving…')).not.toBeInTheDocument()
    })
  })

  it('allows rapid decisions on different proposals without duplicate submissions', async () => {
    const complete: Array<(value: { success: boolean }) => void> = []
    save.mockImplementation(() => new Promise((resolve) => { complete.push(resolve) }))
    render(<ReviewSlider initialPending={[first, second]} recentDecisions={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
    expect(save).toHaveBeenNthCalledWith(1, first.id, 'approve')
    expect(save).toHaveBeenNthCalledWith(2, second.id, 'reject')
    expect(screen.getByText('2 saving…')).toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
    complete[1]({ success: true })
    complete[0]({ success: true })
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(2))
    expect(screen.getByText('All reviewed')).toBeInTheDocument()
  })

  it('restores a failed proposal with a visible error and a review shortcut', async () => {
    save.mockResolvedValueOnce({ error: 'MFA (AAL2) is required to review AI content' })
    render(<ReviewSlider initialPending={[first, second]} recentDecisions={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }))
    expect(screen.getByRole('heading', { name: 'Second track' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('MFA (AAL2)'))
    expect(screen.getByRole('heading', { name: 'First track' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Review failed item' })).toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('shows publication after Accept even when an old queued release has active=false', () => {
    const old = { ...first, operation: 'create', target_id: null, changes: {
      title: 'Empyrean remix', type: 'remix', active: false, artists: ['Neuroklast'],
    } }
    render(<ReviewSlider initialPending={[old]} recentDecisions={[]} />)
    expect(screen.getByText('Visible after Accept')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Review all 4 fields' }))
    expect(screen.getByText('Visible on website')).toBeInTheDocument()
    expect(screen.getAllByText('Yes').length).toBeGreaterThan(0)
  })

  it('requires a separate confirmation before approving a deletion', async () => {
    render(<ReviewSlider initialPending={[request('55555555-5555-4555-8555-555555555555', 'Delete me', 'delete')]} recentDecisions={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Review delete' }))
    expect(save).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Permanent deletion')
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))
    await waitFor(() => expect(save).toHaveBeenCalledWith('55555555-5555-4555-8555-555555555555', 'approve'))
  })

  it('places editorial review and integrations together in the AI navigation section', () => {
    const ai = ADMIN_NAV_GROUPS.find((group) => group.id === 'ai')
    expect(ai?.items.map((item) => item.href)).toEqual(['/admin/ai-content', '/admin/integrations'])
    expect(ADMIN_NAV_GROUPS.find((group) => group.id === 'content')?.items.some((item) => item.href === '/admin/ai-content')).toBe(false)
    expect(ADMIN_NAV_GROUPS.find((group) => group.id === 'system')?.items.some((item) => item.href === '/admin/integrations')).toBe(false)
  })
})
