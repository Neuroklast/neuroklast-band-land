import Link from 'next/link'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { ChangePasswordForm } from './ChangePasswordForm'

export default function SecurityAdminPage() {
  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Security"
        description="Change the password used to sign in to the admin. Requires your current password. If your account has two-factor authentication (MFA) enabled, the change must be verified from a signed-in session."
      />
      <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-900 p-4">
        <h2 className="mb-2 text-base font-semibold text-white">Two-factor authentication</h2>
        <p className="mb-3 text-sm text-zinc-400">
          Add or verify an authenticator to authorize MCP integrations and review AI content.
        </p>
        <Link href="/admin/mfa" className="inline-block rounded border border-zinc-600 px-4 py-2 text-sm text-zinc-100">
          Set up / verify authenticator
        </Link>
      </div>
      <ChangePasswordForm />
    </div>
  )
}
