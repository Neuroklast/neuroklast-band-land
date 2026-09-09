import type { ReactNode } from 'react'
import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabaseServer'
import { resolveImageUrl, resolvePublicAssetUrl } from '@/lib/r2'
import { splitGigsByDate } from '@/lib/gig-browse'
import { PageLayout } from '@/layouts/PageLayout'
import { CookieConsent } from '@/components/CookieConsent'

import { GallerySection } from './_components/public/GallerySection'
import { MediaSection } from './_components/public/MediaSection'
import { LookBackground, LookEffects, LookFooter, LookHero, LookNav, PublicBoot } from './_components/public/LookChrome'
import { BioSection } from './_components/public/BioSection'
import { CreditsSection } from './_components/public/CreditsSection'
import { MusicHighlightsSection } from './_components/public/MusicHighlightsSection'
import { PublicPageClient } from './_components/public/PublicPageClient'

import { AdminDraftListener } from './_components/public/AdminDraftListener'
import { DraftSectionShell } from './_components/public/DraftSectionShell'
import { MerchandiseSection } from './_components/public/MerchandiseSection'
import { SoundpacksSection } from './_components/public/SoundpacksSection'
import { GigsSection } from './_components/public/GigsSection'
import { NewsSection } from './_components/public/NewsSection'
import { ContactSection } from './_components/public/ContactSection'
import { parseLookId } from '@/lib/looks'
import { parseHeroPowerGlitch } from '@/lib/hero-glitch-config'
import {
  DEFAULT_SITE_BACKGROUND_VIDEO,
  parseBackgroundVideoEnabled,
  parseBackgroundVideoOpacity,
  resolveSiteBackgroundVideoSrc,
} from '@/lib/background-config'
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary'
import { SocialSection } from './_components/public/SocialSection'
import { SpotifySection } from './_components/public/SpotifySection'
import { resolveSpotifyArtistUri } from '@/lib/spotify-artist'
import {
  mapMediaDownloadRow,
  type MediaDownloadDbRow,
} from '@/lib/media-download'
import {
  mapReleaseRowToOverlayRelease,
  type ReleaseDbRow,
} from '@/lib/release-public-mapper'
import { navItemsFromSections } from '@/lib/nav-links'
import {
  parseSections,
  withoutExcludedSections,
  type SectionConfig,
} from '@/lib/site-config-sections'
// Revalidate at most once per minute for quick admin updates
export const revalidate = 60

// ─── Type helpers ────────────────────────────────────────────────────────────
interface SiteConfigRow { key: string; value: Record<string, unknown> }
interface BioRow { content: string | null; achievements: unknown; collabs: unknown }

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    : []
}
interface MemberRow {
  id: string
  name: string
  role: string | null
  bio: string | null
  photo_storage_path: string | null
  photo_url: string | null
}

/** Normalize Supabase bio.content so BioSection never receives a non-string. */
function normalizeBioContent(raw: unknown): string {
  return typeof raw === 'string' ? raw : ''
}
interface GigRow {
  id: string; title: string; venue: string | null; city: string | null
  country: string | null; event_date: string; ticket_url: string | null
  festival_name: string | null; description: string | null
}
type ReleaseRow = ReleaseDbRow
interface PartnerRow {
  id: string; name: string; url: string | null
  logo_storage_path: string | null; logo_url: string | null; category: string
  logo_white?: boolean | null
  description?: string | null
  socials?: Record<string, string> | null
}
interface MusicHighlightRow {
  id: string; title: string; youtube_url: string; description: string | null
}
interface CommerceItemRow {
  id: string; title: string
  image_storage_path: string | null; image_url: string | null; external_url: string | null
}
interface GalleryItemRow {
  id: string; alt: string | null
  storage_path: string | null; image_url: string | null
}
type MediaDownloadRow = MediaDownloadDbRow
interface SocialRow {
  id: string
  platform: string
  url: string
  label: string | null
  logo_storage_path?: string | null
  logo_url?: string | null
}
interface NewsPostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string | null
  link: string | null
  cover_storage_path: string | null
  cover_url: string | null
  published_at: string | null
  display_order: number
}

// ─── Data fetching ────────────────────────────────────────────────────────────
async function fetchReleases(supabase: ReturnType<typeof createPublicClient>): Promise<ReleaseRow[]> {
  const fullSelect =
    'id, title, type, release_date, description, cover_storage_path, cover_url, streaming_links, artists, tracks, custom_links, manually_edited'
  const legacySelect =
    'id, title, type, release_date, cover_storage_path, cover_url, streaming_links, manually_edited'
  const minimalSelect =
    'id, title, type, release_date, cover_storage_path, cover_url, streaming_links'

  const { data, error } = await supabase
    .from('releases')
    .select(fullSelect)
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (!error) return (data ?? []) as ReleaseRow[]

  console.error('[fetchAll] releases query failed:', error.message)

  const fallbackSelect = error.message.includes('manually_edited') ? minimalSelect : legacySelect
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('releases')
    .select(fallbackSelect)
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (fallbackError) {
    console.error('[fetchAll] releases fallback query failed:', fallbackError.message)
    return []
  }

  // Dynamic select strings are not const-literal-parsed by supabase-js generics
  const rows = (fallbackData ?? []) as Partial<ReleaseDbRow>[]
  return rows.map((row) => ({
    ...(row as ReleaseDbRow),
    description: null,
    artists: [],
    tracks: [],
    custom_links: [],
    manually_edited: 'manually_edited' in row ? !!row.manually_edited : false,
  }))
}

async function fetchAll() {
  try {
    // Cookie-less anon client: public content must not fail on admin JWT clock skew
    const supabase = createPublicClient()

    const [
      configResult,
      bioResult,
      memberResult,
      gigResult,
      partnerResult,
      musicResult,
      merchResult,
      soundpackResult,
      galleryResult,
      mediaResult,
      socialResult,
      newsResult,
    ] = await Promise.all([
      supabase.from('site_config').select('key, value'),
      // maybeSingle: empty bio table is not an error (single() would log PGRST116)
      supabase.from('bio').select('content, achievements, collabs').limit(1).maybeSingle(),
      supabase.from('members').select('id, name, role, bio, photo_storage_path, photo_url').eq('active', true).order('display_order', { ascending: true }),
      supabase.from('gigs').select('id, title, venue, city, country, event_date, ticket_url, festival_name, description').eq('active', true).order('event_date', { ascending: true }),
      supabase.from('partners').select('id, name, url, logo_storage_path, logo_url, category, logo_white, description, socials').eq('active', true).order('display_order', { ascending: true }),
      supabase.from('music_highlights').select('id, title, youtube_url, description').eq('active', true).order('display_order', { ascending: true }),
      supabase.from('merchandise').select('id, title, image_storage_path, image_url, external_url').eq('active', true).order('display_order', { ascending: true }),
      supabase.from('soundpacks').select('id, title, image_storage_path, image_url, external_url').eq('active', true).order('display_order', { ascending: true }),
      supabase.from('gallery').select('id, alt, storage_path, image_url').eq('active', true).order('display_order', { ascending: true }),
      supabase.from('media_downloads').select('id, title, description, category, file_storage_path, file_url, file_mime, file_size_bytes, original_filename, display_order').eq('active', true).order('display_order', { ascending: true }),
      supabase.from('social_links').select('id, platform, url, label, logo_storage_path, logo_url').order('display_order', { ascending: true }),
      supabase
        .from('news_posts')
        .select('id, title, slug, excerpt, body, link, cover_storage_path, cover_url, published_at, display_order')
        .eq('active', true)
        .order('published_at', { ascending: false }),
    ])

    const logQueryError = (label: string, error: { message: string } | null) => {
      if (error) console.error(`[fetchAll] ${label} query failed:`, error.message)
    }

    logQueryError('site_config', configResult.error)
    logQueryError('bio', bioResult.error)
    logQueryError('members', memberResult.error)
    logQueryError('gigs', gigResult.error)
    logQueryError('partners', partnerResult.error)
    logQueryError('music_highlights', musicResult.error)
    logQueryError('merchandise', merchResult.error)
    logQueryError('soundpacks', soundpackResult.error)
    logQueryError('gallery', galleryResult.error)
    logQueryError('media_downloads', mediaResult.error)
    logQueryError('social_links', socialResult.error)
    logQueryError('news_posts', newsResult.error)

    const releaseRows = await fetchReleases(supabase)

    return {
      configRows: (configResult.data ?? []) as SiteConfigRow[],
      bio: normalizeBioContent((bioResult.data as BioRow | null)?.content),
      bioAchievements: asStringArray((bioResult.data as BioRow | null)?.achievements),
      bioCollabs: asStringArray((bioResult.data as BioRow | null)?.collabs),
      members: (memberResult.data ?? []) as MemberRow[],
      gigs: (gigResult.data ?? []) as GigRow[],
      releases: releaseRows,
      partners: (partnerResult.data ?? []) as PartnerRow[],
      musicHighlights: (musicResult.data ?? []) as MusicHighlightRow[],
      merch: (merchResult.data ?? []) as CommerceItemRow[],
      soundpacks: (soundpackResult.data ?? []) as CommerceItemRow[],
      gallery: (galleryResult.data ?? []) as GalleryItemRow[],
      mediaDownloads: ((mediaResult.data ?? []) as MediaDownloadRow[]).map(mapMediaDownloadRow),
      social: (socialResult.data ?? []) as SocialRow[],
      newsPosts: (newsResult.data ?? []) as NewsPostRow[],
    }
  } catch {
    // Return safe empty defaults when Supabase is not configured (local dev)
    return {
      configRows: [] as SiteConfigRow[],
      bio: '',
      bioAchievements: [] as string[],
      bioCollabs: [] as string[],
      members: [] as MemberRow[],
      gigs: [] as GigRow[],
      releases: [] as ReleaseRow[],
      partners: [] as PartnerRow[],
      musicHighlights: [] as MusicHighlightRow[],
      merch: [] as CommerceItemRow[],
      soundpacks: [] as CommerceItemRow[],
      gallery: [] as GalleryItemRow[],
      mediaDownloads: [],
      social: [] as SocialRow[],
      newsPosts: [] as NewsPostRow[],
    }
  }
}

function getConfig(rows: SiteConfigRow[], key: string): Record<string, unknown> {
  return rows.find((r) => r.key === key)?.value ?? {}
}





// ─── Page ─────────────────────────────────────────────────────────────────────
// searchParams below keep this route request-dynamic, so DB reads are wrapped
// with unstable_cache: one Supabase fetch per 60s window, not per request.
// (PostgREST egress amplification: every homepage hit used to cost 13 queries.)
const fetchAllCached = unstable_cache(fetchAll, ['homepage-site-data'], {
  revalidate: 60,
  tags: ['site-config', 'homepage-site-data'],
})

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ adminPreview?: string }>
}) {
  const { adminPreview } = await searchParams
  const isAdminPreview = adminPreview === '1'
  const {
    configRows, bio, bioAchievements, bioCollabs, members, gigs, releases, partners,
    musicHighlights, merch, soundpacks, gallery, mediaDownloads, social, newsPosts,
  } = await fetchAllCached()

  const heroConfig = getConfig(configRows, 'hero')
  const merchandiseConfig = getConfig(configRows, 'merchandise')
  const footerConfig = getConfig(configRows, 'footer')
  const appearanceConfig = getConfig(configRows, 'appearance')
  const sectionsRaw = configRows.find((r) => r.key === 'sections')?.value
  const allSections = withoutExcludedSections(
    parseSections(sectionsRaw).sort((a, b) => a.order - b.order),
  )
  const sections = isAdminPreview
    ? allSections
    : allSections.filter((s) => s.visible)

  // Extract section style overrides from site_config (centralized helper to avoid repetition)
  // Note: sections config can be array of sections or object with styleOverrides
  const sectionsValue = sectionsRaw
  const overridesRoot: Record<string, unknown> =
    sectionsValue && typeof sectionsValue === 'object' && !Array.isArray(sectionsValue)
      ? ((sectionsValue as Record<string, unknown>).styleOverrides as Record<string, unknown> | undefined)
        ?? (sectionsValue as Record<string, unknown>)
      : {}

  const getSectionOverrides = (key: string): Record<string, unknown> => {
    const value = overridesRoot[key]
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  }

  const releaseOverrides = getSectionOverrides('releases')
  const galleryOverrides = getSectionOverrides('gallery')
  const bioOverrides = getSectionOverrides('bio')
  const creditOverrides = getSectionOverrides('creditHighlights')
  const catalogueSync = getConfig(configRows, 'catalogue_sync')
  const spotifyUri = resolveSpotifyArtistUri([
    social.find((link) => link.platform.toLowerCase().includes('spotify'))?.url,
    typeof catalogueSync.spotifyArtistId === 'string' ? catalogueSync.spotifyArtistId : null,
  ])

  const lookId = parseLookId(
    typeof appearanceConfig.lookId === 'string' ? appearanceConfig.lookId : 'neuroklast-classic',
  )
  const siteName = String(heroConfig.headline ?? 'NEUROKLAST')
  const heroTagline =
    typeof heroConfig.tagline === 'string' && heroConfig.tagline.trim()
      ? heroConfig.tagline.trim()
      : ''
  const heroGenres = Array.isArray(heroConfig.genres)
    ? (heroConfig.genres as unknown[]).filter((g): g is string => typeof g === 'string')
    : []

  // Releases: convert streaming_links to typed array
  const releaseItems = releases.map((r) => {
    const coverUrl = resolveImageUrl(r.cover_storage_path, r.cover_url)
    const streamingLinks = Array.isArray(r.streaming_links)
      ? (r.streaming_links as Array<{ platform: string; url: string }>).filter(
          (l) => typeof l.platform === 'string' && typeof l.url === 'string',
        )
      : []
    const overlayRelease = mapReleaseRowToOverlayRelease(r, coverUrl)

    return {
      id: r.id,
      title: r.title,
      type: r.type,
      release_date: r.release_date,
      coverUrl,
      streamingLinks,
      manually_edited: !!r.manually_edited,
      overlayRelease,
    }
  })

  // Partners split by category
  const mapPartnerItem = (p: PartnerRow) => ({
    id: p.id,
    name: p.name,
    url: p.url,
    logoUrl: resolveImageUrl(p.logo_storage_path, p.logo_url),
    category: p.category,
    logoWhite: p.logo_white !== false,
    description: p.description ?? null,
    socials: p.socials ?? null,
  })

  const credits = partners.filter((p) => p.category === 'credit').map(mapPartnerItem)
  const endorsements = partners.filter((p) => p.category === 'endorsement').map(mapPartnerItem)
  const partnerFriends = partners
    .filter((p) => p.category === 'partner' || p.category === 'label' || p.category === 'sponsor')
    .map(mapPartnerItem)

  const commerceItemMap = (row: CommerceItemRow) => ({
    id: row.id,
    title: row.title,
    imageUrl: resolveImageUrl(row.image_storage_path, row.image_url),
    externalUrl: row.external_url,
  })
  const galleryItemMap = (row: GalleryItemRow) => ({
    id: row.id,
    alt: row.alt,
    imageUrl: resolveImageUrl(row.storage_path, row.image_url),
  })

  // Gigs: split upcoming vs past (shared helper — same rules as /gigs browse)
  const { upcoming, past } = splitGigsByDate(gigs)

  function wrapForPreview(content: ReactNode, section: SectionConfig) {
    if (!isAdminPreview) return content
    return (
      <DraftSectionShell
        key={section.id}
        sectionId={section.id}
        order={section.order}
        visible={section.visible}
      >
        {content}
      </DraftSectionShell>
    )
  }

  // Build slots for the mandatory PageLayout (AGENTS §6)
  const backgroundConfig = getConfig(configRows, 'background')
  const configuredVideoSrc = resolveSiteBackgroundVideoSrc(
    backgroundConfig.video_storage_path,
    backgroundConfig.video_url,
  )
  const backgroundLayers = (
    <>
      <LookBackground
        lookId={lookId}
        siteName={siteName}
        videoUrl={configuredVideoSrc ?? DEFAULT_SITE_BACKGROUND_VIDEO}
        videoOpacity={parseBackgroundVideoOpacity(backgroundConfig.backgroundVideoOpacity)}
        videoEnabled={parseBackgroundVideoEnabled(backgroundConfig.backgroundVideoEnabled, true)}
      />
    </>
  )

  const globalEffectsSlot = <LookEffects lookId={lookId} />

  const navSlot = (
    <LookNav
      lookId={lookId}
      siteName={siteName}
        items={navItemsFromSections(allSections)}
    />
  )

  const legalNoticeUrl = String(
    footerConfig.legalNoticeUrl ?? footerConfig.impressumUrl ?? '/legal-notice',
  )
  const privacyPolicyUrl = String(
    footerConfig.privacyPolicyUrl ?? footerConfig.privacyUrl ?? '/privacy-policy',
  )

  const socialWithLogos = social.map((link) => ({
    id: link.id,
    platform: link.platform,
    url: link.url,
    label: link.label,
    logoUrl: resolveImageUrl(link.logo_storage_path ?? null, link.logo_url ?? null),
  }))

  const footerSlot = (
    <LookFooter
      lookId={lookId}
      siteName={siteName}
      genres={heroGenres}
      socialLinks={Object.fromEntries(
        socialWithLogos.map((link) => [link.platform, link.url]),
      )}
      legalNoticeUrl={legalNoticeUrl}
      privacyPolicyUrl={privacyPolicyUrl}
    />
  )

  const systemSlot = (
    <>
      <PublicBoot lookId={lookId} loadingScreen={getConfig(configRows, 'loadingScreen')} />
      <AdminDraftListener enableDrafts={isAdminPreview} />
      <CookieConsent privacyPolicyUrl={privacyPolicyUrl} />
    </>
  )

  // Overlays are managed inside PublicPageClient (release overlay) and other islands.
  // For strict layering they can be hoisted later; leaving in content preserves current behavior + z.
  const overlaysSlot = null

  return (
    <PageLayout
      backgroundLayers={backgroundLayers}
      nav={navSlot}
      footer={footerSlot}
      globalEffects={globalEffectsSlot}
      overlays={overlaysSlot}
      system={systemSlot}
    >
      {/* Main content – sections rendered in DB-controlled order (inside PageLayout <main>) */}
      {sections.map((section, idx) => {
        const divider = null
        switch (section.id) {
          case 'hero':
            return wrapForPreview(
              <SectionErrorBoundary key="hero" sectionName="Hero">
                <LookHero
                  lookId={lookId}
                  name={siteName}
                  tagline={heroTagline}
                  genres={heroGenres}
                  logoUrl={
                    resolvePublicAssetUrl(
                      typeof heroConfig.logoImageStoragePath === 'string' ? heroConfig.logoImageStoragePath : null,
                      typeof heroConfig.logoUrl === 'string'
                        ? heroConfig.logoUrl
                        : typeof heroConfig.logoImageUrl === 'string'
                          ? heroConfig.logoImageUrl
                          : '/brand/nk-logo-red-bold.png',
                    ) ?? '/brand/nk-logo-red-bold.png'
                  }
                  titleImageUrl={
                    resolvePublicAssetUrl(
                      typeof heroConfig.titleImageStoragePath === 'string' ? heroConfig.titleImageStoragePath : null,
                      typeof heroConfig.titleImageUrl === 'string'
                        ? heroConfig.titleImageUrl
                        : '/brand/neuroklast-wordmark-red.svg',
                    ) ?? '/brand/neuroklast-wordmark-red.svg'
                  }
                  logoWidthPercent={
                    typeof heroConfig.logoWidthPercent === 'number' ? heroConfig.logoWidthPercent : undefined
                  }
                  logoWidthPercentMobile={
                    typeof heroConfig.logoWidthPercentMobile === 'number'
                      ? heroConfig.logoWidthPercentMobile
                      : undefined
                  }
                  powerGlitch={parseHeroPowerGlitch(heroConfig.powerGlitch)}
                  heroButtons={[
                    {
                      id: 'initialize',
                      label: String(heroConfig.ctaLabel ?? 'INITIALIZE'),
                      action: 'scroll',
                      scrollTarget: String(heroConfig.ctaUrl ?? '#news').replace(/^#/, '') || 'news',
                      variant: 'outline',
                    },
                  ]}
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'bio':
            return wrapForPreview(
              <SectionErrorBoundary key="bio" sectionName="Bio">
                {divider}
                <BioSection
                  content={bio}
                  heading={section.label}
                  intro={section.intro}
                  bodyFontSize={typeof bioOverrides.bodyFontSize === 'string' ? bioOverrides.bodyFontSize : undefined}
                  readMoreMaxHeight={typeof bioOverrides.readMoreMaxHeight === 'string' ? bioOverrides.readMoreMaxHeight : undefined}
                  achievements={bioAchievements}
                  collabs={bioCollabs}
                  members={members.map((member) => ({
                    id: member.id,
                    name: member.name,
                    role: member.role,
                    bio: member.bio,
                    photoUrl: resolveImageUrl(member.photo_storage_path, member.photo_url),
                  }))}
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'credits':
            return wrapForPreview(
              <SectionErrorBoundary key="credits" sectionName="Credits">
                {divider}
                <CreditsSection
                  credits={credits}
                  endorsements={endorsements}
                  partners={partnerFriends}
                  heading={section.label}
                  intro={section.intro}
                  logoBrightness={typeof creditOverrides.logoBrightness === 'number' ? creditOverrides.logoBrightness : undefined}
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'gallery':
            return wrapForPreview(
              <SectionErrorBoundary key="gallery" sectionName="Gallery">
                {divider}
                <GallerySection
                  items={gallery.map(galleryItemMap)}
                  heading={section.label}
                  intro={section.intro}
                  columns={typeof galleryOverrides.columns === 'string' ? galleryOverrides.columns : '3'}
                  maxVisible={typeof galleryOverrides.maxVisible === 'number' ? galleryOverrides.maxVisible : undefined}
                  aspectRatio={typeof galleryOverrides.aspectRatio === 'string' ? galleryOverrides.aspectRatio : undefined}
                  gap={typeof galleryOverrides.gap === 'string' ? galleryOverrides.gap : undefined}
                  lightbox={galleryOverrides.lightbox !== false}
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'media':
            return wrapForPreview(
              <SectionErrorBoundary key="media" sectionName="Media">
                {divider}
                <MediaSection
                  items={mediaDownloads}
                  heading={section.label}
                  intro={section.intro}
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'music-highlights':
            return wrapForPreview(
              <SectionErrorBoundary key="music-highlights" sectionName="Music Highlights">
                {divider}
                <MusicHighlightsSection
                  highlights={musicHighlights}
                  heading={section.label}
                  intro={section.intro}
                />
              </SectionErrorBoundary>,
              section,
            )
           case 'spotify':
            return wrapForPreview(
              <SectionErrorBoundary key="spotify" sectionName="Listen">
                {divider}
                <SpotifySection
                  uri={spotifyUri}
                  heading={section.label}
                  intro={section.intro}
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'releases':
            return wrapForPreview(
              <SectionErrorBoundary key="releases" sectionName="Releases">
                {divider}
                <PublicPageClient
                  releases={releaseItems}
                  artistName={String(heroConfig.headline ?? 'NEUROKLAST')}
                  heading={section.label}
                  intro={section.intro}
                  releaseLayout={typeof releaseOverrides.releaseLayout === 'string' && ['grid', 'swipe', 'carousel-3d'].includes(releaseOverrides.releaseLayout) ? (releaseOverrides.releaseLayout as 'grid' | 'swipe' | 'carousel-3d') : 'grid'}
                  releaseColumns={typeof releaseOverrides.releaseColumns === 'string' ? releaseOverrides.releaseColumns : '4'}
                  releaseCardVariant={typeof releaseOverrides.releaseCardVariant === 'string' ? releaseOverrides.releaseCardVariant : undefined}
                  releaseHoverEffect={typeof releaseOverrides.releaseHoverEffect === 'string' ? releaseOverrides.releaseHoverEffect : undefined}
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'social':
            return social.length > 0
              ? wrapForPreview(
                  <SectionErrorBoundary key="social" sectionName="Social">
                    {divider}
                    <SocialSection links={socialWithLogos} label={section.label} />
                  </SectionErrorBoundary>,
                  section,
                )
              : null
          case 'merchandise':
            return wrapForPreview(
              <SectionErrorBoundary key="merchandise" sectionName="Merchandise">
                {divider}
                <MerchandiseSection
                  items={merch.map(commerceItemMap)}
                  heading={section.label}
                  intro={section.intro}
                  footerText={String(merchandiseConfig.footerText ?? '')}
                  footerUrl={
                    typeof merchandiseConfig.footerUrl === 'string' && merchandiseConfig.footerUrl
                      ? merchandiseConfig.footerUrl
                      : undefined
                  }
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'soundpacks':
            return wrapForPreview(
              <SectionErrorBoundary key="soundpacks" sectionName="Soundpacks">
                {divider}
                <SoundpacksSection
                  items={soundpacks.map(commerceItemMap)}
                  heading={section.label}
                  intro={section.intro}
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'gigs':
            return wrapForPreview(
              <SectionErrorBoundary key="gigs" sectionName="Events">
                {divider}
                <GigsSection
                  upcoming={upcoming}
                  past={past}
                  artistName={String(heroConfig.headline ?? 'NEUROKLAST')}
                  heading={section.label}
                  intro={section.intro}
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'news':
            return wrapForPreview(
              <SectionErrorBoundary key="news" sectionName="News">
                {divider}
                <NewsSection
                  posts={newsPosts.map((post) => ({
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    body: post.body,
                    link: post.link,
                    coverUrl: resolveImageUrl(post.cover_storage_path, post.cover_url),
                    publishedAt: post.published_at,
                  }))}
                  heading={section.label}
                  intro={section.intro}
                />
              </SectionErrorBoundary>,
              section,
            )
          case 'contact':
            return wrapForPreview(
              <SectionErrorBoundary key="contact" sectionName="Contact">
                {divider}
                <ContactSection
                  heading={section.label}
                  intro={section.intro}
                  privacyPolicyUrl={privacyPolicyUrl}
                />
              </SectionErrorBoundary>,
              section,
            )
          default:
            return null
        }
      })}


    </PageLayout>
  )
}
