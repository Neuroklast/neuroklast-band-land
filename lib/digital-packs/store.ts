import 'server-only'
import { z } from 'zod'
import { db } from '@/lib/neurokore/server'
import { packSchema, packIsReady } from './rules'
export { packSchema, packIsReady, euros, digitalPackSalesOpen } from './rules'
export type { DigitalPack } from './rules'

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

