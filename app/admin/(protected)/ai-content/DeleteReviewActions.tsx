'use client'

import { useState } from 'react'

export function DeleteReviewActions({
  requestId, title, reviewAction,
}: {
  requestId: string
  title: string
  reviewAction: (formData: FormData) => Promise<void>
}) {
  const [confirming, setConfirming] = useState(false)
  return <div className="mt-4 space-y-3">
    <p className="text-sm font-semibold text-red-300">
      Permanent deletion request. Removing this database record cannot be undone
      in the editor. Referenced R2 media files are not automatically removed.
    </p>
    {confirming && <p className="text-sm text-red-200" role="status">
      Confirm permanent deletion of {title}. Make sure you have reviewed the previous snapshot.
    </p>}
    <form action={reviewAction} className="flex flex-wrap gap-2">
      <input type="hidden" name="id" value={requestId} />
      {confirming ? <button type="submit" name="decision" value="approve"
        className="rounded bg-red-800 px-4 py-2 text-sm font-semibold text-white">
        Permanently delete record
      </button> : <button type="button" onClick={() => setConfirming(true)}
        className="rounded border border-red-700 px-4 py-2 text-sm font-semibold text-red-200">
        Review deletion
      </button>}
      {confirming && <button type="button" onClick={() => setConfirming(false)}
        className="rounded border border-zinc-600 px-4 py-2 text-sm">Cancel confirmation</button>}
      <button type="submit" name="decision" value="reject"
        className="rounded border border-zinc-600 px-4 py-2 text-sm">Reject deletion</button>
    </form>
  </div>
}
