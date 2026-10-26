export const API_SECRET_KEYS = [
  'spotify_client_id',
  'spotify_client_secret',
  'discogs_token',
  'bandsintown_api_key',
  'setlistfm_api_key',
  'google_drive_api_key',
  'google_client_id',
  'google_client_secret',
  'resend_api_key',
  'brevo_api_key',
  'mailchimp_api_key',
  'mailchimp_list_id',
  'brevo_list_id',
  'blob_read_write_token',
] as const

export type ApiSecretKey = (typeof API_SECRET_KEYS)[number]

export interface ApiSecretFieldDef {
  key: ApiSecretKey
  envVar: string
  label: string
  description?: string
  sensitive: boolean
}

export interface ApiSecretGroupDef {
  id: string
  label: string
  description?: string
  fields: readonly ApiSecretFieldDef[]
}

export const API_SECRET_GROUPS: readonly ApiSecretGroupDef[] = [
  {
    id: 'spotify',
    label: 'Spotify',
    description: 'Client credentials for catalogue sync and release enrichment.',
    fields: [
      {
        key: 'spotify_client_id',
        envVar: 'SPOTIFY_CLIENT_ID',
        label: 'Client ID',
        sensitive: false,
      },
      {
        key: 'spotify_client_secret',
        envVar: 'SPOTIFY_CLIENT_SECRET',
        label: 'Client Secret',
        sensitive: true,
      },
    ],
  },
  {
    id: 'discogs',
    label: 'Discogs',
    description: 'Personal access token for release metadata and catalogue sync.',
    fields: [
      {
        key: 'discogs_token',
        envVar: 'DISCOGS_TOKEN',
        label: 'Personal Access Token',
        sensitive: true,
      },
    ],
  },
  {
    id: 'bandsintown',
    label: 'Bandsintown',
    description: 'App ID for live event sync.',
    fields: [
      {
        key: 'bandsintown_api_key',
        envVar: 'BANDSINTOWN_API_KEY',
        label: 'App ID / API Key',
        sensitive: true,
      },
    ],
  },
  {
    id: 'setlistfm',
    label: 'Setlist.fm',
    description: 'API key for setlist lookups.',
    fields: [
      {
        key: 'setlistfm_api_key',
        envVar: 'SETLISTFM_API_KEY',
        label: 'API Key',
        sensitive: true,
      },
    ],
  },
  {
    id: 'google',
    label: 'Google',
    description: 'Drive API and OAuth credentials.',
    fields: [
      {
        key: 'google_drive_api_key',
        envVar: 'GOOGLE_DRIVE_API_KEY',
        label: 'Drive API Key',
        sensitive: true,
      },
      {
        key: 'google_client_id',
        envVar: 'GOOGLE_CLIENT_ID',
        label: 'OAuth Client ID',
        sensitive: false,
      },
      {
        key: 'google_client_secret',
        envVar: 'GOOGLE_CLIENT_SECRET',
        label: 'OAuth Client Secret',
        sensitive: true,
      },
    ],
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Transactional email providers.',
    fields: [
      {
        key: 'resend_api_key',
        envVar: 'RESEND_API_KEY',
        label: 'Resend API Key',
        sensitive: true,
      },
      {
        key: 'brevo_api_key',
        envVar: 'BREVO_API_KEY',
        label: 'Brevo API Key',
        sensitive: true,
      },
    ],
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    description: 'Mailing list provider credentials.',
    fields: [
      {
        key: 'mailchimp_api_key',
        envVar: 'MAILCHIMP_API_KEY',
        label: 'Mailchimp API Key',
        sensitive: true,
      },
      {
        key: 'mailchimp_list_id',
        envVar: 'MAILCHIMP_LIST_ID',
        label: 'Mailchimp List ID',
        sensitive: false,
      },
      {
        key: 'brevo_list_id',
        envVar: 'BREVO_LIST_ID',
        label: 'Brevo List ID',
        sensitive: false,
      },
    ],
  },
  {
    id: 'storage',
    label: 'Vercel Blob',
    description: 'Legacy CMS media upload token.',
    fields: [
      {
        key: 'blob_read_write_token',
        envVar: 'BLOB_READ_WRITE_TOKEN',
        label: 'Blob Read/Write Token',
        sensitive: true,
      },
    ],
  },
] as const

export const API_SECRET_FIELDS: readonly ApiSecretFieldDef[] = API_SECRET_GROUPS.flatMap(
  (group) => group.fields,
)

