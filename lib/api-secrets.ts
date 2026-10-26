import { createAdminClient } from '@/lib/supabaseAdmin'
import {
  decryptSecret,
  encryptSecret,
  isSecretsEncryptionConfigured,
} from '@/lib/secrets-encryption'

import { API_SECRET_FIELDS, type ApiSecretKey, type ApiSecretFieldDef } from './api-secret-fields'
export { API_SECRET_KEYS, API_SECRET_FIELDS, API_SECRET_GROUPS } from './api-secret-fields'
export type { ApiSecretKey, ApiSecretFieldDef, ApiSecretGroupDef } from './api-secret-fields'

const FIELD_BY_KEY = new Map<ApiSecretKey, ApiSecretFieldDef>(
  API_SECRET_FIELDS.map((field) => [field.key, field]),
)

const VALID_KEYS = new Set<ApiSecretKey>(API_SECRET_FIELDS.map((field) => field.key))

interface CacheEntry {
  value: string | null
  expires: number
}

const CACHE_TTL_MS = 60_000
const cache = new Map<ApiSecretKey, CacheEntry>()

function getFieldDef(key: ApiSecretKey): ApiSecretFieldDef {
  const def = FIELD_BY_KEY.get(key)
  if (!def) throw new Error(`Unknown API secret key: ${key}`)
  return def
}

function readEnvFallback(key: ApiSecretKey): string | null {
  const envVar = getFieldDef(key).envVar
  const value = process.env[envVar]
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function clearApiSecretsCache(): void {
  cache.clear()
}

export function isValidApiSecretKey(key: string): key is ApiSecretKey {
  return VALID_KEYS.has(key as ApiSecretKey)
}

/**
 * Returns whether a secret is configured (DB row or env fallback). Never returns the value.
 */
export async function isApiSecretConfigured(key: ApiSecretKey): Promise<boolean> {
  const status = await getApiSecretsStatus()
  return status[key] ?? false
}

export async function getApiSecretsStatus(): Promise<Record<ApiSecretKey, boolean>> {
  const status = {} as Record<ApiSecretKey, boolean>
  const dbKeys = new Set<string>()

  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from('api_secrets').select('key')
    for (const row of data ?? []) {
      if (typeof row.key === 'string') dbKeys.add(row.key)
    }
  } catch {
    // Table may not exist yet — fall back to env only
  }

  for (const field of API_SECRET_FIELDS) {
    status[field.key] = dbKeys.has(field.key) || readEnvFallback(field.key) !== null
  }

  return status
}

/**
 * Resolve a secret: Supabase (decrypted) first, then env fallback.
 */
export async function getApiSecret(key: ApiSecretKey): Promise<string | null> {
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) {
    return cached.value
  }

  let value: string | null = null

  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('api_secrets')
      .select('encrypted_value')
      .eq('key', key)
      .maybeSingle()

    if (data?.encrypted_value && typeof data.encrypted_value === 'string') {
      if (isSecretsEncryptionConfigured()) {
        value = decryptSecret(data.encrypted_value)
      }
    }
  } catch {
    // Fall through to env
  }

  if (!value) {
    value = readEnvFallback(key)
  }

  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS })
  return value
}

export async function setApiSecret(key: ApiSecretKey, plaintext: string): Promise<void> {
  if (!isSecretsEncryptionConfigured()) {
    throw new Error('SECRETS_ENCRYPTION_KEY is not configured')
  }

  const trimmed = plaintext.trim()
  if (!trimmed) {
    throw new Error('Secret value cannot be empty')
  }

  const encrypted = encryptSecret(trimmed)
  const supabase = createAdminClient()
  const { error } = await supabase.from('api_secrets').upsert(
    {
      key,
      encrypted_value: encrypted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  )

  if (error) throw new Error(error.message)
  cache.delete(key)
}

export async function deleteApiSecret(key: ApiSecretKey): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('api_secrets').delete().eq('key', key)
  if (error) throw new Error(error.message)
  cache.delete(key)
}

export interface SaveApiSecretsInput {
  values: Partial<Record<ApiSecretKey, string>>
  clearKeys: ApiSecretKey[]
}

export async function saveApiSecrets(input: SaveApiSecretsInput): Promise<void> {
  for (const key of input.clearKeys) {
    await deleteApiSecret(key)
  }

  for (const [rawKey, rawValue] of Object.entries(input.values)) {
    if (!isValidApiSecretKey(rawKey)) continue
    const value = typeof rawValue === 'string' ? rawValue.trim() : ''
    if (!value) continue
    await setApiSecret(rawKey, value)
  }
}