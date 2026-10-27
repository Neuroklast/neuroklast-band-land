import 'server-only'
import { z } from 'zod'
import { db } from '@/lib/neurokore/server'

export const packSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  pack_type: z.enum(['sample_pack','preset_pack']),
  is_free: z.boolean(),
  price_cents: z.number().int(),
  sample_count: z.number().int(),
  format_description: z.string(),
  license_notes: z.string(),
  archive_key: z.string().nullable(),
  archive_filename: z.string().nullable(),
  archive_bytes: z.number().nullable(),
  image_storage_path: z.string().nullable(),
  image_url: z.string().nullable(),
  active: z.boolean(),
})
export type DigitalPack = z.infer<typeof packSchema>

/** Unpublished and incomplete products are never sellable or downloadable. */
export function packIsReady(pack: DigitalPack): boolean {
  return pack.active && !!pack.archive_key &&
    /^digital-packs\/[a-f0-9-]{36}\.zip$/.test(pack.archive_key) &&
    !!pack.archive_filename && (pack.archive_bytes ?? 0) > 0 &&
    !!pack.license_notes.trim() &&
    (pack.is_free ? pack.price_cents === 0 : pack.price_cents >= 100)
}

const selectFields = [
  'id','title','description','pack_type','is_free','price_cents','sample_count',
  'format_description','license_notes','archive_key','archive_filename','archive_bytes',
  'image_storage_path','image_url','active',
].join(',')

export async function loadDigitalPack(id: string): Promise<DigitalPack | null> {
  if (!z.uuid().safeParse(id).success) return null
  const { data, error } = await db().from('soundpacks')
    .select(selectFields).eq('id', id).maybeSingle()
  if (error || !data) return null
  const parsed = packSchema.safeParse(data)
  return parsed.success && packIsReady(parsed.data) ? parsed.data : null
}

export async function loadDigitalPacks(): Promise<DigitalPack[]> {
  const { data, error } = await db().from('soundpacks')
    .select(selectFields).eq('active', true)
    .not('archive_key','is',null).order('display_order',{ ascending:true }).limit(100)
  if (error) throw error
  return z.array(packSchema).parse(data||[]).filter(packIsReady)
}

export function euros(cents: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents/100)
}

export function digitalPackSalesOpen(env: Record<string,string|undefined> = process.env): boolean {
  const enabled = env.DIGITAL_PACK_SALES_ENABLED === 'true'
  if (!enabled) return false
  const stripeKey = env.STRIPE_SECRET_KEY || ''
  if (env.VERCEL_ENV === 'production') return /^sk_live_|^rk_live_/.test(stripeKey)
  return env.VERCEL_ENV === 'preview' &&
    env.NEUROKORE_SANDBOX_CHECKOUT === 'true' && /^(sk|rk)_test_/.test(stripeKey)
}
