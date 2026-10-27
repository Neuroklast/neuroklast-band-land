import 'server-only'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

/**
 * In authentication redirect Route Handlers, write the refreshed Supabase
 * session cookies directly to the response being returned to the browser.
 * Using cookies().set in a separate response can lose the login on 303.
 */
export function createLoginRedirectClient(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('Supabase login unavailable')

  const saved = new Map(request.cookies.getAll().map(cookie => [cookie.name, {
    name: cookie.name, value: cookie.value,
  }]))
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => [...saved.values()],
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[],
        headers?: Record<string, string>) {
        for (const { name, value, options } of cookiesToSet) {
          saved.set(name, { name, value })
          response.cookies.set(name, value, options)
        }
        for (const [name, value] of Object.entries(headers || {})) {
          response.headers.set(name, value)
        }
      },
    },
  })
}
