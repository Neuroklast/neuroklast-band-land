export interface Gig {
  id: string
  date: string
  venue: string
  location: string
  ticketUrl?: string
}

export interface Release {
  id: string
  title: string
  artwork?: string
  releaseDate: string
  streamingLinks: {
    spotify?: string
    soundcloud?: string
    bandcamp?: string
    youtube?: string
    appleMusic?: string
  }
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  spotify?: string
  soundcloud?: string
  youtube?: string
  bandcamp?: string
  linktr?: string
  tiktok?: string
  twitter?: string
}

export interface BandData {
  name: string
  genres: string[]
  socialLinks: SocialLinks
  gigs: Gig[]
  releases: Release[]
}
