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

// § 5 DDG required operator fields; anything else is optional. Rejecting a
// malformed legal blob here prevents a broken public Impressum / Privacy Policy.
const legalConfigSchema = z.object({
  operatorName: z.string().min(1, 'Operator name is required'),
  street: z.string().min(1, 'Street & number is required'),
  zipCity: z.string().min(1, 'ZIP + city is required'),
  email: z.string().email('Valid email is required'),
  careOf: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  vatId: z.string().optional(),
  responsibleName: z.string().optional(),
  responsibleAddress: z.string().optional(),
  privacyPolicyCustom: z.string().optional(),
  legalNoticeCustom: z.string().optional(),
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

  if (parsed.data.key === 'legal') {
    const legalParse = legalConfigSchema.safeParse(parsedJson)
    if (!legalParse.success) {
      return { error: `Legal config invalid: ${legalParse.error.message}` }
    }
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
    revalidatePath('/news')
    revalidatePath('/media')
    revalidatePath('/plugins')
    revalidatePath('/products')
    revalidatePath('/soundpacks')
    revalidatePath('/members')
    revalidatePath('/gallery')
    revalidatePath('/partners')
    revalidatePath('/legal-notice')
    revalidatePath('/privacy-policy')
    revalidatePath('/legal', 'layout')
    revalidatePath('/api/sitemap')
    revalidatePath('/sitemap.xml')
    revalidatePath('/withdrawal-policy')
    revalidatePath('/admin')
    revalidatePath('/admin/site-config')
    revalidatePath('/admin/legal')
    revalidatePath('/admin/translations')
    revalidatePath('/admin/analytics')
    revalidatePath('/admin/sections')
    return { success: true }
  }, 'Unable to save site configuration.')
}
