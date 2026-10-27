import { json, user } from '@/lib/neurokore/server'

export const dynamic = 'force-dynamic'

/**
 * Read-only authentication status. This endpoint must never depend on
 * licensing encryption, product releases or Stripe configuration.
 */
export async function GET() {
  try {
    const buyer = await user()
    return json({ signedIn: true, email: buyer.email })
  } catch {
    return json({ signedIn: false }, 401)
  }
}
