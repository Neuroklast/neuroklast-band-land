import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { PluginsAdmin } from './PluginsAdmin'

export default function PluginsPage() {
  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Plugins"
        description="Every VST/AU product in one place. Each plugin has its own page, versions, downloads, licences and pricing. Free plugins need no licence."
      />
      <PluginsAdmin />
    </div>
  )
}
