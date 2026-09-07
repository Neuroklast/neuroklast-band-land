import { createClient } from '@/lib/supabaseServer'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import BioForm from './BioForm'

export default async function BioPage() {
  let content = ''
  let achievements: string[] = []
  let collabs: string[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('bio').select('content, achievements, collabs').limit(1).single()
    content = data?.content ?? ''
    achievements = Array.isArray(data?.achievements)
      ? (data.achievements as unknown[]).filter((x): x is string => typeof x === 'string')
      : []
    collabs = Array.isArray(data?.collabs)
      ? (data.collabs as unknown[]).filter((x): x is string => typeof x === 'string')
      : []
  } catch {
    // ignore
  }

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
