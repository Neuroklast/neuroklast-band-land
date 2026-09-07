import { describe, expect, it } from 'vitest'
import {
  buildImportRows,
  collectMediaUrls,
  deterministicUuid,
  parseSiteConfigContentPayload,
  type ImportMediaMap,
} from '@/lib/site-config-content-import'

const sampleExport = {
  exportVersion: '1.0',
  exportScope: 'content',
  templateVersion: '2.0.0',
  siteName: 'NEUROKLAST',
  data: {
    siteName: 'NEUROKLAST',
    tagline: 'The end of the world never sounded this good',
    genres: ['HARD TECHNO', 'CYBERPUNK'],
    biography: {
      story: 'This is Neuroklast.',
      achievements: ['Performed at WGT', '3rd place remix contest'],
      collabs: ['ESA', 'iVardensphere'],
      members: [
        { name: 'Kay', photo: 'https://wsrv.nl/?url=https://lh3.googleusercontent.com/d/abc', bio: 'Founder', statusValue: 'Producer' },
        { name: 'Markus', photo: 'https://wsrv.nl/?url=.../def', bio: 'Co-founder', statusValue: 'Live' },
      ],
      friends: [
        { id: 'friend-1', name: 'Zardonic', photo: 'https://wsrv.nl/?url=.../ghi', url: 'https://zardonic.net', description: 'Mastering engineer', socials: { instagram: 'https://instagram.com/djzardonic' } },
      ],
    },
    label: 'darkTunes Music Group',
    gigs: [
      { id: 'gig-1', date: '2026-06-20', venue: 'Castrum Nigra', location: 'Ehrenburg, 56332 Brodenbach', ticketUrl: 'https://pretix.eu', gigType: 'dj', status: 'confirmed', supportingArtists: ['Vicious Moon'], eventLinks: { facebook: 'https://facebook.com/events/1' }, photo: 'https://wsrv.nl/?url=.../jkl' },
    ],
    releases: [
      { id: 'itunes-1647319915', title: 'Streetkid', artwork: 'https://wsrv.nl/?url=.../mno', releaseDate: '2022-10-28', streamingLinks: { spotify: 'https://open.spotify.com/track/1', appleMusic: 'https://music.apple.com/us/album/1' } },
    ],
    news: [
      { id: 'news-1', date: '2026-01-18', text: 'LET RAGE COMMENCE', details: 'New frontwoman', link: 'https://example.com', photo: 'https://wsrv.nl/?url=.../pqr' },
    ],
    galleryImages: [
      { id: 'drive-1', url: 'https://wsrv.nl/?url=.../stu', caption: 'IMG_0' },
    ],
    mediaFiles: [
      { id: 'media-1', name: 'press_kit.pdf', url: 'https://drive.google.com/file/d/xyz/view', folder: 'press-kit', description: 'Press kit' },
    ],
    socialLinks: { instagram: 'https://instagram.com/neuroklast_music', spotify: 'https://open.spotify.com/artist/1' },
    impressum: { name: 'Kay Schäfer', careOf: 'darkTunes Music Group', street: 'Friedhofweg 1', zipCity: '69118 Heidelberg', email: 'info@neuroklast.net', responsibleName: 'Kay Schäfer' },
    datenschutz: { customText: '1. Datenschutz auf einen Blick', customTextEn: '1. Privacy at a glance' },
  },
}

describe('parseSiteConfigContentPayload', () => {
  it('accepts a content export with a data object', () => {
    const result = parseSiteConfigContentPayload(sampleExport)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.exportScope).toBe('content')
      expect(result.data.data.siteName).toBe('NEUROKLAST')
    }
  })

  it('rejects payloads without a data object', () => {
    const result = parseSiteConfigContentPayload({ foo: 'bar' })
    expect(result.ok).toBe(false)
  })
})

describe('deterministicUuid', () => {
  it('is stable and valid', () => {
    const a = deterministicUuid('release-itunes-1')
    const b = deterministicUuid('release-itunes-1')
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f-]{36}$/)
  })
})

describe('buildImportRows', () => {
  const emptyMap: ImportMediaMap = new Map()

  it('maps biography story, achievements and collabs into bio', () => {
    const { rows } = buildImportRows(sampleExport.data, emptyMap)
    expect(rows.bio).toHaveLength(1)
    expect(rows.bio?.[0].content).toBe('This is Neuroklast.')
    expect(rows.bio?.[0].achievements).toEqual(['Performed at WGT', '3rd place remix contest'])
    expect(rows.bio?.[0].collabs).toEqual(['ESA', 'iVardensphere'])
  })

  it('maps members with role from statusValue', () => {
    const { rows } = buildImportRows(sampleExport.data, emptyMap)
    expect(rows.members).toHaveLength(2)
    expect(rows.members?.[0].name).toBe('Kay')
    expect(rows.members?.[0].role).toBe('Producer')
    expect(rows.members?.[0].id).toMatch(/^[0-9a-f-]{36}$/)
    expect(rows.members?.[0].photo_url).toContain('lh3.googleusercontent.com/d/abc')
  })

  it('maps friends into partners (with description/socials) plus the label', () => {
    const { rows } = buildImportRows(sampleExport.data, emptyMap)
    const partners = rows.partners ?? []
    const friend = partners.find((p) => p.name === 'Zardonic')
    expect(friend).toBeTruthy()
    expect(friend?.description).toBe('Mastering engineer')
    expect(friend?.socials).toEqual({ instagram: 'https://instagram.com/djzardonic' })
    expect(friend?.category).toBe('partner')
    expect(partners.some((p) => p.name === 'darkTunes Music Group' && p.category === 'label')).toBe(true)
  })

  it('maps gigs with the new fields', () => {
    const { rows } = buildImportRows(sampleExport.data, emptyMap)
    const gig = rows.gigs?.[0]
    expect(gig?.title).toBe('Castrum Nigra')
    expect(gig?.gig_type).toBe('dj')
    expect(gig?.status).toBe('confirmed')
    expect(gig?.supporting_artists).toEqual(['Vicious Moon'])
    expect(gig?.event_links).toEqual({ facebook: 'https://facebook.com/events/1' })
    expect(gig).not.toHaveProperty('display_order')
  })

  it('maps events as gigs and biography.content as bio', () => {
    const { rows } = buildImportRows(
      {
        biography: { content: 'Alt story', achievements: ['One'] },
        events: [{ id: 'e1', venue: 'Club X', date: '2026-08-01' }],
      },
      emptyMap,
    )
    expect(rows.bio?.[0].content).toBe('Alt story')
    expect(rows.gigs?.[0].title).toBe('Club X')
  })

  it('maps releases with streaming links and itunes id', () => {
    const { rows } = buildImportRows(sampleExport.data, emptyMap)
    const release = rows.releases?.[0]
    expect(release?.title).toBe('Streetkid')
    expect(release?.release_date).toBe('2022-10-28')
    expect(release?.itunes_id).toBe('1647319915')
    expect(release?.streaming_links).toEqual([
      { platform: 'spotify', url: 'https://open.spotify.com/track/1' },
      { platform: 'appleMusic', url: 'https://music.apple.com/us/album/1' },
    ])
  })

  it('maps news posts, gallery, media and social links', () => {
    const { rows } = buildImportRows(sampleExport.data, emptyMap)
    expect(rows.news_posts?.[0].link).toBe('https://example.com')
    expect(rows.news_posts?.[0].title).toBe('LET RAGE COMMENCE')
    expect(rows.news_posts?.[0].body).toBe('New frontwoman')
    expect(rows.gallery?.[0].caption).toBe('IMG_0')
    expect(rows.media_downloads?.[0].title).toBe('press_kit.pdf')
    expect(rows.media_downloads?.[0].category).toBe('other')
    expect(rows.social_links).toHaveLength(2)
  })

  it('sets site_config hero/appearance/sections/legal', () => {
    const { rows } = buildImportRows(sampleExport.data, emptyMap)
    const config = rows.site_config ?? []
    const hero = config.find((row) => row.key === 'hero')
    expect(hero?.value).toMatchObject({ headline: 'NEUROKLAST', genres: ['HARD TECHNO', 'CYBERPUNK'] })
    const appearance = config.find((row) => row.key === 'appearance')
    expect(appearance?.value).toMatchObject({ lookId: 'neuroklast-classic' })
    const legal = config.find((row) => row.key === 'legal')
    expect(legal?.value).toMatchObject({
      operatorName: 'Kay Schäfer',
      email: 'info@neuroklast.net',
      privacyPolicyCustom: '1. Datenschutz auf einen Blick',
    })
  })

  it('applies the media map to set storage paths + content hashes', () => {
    const url = 'https://wsrv.nl/?url=.../mno'
    const mediaMap: ImportMediaMap = new Map([[url, { storagePath: 'imports/abcd.webp', contentHash: 'abcd' }]])
    const { rows } = buildImportRows(sampleExport.data, mediaMap)
    const release = rows.releases?.[0]
    expect(release?.cover_storage_path).toBe('imports/abcd.webp')
    expect(release?.cover_content_hash).toBe('abcd')
  })

  it('collects all media URLs', () => {
    const urls = collectMediaUrls(sampleExport.data)
    expect(urls).toContain('https://wsrv.nl/?url=.../mno')
    expect(urls).toContain('https://drive.google.com/file/d/xyz/view')
  })
})
