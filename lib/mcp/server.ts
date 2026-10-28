import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { consumeRateLimitForRequest } from '@/lib/rate-limit'
import { allowedContentFields, CONTENT_COLLECTIONS, digestContent, filterContentRow, getContentDefinition, parseContentChanges } from '@/lib/mcp/content'
import { z } from 'zod'
import { canReadSiteContent, parseSiteContentPatch, READABLE_SITE_CONTENT, WRITABLE_SITE_CONTENT } from '@/lib/mcp/site-config'

const uuid = z.string().uuid()
const noCache = { 'Cache-Control': 'no-store' }

export class McpAccessError extends Error {
  constructor(message: string, public readonly status = 401) { super(message) }
}

export async function authenticateMcp(request: Request): Promise<{ userId: string; clientId: string }> {
  // OWASP A07: Fail closed unless an explicitly registered OAuth client is configured.
  const expected = process.env.NEUROKLAST_MCP_CLIENT_ID
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!expected || !url || !key) throw new McpAccessError('MCP integration is not configured', 503)

  const auth = request.headers.get('authorization') ?? ''
  if (!/^Bearer [A-Za-z0-9._-]+$/.test(auth) || auth.length > 6000) throw new McpAccessError('Bearer OAuth access token required')
  const token = auth.slice(7)
  const pieces = token.split('.')
  if (pieces.length !== 3) throw new McpAccessError('Malformed access token')

  // getUser(token) verifies the token with the project's Auth server. Never trust
  // decoded claims without verifying the JWT first.
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw new McpAccessError('Invalid or expired access token')
  let claims: Record<string, unknown>
  try {
    claims = JSON.parse(Buffer.from(pieces[1], 'base64url').toString('utf8')) as Record<string, unknown>
  } catch {
    throw new McpAccessError('Malformed token claims')
  }
  if (claims.client_id !== expected || claims.sub !== user.id || claims.aal !== 'aal2') {
    throw new McpAccessError('OAuth client or MFA assurance not authorized', 403)
  }
  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin.from('profiles')
    .select('role').eq('id', user.id).maybeSingle()
  if (profileError || profile?.role !== 'admin') throw new McpAccessError('Administrator permission required', 403)

  // Distributed limit, deliberately fail closed if DB is unreachable.
  const limit = await consumeRateLimitForRequest(request, { namespace: 'mcp:' + user.id, limit: 90, windowSeconds: 60 })
  if (!limit.allowed) throw new McpAccessError('Rate limit exceeded', 429)
  return { userId: user.id, clientId: expected }
}

export function mcpUnauthorized(error: McpAccessError, request: Request) {
  const resource = new URL('/.well-known/oauth-protected-resource/mcp', request.url).toString()
  const headers: Record<string, string> = { ...noCache }
  if (error.status === 401) headers['WWW-Authenticate'] = 'Bearer resource_metadata="' + resource + '"'
  return new Response(JSON.stringify({ error: error.message }), { status: error.status, headers: { ...headers, 'Content-Type': 'application/json' } })
}

function table(name: string) {
  const definition = getContentDefinition(name)
  if (!definition) throw new McpAccessError('Unknown editorial collection', 400)
  return definition
}

function selectFields(collection: string): string {
  return ['id', ...allowedContentFields(collection)].join(',')
}

export async function listContent(collection: string, limit: number, offset: number) {
  table(collection)
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isInteger(offset) || offset < 0 || offset > 5000) {
    throw new McpAccessError('Invalid pagination', 400)
  }
  const admin = createAdminClient()
  const { data, error } = await admin.from(collection).select(selectFields(collection))
    .order('id', { ascending: true }).range(offset, offset + limit - 1)
  if (error) throw new Error('Content listing unavailable')
  return { collection, items: data, next_offset: data.length === limit ? offset + limit : null }
}

export async function getContent(collection: string, id: string) {
  table(collection)
  if (!uuid.safeParse(id).success) throw new McpAccessError('Invalid id', 400)
  const admin = createAdminClient()
  const { data, error } = await admin.from(collection).select(selectFields(collection)).eq('id', id).maybeSingle()
  if (error) throw new Error('Content lookup unavailable')
  if (!data) throw new McpAccessError('Item not found', 404)
  return { collection, item: data, version: digestContent(data) }
}

export async function queueContentChange(
  context: { userId: string; clientId: string },
  operation: 'create' | 'update',
  collection: string,
  changes: unknown,
  id?: string,
) {
  const definition = table(collection)
  const cleaned = parseContentChanges(collection, operation, changes)
  if (operation === 'create' && !definition.create) throw new McpAccessError('Creation blocked', 403)
  if (operation === 'update' && (!id || !uuid.safeParse(id).success)) throw new McpAccessError('Existing item id required', 400)
  let previousHash: string | null = null
  if (operation === 'update') {
    const existing = await getContent(collection, id!)
    previousHash = existing.version
  }
  const admin = createAdminClient()
  const { data, error } = await admin.from('mcp_content_requests').insert({
    collection, operation, target_id: operation === 'update' ? id : null,
    changes: cleaned, previous_hash: previousHash,
    requested_by: context.userId, client_id: context.clientId,
  }).select('id, status, created_at').single()
  if (error || !data) throw new Error('Could not store content approval request')
  return { request_id: data.id, status: data.status, created_at: data.created_at, needs_admin_approval: true, review_url: 'https://neuroklast.net/admin/ai-content' }
}

export async function listMyRequests(context: { userId: string }, limit = 20) {
  const n = Number.isInteger(limit) ? Math.max(1, Math.min(limit, 50)) : 20
  const admin = createAdminClient()
  const { data, error } = await admin.from('mcp_content_requests')
    .select('id, collection, operation, target_id, target_key, status, created_at, reviewed_at, error')
    .eq('requested_by', context.userId).order('created_at', { ascending: false }).limit(n)
  if (error) throw new Error('Approval history unavailable')
  return { requests: data }
}

export function contentCapabilities() {
  return CONTENT_COLLECTIONS.map((collection) => ({
    collection, create: getContentDefinition(collection)?.create === true,
    writable_fields: allowedContentFields(collection),
    deletion: false, requires_approval: true,
  }))
}


export async function getSiteContent(key: string) {
  if (!canReadSiteContent(key)) throw new McpAccessError('Site content key not readable', 403)
  const admin = createAdminClient()
  const { data, error } = await admin.from('site_config').select('key, value').eq('key', key).maybeSingle()
  if (error) throw new Error('Site text lookup unavailable')
  return { key, value: data?.value ?? null, version: digestContent({ value: data?.value ?? null }) }
}

export async function queueSiteContentChange(
  context: { userId: string; clientId: string }, key: string, changes: unknown,
) {
  const cleaned = parseSiteContentPatch(key, changes)
  const current = await getSiteContent(key)
  const admin = createAdminClient()
  const { data, error } = await admin.from('mcp_content_requests').insert({
    collection: 'site_config', operation: 'config', target_id: null, target_key: key,
    changes: cleaned, previous_hash: current.version,
    requested_by: context.userId, client_id: context.clientId,
  }).select('id, status, created_at').single()
  if (error || !data) throw new Error('Could not store site text proposal')
  return { request_id: data.id, status: data.status, needs_admin_approval: true, review_url: 'https://neuroklast.net/admin/ai-content' }
}

export function siteContentCapabilities() {
  return { read: READABLE_SITE_CONTENT, edit: WRITABLE_SITE_CONTENT, action: 'manual approval required' }
}

export { digestContent, filterContentRow }
