import { adminFailureMessage } from '@/lib/neurokore/admin-error'
import { admin, json, limit, sameOrigin } from '@/lib/neurokore/server'
import { applyIdempotentSchema, loadSchemaSql } from '@/lib/schema-apply-on-deploy'

export const runtime = 'nodejs'
export const maxDuration = 120

function databaseUrl(): string | null {
  const url =
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    ''
  return url || null
}

/** Admin-only one-click apply of the idempotent supabase/schema.sql. */
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'admin-apply-schema', 2)
    await admin()
    const dbUrl = databaseUrl()
    if (!dbUrl) {
      return json({
        error: 'Set SUPABASE_DB_URL (direct Postgres URI, port 5432) in the deployment environment, then retry.',
      }, 503)
    }
    await applyIdempotentSchema(dbUrl, await loadSchemaSql())
    return json({ ok: true })
  } catch (error) {
    console.error('[admin-apply-schema]', error)
    return json({ error: adminFailureMessage(error) }, 400)
  }
}
