import { betaDiagnosticSchema } from '@/lib/neurokore/beta-diagnostics'
import { body, db } from '@/lib/neurokore/server'
import { consumeRateLimitForRequest } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Max-Age': '3600',
  'Cache-Control': 'no-store',
}
function empty(status: number) { return new Response(null, { status, headers: cors }) }

/** Anonymous ingress: limited size, exact allowlist, server-side insert, no public DB writes. */
export async function OPTIONS() { return empty(204) }
export async function POST(request: Request) {
  if (!process.env.CRON_SECRET) return empty(503) // Never collect unless retention is configured.
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
    return empty(415)
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (!Number.isFinite(declared) || declared > 4096) return empty(413)

  let submitted: unknown
  try { submitted = await body(request) }
  catch { return empty(400) }
  const parsed = betaDiagnosticSchema.safeParse(submitted)
  if (!parsed.success) return empty(400)

  // The existing global atomic limiter hashes the caller IP. No IP is written to diagnostics.
  try {
    const rl = await consumeRateLimitForRequest(request, {
      namespace: 'neurokore-beta-diagnostics', limit: 12, windowSeconds: 60,
    })
    if (!rl.allowed) return empty(429)
  } catch { return empty(503) } // Fail closed.

  try {
    const { error } = await db().from('plugin_beta_diagnostics').insert({
      schema_version: parsed.data.schema, plugin_version: parsed.data.version,
      event_code: parsed.data.code, os_family: parsed.data.os, host_family: parsed.data.host,
      plugin_format: parsed.data.format, cpu_cores_bucket: parsed.data.cpuCores,
      memory_gb_bucket: parsed.data.memoryGb, sample_rate: parsed.data.sampleRate,
      buffer_size: parsed.data.bufferSize, bundle: parsed.data.bundle ?? null,
      line_number: parsed.data.line ?? null,
    })
    if (error) return empty(503)
    return empty(204)
  } catch { return empty(503) }
}
