import {
  ApplePodcastsLogo,
  Link as LinkIcon,
  SoundcloudLogo,
  SpotifyLogo,
  Storefront,
  YoutubeLogo,
} from '@phosphor-icons/react'
import { formatReleaseDate } from '@/lib/format-release-date'

/** Shared presentation rules for release cards on the home and browse pages. */
export function formatCardReleaseDate(value: string | null): string {
  if (!value) return 'UNKNOWN'
  const formatted = formatReleaseDate(value, value.slice(0, 4))
  return formatted || value
}

export function getPlatformIcon(platform: string) {
  switch (platform.trim().toLowerCase()) {
    case 'spotify':
      return SpotifyLogo
    case 'youtube':
      return YoutubeLogo
    case 'soundcloud':
      return SoundcloudLogo
    case 'bandcamp':
      return Storefront
    case 'applemusic':
    case 'apple music':
      return ApplePodcastsLogo
    default:
      return LinkIcon
  }
}
