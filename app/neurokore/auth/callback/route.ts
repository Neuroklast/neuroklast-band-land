import { NextResponse } from 'next/server'
import { createActionClient } from '@/lib/supabaseServer'
import { origin } from '@/lib/neurokore/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Exchange a one-time Supabase PKCE code for a cookie-backed customer session.
 * This callback is intentionally limited to our own site origin, never an
 * arbitrary "next" or "redirect_to" URL from the email.
 */
export async function GET(request: Request) {
  const base = origin()
  const target = new URL('/neurokore/account', base)
  const incoming = new URL(request.url)
  const code = incoming.searchParams.get('code')
  if (!code || code.length > 2048) {
    target.searchParams.set('auth', 'invalid')
    return NextResponse.redirect(target, { status: 303, headers: { 'Cache-Control': 'no-store' } })
  }
  try {
    const supabase = await createActionClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) target.searchParams.set('auth', 'expired')
  } catch {
    target.searchParams.set('auth', 'expired')
  }
  return NextResponse.redirect(target, { status: 303, headers: { 'Cache-Control': 'no-store' } })
}
