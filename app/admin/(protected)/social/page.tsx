import { createClient } from '@/lib/supabaseServer'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import SocialLinksClient, { type SocialLinkRow } from './SocialLinksClient'

export default async function SocialPage() {
  let links: SocialLinkRow[] = []

  let loadError = false
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('social_links')
      .select('id, platform, url, label, display_order, logo_storage_path, logo_url')
      .order('display_order', { ascending: true })
    if (error) loadError = true
    else links = (data ?? []) as SocialLinkRow[]
  } catch {
    loadError = true
  }

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Social Links"
        description="Manage footer and connect links. Drag to reorder. Optional custom logos replace default platform icons."
      />
      {loadError ? (
        <p role="alert" className="text-sm text-red-400">Could not load social links. Check the database connection.</p>
      ) : (
        <SocialLinksClient initialLinks={links} />
      )}
    </div>
  )
}
