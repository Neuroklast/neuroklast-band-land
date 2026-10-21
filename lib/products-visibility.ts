import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabaseServer'
import { isProductsSectionVisible, parseSections } from '@/lib/site-config-sections'

/** True when Look & Feel (or Products admin) has the public Products section on. */
export const loadProductsSectionPublished = cache(async (): Promise<boolean> => {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'sections')
      .maybeSingle()
    return isProductsSectionVisible(parseSections(data?.value))
  } catch {
    return false
  }
})
