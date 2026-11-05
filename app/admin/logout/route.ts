import { redirect } from 'next/navigation'
import { createActionClient } from '@/lib/supabaseServer'

/**
 * Logout must be a POST (form submission) for safety.
 * GET requests (including Next.js <Link> prefetch, RSC prefetch, or direct navigation)
 * must NOT trigger signOut, otherwise the sidebar Link prefetch will log users out
 * immediately after login.
 */
async function handleLogout(request: Request) {
  if (request.method === 'POST') {
    const supabase = await createActionClient()
    // Never revoke other sessions here: Supabase's default 'global' sign-out
    // also invalidates OAuth refresh tokens used by external MCP clients.
    await supabase.auth.signOut({ scope: 'local' })
  }
  redirect('/admin/login')
}

export const GET = (req: Request) => handleLogout(req)
export const POST = (req: Request) => handleLogout(req)
