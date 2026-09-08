import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-foreground">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">ERR://404</p>
      <h1 className="mt-4 font-mono text-6xl font-bold text-primary sm:text-7xl">404</h1>
      <p className="mt-3 font-mono text-sm text-muted-foreground">Page not found</p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-[44px] items-center font-mono text-sm uppercase tracking-wider text-primary underline underline-offset-4"
      >
        Return home
      </Link>
    </div>
  )
}
