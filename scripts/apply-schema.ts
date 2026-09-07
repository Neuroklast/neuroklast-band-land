import { config } from 'dotenv'
import { applyIdempotentSchema, loadSchemaSql } from '../lib/schema-apply-on-deploy'

config()

async function main(): Promise<void> {
  const dbUrl =
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim()
  if (!dbUrl) {
    throw new Error('Set SUPABASE_DB_URL (direct Postgres URI, port 5432)')
  }
  const schemaSql = await loadSchemaSql()
  await applyIdempotentSchema(dbUrl, schemaSql)
  console.info('[schema-apply] local apply complete')
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
