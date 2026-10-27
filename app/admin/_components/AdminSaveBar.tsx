'use client'

interface AdminSaveBarProps {
  formId: string
  dirty: boolean
  busy: boolean
  message?: string
}

/** Persistent action area for long admin forms. Submits the real form by ID. */
export function AdminSaveBar({ formId, dirty, busy, message }: AdminSaveBarProps) {
  return (
    <div className="sticky bottom-0 z-20 mt-5 flex min-h-16 flex-wrap items-center justify-between gap-3 rounded border border-zinc-700 bg-zinc-950/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.45)] backdrop-blur">
      <p role="status" className="min-w-0 flex-1 text-xs text-zinc-300">
        {busy ? 'Saving changes…' : message || (dirty ? 'Unsaved changes' : 'All changes saved')}
      </p>
      <button
        type="submit"
        form={formId}
        disabled={busy || !dirty}
        className="min-h-11 shrink-0 rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )
}
