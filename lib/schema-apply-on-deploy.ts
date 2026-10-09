import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import postgres from 'postgres'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabaseAdmin'

export const SCHEMA_APPLY_DEPLOY_KEY = 'schema_apply_deploy'

export interface SchemaApplyDeployState {
  sha: string
  status: 'running' | 'ok' | 'error'
  startedAt?: string
  finishedAt?: string
  error?: string
}

export const SCHEMA_APPLY_RUNNING_STALE_MS = 10 * 60 * 1000

export function shouldRunSchemaApply(options: {
  vercelEnv: string | undefined
  commitSha: string | undefined
  last: SchemaApplyDeployState | null
  nowMs?: number
}): { run: boolean; reason: string } {
  if (options.vercelEnv !== 'production') {
    return { run: false, reason: `skip: VERCEL_ENV=${options.vercelEnv ?? 'unset'}` }
  }
  const sha = options.commitSha?.trim()
  if (!sha) {
    return { run: false, reason: 'skip: no VERCEL_GIT_COMMIT_SHA' }
  }
  if (options.last?.sha === sha && options.last.status === 'ok') {
    return { run: false, reason: `skip: already ok for ${sha}` }
  }
  if (options.last?.sha === sha && options.last.status === 'running') {
    const started = options.last.startedAt ? Date.parse(options.last.startedAt) : NaN
    const now = options.nowMs ?? Date.now()
    if (Number.isFinite(started) && now - started < SCHEMA_APPLY_RUNNING_STALE_MS) {
      return { run: false, reason: `skip: already running for ${sha}` }
    }
  }
  return { run: true, reason: `run for ${sha}` }
}

function parseDeployState(raw: unknown): SchemaApplyDeployState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>
  if (typeof obj.sha !== 'string' || !obj.sha) return null
  if (obj.status !== 'running' && obj.status !== 'ok' && obj.status !== 'error') return null
  return {
    sha: obj.sha,
    status: obj.status,
    startedAt: typeof obj.startedAt === 'string' ? obj.startedAt : undefined,
    finishedAt: typeof obj.finishedAt === 'string' ? obj.finishedAt : undefined,
    error: typeof obj.error === 'string' ? obj.error : undefined,
  }
}

function resolveDbUrl(): string | null {
  const url =
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    ''
  return url || null
}

/**
 * One instance wins. The compare happens in Postgres (`value = p_previous`).
 * A PostgREST `.eq('value', object)` filter would send `[object Object]`.
 */
export async function claimSiteConfigRun(
  supabase: SupabaseClient,
  key: string,
  previous: unknown,
  next: unknown,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('claim_site_config_run', {
    p_key: key,
    p_previous: previous,
    p_next: next,
  })
  if (error) throw new Error(error.message)
  return data === true
}

export function isMissingClaimRpc(message: string): boolean {
  return message.includes('claim_site_config_run') || message.includes('PGRST202')
}

export function isMissingSiteConfigTable(message: string): boolean {
  return (
    /site_config/i.test(message) &&
    /does not exist|schema cache|42P01|PGRST205/i.test(message)
  )
}

export async function applyIdempotentSchema(dbUrl: string, schemaSql: string): Promise<void> {
  const sql = postgres(dbUrl, {
    max: 1,
    ssl: 'require',
    idle_timeout: 20,
    connect_timeout: 15,
  })
  try {
    await sql.unsafe(schemaSql)
  } finally {
    await sql.end({ timeout: 5 })
  }
}

export async function loadSchemaSql(): Promise<string> {
  const filePath = join(process.cwd(), 'supabase', 'schema.sql')
  return readFile(filePath, 'utf8')
}

export async function runProductionDeploySchemaApply(): Promise<void> {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim()
  const dbUrl = resolveDbUrl()
  if (!dbUrl) {
    if (process.env.VERCEL_ENV === 'production') {
      console.info('[schema-apply] skip: SUPABASE_DB_URL / DATABASE_URL missing')
    }
    return
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (process.env.VERCEL_ENV === 'production') {
      console.info('[schema-apply] skip: Supabase admin env incomplete')
    }
    return
  }

  const supabase = createAdminClient()
  const { data, error: readError } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', SCHEMA_APPLY_DEPLOY_KEY)
    .maybeSingle()

  const last = readError ? null : parseDeployState(data?.value)
  if (readError) {
    console.info('[schema-apply] site_config unread (fresh project?):', readError.message)
  }

  const decided = shouldRunSchemaApply({
    vercelEnv: process.env.VERCEL_ENV,
    commitSha: sha,
    last,
  })
  console.info(`[schema-apply] ${decided.reason}`)
  if (!decided.run || !sha) return

  const startedAt = new Date().toISOString()
  if (readError && !isMissingSiteConfigTable(readError.message)) {
    console.info('[schema-apply] skip: cannot read deploy state')
    return
  }
  if (!readError) {
    try {
      const claimed = await claimSiteConfigRun(supabase, SCHEMA_APPLY_DEPLOY_KEY, data?.value ?? null, {
        sha,
        status: 'running',
        startedAt,
      } satisfies SchemaApplyDeployState)
      if (!claimed) {
        console.info('[schema-apply] skip: another instance claimed this deploy')
        return
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'claim failed'
      if (!isMissingClaimRpc(message)) {
        console.error('[schema-apply] claim failed:', message)
        return
      }
      console.info('[schema-apply] claim function missing; applying schema once')
    }
  }

  try {
    const schemaSql = await loadSchemaSql()
    await applyIdempotentSchema(dbUrl, schemaSql)
    const finishedAt = new Date().toISOString()
    await supabase.from('site_config').upsert({
      key: SCHEMA_APPLY_DEPLOY_KEY,
      value: { sha, status: 'ok', startedAt, finishedAt } satisfies SchemaApplyDeployState,
      updated_at: finishedAt,
    })
    console.info('[schema-apply] done')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('[schema-apply] failed:', message)
    await supabase.from('site_config').upsert({
      key: SCHEMA_APPLY_DEPLOY_KEY,
      value: {
        sha,
        status: 'error',
        startedAt,
        finishedAt: new Date().toISOString(),
        error: message,
      } satisfies SchemaApplyDeployState,
      updated_at: new Date().toISOString(),
    })
  }
}
