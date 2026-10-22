import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { PluginDetail } from './PluginDetail'

export default async function PluginDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Plugin"
        description="Product page content, pricing, licensing key and downloads for this plugin."
      />
      <PluginDetail productId={id} />
    </div>
  )
}
