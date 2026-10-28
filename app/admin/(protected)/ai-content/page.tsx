import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/app/admin/_actions/auth'
import { reviewMcpContent } from '@/app/admin/_actions/mcpContent'
import { DeleteReviewActions } from './DeleteReviewActions'
import { createAdminClient } from '@/lib/supabaseAdmin'

type ContentReviewRow = {
  id: string
  collection: string
  operation: string
  target_id: string | null
  target_key: string | null
  changes: unknown
  previous_snapshot: unknown
  status: string
  created_at: string
  requested_by: string
  reviewed_at: string | null
  error: string | null
}

const URLS: Record<string, string> = {
  news_posts: 'news', gigs: 'gigs', releases: 'releases', bio: 'bio',
  members: 'members', gallery: 'gallery', media_downloads: 'media',
  partners: 'partners', social_links: 'social', music_highlights: 'music-highlights',
  merchandise: 'merchandise', products: 'products', soundpacks: 'soundpacks',
}

async function review(formData: FormData) {
  'use server'
  const id = String(formData.get('id') ?? '')
  const decision = formData.get('decision')
  if (decision !== 'approve' && decision !== 'reject') return
  const result = await reviewMcpContent(id, decision)
  redirect(result.success ? '/admin/ai-content?result=ok' : '/admin/ai-content?result=error')
}

export default async function AiContentReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>
}) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('mcp_content_requests')
    .select('id, collection, operation, target_id, target_key, changes, previous_snapshot, status, created_at, requested_by, reviewed_at, error')
    .order('created_at', { ascending: false }).limit(70)
  const requests = (data ?? []) as ContentReviewRow[]
  const pending = requests.filter((row) => row.status === 'pending')
  const history = requests.filter((row) => row.status !== 'pending')
  const params = await searchParams
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-12">
      <div>
        <h1 className="text-xl font-bold">AI Content Review</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Proposals from the OAuth-protected MCP integration. Nothing is changed without your explicit approval and an MFA-assured admin session.
          New items are created inactive. Deletion requests remove one database row only after a second explicit confirmation; rejected requests cannot alter website content.
        </p>
      </div>
      {params.result === 'ok' ? <p className="rounded border border-emerald-800 p-3 text-sm">Decision saved.</p> : null}
      {params.result === 'error' ? <p className="rounded border border-amber-800 p-3 text-sm">Approval failed or content changed. Check the request status.</p> : null}
      {error ? <p className="text-red-400">Could not load review requests. Verify the schema is deployed.</p> : null}
      <section>
        <h2 className="mb-3 text-base font-semibold">Pending ({pending.length})</h2>
        {pending.length === 0 ? <p className="text-sm text-zinc-500">No pending requests.</p> : null}
        <div className="space-y-4">
          {pending.map((request) => (
            <article key={request.id} className="rounded-lg border border-zinc-700 bg-zinc-900/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm">{request.operation.toUpperCase()} · {request.collection}</strong>
                <time className="text-xs text-zinc-500">{new Date(request.created_at).toLocaleString('de-DE')}</time>
              </div>
              {request.target_key ? <p className="mt-2 text-xs text-zinc-400">Site text key: {request.target_key}</p> : null}
              {request.target_id ? (
                <p className="mt-2 text-xs text-zinc-400">
                  Existing item: <Link className="underline" href={`/admin/${URLS[request.collection] ?? ''}/${request.target_id}`}>{request.target_id}</Link>
                </p>
              ) : null}
              {request.previous_snapshot ? (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Before</p>
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-500">
                    {JSON.stringify(request.previous_snapshot, null, 2)}
                  </pre>
                </>
              ) : null}
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Proposed changes</p>
              <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-all rounded border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
                {JSON.stringify(request.changes, null, 2)}
              </pre>
              {request.operation === 'delete' ? (
                <DeleteReviewActions
                  requestId={request.id}
                  title={request.collection + ' / ' + (request.target_id ?? '')}
                  reviewAction={review}
                />
              ) : <form action={review} className="mt-4 flex gap-2">
                <input type="hidden" name="id" value={request.id} />
                <button name="decision" value="approve" type="submit" className="rounded bg-zinc-200 px-4 py-2 text-sm font-semibold text-black hover:bg-white">
                  Apply change
                </button>
                <button name="decision" value="reject" type="submit" className="rounded border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800">
                  Reject
                </button>
              </form>}
            </article>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold">Recent decisions</h2>
        {history.map((request) => (
          <div key={request.id} className="rounded border border-zinc-800 px-3 py-2 text-xs text-zinc-400">
            {request.collection} · {request.operation} · {request.status} · {new Date(request.created_at).toLocaleString('de-DE')}
            {request.error ? <p className="text-amber-400">{request.error}</p> : null}
          </div>
        ))}
      </section>
    </div>
  )
}
