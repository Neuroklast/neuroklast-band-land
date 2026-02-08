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

export interface Friend {
  id: string
  name: string
  photo?: string
  description?: string
  url?: string
  socials?: {
    instagram?: string
    facebook?: string
    spotify?: string
    soundcloud?: string
    youtube?: string
    bandcamp?: string
    website?: string
  }
}

export interface Biography {
  story: string
  founded?: string
  members?: (string | Member)[]
  achievements?: string[]
  collabs?: string[]
  photos?: string[]
  friends?: Friend[]
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
  /** URL to a remote JSON file (e.g. Google Drive) that is periodically checked for updates */
  syncUrl?: string
  /** Google Drive folder URL for gallery photos */
  galleryDriveFolderUrl?: string
  /** Sound effect settings */
  soundSettings?: SoundSettings
  /** Runtime overrides for config.ts constants (keys are ConfigKey names) */
  configOverrides?: Record<string, unknown>
  /** Custom section headings and display labels */
  sectionLabels?: SectionLabels
}

export interface SoundSettings {
  /** URL to terminal keystroke/beep sound */
  terminalSound?: string
  /** URL to typing effect sound */
  typingSound?: string
  /** URL to button click sound */
  buttonSound?: string
}

export interface SectionLabels {
  biography?: string
  gallery?: string
  gigs?: string
  releases?: string
  connect?: string
  partnersAndFriends?: string
  profileStatusText?: string
  sessionStatusText?: string
  collabs?: string
}

export interface FontSizeSettings {
  biographyStory?: string
  biographyHeadings?: string
  gigsText?: string
  releasesText?: string
  connectText?: string
  footerText?: string
}
