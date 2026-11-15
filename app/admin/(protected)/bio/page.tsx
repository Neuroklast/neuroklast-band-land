import { createClient } from '@/lib/supabaseServer'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import BioForm from './BioForm'
import { checkAdminReadError, loadAdminData } from '@/lib/admin-read-state'
import { AdminDataUnavailable } from '@/app/admin/_components/AdminDataUnavailable'

export default async function BioPage() {
  const loaded = await loadAdminData('bio', async () => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('bio').select('content, achievements, collabs').limit(1).maybeSingle()
    checkAdminReadError(error, 'bio')
    return {
      content: data?.content ?? '',
      achievements: Array.isArray(data?.achievements)
        ? (data.achievements as unknown[]).filter((x): x is string => typeof x === 'string') : [],
      collabs: Array.isArray(data?.collabs)
        ? (data.collabs as unknown[]).filter((x): x is string => typeof x === 'string') : [],
    }
  })
  if (!loaded.ok) return <AdminDataUnavailable title="Biography" href="/admin/bio" />
  const { content, achievements, collabs } = loaded.data

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Biography"
        description="Edit the artist biography shown in the Bio section on the public site."
      />
      <BioForm initialContent={content} initialAchievements={achievements} initialCollabs={collabs} />
    </div>
  )
}
