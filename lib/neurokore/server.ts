
import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createActionClient } from '@/lib/supabaseServer'
import { getAdminUserId } from '@/lib/api-admin-auth'
import { consumeRateLimitForRequest } from '@/lib/rate-limit'
import { z } from 'zod'

export function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error('Licensing configuration incomplete')
  return value
}
export function db() {
  return createClient(required('NEXT_PUBLIC_SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } })
}
export function origin(): string {
  const raw = process.env.NEUROKORE_SITE_URL || process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (!raw) throw new Error('Licensing configuration incomplete')
  const url = new URL(raw)
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('HTTPS required')
  return url.origin
}
export function sameOrigin(request: Request) {
  if (request.headers.get('origin') !== origin()) throw new Error('Invalid origin')
}
export async function user() {
  const client: SupabaseClient = await createActionClient()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user?.email || !data.user.email_confirmed_at) throw new Error('Sign in first')
  return { id: data.user.id, email: data.user.email.toLowerCase() }
}
export async function admin() {
  const id = await getAdminUserId()
  if (!id) throw new Error('Administrator required')
  const client: SupabaseClient = await createActionClient()
  const { data, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error || (data?.nextLevel === 'aal2' && data.currentLevel !== 'aal2')) throw new Error('MFA required')
  return id
}
export async function limit(request: Request, namespace: string, count = 10) {
  const result = await consumeRateLimitForRequest(request, { namespace, limit: count, windowSeconds: 60 })
  if (!result.allowed) throw new Error('Too many requests. Please try again later.')
}
export async function body(request: Request): Promise<unknown> {
  // Stream cap also covers requests without Content-Length.
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Missing request')
  const chunks: Uint8Array[] = []
  let length = 0
  while (true) {
    const chunk = await reader.read()
    if (chunk.done) break
    length += chunk.value.byteLength
    if (length > 16384) { await reader.cancel(); throw new Error('Request too large') }
    chunks.push(chunk.value)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}
export const licenseRow = z.object({
  id: z.uuid(), email: z.email(), tier: z.enum(['alpha', 'full']),
  expires_at: z.string().nullable(),
  license_format: z.enum(['v2', 'v3']),
  product_slug: z.string(),
})
export function json(value: unknown, status = 200, cors = false) {
  return Response.json(value, { status, headers: {
    'Cache-Control': 'no-store',
    ...(cors ? { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type' } : {}),
  } })
}
export function unavailable(cors = false) {
  return json({ error: 'Request unavailable. Check your sign-in, license and configuration, then retry.' }, 400, cors)
}
