import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { isNeurokoreSalesEnabled } from '@/lib/neurokore/flags'
import { loadProductsSectionPublished } from '@/lib/products-visibility'
import { LicenseAdmin } from './LicenseAdmin'

export default async function NeurokoreAdminPage() {
  const publicEnabled = await loadProductsSectionPublished()
  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="NEUROKORE licenses"
        description="Generate alpha keys for plugin testing without publishing the product section. The plugin activation API stays up. Purchases are fulfilled by the verified Stripe webhook once sales are enabled."
      />
      <LicenseAdmin
        publicEnabled={publicEnabled}
        salesEnabled={isNeurokoreSalesEnabled()}
      />
    </div>
  )
}
