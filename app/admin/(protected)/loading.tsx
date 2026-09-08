export default function AdminLoading() {
  return (
    <div className="p-8" aria-busy="true" aria-live="polite">
      <div className="h-6 w-40 animate-pulse rounded bg-zinc-800" />
      <div className="mt-4 h-4 w-72 animate-pulse rounded bg-zinc-900" />
      <div className="mt-8 space-y-3">
        <div className="h-12 animate-pulse rounded bg-zinc-900" />
        <div className="h-12 animate-pulse rounded bg-zinc-900" />
        <div className="h-12 animate-pulse rounded bg-zinc-900" />
      </div>
    </div>
  )
}
