import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/api-admin-auth'
import { listActiveSyncJobs } from '@/lib/sync-jobs'
import { parseActiveSyncJobTypes } from '@/lib/sync-job-types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const admin = await isAdminSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const query = parseActiveSyncJobTypes(url.searchParams.get('types'))
  if (!query.valid) {
    return NextResponse.json({ error: 'Invalid types parameter' }, { status: 400 })
  }

  try {
    const jobs = await listActiveSyncJobs(query.types)
    return NextResponse.json({ jobs }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[sync-jobs] active list failed:', error)
    return NextResponse.json({ error: 'Failed to list active sync jobs' }, { status: 500 })
  }
}