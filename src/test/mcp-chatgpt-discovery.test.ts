import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authenticate, removal, inboxList, inboxGet } = vi.hoisted(() => ({
  authenticate: vi.fn(),
  removal: vi.fn(),
  inboxList: vi.fn(),
  inboxGet: vi.fn(),
}))

vi.mock('@/lib/mcp/server', () => {
  class McpAccessError extends Error {
    constructor(message: string, public readonly status = 401) { super(message) }
  }
  return {
    authenticateMcp: authenticate,
    McpAccessError,
    mcpUnauthorized: (error: McpAccessError) => Response.json({ error: error.message }, { status: error.status }),
    contentCapabilities: () => [{ collection: 'news', deletion: false }],
    getContent: vi.fn(),
    getSiteContent: vi.fn(),
    listContent: vi.fn(),
    listMyRequests: vi.fn(),
    queueContentChange: vi.fn(),
    queueContentRemoval: removal,
    queueSiteContentChange: vi.fn(),
    siteContentCapabilities: () => ({ read: [] }),
  }
})

vi.mock('@/lib/mcp/contact-inbox', () => ({
  listContactInbox: inboxList,
  getContactInboxMessage: inboxGet,
}))

import { POST, GET } from '@/app/api/mcp/route'
import { McpAccessError } from '@/lib/mcp/server'

const modern = '2026-07-28'
const legacy = '2025-06-18'
const mcpEndpoint = 'https://neuroklast.net/api/mcp'

function call(method: string, params: Record<string, unknown> = {}, version = modern) {
  return POST(new Request(mcpEndpoint, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer valid-test-token',
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': version,
    },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 10, method,
      params: version === modern ? {
        ...params,
        _meta: {
          'io.modelcontextprotocol/protocolVersion': modern,
          'io.modelcontextprotocol/clientCapabilities': {},
        },
      } : params,
    }),
  }))
}

describe('ChatGPT MCP tool discovery compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticate.mockResolvedValue({
      userId: '00000000-0000-4000-8000-000000000001',
      clientId: '27373656-347b-49df-a452-550198edc379',
    })
  })

  it('responds to modern server/discover with full required fields', async () => {
    const response = await call('server/discover')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(response.headers.get('MCP-Protocol-Version')).toBe(modern)
    const message = await response.json()
    expect(message.id).toBe(10)
    expect(message.result).toMatchObject({
      resultType: 'complete',
      supportedVersions: [modern, legacy],
      capabilities: { tools: { listChanged: false } },
      cacheScope: 'private',
      ttlMs: 0,
      _meta: { 'io.modelcontextprotocol/serverInfo': {
        name: 'neuroklast-content',
      } },
    })
    expect(authenticate).toHaveBeenCalledTimes(1)
  })

  it('returns tool definitions using the modern complete result shape', async () => {
    const response = await call('tools/list')
    expect(response.status).toBe(200)
    expect(response.headers.get('MCP-Protocol-Version')).toBe(modern)
    const data = await response.json()
    expect(data.result.resultType).toBe('complete')
    expect(data.result.tools.length).toBeGreaterThanOrEqual(6)
    for (const tool of data.result.tools) {
      expect(tool.name).toMatch(/^[a-z][a-z0-9_]+$/)
      expect(tool.description).toBeTruthy()
      expect(tool.inputSchema.type).toBe('object')
      expect(tool.inputSchema.properties).toBeDefined()
    }
  })

  it('discovers only read-only contact inbox tools', async () => {
    const response = await call('tools/list')
    const data = await response.json()
    for (const name of ['contact_inbox_list', 'contact_inbox_get']) {
      const tool = data.result.tools.find((item: { name: string }) => item.name === name)
      expect(tool).toBeDefined()
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false })
    }
    const get = data.result.tools.find((item: { name: string }) => item.name === 'contact_inbox_get')
    expect(get.inputSchema.required).toEqual(['id'])
  })

  it('reads contact previews only after authenticated MCP access', async () => {
    inboxList.mockResolvedValueOnce({ items: [{ id: 'one', preview: 'Example' }] })
    const response = await call('tools/call', {
      name: 'contact_inbox_list',
      arguments: { status: 'all', limit: 5, offset: 10 },
    })
    expect(response.status).toBe(200)
    expect(inboxList).toHaveBeenCalledWith('all', 5, 10)
    expect((await response.json()).result.content[0].text).toContain('Example')
    expect(authenticate).toHaveBeenCalledTimes(1)
  })

  it('gets a single contact message by id with no mutation', async () => {
    const uuid = '00000000-0000-4000-8000-000000000009'
    inboxGet.mockResolvedValueOnce({ id: uuid, message: 'Untrusted text' })
    const response = await call('tools/call', {
      name: 'contact_inbox_get', arguments: { id: uuid },
    })
    expect(response.status).toBe(200)
    expect(inboxGet).toHaveBeenCalledWith(uuid)
    expect((await response.json()).result.content[0].text).toContain('Untrusted text')
  })

  it('rejects unauthorized contact tool calls before reading any messages', async () => {
    authenticate.mockRejectedValueOnce(new McpAccessError('Administrator permission required', 403))
    const response = await call('tools/call', {
      name: 'contact_inbox_list', arguments: {},
    })
    expect(response.status).toBe(403)
    expect(inboxList).not.toHaveBeenCalled()
  })

  it('rejects contact get calls without an id', async () => {
    const response = await call('tools/call', {
      name: 'contact_inbox_get', arguments: {},
    })
    expect(response.status).toBe(400)
    expect(inboxGet).not.toHaveBeenCalled()
  })

  it('advertises an explicitly destructive human-reviewed deletion proposal', async () => {
    const response = await call('tools/list')
    const data = await response.json()
    const tool = data.result.tools.find((item: { name: string }) => item.name === 'content_propose_delete')
    expect(tool?.annotations?.destructiveHint).toBe(true)
    expect(tool?.annotations?.readOnlyHint).toBe(false)
    expect(tool?.inputSchema?.required).toEqual(['collection', 'id', 'reason'])
  })

  it('queues deletion only; tool invocation does not directly remove any content', async () => {
    removal.mockResolvedValueOnce({ status: 'pending', deletion_performed: false })
    const response = await call('tools/call', {
      name: 'content_propose_delete',
      arguments: {
        collection: 'news_posts',
        id: '00000000-0000-4000-8000-000000000009',
        reason: 'Duplicate article',
      },
    })
    expect(response.status).toBe(200)
    expect(removal).toHaveBeenCalledWith(
      expect.objectContaining({ userId: expect.any(String) }),
      'news_posts', '00000000-0000-4000-8000-000000000009', 'Duplicate article',
    )
    const data = await response.json()
    expect(data.result.content[0].text).toContain('"deletion_performed":false')
  })

  it('keeps legacy initialization available to older MCP clients', async () => {
    const response = await call('initialize', {
      protocolVersion: legacy, capabilities: {}, clientInfo: { name: 'legacy', version: '1.0' },
    }, legacy)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.result.protocolVersion).toBe(legacy)
    expect(data.result.resultType).toBeUndefined()
  })

  it('keeps tools/list backward-compatible', async () => {
    const response = await call('tools/list', {}, legacy)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.result.resultType).toBeUndefined()
    expect(data.result.tools.length).toBeGreaterThan(0)
  })

  it('never exposes tool definitions without valid authentication', async () => {
    authenticate.mockRejectedValueOnce(new McpAccessError('Bearer OAuth access token required', 401))
    const response = await call('server/discover')
    expect(response.status).toBe(401)
  })

  it('rejects unsupported GET transport instead of anonymous tool discovery', () => {
    expect(GET().status).toBe(405)
  })
})
