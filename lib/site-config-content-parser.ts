export interface SiteConfigContentFile {
  exportVersion?: string
  exportScope?: string
  templateVersion?: string
  siteName?: string
  data: Record<string, unknown>
}

export interface ParseContentResult {
  ok: true
  data: SiteConfigContentFile
}

export interface ParseContentError {
  ok: false
  error: string
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return isPlainObject(value) ? value : null
}

export function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function parseSiteConfigContentPayload(input: unknown): ParseContentResult | ParseContentError {
  const root = asRecord(input)
  if (!root) return { ok: false, error: 'Site config content must be a JSON object' }

  const data = asRecord(root.data)
  if (!data) return { ok: false, error: 'Missing "data" object' }

  return {
    ok: true,
    data: {
      exportVersion: asString(root.exportVersion) ?? undefined,
      exportScope: asString(root.exportScope) ?? undefined,
      templateVersion: asString(root.templateVersion) ?? undefined,
      siteName: asString(root.siteName) ?? undefined,
      data,
    },
  }
}

