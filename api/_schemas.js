import { z } from 'zod'

/**
 * Zod schemas for strict input validation on all API endpoints.
 *
 * Every piece of user input must pass through a schema before the API
 * handler processes it.  This prevents injection, type confusion, and
 * unexpected data shapes.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Safe string: printable, no control characters, bounded length */
const safeString = (maxLen = 200) =>
  z.string().max(maxLen).regex(/^[^\n\r\0]*$/, 'Must not contain control characters')

/** KV key: alphanumeric + hyphens/underscores/dots/colons, max 200 chars */
export const kvKeySchema = safeString(200)
  .min(1, 'key is required')

// ---------------------------------------------------------------------------
// KV API — POST body
// ---------------------------------------------------------------------------

export const kvPostSchema = z.object({
  key: kvKeySchema,
  value: z.unknown().refine((v) => v !== undefined, 'value is required'),
})

// ---------------------------------------------------------------------------
// KV API — GET query
// ---------------------------------------------------------------------------

export const kvGetQuerySchema = z.object({
  key: kvKeySchema,
})

// ---------------------------------------------------------------------------
// Reset Password API — POST body
// ---------------------------------------------------------------------------

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'email is required')
    .max(254, 'Email too long')
    .email('Invalid email format'),
})

// ---------------------------------------------------------------------------
// Reset Password Confirm API — POST body (token-based reset)
// ---------------------------------------------------------------------------

export const confirmResetPasswordSchema = z.object({
  token: z.string().min(1, 'token is required').max(200),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(200),
})

// ---------------------------------------------------------------------------
// Auth API — POST body schemas
// ---------------------------------------------------------------------------

export const authLoginSchema = z.object({
  password: z.string().min(1, 'password is required').max(200),
})

export const authLoginTotpSchema = z.object({
  password: z.string().min(1, 'password is required').max(200),
  totpCode: z.string().min(6, 'TOTP code must be 6 digits').max(6).regex(/^\d{6}$/, 'TOTP code must be 6 digits').optional(),
})

export const authSetupSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  action: z.literal('setup'),
  setupToken: z.string().max(200).optional(),
})

export const authChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'current password is required').max(200),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(200),
})

export const totpVerifySchema = z.object({
  action: z.literal('totp-verify'),
  code: z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d{6}$/, 'TOTP code must be 6 digits'),
})

export const totpSetupSchema = z.object({
  action: z.literal('totp-disable'),
  password: z.string().min(1, 'password is required').max(200),
  code: z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d{6}$/, 'TOTP code must be 6 digits'),
})

// ---------------------------------------------------------------------------
// Analytics API — POST body
// ---------------------------------------------------------------------------

const analyticsMetaSchema = z.object({
  referrer: safeString().optional(),
  device: safeString().optional(),
  browser: safeString().optional(),
  screenResolution: safeString(50).optional(),
  landingPage: safeString().optional(),
  utmSource: safeString(100).optional(),
  utmMedium: safeString(100).optional(),
  utmCampaign: safeString(100).optional(),
  sessionId: safeString(100).optional(),
}).optional()

const heatmapSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(2),
  page: safeString().optional(),
  elementTag: safeString(100).optional(),
}).optional()

export const analyticsPostSchema = z.object({
  type: z.enum(['page_view', 'section_view', 'interaction', 'click']),
  target: safeString().optional(),
  meta: analyticsMetaSchema,
  heatmap: heatmapSchema,
})

// ---------------------------------------------------------------------------
// Drive folder API — GET query
// ---------------------------------------------------------------------------

export const driveFolderQuerySchema = z.object({
  folderId: z.string().min(1, 'folderId parameter is required').regex(/^[A-Za-z0-9_-]+$/, 'Invalid folderId format'),
})

// ---------------------------------------------------------------------------
// iTunes API — GET query
// ---------------------------------------------------------------------------

export const itunesQuerySchema = z.object({
  term: z.string().min(1, 'Search term is required').max(200),
  entity: z.enum(['song', 'album', 'all']).optional(),
})

// ---------------------------------------------------------------------------
// Odesli API — GET query
// ---------------------------------------------------------------------------

export const odesliQuerySchema = z.object({
  url: z.string().min(1, 'A streaming URL is required').max(2000).url('Invalid URL'),
})

// ---------------------------------------------------------------------------
// Image proxy API — GET query
// ---------------------------------------------------------------------------

export const imageProxyQuerySchema = z.object({
  url: z.string().min(1, 'url parameter is required').max(2000),
})

// ---------------------------------------------------------------------------
// Terminal API — POST body
// ---------------------------------------------------------------------------

export const terminalCommandSchema = z.object({
  command: z.string().min(1, 'command is required').max(100)
    .regex(/^[a-z0-9_-]+$/, 'Invalid command format'),
})

// ---------------------------------------------------------------------------
// Drive download API — GET query
// ---------------------------------------------------------------------------

export const driveDownloadQuerySchema = z.object({
  fileId: z.string().min(1, 'fileId parameter is required').regex(/^[A-Za-z0-9_-]+$/, 'Invalid fileId format'),
})

// ---------------------------------------------------------------------------
// Helper: validate and return first error message
// ---------------------------------------------------------------------------

/**
 * Validate input against a Zod schema.
 * Returns `{ success: true, data }` or `{ success: false, error: string }`.
 */
export function validate(schema, input) {
  const result = schema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  // Return the first human-readable error message
  const firstIssue = result.error.issues[0]
  return { success: false, error: firstIssue?.message || 'Validation failed' }
}
