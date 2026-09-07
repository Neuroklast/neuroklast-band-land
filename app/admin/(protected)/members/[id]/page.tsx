import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { resolveImageUrl } from '@/lib/r2'
import { EditMemberForm } from './EditMemberForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMemberPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: member } = await supabase
    .from('members')
    .select('id, name, role, bio, photo_storage_path, photo_url, display_order, active')
    .eq('id', id)
    .single()

  if (!member) notFound()

  const resolvedPhotoUrl = resolveImageUrl(member.photo_storage_path, member.photo_url)

  return (
    <div>
      <Link href="/admin/members" className="text-zinc-500 hover:text-white text-sm">
        ← Members
      </Link>
      <h1 className="text-xl font-bold mt-4 mb-6">Edit Member</h1>
      <EditMemberForm member={member} resolvedPhotoUrl={resolvedPhotoUrl} />
    </div>
  )
}
