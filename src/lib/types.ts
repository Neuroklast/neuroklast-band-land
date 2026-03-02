export interface Gig {
  id: string
  date: string // ISO 8601: "2025-03-15" or "2025-03-15T19:00"
  venue: string
  location: string // City, Country
  ticketUrl?: string
  gigType?: 'concert' | 'dj'
  allDay?: boolean
  status?: 'confirmed' | 'cancelled' | 'soldout' | 'announced'
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
  type?: 'album' | 'ep' | 'single' | 'remix' | 'compilation'
  artwork?: string
  releaseDate?: string // ISO 8601: "2024-11-01"
  description?: string
  featured?: boolean
  streamingLinks: {
    spotify?: string
    soundcloud?: string
    bandcamp?: string
    youtube?: string
    appleMusic?: string
    beatport?: string
  }
  tracks?: Array<{
    title: string
    duration?: string // "4:23"
  }>
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
  /** Base font size factor (default 1.0, range 0.75–1.5) */
  fontSize?: number
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
  movingScanline?: OverlayEffect
}

export interface AnimationSettings {
  glitchEnabled?: boolean
  scanlineEnabled?: boolean
  chromaticEnabled?: boolean
  crtEnabled?: boolean
  noiseEnabled?: boolean
  circuitBackgroundEnabled?: boolean
  crtOverlayOpacity?: number
  crtVignetteOpacity?: number
}

export interface ProgressiveOverlayModes {
  progressiveReveal?: boolean
  dataStream?: boolean
  sectorAssembly?: boolean
  holographicMaterialization?: boolean
}

export interface NewsletterSettings {
  enabled?: boolean
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  provider?: 'mailchimp' | 'brevo' | 'none'
  showInFooter?: boolean
  showAfterGigs?: boolean
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  date: string // ISO 8601
  read?: boolean
}

export interface ContactSettings {
  enabled?: boolean
  title?: string
  description?: string
  emailForwardTo?: string
  successMessage?: string
  /** Show the contact section on the public site */
  showSection?: boolean
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
  contact?: boolean
  hudBackground?: boolean
  audioVisualizer?: boolean
  scanline?: boolean
  systemMonitor?: boolean
}

export interface NavigationConfig {
  showLanguageSwitcher?: boolean
  showAudioPlayer?: boolean
  customItems?: Array<{ label: string; href: string; external?: boolean }>
}

export interface FooterConfig {
  copyrightText?: string
  showAttribution?: boolean
  links?: Array<{ label: string; href: string; external?: boolean }>
}

export interface SEOConfig {
  ogImage?: string
  twitterCard?: 'summary' | 'summary_large_image'
  twitterHandle?: string
  analyticsId?: string
  customMeta?: Array<{ name: string; content: string }>
}

export interface FeatureFlags {
  newsletter?: boolean
  contactForm?: boolean
  gallery?: boolean
  terminal?: boolean
  sounds?: boolean
  crtEffects?: boolean
  hudBackground?: boolean
  cookieBanner?: boolean
  security?: boolean
}

export interface SiteConfig {
  // ─── META FIELDS ───
  /** Unique site identifier (auto-generated UUID on first setup) */
  siteId: string
  /** Type of site – determines available sections and defaults */
  siteType: 'band' | 'dj' | 'artist' | 'label' | 'portfolio' | 'custom'
  /** Site name (replaces BandData.name) */
  siteName: string
  /** Short tagline / subtitle */
  tagline?: string
  /** Site description for SEO */
  description?: string
  /** Primary domain (for OG tags, sitemap, canonical) */
  domain?: string
  /** Whether initial setup wizard has been completed */
  setupComplete: boolean
  /** ISO date of first configuration */
  createdAt?: string
  /** ISO date of last change */
  updatedAt?: string
  /** Template version for future migrations */
  templateVersion: string

  // ─── EXISTING FIELDS FROM BandData (1:1 kept) ───
  genres: string[]
  socialLinks: SocialLinks
  gigs: Gig[]
  releases: Release[]
  biography?: Biography
  label?: string
  logoUrl?: string
  titleImageUrl?: string
  terminalCommands?: TerminalCommand[]
  impressum?: Impressum
  galleryImages?: GalleryImage[]
  datenschutz?: Datenschutz
  fontSizes?: FontSizeSettings
  syncUrl?: string
  galleryDriveFolderUrl?: string
  soundSettings?: SoundSettings
  configOverrides?: Record<string, unknown>
  secretCode?: string[]
  hudTexts?: HudTexts
  sectionLabels?: SectionLabels
  news?: NewsItem[]
  mediaFiles?: MediaFile[]
  themeSettings?: ThemeSettings
  sectionVisibility?: SectionVisibility
  newsletterSettings?: NewsletterSettings
  contactSettings?: ContactSettings
  terminalMorseCode?: string
  animations?: AnimationSettings

  // ─── NEW CONFIG FIELDS ───
  /** Section display order – array of section IDs */
  sectionOrder: string[]
  /** Navigation configuration */
  navigation: NavigationConfig
  /** Footer configuration */
  footer: FooterConfig
  /** SEO & meta tag configuration */
  seo: SEOConfig
  /** Feature flags */
  features: FeatureFlags
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
  contact?: string
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
  /** Top-right line 1 (default: "{siteName} v1.0") */
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

/**
 * Identifies which admin dialog is currently open.
 * Used as a single state value instead of 13+ individual booleans.
 */
export type AdminDialog =
  | 'design'
  | 'config'
  | 'sound'
  | 'terminal'
  | 'secret-terminal'
  | 'analytics'
  | 'security-log'
  | 'security-settings'
  | 'blocklist'
  | 'attacker-profiles'
  | 'inbox'
  | 'subscribers'
  | 'marketing'
  | null
