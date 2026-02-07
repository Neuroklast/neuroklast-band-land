export interface Gig {
  id: string
  date: string
  venue: string
  location: string
  ticketUrl?: string
  gigType?: 'concert' | 'dj'
  allDay?: boolean
  eventLinks?: {
    facebook?: string
    instagram?: string
    residentAdvisor?: string
    other?: string
  }
  supportingArtists?: string[]
  photo?: string
}

export interface Release {
  id: string
  title: string
  artwork?: string
  releaseDate?: string
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

export interface Member {
  name: string
  photo?: string
  bio?: string
}

export interface Biography {
  story: string
  founded?: string
  members?: (string | Member)[]
  achievements?: string[]
  photos?: string[]
}

export interface TerminalCommand {
  name: string
  description: string
  output: string[]
  fileUrl?: string
  fileName?: string
}

export interface Impressum {
  name: string
  careOf?: string
  street?: string
  zipCity?: string
  phone?: string
  email?: string
  responsibleName?: string
  responsibleAddress?: string
}

export interface GalleryImage {
  id: string
  url: string
  caption?: string
}

export interface Datenschutz {
  customText?: string
}

export interface BandData {
  name: string
  genres: string[]
  socialLinks: SocialLinks
  gigs: Gig[]
  releases: Release[]
  biography?: Biography
  label?: string
  terminalCommands?: TerminalCommand[]
  impressum?: Impressum
  galleryImages?: GalleryImage[]
  datenschutz?: Datenschutz
  fontSizes?: FontSizeSettings
}

export interface FontSizeSettings {
  biographyStory?: string
  biographyHeadings?: string
  gigsText?: string
  releasesText?: string
  connectText?: string
  footerText?: string
}
