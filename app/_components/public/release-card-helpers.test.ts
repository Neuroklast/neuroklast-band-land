import { describe, expect, it } from 'vitest'
import {
  ApplePodcastsLogo,
  Link as LinkIcon,
  SoundcloudLogo,
  SpotifyLogo,
  Storefront,
  YoutubeLogo,
} from '@phosphor-icons/react'
import { formatCardReleaseDate, getPlatformIcon } from './release-card-helpers'

describe('release card presentation', () => {
  it('uses the same date labels on homepage and browse pages', () => {
    expect(formatCardReleaseDate(null)).toBe('UNKNOWN')
    expect(formatCardReleaseDate('2023-01-01')).toBe('2023')
    expect(formatCardReleaseDate('2023-07-14')).toBe('14 Jul 2023')
  })

  it('maps known streaming providers to their icons', () => {
    expect(getPlatformIcon(' Spotify ')).toBe(SpotifyLogo)
    expect(getPlatformIcon('YOUTUBE')).toBe(YoutubeLogo)
    expect(getPlatformIcon('soundcloud')).toBe(SoundcloudLogo)
    expect(getPlatformIcon('bandcamp')).toBe(Storefront)
    expect(getPlatformIcon('applemusic')).toBe(ApplePodcastsLogo)
    expect(getPlatformIcon('Apple Music')).toBe(ApplePodcastsLogo)
    expect(getPlatformIcon('other')).toBe(LinkIcon)
  })
})
