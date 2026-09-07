/**
 * Import the legacy "site-config-content" export (exportScope: "content").
 *
 * This is the old single-document content model (biography with members /
 * achievements / collabs / friends, releases, news, gallery, media files,
 * social links, impressum, datenschutz). It is NOT the relational
 * site-data-backup format. This module parses it and maps it onto the current
 * Supabase tables, re-hosting media to R2 via an injected media map so the
 * pure mapping stays testable (no server-action imports).
 */

import { createHash } from 'node:crypto'

export interface SiteConfigContentFile {
  exportVersion?: string
  exportScope?: string
  templateVersion?: string
  siteName?: string
  data: Record<string, unknown>
}

export interface ImportMediaEntry {
  storagePath: string
  contentHash: string
}

export type ImportMediaMap = Map<string, ImportMediaEntry>

export type SiteConfigContentRow = Record<string, unknown>

export interface BuildImportRowsResult {
  rows: Record<string, SiteConfigContentRow[]>
  mediaUrls: string[]
  summary: Record<string, number>
}

export interface ParseContentResult {
  ok: true
  data: SiteConfigContentFile
}

export interface ParseContentError {
  ok: false
  error: string
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return isPlainObject(value) ? value : null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
  }
  return []
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => isPlainObject(item))
  return []
}

function asObject(value: unknown): Record<string, unknown> {
  return isPlainObject(value) ? value : {}
}

function asLocalizedString(value: unknown): string | null {
  const direct = asString(value)
  if (direct) return direct
  const record = asRecord(value)
  if (!record) return null
  return (
    asString(record.en) ??
    asString(record.de) ??
    asString(record.story) ??
    asString(record.text) ??
    asString(record.content)
  )
}

function biographyStory(biography: Record<string, unknown> | null, data: Record<string, unknown>): string | null {
  if (!biography) return asString(data.bio) ?? asString(data.story)
  return (
    asLocalizedString(biography.story) ??
    asLocalizedString(biography.content) ??
    asLocalizedString(biography.text) ??
    asLocalizedString(biography.bio)
  )
}

function memberEntries(biography: Record<string, unknown> | null): Record<string, unknown>[] {
  const raw = biography?.members
  if (!Array.isArray(raw)) return []
  const entries: Record<string, unknown>[] = []
  for (const item of raw) {
    if (typeof item === 'string' && item.trim()) {
      const match = item.trim().match(/^(.*?)(?:\s*\((.+)\))?$/)
      entries.push({
        name: (match?.[1] ?? item).trim(),
        statusValue: match?.[2]?.trim() ?? null,
      })
      continue
    }
    if (isPlainObject(item)) entries.push(item)
  }
  return entries
}

function recordArrayFromKeys(data: Record<string, unknown>, keys: string[]): Record<string, unknown>[] {
  for (const key of keys) {
    const rows = asRecordArray(data[key])
    if (rows.length > 0) return rows
  }
  return []
}

export function parseSiteConfigContentPayload(input: unknown): ParseContentResult | ParseContentError {
  const root = asRecord(input)
  if (!root) return { ok: false, error: 'Site config content must be a JSON object' }

  const data = asRecord(root.data)
  if (!data) return { ok: false, error: 'Missing "data" object' }

  return {
    ok: true,
    data: {
      exportVersion: asString(root.exportVersion) ?? undefined,
      exportScope: asString(root.exportScope) ?? undefined,
      templateVersion: asString(root.templateVersion) ?? undefined,
      siteName: asString(root.siteName) ?? undefined,
      data,
    },
  }
}

/** Derive a stable UUID from a seed so re-imports upsert instead of duplicating. */
export function deterministicUuid(seed: string): string {
  const hash = createHash('sha256').update(seed).digest('hex')
  const hex = hash.slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function normalizeReleaseDate(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function normalizeDate(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
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

function mediaFor(
  mediaMap: ImportMediaMap,
  url: unknown,
): { storagePath: string | null; contentHash: string | null } {
  const entry = mediaMap.get(asString(url) ?? '')
  if (!entry) return { storagePath: null, contentHash: null }
  return { storagePath: entry.storagePath, contentHash: entry.contentHash }
}

/** All media URLs that need to be re-hosted to R2 (images + downloadable files). */
export function collectMediaUrls(data: Record<string, unknown>): string[] {
  const urls: string[] = []
  const push = (value: unknown) => {
    const s = asString(value)
    if (s) urls.push(s)
  }

  const biography = asRecord(data.biography)
  for (const member of memberEntries(biography)) push(member.photo)
  for (const friend of asRecordArray(biography?.friends)) {
    push(friend.photo)
    push(friend.iconPhoto)
    push(friend.profilePhoto)
  }
  for (const gig of recordArrayFromKeys(data, ['gigs', 'events'])) push(gig.photo)
  for (const release of asRecordArray(data.releases)) push(release.artwork)
  for (const item of recordArrayFromKeys(data, ['news', 'newsPosts', 'news_posts'])) push(item.photo)
  for (const image of asRecordArray(data.galleryImages)) push(image.url)
  for (const file of asRecordArray(data.mediaFiles)) push(file.url)

  return Array.from(new Set(urls))
}

export function buildImportRows(
  data: Record<string, unknown>,
  mediaMap: ImportMediaMap,
): BuildImportRowsResult {
  const rows: Record<string, SiteConfigContentRow[]> = {}
  const summary: Record<string, number> = {}
  const biography = asRecord(data.biography)

  // ── bio (single row, content + achievements + collabs) ────────────────
  const story = biographyStory(biography, data)
  const achievements = asStringArray(biography?.achievements)
  const collabs = asStringArray(biography?.collabs)
  if (story || achievements.length > 0 || collabs.length > 0) {
    rows.bio = [{ content: story ?? '', achievements, collabs }]
    summary.bio = 1
  }

  // ── members ───────────────────────────────────────────────────────────
  const members = memberEntries(biography)
  if (members.length > 0) {
    rows.members = members.map((member, index) => {
      const photo = asString(member.photo)
      const { storagePath } = mediaFor(mediaMap, photo)
      const name = asString(member.name) ?? `Member ${index + 1}`
      return {
        id: deterministicUuid(`member-${asString(member.id) ?? name}`),
        name,
        role:
          asString(member.statusValue) ??
          asString(member.statusLabel) ??
          asString(member.subjectLabel) ??
          asString(member.role) ??
          null,
        bio: asString(member.bio),
        photo_storage_path: storagePath,
        photo_url: photo,
        display_order: index,
        active: true,
      }
    })
    summary.members = rows.members.length
  }

  // ── partners (friends + label) ────────────────────────────────────────
  const partners: SiteConfigContentRow[] = []
  const friends = asRecordArray(biography?.friends)
  for (const [index, friend] of friends.entries()) {
    const logo = asString(friend.iconPhoto) ?? asString(friend.photo) ?? asString(friend.profilePhoto)
    const { storagePath, contentHash } = mediaFor(mediaMap, logo)
    partners.push({
      id: deterministicUuid(`partner-${asString(friend.id) ?? asString(friend.name) ?? index}`),
      name: asString(friend.name) ?? `Partner ${index + 1}`,
      url: asString(friend.url),
      description: asString(friend.description),
      socials: asObject(friend.socials),
      logo_storage_path: storagePath,
      logo_url: logo,
      logo_content_hash: contentHash,
      category: 'partner',
      display_order: index,
      active: true,
      logo_white: true,
    })
  }
  const label = asString(data.label)
  if (label) {
    partners.push({
      id: deterministicUuid(`partner-label-${label}`),
      name: label,
      description: 'Label',
      category: 'label',
      display_order: friends.length,
      active: true,
      logo_white: true,
    })
  }
  if (partners.length > 0) {
    rows.partners = partners
    summary.partners = partners.length
  }

  // ── gigs ──────────────────────────────────────────────────────────────
  const gigs = recordArrayFromKeys(data, ['gigs', 'events'])
  if (gigs.length > 0) {
    rows.gigs = gigs.map((gig, index) => {
      const loc = splitLocation(asString(gig.location) ?? asString(gig.city))
      const photo = asString(gig.photo)
      const { storagePath, contentHash } = mediaFor(mediaMap, photo)
      return {
        id: deterministicUuid(`gig-${asString(gig.id) ?? asString(gig.venue) ?? index}`),
        title: asString(gig.venue) ?? asString(gig.title) ?? `Gig ${index + 1}`,
        venue: asString(gig.venue),
        city: loc.city,
        country: loc.country,
        event_date: normalizeDate(asString(gig.date) ?? asString(gig.eventDate) ?? asString(gig.event_date)) ?? new Date().toISOString(),
        ticket_url: asString(gig.ticketUrl) ?? asString(gig.ticket_url),
        description: asString(gig.description),
        gig_type: asString(gig.gigType) ?? asString(gig.gig_type),
        status: asString(gig.status) ?? 'confirmed',
        supporting_artists: asStringArray(gig.supportingArtists ?? gig.supporting_artists),
        event_links: asObject(gig.eventLinks ?? gig.event_links),
        photo_storage_path: storagePath,
        photo_url: photo,
        photo_content_hash: contentHash,
        active: true,
      }
    })
    summary.gigs = rows.gigs.length
  }

  // ── releases ──────────────────────────────────────────────────────────
  const releases = asRecordArray(data.releases)
  if (releases.length > 0) {
    rows.releases = releases.map((release, index) => {
      const artwork = asString(release.artwork)
      const { storagePath, contentHash } = mediaFor(mediaMap, artwork)
      const exportId = asString(release.id) ?? ''
      const itunesMatch = exportId.match(/itunes-(\d+)/)
      return {
        id: deterministicUuid(`release-${exportId || asString(release.title) || index}`),
        title: asString(release.title) ?? `Release ${index + 1}`,
        type: asString(release.type) ?? 'single',
        release_date: normalizeReleaseDate(asString(release.releaseDate)),
        cover_storage_path: storagePath,
        cover_url: artwork,
        cover_content_hash: contentHash,
        streaming_links: streamingLinksFromRecord(release.streamingLinks),
        itunes_id: itunesMatch ? itunesMatch[1] : null,
        display_order: index,
        active: true,
        manually_edited: true,
      }
    })
    summary.releases = rows.releases.length
  }

  // ── news_posts ────────────────────────────────────────────────────────
  const news = recordArrayFromKeys(data, ['news', 'newsPosts', 'news_posts'])
  if (news.length > 0) {
    rows.news_posts = news.map((item, index) => {
      const title = asString(item.text) ?? `News ${index + 1}`
      const baseSlug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `news-${index + 1}`
      const photo = asString(item.photo)
      const { storagePath, contentHash } = mediaFor(mediaMap, photo)
      return {
        id: deterministicUuid(`news-${asString(item.id) ?? baseSlug}`),
        title,
        slug: `${baseSlug}-${index + 1}`,
        excerpt: asString(item.details) ?? null,
        body: asString(item.details) ?? title,
        link: asString(item.link),
        cover_storage_path: storagePath,
        cover_url: photo,
        cover_content_hash: contentHash,
        published_at: normalizeDate(asString(item.date)) ?? new Date().toISOString(),
        display_order: index,
        active: true,
      }
    })
    summary.news_posts = rows.news_posts.length
  }

  // ── gallery ───────────────────────────────────────────────────────────
  const galleryImages = asRecordArray(data.galleryImages)
  if (galleryImages.length > 0) {
    rows.gallery = galleryImages.map((image, index) => {
      const url = asString(image.url)
      const { storagePath, contentHash } = mediaFor(mediaMap, url)
      return {
        id: deterministicUuid(`gallery-${asString(image.id) ?? url ?? index}`),
        storage_path: storagePath,
        image_url: url,
        content_hash: contentHash,
        alt: asString(image.caption) ?? '',
        caption: asString(image.caption),
        display_order: index,
        active: true,
      }
    })
    summary.gallery = rows.gallery.length
  }

  // ── media_downloads ───────────────────────────────────────────────────
  const mediaFiles = asRecordArray(data.mediaFiles)
  if (mediaFiles.length > 0) {
    rows.media_downloads = mediaFiles.map((file, index) => {
      const url = asString(file.url)
      const { storagePath, contentHash } = mediaFor(mediaMap, url)
      const folder = asString(file.folder) ?? 'other'
      return {
        id: deterministicUuid(`media-${asString(file.id) ?? asString(file.name) ?? index}`),
        title: asString(file.name) ?? `File ${index + 1}`,
        description: asString(file.description),
        category: folder.includes('photo') ? 'photo' : folder.includes('logo') ? 'logo' : folder.includes('document') ? 'document' : folder.includes('audio') ? 'audio' : 'other',
        file_storage_path: storagePath,
        file_url: url,
        file_content_hash: contentHash,
        display_order: index,
        active: true,
      }
    })
    summary.media_downloads = rows.media_downloads.length
  }

  // ── social_links ──────────────────────────────────────────────────────
  const socialLinks = asObject(data.socialLinks)
  const socialEntries = Object.entries(socialLinks).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0,
  )
  if (socialEntries.length > 0) {
    rows.social_links = socialEntries.map(([platform, url], index) => ({
      id: deterministicUuid(`social-${platform}`),
      platform,
      url,
      label: platform,
      display_order: index,
      active: true,
    }))
    summary.social_links = rows.social_links.length
  }

  // ── site_config (hero / appearance / sections / legal) ───────────────
  const siteName = asString(data.siteName) ?? asString(data.label) ?? 'NEUROKLAST'
  const tagline = asString(data.tagline) ?? 'Industrial / Electronic'
  const genres = asStringArray(data.genres)
  const hero: Record<string, unknown> = {
    headline: siteName.toUpperCase(),
    tagline,
    genres,
    ctaLabel: 'INITIALIZE',
    ctaUrl: '#news',
  }

  const sections = [
    { id: 'hero', label: 'Hero', visible: true, order: 0 },
    { id: 'news', label: 'News', visible: true, order: 1 },
    { id: 'bio', label: 'Biography', visible: true, order: 2 },
    { id: 'gallery', label: 'Gallery', visible: true, order: 3 },
    { id: 'gigs', label: 'Events', visible: true, order: 4 },
    { id: 'releases', label: 'Discography', visible: true, order: 5 },
    { id: 'media', label: 'Media', visible: true, order: 6 },
    { id: 'contact', label: 'Contact', visible: true, order: 7 },
  ]

  const impressum = asRecord(data.impressum)
  const datenschutz = asRecord(data.datenschutz)
  const legal: Record<string, unknown> = {
    operatorName: asString(impressum?.name) ?? '',
    careOf: asString(impressum?.careOf) ?? undefined,
    street: asString(impressum?.street) ?? '',
    zipCity: asString(impressum?.zipCity) ?? '',
    country: 'Germany',
    email: asString(impressum?.email) ?? '',
    responsibleName: asString(impressum?.responsibleName) ?? undefined,
    privacyPolicyCustom: asString(datenschutz?.customText) ?? undefined,
  }

  rows.site_config = [
    { key: 'hero', value: hero, updated_at: new Date().toISOString() },
    { key: 'appearance', value: { lookId: 'neuroklast-classic' }, updated_at: new Date().toISOString() },
    { key: 'sections', value: sections, updated_at: new Date().toISOString() },
    { key: 'legal', value: legal, updated_at: new Date().toISOString() },
  ]

  return { rows, mediaUrls: collectMediaUrls(data), summary }
}
