import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground p-6">
      <h1 className="font-mono text-2xl">404</h1>
      <p className="font-mono text-sm text-muted-foreground">Page not found.</p>
      <Link href="/" className="font-mono text-sm text-primary underline">
        Back to home
      </Link>
    </main>
  )
}
