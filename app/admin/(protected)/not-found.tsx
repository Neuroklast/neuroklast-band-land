export default function AdminNotFound() {
  return (
    <div className="p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-red-400">ERR://404</p>
      <h1 className="mt-3 text-xl font-bold text-white">Page not found</h1>
      <a
        href="/admin"
        className="mt-6 inline-flex min-h-[44px] items-center text-sm text-zinc-300 underline hover:text-white"
      >
        Back to dashboard
      </a>
    </div>
  )
}
