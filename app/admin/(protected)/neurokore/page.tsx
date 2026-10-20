
import { LicenseAdmin } from './LicenseAdmin'
export default function NeurokoreAdminPage() {
  return <section className="mx-auto max-w-4xl space-y-6 p-6">
    <h1 className="text-3xl font-semibold">NEUROKORE licenses</h1>
    <p>Issue free alpha keys. Purchases are fulfilled by the verified Stripe webhook.</p>
    <LicenseAdmin />
  </section>
}
