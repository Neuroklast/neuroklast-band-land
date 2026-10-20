
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { LicenseAccount } from './LicenseAccount'
export const metadata = { title: 'NEUROKORE licenses', robots: { index: false, follow: false } }
export default function AccountPage() {
  return <LegalPageShell><section className="mx-auto max-w-3xl space-y-6 px-6 py-32">
    <h1 className="text-3xl font-bold">NEUROKORE licenses</h1>
    <LicenseAccount salesEnabled={process.env.NEUROKORE_SALES_ENABLED === 'true'} />
  </section></LegalPageShell>
}
