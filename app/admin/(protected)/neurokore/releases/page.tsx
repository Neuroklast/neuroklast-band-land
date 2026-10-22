import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { isNeurokoreSalesEnabled } from '@/lib/neurokore/flags'
import { loadProductsSectionPublished } from '@/lib/products-visibility'
import { ReleaseAdmin } from './ReleaseAdmin'

export default async function NeurokoreReleasesPage() {
  const publicEnabled = await loadProductsSectionPublished()
  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="NEUROKORE versions & downloads"
        description="Register builds, check their checksums and publish them. Only published versions are offered on the public download page. Withdrawing keeps the files for support and restoration."
      />
      <ReleaseAdmin publicEnabled={publicEnabled} salesEnabled={isNeurokoreSalesEnabled()} />
    </div>
  )
}
