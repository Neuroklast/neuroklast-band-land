'use server'

import { runAdminAction } from '@/app/admin/_actions/auth'
import { createSupabaseActionContext } from '@/app/admin/_actions/context'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { dispatchAdminActionAsAdmin } from '@/app/admin/_actions/context'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { mergeSiteConfigValue, replacedConfigStoragePaths } from '@/lib/site-config-save'

const schema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
})

export async function updateSiteConfig(formData: FormData) {
  const raw = {
    key: formData.get('key'),
    value: formData.get('value'),
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.message }

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(parsed.data.value)
  } catch {
    return { error: 'Value must be valid JSON' }
  }

  const supabaseAdmin = createAdminClient()

  // Dispatch via registry (AGENTS §12)
  const dispatchResult = dispatchAdminActionAsAdmin('update_site_config', { key: parsed.data.key, value: parsedJson }, createSupabaseActionContext(supabaseAdmin))
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { data: existingRow } = await supabaseAdmin
      .from('site_config')
      .select('value')
      .eq('key', parsed.data.key)
      .maybeSingle()

    const previous = existingRow?.value
    const nextValue = mergeSiteConfigValue(previous, parsedJson)

    const { error } = await supabaseAdmin
      .from('site_config')
      .upsert(
        { key: parsed.data.key, value: nextValue, updated_at: new Date().toISOString() },
        { onConflict: 'key' },
      )

    if (error) return { error: error.message }

    const stalePaths = replacedConfigStoragePaths(parsed.data.key, previous, nextValue)
    if (stalePaths.length > 0) {
      const { deleteR2MediaObject } = await import('@/app/admin/_actions/r2Upload')
      await Promise.all(
        stalePaths.map(async (path) => {
          try {
            await deleteR2MediaObject(path)
          } catch {
            // Save already succeeded; orphan cleanup is best-effort.
          }
        }),
      )
    }

    revalidateTag('site-config', 'max')
    revalidateTag('homepage-site-data', 'max')
    revalidatePath('/', 'layout')
    revalidatePath('/')
    revalidatePath('/releases')
    revalidatePath('/gigs')
    revalidatePath('/legal-notice')
    revalidatePath('/privacy-policy')
    revalidatePath('/admin')
    revalidatePath('/admin/site-config')
    revalidatePath('/admin/legal')
    revalidatePath('/admin/translations')
    revalidatePath('/admin/analytics')
    revalidatePath('/admin/sections')
    return { success: true }
  }, 'Unable to save site configuration.')
}
