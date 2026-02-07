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

export interface Biography {
  story: string
  founded?: string
  members?: string[]
  achievements?: string[]
  photos?: string[]
}

export interface TerminalCommand {
  name: string
  description: string
  output: string[]
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
}
