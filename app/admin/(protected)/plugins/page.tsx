import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { PluginsAdmin } from './PluginsAdmin'
import Link from 'next/link'

export default function PluginsPage() {
  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Products & Plugins"
        description="Every product in one list. Each has its own public page, versions, downloads, licences and pricing. New products stay hidden until you make them public."
      />
      <Link href="/admin/plugins/beta-diagnostics" className="mb-5 inline-block rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
        NEUROKORE beta diagnostics
      </Link>
      <PluginsAdmin />
    </div>
  )
}
