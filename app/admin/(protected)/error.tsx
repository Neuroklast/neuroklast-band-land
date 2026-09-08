'use client'

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-red-400">ERR://ADMIN</p>
      <h1 className="mt-3 text-xl font-bold text-white">Could not load this page</h1>
      <p className="mt-2 text-sm text-zinc-400">A server error occurred. Try again, or go back to the dashboard.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-[44px] items-center rounded bg-zinc-700 px-4 text-sm text-white hover:bg-zinc-600"
        >
          Try again
        </button>
        <a
          href="/admin"
          className="inline-flex min-h-[44px] items-center rounded border border-zinc-700 px-4 text-sm text-zinc-300 hover:text-white"
        >
          Dashboard
        </a>
      </div>
    </div>
  )
}
