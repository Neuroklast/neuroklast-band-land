import { z } from 'zod'
import { createActionClient } from '@/lib/supabaseServer'
import { body, json, limit, origin, sameOrigin, unavailable } from '@/lib/neurokore/server'

function rateLimited() {
  return Response.json(
    { error: 'Too many sign-in requests. Please try again in about a minute.' },
    { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } },
  )
}

export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'neurokore-auth', 5)
    const input = z.object({ email: z.email() }).strict().parse(await body(request))
    const client = await createActionClient()
    const { error } = await client.auth.signInWithOtp({
      email: input.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: origin() + '/neurokore/auth/callback',
      },
    })
    if (error) return error.status === 429 || error.code === 'over_email_send_rate_limit'
      ? rateLimited() : unavailable()
    return json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Too many requests.'))
      return rateLimited()
    return unavailable()
  }
}

export async function DELETE(request: Request) {
  try {
    sameOrigin(request)
    const client = await createActionClient()
    const { error } = await client.auth.signOut({ scope: 'local' })
    if (error) return unavailable()
    return json({ ok: true })
  } catch { return unavailable() }
}
