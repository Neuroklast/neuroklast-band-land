
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createActionClient } from '@/lib/supabaseServer'
import { body, json, limit, sameOrigin, unavailable } from '@/lib/neurokore/server'
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'neurokore-auth', 5)
    const input = z.object({ email: z.email(), token: z.string().regex(/^[0-9]{6,10}$/).optional() })
      .strict().parse(await body(request))
    const client: SupabaseClient = await createActionClient()
    if (input.token) {
      const { error } = await client.auth.verifyOtp({ email: input.email, token: input.token, type: 'email' })
      if (error) return unavailable()
    } else {
      const { error } = await client.auth.signInWithOtp({ email: input.email, options: { shouldCreateUser: true } })
      if (error) return unavailable()
    }
    return json({ ok: true })
  } catch { return unavailable() }
}

export async function DELETE(request: Request) {
  try {
    sameOrigin(request)
    const client: SupabaseClient = await createActionClient()
    const { error } = await client.auth.signOut({ scope: 'local' })
    if (error) return unavailable()
    return json({ ok: true })
  } catch { return unavailable() }
}
