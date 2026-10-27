'use server'

import { runAdminAction } from '@/app/admin/_actions/auth'
import { createSupabaseActionContext } from '@/app/admin/_actions/context'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { dispatchAdminActionAsAdmin } from '@/app/admin/_actions/context'
import { revalidatePath } from 'next/cache'
import { preferR2StoragePath } from '@/lib/r2-image-preference'
import { safeExternalUrlOptional } from '@/lib/safe-external-url'
import { z } from 'zod'
import { verifyDigitalPackArchive } from './digitalPacks'

const schema = z.object({
  title: z.string().min(1),
  image_storage_path: z.string().optional().nullable(),
  image_url: safeExternalUrlOptional,
  external_url: safeExternalUrlOptional,
  display_order: z.coerce.number().optional().default(0),
  description: z.string().max(4000).default(''),
  pack_type: z.enum(['sample_pack','preset_pack']).default('sample_pack'),
  is_free: z.boolean().default(true),
  price_cents: z.coerce.number().int().min(0).max(100000).default(0),
  archive_key: z.string().regex(/^digital-packs\/[a-f0-9-]{36}\.zip$/).nullable().default(null),
  archive_filename: z.string().min(1).max(180).nullable().default(null),
  archive_bytes: z.coerce.number().int().min(1).max(1024*1024*1024).nullable().default(null),
  sample_count: z.coerce.number().int().min(0).max(1000000).default(0),
  format_description: z.string().max(500).default(''),
  license_notes: z.string().max(5000).default(''),
})

function parseFormData(formData: FormData) {
  return {
    title: formData.get('title'),
    image_storage_path: formData.get('image_storage_path') || null,
    image_url: formData.get('image_url') || null,
    external_url: formData.get('external_url') || null,
    display_order: formData.get('display_order') || 0,
    description: formData.get('description') || '',
    pack_type: formData.get('pack_type') || 'sample_pack',
    is_free: formData.get('is_free') === 'on',
    price_cents: formData.get('is_free') === 'on' ? 0 : formData.get('price_cents') || 0,
    archive_key: formData.get('archive_key') || null,
    archive_filename: formData.get('archive_filename') || null,
    archive_bytes: formData.get('archive_bytes') || null,
    sample_count: formData.get('sample_count') || 0,
    format_description: formData.get('format_description') || '',
    license_notes: formData.get('license_notes') || '',
  }
}

export async function createSoundpack(formData: FormData) {
  const parsed = schema.safeParse(parseFormData(formData))
  if (!parsed.success) return { error: parsed.error.message }

  if (parsed.data.archive_key) {
    if (!parsed.data.archive_filename || !parsed.data.archive_bytes)
      return { error: 'Archive file name and file size are required.' }
    try { await verifyDigitalPackArchive(parsed.data.archive_key, parsed.data.archive_bytes) }
    catch (error) { return { error: error instanceof Error ? error.message : 'Archive unavailable.' } }
  }
  if (!parsed.data.is_free && parsed.data.price_cents < 100)
    return { error: 'Paid digital packs must cost at least 1 EUR.' }

  const supabaseAdmin = createAdminClient()

  const dispatchResult = dispatchAdminActionAsAdmin('create_soundpack', parsed.data, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const row = preferR2StoragePath(
      {
        ...parsed.data,
        image_url: parsed.data.image_url || null,
        external_url: parsed.data.external_url || null,
      },
      'image_storage_path',
      'image_url',
    )
    const { error } = await supabaseAdmin.from('soundpacks').insert(row)
    if (error) return { error: error.message }

    revalidatePath('/admin/soundpacks')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to create soundpack.')
}

export async function updateSoundpack(id: string, formData: FormData) {
  const parsed = schema.safeParse(parseFormData(formData))
  if (!parsed.success) return { error: parsed.error.message }

  if (parsed.data.archive_key) {
    if (!parsed.data.archive_filename || !parsed.data.archive_bytes)
      return { error: 'Archive file name and file size are required.' }
    try { await verifyDigitalPackArchive(parsed.data.archive_key, parsed.data.archive_bytes) }
    catch (error) { return { error: error instanceof Error ? error.message : 'Archive unavailable.' } }
  }
  if (!parsed.data.is_free && parsed.data.price_cents < 100)
    return { error: 'Paid digital packs must cost at least 1 EUR.' }

  const supabaseAdmin = createAdminClient()

  const dispatchResult = dispatchAdminActionAsAdmin('update_soundpack', { ...parsed.data, id }, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const row = preferR2StoragePath(
      {
        ...parsed.data,
        image_url: parsed.data.image_url || null,
        external_url: parsed.data.external_url || null,
      },
      'image_storage_path',
      'image_url',
    )
    const { error } = await supabaseAdmin.from('soundpacks').update(row).eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin/soundpacks')
    revalidatePath(`/admin/soundpacks/${id}`)
    revalidatePath('/')
    return { success: true }
  }, 'Unable to update soundpack.')
}

export async function deleteSoundpack(id: string) {
  const supabaseAdmin = createAdminClient()

  const dispatchResult = dispatchAdminActionAsAdmin('delete_soundpack', { id }, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('soundpacks').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin/soundpacks')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to delete soundpack.')
}

export async function toggleSoundpackVisibility(id: string, active: boolean) {
  const supabaseAdmin = createAdminClient()

  const dispatchResult = dispatchAdminActionAsAdmin('update_soundpack', { id, active }, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('soundpacks').update({ active }).eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin/soundpacks')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to update soundpack visibility.')
}
