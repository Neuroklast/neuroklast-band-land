import { createClient } from '@/lib/supabaseServer'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { parseSections } from '@/lib/site-config-sections'
import { SectionsSortable } from './SectionsSortable'
import { checkAdminReadError, loadAdminData } from '@/lib/admin-read-state'
import { AdminDataUnavailable } from '@/app/admin/_components/AdminDataUnavailable'

export default async function SectionsPage() {
  const loaded = await loadAdminData('sections', async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'sections')
      .maybeSingle()
    checkAdminReadError(error, 'sections')
    return parseSections(data?.value ?? null)
  })
  if (!loaded.ok) return <AdminDataUnavailable title="Sections" href="/admin/sections" />
  const sections = loaded.data

  return (
    <div>
      <AdminPageHeader
        title="Section Visibility & Order"
        description="Drag sections to reorder them on the frontpage. Toggle visibility to hide a section without deleting its content."
      />
      <SectionsSortable initialSections={sections} />
    </div>
  )
}