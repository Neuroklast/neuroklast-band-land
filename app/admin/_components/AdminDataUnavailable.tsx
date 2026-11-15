import Link from 'next/link'

/** A failed database read is not an empty configuration. Never mount an editor. */
export function AdminDataUnavailable({ title, href }: { title: string; href: string }) {
  return (
    <section role="alert" className="mx-auto max-w-2xl rounded-lg border border-red-800/60 bg-zinc-950 p-6 text-zinc-100">
      <h1 className="mb-2 text-lg font-semibold">{title} could not be loaded</h1>
      <p className="mb-4 text-sm text-zinc-300">
        The saved data is unchanged. Editing is unavailable until the connection is restored.
      </p>
      <Link className="inline-block rounded border border-zinc-600 px-4 py-2 text-sm hover:border-zinc-300" href={href}>
        Try again
      </Link>
    </section>
  )
}
