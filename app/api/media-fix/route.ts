import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Kept so `<img onError>` has a same-origin URL. It does not list the bucket
 * and does not write a rate-limit row. Stale keys are rewritten by the deploy
 * reconcile (`lib/r2-reconcile-on-deploy.ts`).
 *
 * GET /api/media-fix?path=<objectPath>
 * → { ok: true, url: null }
 */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path')
  if (!path) return NextResponse.json({ ok: false, error: 'Missing path' }, { status: 400 })
  return NextResponse.json({ ok: true, url: null })
}
