import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reorderNewsPosts } from '@/app/admin/_actions/news'

const { rpc, revalidate } = vi.hoisted(() => ({
  rpc: vi.fn(),
  revalidate: vi.fn(),
}))

vi.mock('@/app/admin/_actions/auth', () => ({
  runAdminAction: async (callback: () => Promise<unknown>) => callback(),
}))
vi.mock('@/lib/supabaseAdmin', () => ({
  createAdminClient: () => ({ rpc }),
}))
vi.mock('next/cache', () => ({
  revalidatePath: revalidate,
}))

const first = '11111111-1111-4111-8111-111111111111'
const second = '22222222-2222-4222-8222-222222222222'

beforeEach(() => {
  vi.clearAllMocks()
  rpc.mockResolvedValue({ data: 'saved', error: null })
})

describe('news drag order persistence', () => {
  it('rejects missing, duplicate and unknown IDs before database writes', async () => {
    expect(await reorderNewsPosts([first, first], [first, second])).toHaveProperty('error')
    expect(await reorderNewsPosts([first, second], [first, first])).toHaveProperty('error')
    expect(await reorderNewsPosts([first], [second])).toHaveProperty('error')
    expect(await reorderNewsPosts([], [])).toHaveProperty('error')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('saves the full new order against the expected original order', async () => {
    expect(await reorderNewsPosts([second, first], [first, second])).toEqual({ success: true })
    expect(rpc).toHaveBeenCalledWith('reorder_news_posts', {
      p_ids: [second, first], p_expected_ids: [first, second],
    })
    expect(revalidate).toHaveBeenCalledWith('/admin/news')
    expect(revalidate).toHaveBeenCalledWith('/')
  })

  it('reports RPC errors without claiming the order was persisted', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'Conflict' } })
    expect(await reorderNewsPosts([second, first], [first, second])).toHaveProperty('error')
    expect(revalidate).not.toHaveBeenCalled()
  })
})
