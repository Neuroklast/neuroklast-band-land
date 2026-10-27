import { type NextRequest, NextResponse } from 'next/server'
import { createLoginRedirectClient } from '@/lib/neurokore/auth-redirect-client'
import { origin } from '@/lib/neurokore/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Compatibility with older Supabase PKCE links that already contain a code. */
export async function GET(request: NextRequest) {
  const destination = new URL('/neurokore/account', origin())
  // New branded email links carry a token hash. Never consume it in a GET:
  // link scanners may visit this URL automatically.
  const hash = request.nextUrl.searchParams.get('token_hash')
  if (hash && /^[a-f0-9]{64}$/i.test(hash) && request.nextUrl.searchParams.get('type') === 'email') {
    const confirm = new URL('/neurokore/auth/confirm', origin())
    confirm.searchParams.set('token_hash', hash)
    confirm.searchParams.set('type', 'email')
    return NextResponse.redirect(confirm, { status: 303, headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } })
  }

  const code = request.nextUrl.searchParams.get('code')
  if (!code || code.length > 2048) {
    destination.searchParams.set('auth', 'invalid')
    return NextResponse.redirect(destination, { status: 303, headers: { 'Cache-Control': 'private, no-store' } })
  }

  const response = NextResponse.redirect(destination, {
    status: 303, headers: { 'Cache-Control': 'private, no-store' },
  })
  try {
    const client = createLoginRedirectClient(request, response)
    const { data, error } = await client.auth.exchangeCodeForSession(code)
    if (error || !data.session) throw new Error('Invalid session')

    // Explicitly persist the session in this redirect response.
    const { error: sessionError } = await client.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
    if (sessionError) throw new Error('Could not persist session')
    return response
  } catch {
    destination.searchParams.set('auth', 'expired')
    return NextResponse.redirect(destination, { status: 303, headers: { 'Cache-Control': 'private, no-store' } })
  }
}
