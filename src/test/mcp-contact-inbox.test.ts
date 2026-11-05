import { beforeEach, describe, expect, it, vi } from 'vitest'

const { from, query } = vi.hoisted(() => ({
  from: vi.fn(),
  query: {
    select: vi.fn(), is: vi.fn(), not: vi.fn(), order: vi.fn(),
    range: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(),
  },
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  createAdminClient: () => ({ from }),
}))

vi.mock('@/lib/mcp/server', () => {
  class McpAccessError extends Error {
    constructor(message: string, public readonly status = 401) { super(message) }
  }
  return { McpAccessError }
})

import { getContactInboxMessage, listContactInbox } from '@/lib/mcp/contact-inbox'

const id = '00000000-0000-4000-8000-000000000001'
const contact = {
  id, name: 'Example', email: 'example@example.com',
  subject: 'Test', message: 'a'.repeat(250),
  delivery_state: 'accepted', created_at: '2026-11-05T08:00:00Z',
  closed_at: null, order_id: 'must-not-be-exposed',
}

describe('private MCP contact inbox', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    from.mockReturnValue(query)
    query.select.mockReturnValue(query)
    query.is.mockReturnValue(query)
    query.not.mockReturnValue(query)
    query.order.mockReturnValue(query)
    query.eq.mockReturnValue(query)
  })

  it('lists bounded previews but never complete bodies or unrelated attributes', async () => {
    query.range.mockResolvedValue({ data: [contact], error: null })
    const result = await listContactInbox('open', 20, 0)
    expect(from).toHaveBeenCalledWith('plugin_contact_requests')
    expect(query.select).toHaveBeenCalledWith('id,name,email,subject,message,delivery_state,created_at,closed_at')
    expect(query.is).toHaveBeenCalledWith('closed_at', null)
    expect(query.range).toHaveBeenCalledWith(0, 19)
    expect(result.items[0].preview).toHaveLength(180)
    expect(result.items[0]).not.toHaveProperty('message')
    expect(result.items[0]).not.toHaveProperty('order_id')
  })

  it('handles closed and all filters explicitly', async () => {
    query.range.mockResolvedValue({ data: [], error: null })
    await listContactInbox('closed', 10, 5)
    expect(query.not).toHaveBeenCalledWith('closed_at', 'is', null)
    vi.clearAllMocks()
    await listContactInbox('all', 10, 5)
    expect(query.is).not.toHaveBeenCalled()
    expect(query.not).not.toHaveBeenCalled()
  })

  it('fails closed on invalid pagination and status', async () => {
    await expect(listContactInbox('open', 31)).rejects.toThrow('Invalid contact inbox pagination')
    await expect(listContactInbox('open', 1, -1)).rejects.toThrow('Invalid contact inbox pagination')
    await expect(listContactInbox('other' as 'all')).rejects.toThrow('Invalid contact inbox status')
    expect(from).not.toHaveBeenCalled()
  })

  it('fetches exactly one message by validated UUID', async () => {
    query.maybeSingle.mockResolvedValue({ data: contact, error: null })
    const result = await getContactInboxMessage(id)
    expect(query.eq).toHaveBeenCalledWith('id', id)
    expect(result.message).toEqual(contact.message)
    expect(result).not.toHaveProperty('order_id')
  })

  it('rejects invalid IDs without reading the database', async () => {
    await expect(getContactInboxMessage('not-a-uuid')).rejects.toThrow('Invalid contact message id')
    expect(from).not.toHaveBeenCalled()
  })

  it('returns a safe not-found error for missing messages', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null })
    await expect(getContactInboxMessage(id)).rejects.toThrow('Contact message not found')
  })

  it('does not reveal database errors to callers', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: new Error('sensitive database details') })
    await expect(getContactInboxMessage(id)).rejects.toThrow('Contact inbox lookup unavailable')
  })
})
