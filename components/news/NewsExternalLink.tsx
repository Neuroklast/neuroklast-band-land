import { sanitizeExternalHref } from '@/lib/sanitize-href'
import { resolveNewsLinkLabel } from '@/lib/news-link-label'

interface NewsExternalLinkProps {
  href: string | null | undefined
  label?: string | null
  compact?: boolean
}

/** Same safe destination with an understated card link or an article CTA. */
export function NewsExternalLink({ href: rawHref, label, compact = false }: NewsExternalLinkProps) {
  const href = sanitizeExternalHref(rawHref)
  if (!href) return null

  const hostname = new URL(href).hostname.replace(/^www\./, '')
  const action = resolveNewsLinkLabel(href, label)
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={hostname}
      aria-label={`Open external link on ${hostname} (new tab): ${action}`}
      className={compact
        ? 'inline-flex min-h-11 min-w-0 items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-wider text-primary/90 transition-colors hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'
        : 'inline-flex min-h-11 max-w-full items-center gap-2 border border-primary/45 bg-primary/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:border-primary hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'}
    >
      <span className="min-w-0 truncate">{action}</span>
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 5h6v6M19 5l-9 9" />
        <path d="M19 13v6H5V5h6" />
      </svg>
    </a>
  )
}
