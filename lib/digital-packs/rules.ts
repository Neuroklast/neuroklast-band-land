import { z } from 'zod'

export const packSchema = z.object({
  id: z.uuid(), title: z.string(), description: z.string(),
  pack_type: z.enum(['sample_pack','preset_pack']),
  is_free: z.boolean(), price_cents: z.number().int(),
  sample_count: z.number().int(), format_description: z.string(),
  license_notes: z.string(), archive_key: z.string().nullable(),
  archive_filename: z.string().nullable(), archive_bytes: z.number().nullable(),
  image_storage_path: z.string().nullable(), image_url: z.string().nullable(),
  active: z.boolean(),
})
export type DigitalPack = z.infer<typeof packSchema>

export function packIsReady(pack: DigitalPack): boolean {
  return pack.active && !!pack.archive_key &&
    /^digital-packs\/[a-f0-9-]{36}\.zip$/.test(pack.archive_key) &&
    !!pack.archive_filename && (pack.archive_bytes ?? 0) > 0 &&
    !!pack.license_notes.trim() &&
    (pack.is_free ? pack.price_cents === 0 : pack.price_cents >= 100)
}
export function euros(cents: number): string {
  return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(cents/100)
}
/** An explicit environment + sales switch is required even in Preview. */
export function digitalPackSalesOpen(env: Record<string,string|undefined> = process.env): boolean {
  if (env.DIGITAL_PACK_SALES_ENABLED !== 'true') return false
  const stripeKey = env.STRIPE_SECRET_KEY || ''
  if (env.VERCEL_ENV === 'production') return /^(sk|rk)_live_/.test(stripeKey)
  return env.VERCEL_ENV === 'preview' &&
    env.NEUROKORE_SANDBOX_CHECKOUT === 'true' && /^(sk|rk)_test_/.test(stripeKey)
}
