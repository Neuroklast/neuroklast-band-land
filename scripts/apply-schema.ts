import { config } from 'dotenv'
import postgres from 'postgres'
import { applyIdempotentSchema, loadSchemaSql } from '../lib/schema-apply-on-deploy'

config()

/** This command is the only supported production schema application entrypoint. */
async function main(): Promise<void> {
  if (process.env.VERCEL === '1') {
    throw new Error('Database schema changes are forbidden in Vercel builds and functions')
  }
  const dbUrl = process.env.SUPABASE_DB_URL?.trim()
  if (!dbUrl) {
    throw new Error('Set SUPABASE_DB_URL explicitly; DATABASE_URL / POSTGRES_URL are not migration credentials')
  }
  const url = new URL(dbUrl)
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('SUPABASE_DB_URL must be a PostgreSQL connection string')
  }

  // Authenticate and verify basic connectivity without applying schema first.
  // The --check-only mode is safe for pre-deployment diagnostics.
  const sql = postgres(dbUrl, { max: 1, ssl: 'require', connect_timeout: 10 })
  try {
    await sql`SELECT 1`
  } catch {
    throw new Error('Postgres connection check failed; check SUPABASE_DB_URL privately before deployment')
  } finally {
    await sql.end({ timeout: 5 })
  }
  if (process.argv.includes('--check-only')) {
    console.info('[schema-apply] PostgreSQL connection verified; no changes applied')
    return
  }

  await applyIdempotentSchema(dbUrl, await loadSchemaSql())
  console.info('[schema-apply] explicit schema application completed')
}

void main().catch((error: unknown) => {
  // Never print the database connection string or underlying authentication payload.
  console.error(error instanceof Error ? error.message : 'Schema operation failed')
  process.exitCode = 1
})
