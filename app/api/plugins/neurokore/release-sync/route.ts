import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { body, json, limit } from '@/lib/neurokore/server'
import { importedReleaseStatus, importOfficialRelease, importVersionSchema, releaseImportAuthorized } from '@/lib/plugins/release-import-server'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: Request) {
  if (!releaseImportAuthorized(request)) return json({ error: 'Release sync authorization required' }, 401)
  try {
    await limit(request, 'neurokore-release-sync-status', 60)
    const version = importVersionSchema.parse(new URL(request.url).searchParams.get('version'))
    return json(await importedReleaseStatus(version))
  } catch { return json({ error: 'Website release status unavailable' }, 503) }
}

export async function POST(request: Request) {
  if (!releaseImportAuthorized(request)) return json({ error: 'Release sync authorization required' }, 401)
  try {
    await limit(request, 'neurokore-release-sync-write', 10)
    const input = z.object({ version: importVersionSchema }).strict().parse(await body(request))
    const result = await importOfficialRelease(input.version)
    if (!(await importedReleaseStatus(input.version)).ready) throw new Error('Website publication is incomplete or withdrawn')
    for (const path of ['/', '/plugins', '/plugins/neurokore', '/plugins/neurokore/download', '/admin/plugins', '/admin/products']) revalidatePath(path)
    revalidatePath('/admin/plugins/[id]', 'page')
    return json({ ...result, ready: true, status: 'published' })
  } catch (error) {
    console.error('NEUROKORE release import failed:', error instanceof Error ? error.message : 'Storage/database error')
    return json({ error: 'R2 transfer incomplete. Existing downloads are unchanged; retry this version.' }, 409)
  }
}
