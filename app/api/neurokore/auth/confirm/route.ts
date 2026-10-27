import { type NextRequest, NextResponse } from 'next/server'
import { createLoginRedirectClient } from '@/lib/neurokore/auth-redirect-client'
import { limit, origin } from '@/lib/neurokore/server'

export const runtime = 'nodejs'

function accountRedirect(status: 'expired' | 'success') {
  const location = new URL('/neurokore/account', origin())
  location.searchParams.set('auth', status)
  return NextResponse.redirect(location, {
    status: 303, headers: { 'Cache-Control': 'private, no-store' },
  })
}

/** The POST, not the email link's GET, consumes the one-time token. */
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== origin()) return new Response(null, { status: 403 })
  await limit(request, 'neurokore-auth-confirm', 5)
  const body = await request.formData().catch(() => null)
  const hash = body?.get('token_hash')
  if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/i.test(hash) ||
    body?.get('type') !== 'email') return accountRedirect('expired')

  const response = accountRedirect('success')
  try {
    const client = createLoginRedirectClient(request, response)
    const { data, error } = await client.auth.verifyOtp({ token_hash: hash, type: 'email' })
    if (error || !data.session) return accountRedirect('expired')

    // Explicitly persist the verified session to the returned redirect cookies.
    // Necessary with some supabase-js versions that defer SIGNED_IN notifications.
    const { error: sessionError } = await client.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
    if (sessionError) return accountRedirect('expired')
    return response
  } catch {
    return accountRedirect('expired')
  }
}
