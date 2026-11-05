import { admin, db } from '@/lib/neurokore/server'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import {
  CONTACT_SPAM_CONFIG_KEY,
  parseContactSpamConfig,
} from '@/lib/contact-spam-filter'
import { ContactSpamEditor } from './ContactSpamEditor'

export const dynamic = 'force-dynamic'

export default async function ContactSpamPage() {
  await admin()

  try {
    const { data, error } = await db().from('site_config')
      .select('value').eq('key', CONTACT_SPAM_CONFIG_KEY).maybeSingle()
    if (error) throw error

    const config = parseContactSpamConfig(data?.value)
    if (!config) throw new Error('Invalid saved spam filter rules')

    return (
      <main className="space-y-6">
        <AdminPageHeader title="Contact spam filter"
          description="Block contact-form messages containing specified words or phrases." />
        <ContactSpamEditor initialConfig={config} />
      </main>
    )
  } catch {
    return (
      <main className="space-y-6">
        <AdminPageHeader title="Contact spam filter" description="Contact form blacklist settings." />
        <p role="alert" className="border border-red-700 p-4 text-sm text-red-300">
          Settings could not be loaded. No rules have been changed. Check the database connection.
        </p>
      </main>
    )
  }
}
