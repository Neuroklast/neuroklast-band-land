import { createClient } from '@/lib/supabaseServer'
import { resolveImageUrl } from '@/lib/r2'
import Link from 'next/link'
import Image from 'next/image'
import { deleteMember } from '@/app/admin/_actions/members'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import MemberForm from './MemberForm'
import { MemberVisibilityToggle } from './MemberVisibilityToggle'

export default async function MembersPage() {
  let members: Array<{
    id: string
    name: string
    role: string | null
    display_order: number
    active: boolean
    photo_storage_path: string | null
    photo_url: string | null
  }> = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('members')
      .select('id, name, role, display_order, active, photo_storage_path, photo_url')
      .order('display_order', { ascending: true })
    members = data ?? []
  } catch {
    // ignore
  }

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Band Members"
        description="Shown in the Biography section on the public site."
      />
      <div className="mb-8">
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Add member</h2>
        <MemberForm />
      </div>
      {members.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-4">Existing members</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left py-2 pr-4">Photo</th>
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Role</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const photoUrl = resolveImageUrl(member.photo_storage_path, member.photo_url)
                  return (
                    <tr key={member.id} className="border-b border-zinc-800/50">
                      <td className="py-2 pr-4">
                        {photoUrl ? (
                          <div className="relative w-12 h-12 bg-zinc-900 rounded border border-zinc-800 overflow-hidden">
                            <Image
                              src={photoUrl}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-zinc-200">{member.name}</td>
                      <td className="py-2 pr-4 text-zinc-400">{member.role ?? '—'}</td>
                      <td className="py-2 pr-4">
                        <MemberVisibilityToggle memberId={member.id} active={member.active ?? true} />
                      </td>
                      <td className="py-2 text-right space-x-2">
                        <Link
                          href={`/admin/members/${member.id}`}
                          className="text-zinc-400 hover:text-white text-xs"
                        >
                          Edit
                        </Link>
                        <form action={async () => { 'use server'; await deleteMember(member.id) }}>
                          <button type="submit" className="text-red-400 hover:text-red-300 text-xs">
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
