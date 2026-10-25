import { ArrowSquareOut } from '@phosphor-icons/react'
import { sanitizeExternalHref } from '@/lib/sanitize-href'

interface NewsExternalLinkProps {
  href: string | null | undefined
  compact?: boolean
}

/** Single outbound link action used by news cards, overlays and article pages. */
export function NewsExternalLink({ href: rawHref, compact = false }: NewsExternalLinkProps) {
  const href = sanitizeExternalHref(rawHref)
  if (!href) return null

  const hostname = new URL(href).hostname.replace(/^www\./, '')

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open external link on ${hostname} (new tab)`}
      className={[
        'inline-flex min-h-11 max-w-full items-center gap-2 border border-primary/40 bg-primary/10',
        'px-3 py-2 text-left font-mono text-xs text-primary transition-colors',
        'hover:border-primary hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        compact ? 'w-full' : 'mt-4',
      ].join(' ')}
    >
      <ArrowSquareOut className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0">
        <span className="block uppercase tracking-wider">External link</span>
        <span className="block break-all text-foreground/80">{hostname}</span>
      </span>
    </a>
  )
}
