import { authenticateMcp, contentCapabilities, getContent, listContent, listMyRequests, McpAccessError, mcpUnauthorized, queueContentChange } from '@/lib/mcp/server'
import { CONTENT_COLLECTIONS } from '@/lib/mcp/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COLLECTION_ENUM = [...CONTENT_COLLECTIONS]
const collection = { type: 'string', enum: COLLECTION_ENUM }
const id = { type: 'string', format: 'uuid' }

const TOOLS = [
  {
    name: 'content_capabilities',
    description: 'List permitted editorial collections and writable fields. No access to personal, financial, legal, licensing or security data.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  {
    name: 'content_list',
    description: 'Read up to 50 existing editorial records from one collection. Paginated, restricted to safe content fields.',
    inputSchema: { type: 'object', properties: { collection, limit: { type: 'integer', minimum: 1, maximum: 50 }, offset: { type: 'integer', minimum: 0, maximum: 5000 } }, required: ['collection'], additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  {
    name: 'content_get',
    description: 'Read a specific editorial record by UUID plus its version fingerprint.',
    inputSchema: { type: 'object', properties: { collection, id }, required: ['collection', 'id'], additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  {
    name: 'content_propose_create',
    description: 'Submit a new editorial item as an inactive draft for human approval. Does not publish or modify live content.',
    inputSchema: { type: 'object', properties: { collection, changes: { type: 'object', additionalProperties: true } }, required: ['collection', 'changes'], additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  {
    name: 'content_propose_update',
    description: 'Submit an edit to an existing editorial record for human approval. Does not modify live content. Changes must contain only permitted content fields.',
    inputSchema: { type: 'object', properties: { collection, id, changes: { type: 'object', additionalProperties: true } }, required: ['collection', 'id', 'changes'], additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  {
    name: 'content_my_requests',
    description: 'Check the status of content edits submitted through the current authenticated account.',
    inputSchema: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, maximum: 50 } }, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
] as const

function rpc(id: unknown, result: unknown, status = 200) {
  return Response.json({ jsonrpc: '2.0', id, result }, { status, headers: { 'Cache-Control': 'no-store', 'MCP-Protocol-Version': '2025-06-18' } })
}
function rpcError(id: unknown, code: number, message: string, status = 200) {
  return Response.json({ jsonrpc: '2.0', id, error: { code, message } }, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  try {
    const context = await authenticateMcp(request)
    const length = Number(request.headers.get('content-length') ?? 0)
    if (length > 48000) return rpcError(null, -32600, 'Request too large', 413)
    const raw = await request.text()
    if (raw.length > 48000) return rpcError(null, -32600, 'Request too large', 413)
    let payload: unknown
    try { payload = JSON.parse(raw) } catch { return rpcError(null, -32700, 'Invalid JSON', 400) }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return rpcError(null, -32600, 'Invalid JSON-RPC request', 400)
    const message = payload as Record<string, unknown>
    const requestId = typeof message.id === 'number' || typeof message.id === 'string' ? message.id : null
    if (message.jsonrpc !== '2.0' || typeof message.method !== 'string') return rpcError(requestId, -32600, 'Invalid JSON-RPC request', 400)

    // Stateless MCP over Streamable HTTP. A notification has no response body.
    if (message.method === 'notifications/initialized') return new Response(null, { status: 202, headers: { 'Cache-Control': 'no-store' } })
    if (requestId === null) return new Response(null, { status: 202, headers: { 'Cache-Control': 'no-store' } })
    if (message.method === 'ping') return rpc(requestId, {})
    if (message.method === 'initialize') {
      return rpc(requestId, {
        protocolVersion: '2025-06-18',
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'neuroklast-content', version: '1.0.0' },
        instructions: 'Editorial content only. Read content first. Submit proposals; only a human administrator can approve. No direct publication or deletion.',
      })
    }
    if (message.method === 'tools/list') return rpc(requestId, { tools: TOOLS })
    if (message.method !== 'tools/call') return rpcError(requestId, -32601, 'Method not found')

    const params = message.params
    if (!params || typeof params !== 'object' || Array.isArray(params)) return rpcError(requestId, -32602, 'Invalid tool parameters')
    const call = params as Record<string, unknown>
    const name = call.name
    const args = call.arguments && typeof call.arguments === 'object' && !Array.isArray(call.arguments)
      ? call.arguments as Record<string, unknown>
      : {}
    if (typeof name !== 'string') return rpcError(requestId, -32602, 'Tool name required')
    let value: unknown
    switch (name) {
      case 'content_capabilities': value = contentCapabilities(); break
      case 'content_list':
        if (typeof args.collection !== 'string') throw new McpAccessError('Collection required', 400)
        value = await listContent(args.collection, args.limit === undefined ? 20 : Number(args.limit), args.offset === undefined ? 0 : Number(args.offset)); break
      case 'content_get':
        if (typeof args.collection !== 'string' || typeof args.id !== 'string') throw new McpAccessError('Collection and id required', 400)
        value = await getContent(args.collection, args.id); break
      case 'content_propose_create':
        if (typeof args.collection !== 'string') throw new McpAccessError('Collection required', 400)
        value = await queueContentChange(context, 'create', args.collection, args.changes); break
      case 'content_propose_update':
        if (typeof args.collection !== 'string' || typeof args.id !== 'string') throw new McpAccessError('Collection and id required', 400)
        value = await queueContentChange(context, 'update', args.collection, args.changes, args.id); break
      case 'content_my_requests':
        value = await listMyRequests(context, args.limit === undefined ? 20 : Number(args.limit)); break
      default: return rpcError(requestId, -32601, 'Unknown tool')
    }
    return rpc(requestId, { content: [{ type: 'text', text: JSON.stringify(value) }] })
  } catch (error) {
    if (error instanceof McpAccessError) {
      if (error.status === 401 || error.status === 403 || error.status === 429 || error.status === 503) return mcpUnauthorized(error, request)
      return rpcError(null, -32602, error.message, error.status)
    }
    // OWASP A09: Do not send database errors, stack traces or credentials to MCP.
    console.error('[MCP] Content endpoint failed', error instanceof Error ? error.name : 'Unknown')
    return rpcError(null, -32603, 'Content service unavailable', 503)
  }
}

export function GET() {
  return new Response(null, { status: 405, headers: { 'Allow': 'POST', 'Cache-Control': 'no-store' } })
}
export function DELETE() {
  return new Response(null, { status: 405, headers: { 'Allow': 'POST', 'Cache-Control': 'no-store' } })
}
