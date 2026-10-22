import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { PluginsAdmin } from './PluginsAdmin'

export default function PluginsPage() {
  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Products & Plugins"
        description="Every product in one list. Each has its own public page, versions, downloads, licences and pricing. New products stay hidden until you make them public."
      />
      <PluginsAdmin />
    </div>
  )
}
