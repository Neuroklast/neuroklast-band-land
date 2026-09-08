'use client'

import Link from 'next/link'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-foreground">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">ERR://500</p>
      <h1 className="mt-4 font-mono text-3xl font-bold">Something went wrong</h1>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-[44px] items-center font-mono text-sm uppercase tracking-wider text-primary underline underline-offset-4"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center font-mono text-sm uppercase tracking-wider text-muted-foreground underline underline-offset-4"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
