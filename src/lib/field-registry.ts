/**
 * Field Registry — schema-driven UI metadata system.
 *
 * Every content schema exposes field metadata here so that
 * <SchemaFormRenderer> can render forms without hardcoded markup.
 *
 * Architecture: this is the Single Source of Truth for all admin form fields.
 * Ref: ADR-004 in .github/ARCHITECTURE.md
 */

// ─── Widget Types ─────────────────────────────────────────────────────────────

/**
 * The UI widget type that should be used to render a given field.
 */
export type FieldWidgetType =
  | 'text'       // single-line text input
  | 'textarea'   // multi-line text area
  | 'number'     // numeric input
  | 'boolean'    // toggle / checkbox
  | 'url'        // URL input (validated)
  | 'date'       // date picker
  | 'select'     // dropdown with predefined options
  | 'tags'       // comma-separated or chip-style tag list
  | 'color'      // color picker

// ─── Field Metadata ────────────────────────────────────────────────────────────

/**
 * Metadata for a single form field.
 * Used by <SchemaFormRenderer> to render the correct input widget.
 */
export interface FieldMeta {
  /** Unique field key – must match the object property name */
  key: string
  /** Human-readable label shown in the UI */
  label: string
  /** Optional help text shown below the input */
  description?: string
  /** The UI widget to use */
  widget: FieldWidgetType
  /** Whether this field must have a value */
  required?: boolean
  /** Placeholder text for the input */
  placeholder?: string
  /** For 'select' widget: the available options */
  options?: Array<{ value: string; label: string }>
  /**
   * Progressive disclosure level.
   * 'basic' fields are shown by default; 'advanced' and 'expert' are hidden
   * unless the user opts into more settings.
   */
  disclosure?: 'basic' | 'advanced' | 'expert'
}

// ─── Schema Name Registry ─────────────────────────────────────────────────────

/**
 * All known schema names that have registered fields.
 * Add a new entry here when you register a new content type.
 */
export type SchemaName =
  | 'bandInfo'
  | 'gig'
  | 'release'
  | 'biography'
  | 'newsItem'
  | 'socialLinks'
  | 'seoSettings'
  | 'navigationSettings'
  | 'contactSettings'
  | 'newsletterSettings'

// ─── Field Registry ────────────────────────────────────────────────────────────

/**
 * Maps each schema name to the ordered list of field definitions.
 * This is the Single Source of Truth for all admin form fields.
 */
export const FIELD_REGISTRY: Record<SchemaName, readonly FieldMeta[]> = {
  bandInfo: [
    { key: 'siteName', label: 'Band / Artist Name', widget: 'text', required: true, placeholder: 'e.g. Neuroklast', disclosure: 'basic' },
    { key: 'label', label: 'Record Label', widget: 'text', placeholder: 'e.g. Darktunes Music Group', disclosure: 'basic' },
    { key: 'genres', label: 'Genres', widget: 'tags', placeholder: 'INDUSTRIAL, EBM, TECHNO', disclosure: 'basic', description: 'Comma-separated genre tags' },
    { key: 'logoUrl', label: 'Logo URL', widget: 'url', placeholder: 'https://…/logo.png', disclosure: 'advanced' },
    { key: 'titleImageUrl', label: 'Title Image URL', widget: 'url', placeholder: 'https://…/title.png', disclosure: 'advanced' },
  ],

  gig: [
    { key: 'date', label: 'Date', widget: 'date', required: true, disclosure: 'basic' },
    { key: 'venue', label: 'Venue', widget: 'text', required: true, placeholder: 'e.g. Berghain', disclosure: 'basic' },
    { key: 'location', label: 'Location', widget: 'text', required: true, placeholder: 'Berlin, Germany', disclosure: 'basic' },
    { key: 'gigType', label: 'Type', widget: 'select', options: [{ value: 'concert', label: 'Concert' }, { value: 'dj', label: 'DJ Set' }], disclosure: 'basic' },
    { key: 'status', label: 'Status', widget: 'select', options: [
      { value: 'announced', label: 'Announced' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'soldout', label: 'Sold Out' },
      { value: 'cancelled', label: 'Cancelled' },
    ], disclosure: 'basic' },
    { key: 'ticketUrl', label: 'Ticket URL', widget: 'url', placeholder: 'https://…', disclosure: 'advanced' },
    { key: 'description', label: 'Description', widget: 'textarea', disclosure: 'advanced' },
  ],

  release: [
    { key: 'title', label: 'Title', widget: 'text', required: true, placeholder: 'Album / EP / Single title', disclosure: 'basic' },
    { key: 'type', label: 'Release Type', widget: 'select', options: [
      { value: 'album', label: 'Album' },
      { value: 'ep', label: 'EP' },
      { value: 'single', label: 'Single' },
      { value: 'remix', label: 'Remix' },
      { value: 'compilation', label: 'Compilation' },
    ], disclosure: 'basic' },
    { key: 'releaseDate', label: 'Release Date', widget: 'date', disclosure: 'basic' },
    { key: 'artwork', label: 'Artwork URL', widget: 'url', disclosure: 'advanced' },
    { key: 'description', label: 'Description', widget: 'textarea', disclosure: 'advanced' },
    { key: 'featured', label: 'Featured Release', widget: 'boolean', disclosure: 'advanced' },
  ],

  biography: [
    { key: 'story', label: 'Biography Text', widget: 'textarea', required: true, placeholder: 'Tell your story…', disclosure: 'basic' },
    { key: 'founded', label: 'Founded Year', widget: 'text', placeholder: 'e.g. 2015', disclosure: 'basic' },
  ],

  newsItem: [
    { key: 'title', label: 'Headline', widget: 'text', required: true, disclosure: 'basic' },
    { key: 'date', label: 'Date', widget: 'date', required: true, disclosure: 'basic' },
    { key: 'content', label: 'Content', widget: 'textarea', required: true, disclosure: 'basic' },
    { key: 'url', label: 'Link URL', widget: 'url', disclosure: 'advanced' },
  ],

  socialLinks: [
    { key: 'instagram', label: 'Instagram', widget: 'url', placeholder: 'https://instagram.com/…', disclosure: 'basic' },
    { key: 'facebook', label: 'Facebook', widget: 'url', placeholder: 'https://facebook.com/…', disclosure: 'basic' },
    { key: 'spotify', label: 'Spotify', widget: 'url', placeholder: 'https://open.spotify.com/…', disclosure: 'basic' },
    { key: 'soundcloud', label: 'SoundCloud', widget: 'url', placeholder: 'https://soundcloud.com/…', disclosure: 'basic' },
    { key: 'youtube', label: 'YouTube', widget: 'url', placeholder: 'https://youtube.com/…', disclosure: 'basic' },
    { key: 'bandcamp', label: 'Bandcamp', widget: 'url', placeholder: 'https://…bandcamp.com', disclosure: 'basic' },
    { key: 'tiktok', label: 'TikTok', widget: 'url', placeholder: 'https://tiktok.com/@…', disclosure: 'advanced' },
    { key: 'twitter', label: 'Twitter / X', widget: 'url', placeholder: 'https://x.com/…', disclosure: 'advanced' },
    { key: 'linktr', label: 'Linktree', widget: 'url', placeholder: 'https://linktr.ee/…', disclosure: 'advanced' },
  ],

  seoSettings: [
    { key: 'title', label: 'Page Title', widget: 'text', placeholder: 'Band Name – Official Site', disclosure: 'basic' },
    { key: 'description', label: 'Meta Description', widget: 'textarea', placeholder: 'Short description for search engines', disclosure: 'basic' },
    { key: 'keywords', label: 'Keywords', widget: 'tags', disclosure: 'advanced' },
    { key: 'ogImage', label: 'OG Image URL', widget: 'url', disclosure: 'advanced' },
  ],

  navigationSettings: [
    { key: 'showLanguageSwitcher', label: 'Show Language Switcher', widget: 'boolean', disclosure: 'basic' },
    { key: 'showAudioPlayer', label: 'Show Audio Player', widget: 'boolean', disclosure: 'basic' },
  ],

  contactSettings: [
    { key: 'email', label: 'Contact Email', widget: 'text', placeholder: 'band@example.com', disclosure: 'basic' },
    { key: 'subject', label: 'Email Subject Prefix', widget: 'text', placeholder: '[NEUROKLAST]', disclosure: 'advanced' },
  ],

  newsletterSettings: [
    { key: 'provider', label: 'Provider', widget: 'select', options: [
      { value: 'mailchimp', label: 'Mailchimp' },
      { value: 'brevo', label: 'Brevo' },
    ], disclosure: 'basic' },
    { key: 'listId', label: 'List / Audience ID', widget: 'text', disclosure: 'basic' },
    { key: 'apiKey', label: 'API Key', widget: 'text', disclosure: 'advanced', description: 'Stored in Vercel environment variables — do not expose in client code' },
  ],
}

// ─── Lookup helpers ────────────────────────────────────────────────────────────

/**
 * Return the ordered field definitions for a given schema.
 * Optionally filter by disclosure level.
 *
 * @example
 *   const fields = getFieldsForSchema('gig')               // all fields
 *   const basic  = getFieldsForSchema('gig', 'basic')      // basic only
 */
export function getFieldsForSchema(
  schema: SchemaName,
  disclosure?: FieldMeta['disclosure'],
): readonly FieldMeta[] {
  const fields = FIELD_REGISTRY[schema]
  if (!disclosure) return fields
  return fields.filter((f) => (f.disclosure ?? 'basic') === disclosure)
}

/**
 * Return all field keys for a given schema.
 */
export function getFieldKeysForSchema(schema: SchemaName): readonly string[] {
  return FIELD_REGISTRY[schema].map((f) => f.key)
}
