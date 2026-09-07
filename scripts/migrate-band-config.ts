import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import * as dotenv from 'dotenv'
import {
  createMigrateClient,
  fetchBandConfigFromKv,
  importBandConfigToSupabase,
  migrateDriveAssets,
  unwrapBandConfig,
} from '@/lib/band-config-migrate'

dotenv.config({ path: '.env.local' })
dotenv.config()

const APPLY = process.argv.includes('--apply')
const fromIdx = process.argv.indexOf('--from')
const fromPath = fromIdx >= 0 ? process.argv[fromIdx + 1] : undefined

async function loadRawConfig(): Promise<unknown> {
  if (fromPath) {
    const text = await readFile(resolve(fromPath), 'utf8')
    return JSON.parse(text)
  }

  const kv = await fetchBandConfigFromKv()
  if (kv) return kv

  const fallbacks = ['site-config.json', 'band-config.json', 'src/assets/documents/band-data.json']
  for (const file of fallbacks) {
    try {
      const text = await readFile(resolve(file), 'utf8')
      console.log(`Loaded ${file}`)
      return JSON.parse(text)
    } catch {
      // try next
    }
  }

  throw new Error(
    'No config found. Pass --from path/to.json, or set KV_REST_API_URL + KV_REST_API_TOKEN, or place site-config.json in the repo root.',
  )
}

async function main(): Promise<void> {
  console.log(`Band config → R2 + Supabase (${APPLY ? 'APPLY' : 'dry-run'})`)
  const raw = await loadRawConfig()
  const config = unwrapBandConfig(raw)

  const drive = await migrateDriveAssets({
    config,
    apply: APPLY,
    log: (line) => console.log(line),
  })

  const supabase = createMigrateClient()
  const inserted = await importBandConfigToSupabase({
    supabase,
    config: drive.rewritten,
    apply: APPLY,
    log: (line) => console.log(line),
  })

  console.log('\n── Summary ──────────────────────────────────────────────')
  console.log(`uploaded: ${drive.uploaded} | failed: ${drive.failed}`)
  for (const failure of drive.failures) console.log(`  ✗ ${failure}`)
  console.log(`inserted: ${JSON.stringify(inserted)}`)
  console.log(APPLY ? 'Done.' : 'Nothing written (dry-run). Re-run with --apply to migrate.')
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
