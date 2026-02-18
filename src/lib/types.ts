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
  /** Custom label for the name line (default: "SUBJECT") */
  subjectLabel?: string
  /** Custom label for the status line (default: "STATUS") */
  statusLabel?: string
  /** Custom value for the status line (default: "ACTIVE") */
  statusValue?: string
}

export interface Friend {
  id: string
  name: string
  photo?: string
  /** Small icon/avatar shown on the friend card */
  iconPhoto?: string
  /** Full-size photo shown in the profile overlay (falls back to photo if not set) */
  profilePhoto?: string
  description?: string
  url?: string
  /** Custom label for the name line (default: "SUBJECT") */
  subjectLabel?: string
  /** Custom label for the status line (default: "STATUS") */
  statusLabel?: string
  /** Custom value for the status line (default: "ACTIVE") */
  statusValue?: string
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
  /** English overrides – when set, the EN view shows these values instead */
  nameEn?: string
  careOfEn?: string
  streetEn?: string
  zipCityEn?: string
  responsibleNameEn?: string
  responsibleAddressEn?: string
}

export interface GalleryImage {
  id: string
  url: string
  caption?: string
}

export interface NewsItem {
  id: string
  date: string
  text: string
  details?: string
  link?: string
  photo?: string
}

export interface Datenschutz {
  customText?: string
  /** Separate English custom text */
  customTextEn?: string
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
  /** Custom secret code key sequence (replaces the default Konami code) */
  secretCode?: string[]
  /** Custom section headings and display labels */
  sectionLabels?: SectionLabels
  /** News items for the band */
  news?: NewsItem[]
  /** Media files for press kits, logos, etc. */
  mediaFiles?: MediaFile[]
}

export interface SoundSettings {
  /** URL to terminal keystroke/beep sound */
  terminalSound?: string
  /** URL to typing effect sound */
  typingSound?: string
  /** URL to button click sound */
  buttonSound?: string
  /** URL to loading finished sound */
  loadingFinishedSound?: string
  /** URL to background music */
  backgroundMusic?: string
  /** Background music volume (0-1) */
  backgroundMusicVolume?: number
  /** Whether sounds are muted by default */
  defaultMuted?: boolean
}

export interface ProfileField {
  label: string
  value: string
}

export interface MediaFile {
  id: string
  name: string
  description?: string
  url: string
  folder?: string
  /** File type hint: 'audio' for playable music, 'youtube' for embedded video */
  type?: 'audio' | 'youtube'
}

export interface SectionLabels {
  biography?: string
  gallery?: string
  gigs?: string
  releases?: string
  connect?: string
  media?: string
  news?: string
  partnersAndFriends?: string
  profileStatusText?: string
  sessionStatusText?: string
  collabs?: string
  /** Custom prefix shown before section headings (default ">") */
  headingPrefix?: string
  /** Custom profile fields shown in member/friend overlays */
  profileFields?: ProfileField[]
  /** Custom close button text for overlays (default "CLOSE") */
  closeButtonText?: string
}

export interface FontSizeSettings {
  biographyStory?: string
  biographyHeadings?: string
  gigsText?: string
  releasesText?: string
  connectText?: string
  footerText?: string
}
