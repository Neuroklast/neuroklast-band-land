import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { MEDIA_BUCKET } from '@/lib/constants'
import { contentObjectKey } from '@/lib/r2-object-key'
import { getStorageProvider } from '@/lib/storage'
import {
  collectDriveFileIdsFromFolders,
  collectGoogleDriveFileIds,
  collectGoogleDriveFolderIds,
  downloadGoogleDriveFile,
} from '@/lib/drive-migrate'

export interface BandConfigMigrateLog {
  (line: string): void
}

export interface BandConfigMigrateResult {
  driveFiles: number
  uploaded: number
  reused: number
  failed: number
  failures: string[]
  inserted: Record<string, number>
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

export function unwrapBandConfig(raw: unknown): Record<string, unknown> {
  const obj = asRecord(raw)
  if (!obj) throw new Error('Band config JSON must be an object')

  if (asRecord(obj['site-config'])) return asRecord(obj['site-config']) as Record<string, unknown>
  if (asRecord(obj.siteConfig)) return asRecord(obj.siteConfig) as Record<string, unknown>
  if (asRecord(obj.value) && (obj.key === 'site-config' || obj.key === 'band-data')) {
    return asRecord(obj.value) as Record<string, unknown>
  }
  if (Array.isArray(obj.result) || typeof obj.result === 'string' || asRecord(obj.result)) {
    const result = obj.result
    if (typeof result === 'string') {
      try {
        return unwrapBandConfig(JSON.parse(result))
      } catch {
        throw new Error('KV result string is not JSON')
      }
    }
    return unwrapBandConfig(result)
  }
  if (asRecord(obj.band) || Array.isArray(obj.gigs) || obj.siteName || obj.biography) {
    return obj
  }
  throw new Error('Unrecognized band config shape')
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function splitLocation(location: string | null): { city: string | null; country: string | null } {
  if (!location) return { city: null, country: null }
  const parts = location.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length === 0) return { city: null, country: null }
  if (parts.length === 1) return { city: parts[0], country: null }
  return { city: parts.slice(0, -1).join(', '), country: parts[parts.length - 1] }
}

function streamingLinksFromRecord(links: unknown): Array<{ platform: string; url: string }> {
  const record = asRecord(links)
  if (!record) return []
  return Object.entries(record)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0)
    .map(([platform, url]) => ({ platform, url }))
}

export function rewriteDriveUrls(value: unknown, map: Map<string, string>): unknown {
  if (typeof value === 'string') {
    for (const [fileId, publicUrl] of map) {
      if (value.includes(fileId)) return publicUrl
    }
    return value
  }
  if (Array.isArray(value)) return value.map((item) => rewriteDriveUrls(item, map))
  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      next[key] = rewriteDriveUrls(nested, map)
    }
    return next
  }
  return value
}

export async function uploadDriveFileToR2(args: {
  fileId: string
  prefix: string
}): Promise<{ storagePath: string; publicUrl: string }> {
  const file = await downloadGoogleDriveFile(args.fileId)
  const storagePath = await contentObjectKey({
    prefix: args.prefix,
    data: file.bytes,
    extension: file.extension,
  })
  const storage = getStorageProvider()
  await storage.uploadObject(MEDIA_BUCKET, storagePath, file.bytes, file.contentType)
  return { storagePath, publicUrl: storage.getPublicUrl(MEDIA_BUCKET, storagePath) }
}

export async function migrateDriveAssets(args: {
  config: Record<string, unknown>
  apply: boolean
  log: BandConfigMigrateLog
}): Promise<{ rewritten: Record<string, unknown>; uploaded: number; reused: number; failed: number; failures: string[] }> {
  const folderIds = collectGoogleDriveFolderIds(args.config)
  const fileIds = new Set(collectGoogleDriveFileIds(args.config))
  const folderFileIds = new Set<string>()
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim()

  if (folderIds.length > 0) {
    if (!apiKey) {
      args.log(`Drive folders found (${folderIds.length}) but GOOGLE_DRIVE_API_KEY is unset — folder files skipped`)
    } else {
      const nested = await collectDriveFileIdsFromFolders(folderIds, apiKey)
      args.log(`Drive folders: ${folderIds.length} → ${nested.length} files`)
      for (const id of nested) {
        fileIds.add(id)
        folderFileIds.add(id)
      }
    }
  }

  const map = new Map<string, string>()
  let uploaded = 0
  const reused = 0
  let failed = 0
  const failures: string[] = []

  args.log(`Drive files to migrate: ${fileIds.size}`)

  for (const fileId of fileIds) {
    if (!args.apply) {
      args.log(`  dry-run ${fileId}`)
      continue
    }
    try {
      const result = await uploadDriveFileToR2({ fileId, prefix: 'migrated/drive' })
      map.set(fileId, result.publicUrl)
      uploaded += 1
      args.log(`  ok ${fileId} → ${result.storagePath}`)
    } catch (error) {
      failed += 1
      const message = error instanceof Error ? error.message : String(error)
      failures.push(`${fileId}: ${message}`)
      args.log(`  fail ${fileId}: ${message}`)
    }
  }

  const rewritten = rewriteDriveUrls(args.config, map) as Record<string, unknown>
  const extraGallery = [...folderFileIds]
    .map((id) => map.get(id))
    .filter((url): url is string => typeof url === 'string')
    .map((url) => ({ url }))
  if (extraGallery.length > 0) {
    const existing = Array.isArray(rewritten.galleryImages) ? rewritten.galleryImages : []
    rewritten.galleryImages = [...existing, ...extraGallery]
  }
  return { rewritten, uploaded, reused, failed, failures }
}

async function upsertSiteConfig(
  supabase: SupabaseClient,
  key: string,
  value: unknown,
): Promise<void> {
  const { error } = await supabase.from('site_config').upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(`site_config.${key}: ${error.message}`)
}

export async function importBandConfigToSupabase(args: {
  supabase: SupabaseClient
  config: Record<string, unknown>
  apply: boolean
  log: BandConfigMigrateLog
}): Promise<Record<string, number>> {
  const inserted: Record<string, number> = {}
  const config = args.config
  const biography = asRecord(config.biography)
  const social = asRecord(config.socialLinks) ?? {}
  const impressum = asRecord(config.impressum)

  const siteName = asString(config.siteName) ?? asString(asRecord(config.band)?.name) ?? 'Neuroklast'
  const tagline = asString(config.tagline) ?? (Array.isArray(config.genres) ? (config.genres as string[]).join(' / ') : null)

  if (!args.apply) {
    args.log(`Would write site_config hero/legal + content tables for ${siteName}`)
    return inserted
  }

  await upsertSiteConfig(args.supabase, 'hero', {
    headline: siteName.toUpperCase(),
    tagline: tagline ?? 'Industrial / Electronic',
    ctaLabel: 'INITIALIZE',
    ctaUrl: '#news',
    logoUrl: asString(config.logoUrl) ?? asString(config.titleImageUrl) ?? '/brand/neuroklast-wordmark.svg',
    bootSequenceEnabled: true,
  })
  if (impressum) {
    await upsertSiteConfig(args.supabase, 'legal', {
      operatorName: asString(impressum.name) ?? '',
      street: asString(impressum.street) ?? '',
      zipCity: asString(impressum.zipCity) ?? '',
      country: 'Germany',
      email: asString(impressum.email) ?? '',
      responsiblePerson: asString(impressum.responsibleName) ?? '',
    })
  }

  const story = asString(biography?.story)
  if (story) {
    const { data: existing } = await args.supabase.from('bio').select('id').limit(1).maybeSingle()
    if (existing?.id) {
      const { error } = await args.supabase.from('bio').update({ content: story, updated_at: new Date().toISOString() }).eq('id', existing.id)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await args.supabase.from('bio').insert({ content: story })
      if (error) throw new Error(error.message)
    }
    inserted.bio = 1
  }

  const membersRaw = Array.isArray(biography?.members) ? biography.members : []
  let memberCount = 0
  for (const [index, raw] of membersRaw.entries()) {
    if (typeof raw === 'string') {
      const match = raw.match(/^(.*?)(?:\s*\((.+)\))?$/)
      const { error } = await args.supabase.from('members').insert({
        name: (match?.[1] ?? raw).trim(),
        role: match?.[2]?.trim() ?? null,
        display_order: index,
        active: true,
      })
      if (error) throw new Error(error.message)
      memberCount += 1
      continue
    }
    const member = asRecord(raw)
    if (!member) continue
    const photo = asString(member.photo)
    const { error } = await args.supabase.from('members').insert({
      name: asString(member.name) ?? `Member ${index + 1}`,
      role: asString(member.subjectLabel) ?? null,
      bio: asString(member.bio),
      photo_url: photo,
      display_order: index,
      active: true,
    })
    if (error) throw new Error(error.message)
    memberCount += 1
  }
  inserted.members = memberCount

  const gigs = Array.isArray(config.gigs) ? config.gigs : []
  let gigCount = 0
  for (const raw of gigs) {
    const gig = asRecord(raw)
    if (!gig) continue
    const loc = splitLocation(asString(gig.location))
    const { error } = await args.supabase.from('gigs').insert({
      title: asString(gig.venue) ?? asString(gig.title) ?? 'Gig',
      venue: asString(gig.venue),
      city: loc.city,
      country: loc.country,
      event_date: asString(gig.date) ?? new Date().toISOString(),
      ticket_url: asString(gig.ticketUrl),
      description: asString(gig.description),
      active: true,
    })
    if (error) throw new Error(error.message)
    gigCount += 1
  }
  inserted.gigs = gigCount

  const releases = Array.isArray(config.releases) ? config.releases : []
  let releaseCount = 0
  for (const [index, raw] of releases.entries()) {
    const release = asRecord(raw)
    if (!release) continue
    const artwork = asString(release.artwork)
    const { error } = await args.supabase.from('releases').insert({
      title: asString(release.title) ?? `Release ${index + 1}`,
      type: asString(release.type) ?? 'single',
      release_date: asString(release.releaseDate),
      description: asString(release.description),
      cover_url: artwork,
      streaming_links: streamingLinksFromRecord(release.streamingLinks),
      tracks: Array.isArray(release.tracks) ? release.tracks : [],
      display_order: index,
      active: true,
      manually_edited: true,
    })
    if (error) throw new Error(error.message)
    releaseCount += 1
  }
  inserted.releases = releaseCount

  const news = Array.isArray(config.news) ? config.news : []
  let newsCount = 0
  for (const [index, raw] of news.entries()) {
    const item = asRecord(raw)
    if (!item) continue
    const title = asString(item.text) ?? `News ${index + 1}`
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `news-${index + 1}`
    const { error } = await args.supabase.from('news_posts').insert({
      title,
      slug: `${slug}-${index + 1}`,
      excerpt: asString(item.details),
      body: asString(item.details) ?? title,
      cover_url: asString(item.photo),
      published_at: asString(item.date) ?? new Date().toISOString(),
      display_order: index,
      active: true,
    })
    if (error) throw new Error(error.message)
    newsCount += 1
  }
  inserted.news_posts = newsCount

  const gallery = Array.isArray(config.galleryImages) ? config.galleryImages : []
  let galleryCount = 0
  for (const [index, raw] of gallery.entries()) {
    const image = asRecord(raw)
    const url = asString(image?.url) ?? (typeof raw === 'string' ? raw : null)
    if (!url) continue
    const { error } = await args.supabase.from('gallery').insert({
      image_url: url,
      alt: asString(image?.caption) ?? '',
      caption: asString(image?.caption),
      display_order: index,
      active: true,
    })
    if (error) throw new Error(error.message)
    galleryCount += 1
  }
  inserted.gallery = galleryCount

  const media = Array.isArray(config.mediaFiles) ? config.mediaFiles : []
  let mediaCount = 0
  for (const [index, raw] of media.entries()) {
    const file = asRecord(raw)
    if (!file) continue
    const url = asString(file.url)
    if (!url) continue
    const { error } = await args.supabase.from('media_downloads').insert({
      title: asString(file.name) ?? `File ${index + 1}`,
      description: asString(file.description),
      category: 'other',
      file_url: url,
      display_order: index,
      active: true,
    })
    if (error) throw new Error(error.message)
    mediaCount += 1
  }
  inserted.media_downloads = mediaCount

  const friends = Array.isArray(biography?.friends) ? biography.friends : []
  let partnerCount = 0
  for (const [index, raw] of friends.entries()) {
    const friend = asRecord(raw)
    if (!friend) continue
    const { error } = await args.supabase.from('partners').insert({
      name: asString(friend.name) ?? `Partner ${index + 1}`,
      url: asString(friend.url),
      logo_url: asString(friend.iconPhoto) ?? asString(friend.photo),
      category: 'partner',
      display_order: index,
      active: true,
      logo_white: true,
    })
    if (error) throw new Error(error.message)
    partnerCount += 1
  }
  inserted.partners = partnerCount

  let socialCount = 0
  let socialOrder = 0
  for (const [platform, urlValue] of Object.entries(social)) {
    const url = asString(urlValue)
    if (!url) continue
    const { error } = await args.supabase.from('social_links').insert({
      platform,
      url,
      label: platform,
      display_order: socialOrder,
      active: true,
    })
    if (error) throw new Error(error.message)
    socialOrder += 1
    socialCount += 1
  }
  inserted.social_links = socialCount

  args.log(`Imported ${siteName}: ${JSON.stringify(inserted)}`)
  return inserted
}

export async function fetchBandConfigFromKv(): Promise<unknown | null> {
  const url = process.env.KV_REST_API_URL?.replace(/\/$/, '')
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null

  const res = await fetch(`${url}/get/site-config`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const bandData = await fetch(`${url}/get/band-data`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!bandData.ok) return null
    return bandData.json()
  }
  return res.json()
}

export function createMigrateClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}


