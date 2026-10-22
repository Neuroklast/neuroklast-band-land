import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { PluginDetail } from './PluginDetail'

export default async function PluginDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Product"
        description="Page content, visibility, pricing, signing key, versions, downloads and licences."
      />
      <PluginDetail productId={id} />
    </div>
  )
}

