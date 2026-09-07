'use server'

import { revalidatePath } from 'next/cache'
import { runAdminAction } from '@/app/admin/_actions/auth'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { cacheRemoteImageToR2 } from '@/app/admin/_actions/cacheRemoteImage'
import { uploadBufferToR2 } from '@/app/admin/_actions/r2Upload'
import { MEDIA_BUCKET } from '@/lib/constants'
import { contentObjectKey, contentHashFromKey } from '@/lib/r2-object-key'
import {
  downloadGoogleDriveFile,
  isGoogleDriveUrl,
  extractGoogleDriveFolderId,
} from '@/lib/drive-migrate'
import { extractGoogleDriveFileId, extensionFromContentType } from '@/lib/remote-image-url'
import { assertSafeRemoteUrl } from '@/lib/ssrf-guard'
import {
  buildImportRows,
  collectMediaUrls,
  parseSiteConfigContentPayload,
  reconcileImportedMembers,
  type ImportMediaEntry,
  type ImportMediaMap,
} from '@/lib/site-config-content-import'
import { chunkRows } from '@/lib/site-data-backup'

export interface ImportContentResult {
  ok: boolean
  summary?: Record<string, number>
  media?: { uploaded: number; failed: number }
  errors?: string[]
  error?: string
}

async function downloadRemoteFile(url: string): Promise<{ bytes: Buffer; contentType: string; extension: string } | null> {
  if (isGoogleDriveUrl(url)) {
    const folderId = extractGoogleDriveFolderId(url)
    if (folderId) return null
    const fileId = extractGoogleDriveFileId(url)
    if (!fileId) return null
    try {
      const file = await downloadGoogleDriveFile(fileId)
      return { bytes: file.bytes, contentType: file.contentType, extension: file.extension }
    } catch {
      return null
    }
  }

  try {
    await assertSafeRemoteUrl(url)
    const response = await fetch(url, { redirect: 'follow' })
    if (!response.ok) return null
    const contentType = response.headers.get('content-type')?.split(';')[0].trim() || 'application/octet-stream'
    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.byteLength === 0) return null
    return { bytes, contentType, extension: extensionFromContentType(contentType) }
  } catch {
    return null
  }
}

async function rehostMedia(url: string): Promise<ImportMediaEntry | null> {
  // Never throw: if R2 is unavailable (missing bucket / creds) the import must
  // still succeed, keeping the original external URL on the row instead.
  try {
    const image = await cacheRemoteImageToR2(url)
    if (image.ok && image.storagePath) {
      return {
        storagePath: image.storagePath,
        contentHash: contentHashFromKey(image.storagePath) ?? '',
      }
    }
  } catch {
    // fall through to generic file download
  }

  try {
    const file = await downloadRemoteFile(url)
    if (!file) return null
    const objectPath = await contentObjectKey({
      prefix: 'imports',
      data: file.bytes,
      extension: file.extension,
    })
    const { objectPath: storedPath } = await uploadBufferToR2(
      MEDIA_BUCKET,
      objectPath,
      file.bytes,
      file.contentType,
    )
    return {
      storagePath: storedPath,
      contentHash: contentHashFromKey(storedPath) ?? '',
    }
  } catch {
    return null
  }
}

async function upsertTable(client: ReturnType<typeof createAdminClient>, table: string, rows: Array<Record<string, unknown>>): Promise<number> {
  let count = 0
  for (const chunk of chunkRows(rows)) {
    const { error } = await client.from(table).upsert(chunk, { onConflict: 'id' })
    if (error) throw new Error(`${table}: ${error.message}`)
    count += chunk.length
  }
  return count
}

async function upsertBio(client: ReturnType<typeof createAdminClient>, row: Record<string, unknown>): Promise<number> {
  const { data: existing } = await client.from('bio').select('id').limit(1).maybeSingle()
  if (existing?.id) {
    const { error } = await client
      .from('bio')
      .upsert([{ id: existing.id, ...row, updated_at: new Date().toISOString() }], { onConflict: 'id' })
    if (error) throw new Error(`bio: ${error.message}`)
  } else {
    const { error } = await client.from('bio').insert([row])
    if (error) throw new Error(`bio: ${error.message}`)
  }
  return 1
}

async function upsertSiteConfig(client: ReturnType<typeof createAdminClient>, rows: Array<Record<string, unknown>>): Promise<number> {
  let count = 0
  for (const row of rows) {
    const { error } = await client
      .from('site_config')
      .upsert({ key: row.key, value: row.value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw new Error(`site_config.${row.key}: ${error.message}`)
    count += 1
  }
  return count
}

function revalidateImportedPaths() {
  revalidatePath('/')
  revalidatePath('/admin', 'layout')
  revalidatePath('/news', 'layout')
  revalidatePath('/releases')
  revalidatePath('/gigs')
  revalidatePath('/media')
  revalidatePath('/legal-notice')
  revalidatePath('/privacy-policy')
}

export async function importSiteConfigContent(jsonText: string): Promise<ImportContentResult> {
  const result = await runAdminAction(async () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      return { ok: false as const, error: 'Invalid JSON file' }
    }

    const content = parseSiteConfigContentPayload(parsed)
    if (!content.ok) return { ok: false as const, error: content.error }

    const data = content.data.data
    const client = createAdminClient()

    // Re-host every media URL to R2.
    const mediaUrls = collectMediaUrls(data)
    const mediaMap: ImportMediaMap = new Map()
    let uploaded = 0
    let failed = 0
    for (const url of mediaUrls) {
      const entry = await rehostMedia(url)
      if (entry) {
        mediaMap.set(url, entry)
        uploaded += 1
      } else {
        failed += 1
      }
    }

    const { rows } = buildImportRows(data, mediaMap)
    const summary: Record<string, number> = {}
    const errors: string[] = []

    const tableOrder = ['partners', 'gigs', 'releases', 'news_posts', 'gallery', 'media_downloads', 'social_links'] as const
    for (const table of tableOrder) {
      const tableRows = rows[table]
      if (!tableRows || tableRows.length === 0) continue
      try {
        summary[table] = await upsertTable(client, table, tableRows)
      } catch (error) {
        errors.push(error instanceof Error ? error.message : `${table}: unknown error`)
      }
    }

    if (rows.members?.length) {
      try {
        const { data: existingMembers } = await client.from('members').select('id, name')
        const reconciled = reconcileImportedMembers(
          rows.members,
          (existingMembers ?? []) as Array<{ id: string; name: string | null }>,
        )
        summary.members = await upsertTable(client, 'members', reconciled.rows)
        if (reconciled.staleIds.length > 0) {
          const { error: deleteError } = await client.from('members').delete().in('id', reconciled.staleIds)
          if (deleteError) throw new Error(deleteError.message)
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'members: unknown error')
      }
    }

    if (rows.bio?.length) {
      try {
        summary.bio = await upsertBio(client, rows.bio[0])
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'bio: unknown error')
      }
    }

    if (rows.site_config?.length) {
      try {
        summary.site_config = await upsertSiteConfig(client, rows.site_config)
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'site_config: unknown error')
      }
    }

    revalidateImportedPaths()

    return {
      ok: true as const,
      summary,
      media: { uploaded, failed },
      errors: errors.length > 0 ? errors : undefined,
    }
  }, 'Unable to import site config content.')

  if ('error' in result && !('ok' in result)) {
    return { ok: false, error: result.error }
  }
  return result
}
