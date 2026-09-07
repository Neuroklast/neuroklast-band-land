'use server'

import { runAdminAction } from '@/app/admin/_actions/auth'
import { createSupabaseActionContext } from '@/app/admin/_actions/context'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { dispatchAdminActionAsAdmin } from '@/app/admin/_actions/context'
import { revalidatePath } from 'next/cache'
import { preferR2StoragePath } from '@/lib/r2-image-preference'
import { safeExternalUrlOptional } from '@/lib/safe-external-url'
import { z } from 'zod'

const memberInputSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().nullable().or(z.literal('')).transform((v) => (v === '' ? null : v)),
  bio: z.string().optional().nullable().or(z.literal('')).transform((v) => (v === '' ? null : v)),
  photo_storage_path: z.string().optional().nullable().or(z.literal('')).transform((v) => (v === '' ? null : v)),
  photo_url: safeExternalUrlOptional.transform((v) => (v === '' ? null : v)),
  display_order: z.coerce.number().optional().default(0),
  active: z.coerce.boolean().optional(),
})

function parseFormData(formData: FormData) {
  return {
    name: formData.get('name'),
    role: formData.get('role') || null,
    bio: formData.get('bio') || null,
    photo_storage_path: formData.get('photo_storage_path') || null,
    photo_url: formData.get('photo_url') || null,
    display_order: formData.get('display_order') || 0,
    active: formData.get('active'),
  }
}

function withR2PhotoPreference<T extends { photo_storage_path?: string | null; photo_url?: string | null }>(
  data: T,
): T {
  return preferR2StoragePath(data, 'photo_storage_path', 'photo_url')
}

export async function createMember(formData: FormData) {
  const parsed = memberInputSchema.safeParse(parseFormData(formData))
  if (!parsed.success) return { error: parsed.error.message }

  const supabaseAdmin = createAdminClient()
  const dispatchResult = dispatchAdminActionAsAdmin('create_member', parsed.data, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('members').insert(withR2PhotoPreference(parsed.data))
    if (error) return { error: error.message }
    revalidatePath('/admin/members')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to create member.')
}

export async function updateMember(id: string, formData: FormData) {
  const parsed = memberInputSchema.safeParse(parseFormData(formData))
  if (!parsed.success) return { error: parsed.error.message }

  const supabaseAdmin = createAdminClient()
  const dispatchResult = dispatchAdminActionAsAdmin('update_member', { ...parsed.data, id }, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin
      .from('members')
      .update(withR2PhotoPreference(parsed.data))
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin/members')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to update member.')
}

export async function deleteMember(id: string) {
  const supabaseAdmin = createAdminClient()
  const dispatchResult = dispatchAdminActionAsAdmin('delete_member', { id }, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('members').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin/members')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to delete member.')
}

export async function toggleMemberVisibility(id: string, active: boolean) {
  const supabaseAdmin = createAdminClient()
  const dispatchResult = dispatchAdminActionAsAdmin('update_member', { id, active }, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('members').update({ active }).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin/members')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to update member visibility.')
}
