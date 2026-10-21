import { notFound } from 'next/navigation'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { isNeurokoreSalesEnabled } from '@/lib/neurokore/flags'
import { loadProductsSectionPublished } from '@/lib/products-visibility'
import { LicenseAccount } from './LicenseAccount'

export async function generateMetadata() {
  if (!(await loadProductsSectionPublished())) {
    return { title: 'Not found', robots: { index: false, follow: false } }
  }
  return { title: 'NEUROKORE licenses', robots: { index: false, follow: false } }
}

export default async function AccountPage() {
  if (!(await loadProductsSectionPublished())) notFound()
  return <LegalPageShell><section className="mx-auto max-w-3xl space-y-6 px-6 py-32">
    <h1 className="text-3xl font-bold">NEUROKORE licenses</h1>
    <LicenseAccount salesEnabled={isNeurokoreSalesEnabled()} />
  </section></LegalPageShell>
}
