'use server'

import { runAdminAction } from '@/app/admin/_actions/auth'
import { createSupabaseActionContext } from '@/app/admin/_actions/context'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { dispatchAdminActionAsAdmin } from '@/app/admin/_actions/context'
import { revalidatePath, revalidateTag } from 'next/cache'
import { preferR2StoragePath } from '@/lib/r2-image-preference'
import { safeProductHrefOptional } from '@/lib/safe-external-url'
import {
  isProductsSectionVisible,
  mergeWithDefaultSections,
  parseSections,
} from '@/lib/site-config-sections'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
  image_storage_path: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  href: safeProductHrefOptional,
  price_label: z.string().max(80).optional().nullable(),
  display_order: z.coerce.number().optional().default(0),
})

function parseFormData(formData: FormData) {
  return {
    title: formData.get('title'),
    description: formData.get('description') || null,
    image_storage_path: formData.get('image_storage_path') || null,
    image_url: formData.get('image_url') || null,
    href: formData.get('href') || null,
    price_label: formData.get('price_label') || null,
    display_order: formData.get('display_order') || 0,
  }
}

function revalidateProductSurfaces() {
  revalidateTag('site-config', 'max')
  revalidateTag('homepage-site-data', 'max')
  revalidatePath('/', 'layout')
  revalidatePath('/')
  revalidatePath('/neurokore')
  revalidatePath('/neurokore/account')
  revalidatePath('/admin/products')
  revalidatePath('/admin/sections')
  revalidatePath('/admin/site-config')
}

export async function createProduct(formData: FormData) {
  const parsed = schema.safeParse(parseFormData(formData))
  if (!parsed.success) return { error: parsed.error.message }

  const supabaseAdmin = createAdminClient()
  const dispatchResult = dispatchAdminActionAsAdmin(
    'create_product',
    parsed.data,
    createSupabaseActionContext(supabaseAdmin),
  )
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const row = preferR2StoragePath(
      {
        ...parsed.data,
        description: parsed.data.description || null,
        image_url: parsed.data.image_url || null,
        href: parsed.data.href || null,
        price_label: parsed.data.price_label || null,
      },
      'image_storage_path',
      'image_url',
    )
    const { error } = await supabaseAdmin.from('products').insert(row)
    if (error) return { error: error.message }
    revalidateProductSurfaces()
    return { success: true }
  }, 'Unable to create product.')
}

export async function updateProduct(id: string, formData: FormData) {
  const parsed = schema.safeParse(parseFormData(formData))
  if (!parsed.success) return { error: parsed.error.message }

  const supabaseAdmin = createAdminClient()
  const dispatchResult = dispatchAdminActionAsAdmin(
    'update_product',
    { ...parsed.data, id },
    createSupabaseActionContext(supabaseAdmin),
  )
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const row = preferR2StoragePath(
      {
        ...parsed.data,
        description: parsed.data.description || null,
        image_url: parsed.data.image_url || null,
        href: parsed.data.href || null,
        price_label: parsed.data.price_label || null,
      },
      'image_storage_path',
      'image_url',
    )
    const { error } = await supabaseAdmin.from('products').update(row).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath(`/admin/products/${id}`)
    revalidateProductSurfaces()
    return { success: true }
  }, 'Unable to update product.')
}

export async function deleteProduct(id: string) {
  const supabaseAdmin = createAdminClient()
  const dispatchResult = dispatchAdminActionAsAdmin(
    'delete_product',
    { id },
    createSupabaseActionContext(supabaseAdmin),
  )
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidateProductSurfaces()
    return { success: true }
  }, 'Unable to delete product.')
}

export async function toggleProductVisibility(id: string, active: boolean) {
  const supabaseAdmin = createAdminClient()
  const dispatchResult = dispatchAdminActionAsAdmin(
    'update_product',
    { id, active },
    createSupabaseActionContext(supabaseAdmin),
  )
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { error } = await supabaseAdmin.from('products').update({ active }).eq('id', id)
    if (error) return { error: error.message }
    revalidateProductSurfaces()
    return { success: true }
  }, 'Unable to update product visibility.')
}

export async function setProductsSectionVisible(visible: boolean) {
  const supabaseAdmin = createAdminClient()
  const dispatchResult = dispatchAdminActionAsAdmin(
    'update_site_config',
    { key: 'sections', value: { visible } },
    createSupabaseActionContext(supabaseAdmin),
  )
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { data } = await supabaseAdmin
      .from('site_config')
      .select('value')
      .eq('key', 'sections')
      .maybeSingle()
    const sections = mergeWithDefaultSections(parseSections(data?.value)).map((section) =>
      section.id === 'products' ? { ...section, visible } : section,
    )
    const { error } = await supabaseAdmin.from('site_config').upsert(
      { key: 'sections', value: sections, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    )
    if (error) return { error: error.message }
    revalidateProductSurfaces()
    return { success: true, visible: isProductsSectionVisible(sections) }
  }, 'Unable to update product section visibility.')
}
