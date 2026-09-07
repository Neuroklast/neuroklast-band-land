'use server'

import { runAdminAction } from '@/app/admin/_actions/auth'
import { createSupabaseActionContext } from '@/app/admin/_actions/context'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { dispatchAdminActionAsAdmin } from '@/app/admin/_actions/context'
import { revalidatePath } from 'next/cache'
import { safeExternalUrlOptional } from '@/lib/safe-external-url'
import { z } from 'zod'

function parseStringListFormField(formData: FormData, name: string): string[] {
  const raw = formData.get(name)
  if (typeof raw !== 'string' || raw.trim() === '') return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    }
  } catch {
    // ignore
  }
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseObjectFormField(formData: FormData, name: string): Record<string, unknown> {
  const raw = formData.get(name)
  if (typeof raw !== 'string' || raw.trim() === '') return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    // ignore
  }
  return {}
}

const gigInputSchema = z.object({
  title: z.string().min(1),
  venue: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  event_date: z.string().min(1),
  ticket_url: safeExternalUrlOptional.transform(v => v === '' ? null : v),
  festival_name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  gig_type: z.string().optional().nullable(),
  status: z.string().optional().default('confirmed'),
  supporting_artists: z.array(z.string()).optional().default([]),
  event_links: z.record(z.string(), z.unknown()).optional().default({}),
  photo_storage_path: z.string().optional().nullable(),
  photo_url: safeExternalUrlOptional.transform(v => v === '' ? null : v),
})

function parseFormData(formData: FormData) {
  return {
    title: formData.get('title'),
    venue: formData.get('venue') || null,
    city: formData.get('city') || null,
    country: formData.get('country') || null,
    event_date: formData.get('event_date'),
    ticket_url: formData.get('ticket_url') || null,
    festival_name: formData.get('festival_name') || null,
    description: formData.get('description') || null,
    gig_type: formData.get('gig_type') || null,
    status: formData.get('status') || 'confirmed',
    supporting_artists: parseStringListFormField(formData, 'supporting_artists'),
    event_links: parseObjectFormField(formData, 'event_links'),
    photo_storage_path: formData.get('photo_storage_path') || null,
    photo_url: formData.get('photo_url') || null,
  }
}

export async function createGig(formData: FormData) {
  const parsed = gigInputSchema.safeParse(parseFormData(formData))
  if (!parsed.success) return { error: parsed.error.message }

  const supabaseAdmin = createAdminClient()

  // Dispatch via registry for AGENTS compliance
  const dispatchResult = dispatchAdminActionAsAdmin('create_gig', parsed.data, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('gigs').insert(parsed.data)
    if (error) return { error: error.message }

    revalidatePath('/admin/gigs')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to create gig.')
}

export async function updateGig(id: string, formData: FormData) {
  const parsed = gigInputSchema.safeParse(parseFormData(formData))
  if (!parsed.success) return { error: parsed.error.message }

  const supabaseAdmin = createAdminClient()

  const dispatchResult = dispatchAdminActionAsAdmin('update_gig', { ...parsed.data, id }, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('gigs').update(parsed.data).eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin/gigs')
    revalidatePath(`/admin/gigs/${id}`)
    revalidatePath('/')
    return { success: true }
  }, 'Unable to update gig.')
}

export async function deleteGig(id: string) {
  const supabaseAdmin = createAdminClient()

  const dispatchResult = dispatchAdminActionAsAdmin('delete_gig', { id }, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('gigs').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin/gigs')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to delete gig.')
}

export async function toggleGigVisibility(id: string, active: boolean) {
  const supabaseAdmin = createAdminClient()

  const dispatchResult = dispatchAdminActionAsAdmin('update_gig', { id, active }, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('gigs').update({ active }).eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin/gigs')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to update gig visibility.')
}
