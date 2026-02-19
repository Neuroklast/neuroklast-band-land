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

/** Theme color & font customization settings */
export interface ThemeSettings {
  /** Primary color in oklch format e.g. "oklch(0.50 0.22 25)" */
  primary?: string
  /** Accent color */
  accent?: string
  /** Background color */
  background?: string
  /** Card background color */
  card?: string
  /** Foreground text color */
  foreground?: string
  /** Muted foreground text color */
  mutedForeground?: string
  /** Border color */
  border?: string
  /** Secondary color */
  secondary?: string
  /** Heading font family */
  fontHeading?: string
  /** Body font family */
  fontBody?: string
  /** Mono/code font family */
  fontMono?: string
  /** Active theme preset name (if using a preset) */
  activePreset?: string
  /** Base border radius in rem (default 0.125) */
  borderRadius?: number
  /** Overlay effects configuration */
  overlayEffects?: OverlayEffects
}

/** Individual overlay effect configuration */
export interface OverlayEffect {
  enabled: boolean
  intensity: number
}

/** Configurable visual overlay effects */
export interface OverlayEffects {
  dotMatrix?: OverlayEffect
  scanlines?: OverlayEffect
  crt?: OverlayEffect
  noise?: OverlayEffect
  vignette?: OverlayEffect
  chromatic?: OverlayEffect
}

/** Controls visibility of individual sections and UI elements */
export interface SectionVisibility {
  news?: boolean
  biography?: boolean
  gallery?: boolean
  gigs?: boolean
  releases?: boolean
  media?: boolean
  social?: boolean
  partnersAndFriends?: boolean
  hudBackground?: boolean
  audioVisualizer?: boolean
  scanline?: boolean
  systemMonitor?: boolean
}

export interface BandData {
  name: string
  genres: string[]
  socialLinks: SocialLinks
  gigs: Gig[]
  releases: Release[]
  biography?: Biography
  label?: string
  logoUrl?: string       // URL or Data-URL for the Logo
  titleImageUrl?: string // URL or Data-URL for the Title Image
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
  /** Custom HUD background text labels */
  hudTexts?: HudTexts
  /** Custom section headings and display labels */
  sectionLabels?: SectionLabels
  /** News items for the band */
  news?: NewsItem[]
  /** Media files for press kits, logos, etc. */
  mediaFiles?: MediaFile[]
  /** Theme color/font customization */
  themeSettings?: ThemeSettings
  /** Section visibility toggles */
  sectionVisibility?: SectionVisibility
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

export interface HudTexts {
  /** Top-left line 1 (default: "SYSTEM: ONLINE") */
  topLeft1?: string
  /** Top-left line 2 (default: "TIME: <clock>") – set to empty string to hide */
  topLeft2?: string
  /** Top-left status text (default: "ACTIVE") */
  topLeftStatus?: string
  /** Top-right line 1 (default: "NEUROKLAST v1.0") */
  topRight1?: string
  /** Top-right line 2 (default: "ID: NK-<random>") */
  topRight2?: string
  /** Bottom-left line 1 (default: "PROTOCOL: TECHNO") */
  bottomLeft1?: string
  /** Bottom-left line 2 (default: "STATUS: TRANSMITTING") */
  bottomLeft2?: string
  /** Bottom-right line 1 (default: "FREQ: 140-180 BPM") */
  bottomRight1?: string
  /** Bottom-right line 2 (default: "MODE: HARD") */
  bottomRight2?: string
}
