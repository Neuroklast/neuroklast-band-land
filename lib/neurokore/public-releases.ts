import 'server-only'
import { createPublicClient } from '@/lib/supabaseServer'
import { parsePublicReleases, type PublicRelease } from './releases'

/** Published release metadata only; storage keys stay server-side. */
export async function loadPublicReleases(): Promise<PublicRelease[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase.rpc('neurokore_public_releases')
    if (error) return []
    return parsePublicReleases(data)
  } catch {
    return []
  }
}
