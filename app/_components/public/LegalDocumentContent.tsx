import Link from 'next/link'
import type { LegalSection } from '@/lib/legal-content'

interface LegalDocumentContentProps {
  title: string
  streamLabel: string
  sections: LegalSection[]
  isCustom?: boolean
  incomplete?: boolean
  incompleteMessage?: string
  backHref?: string
  backLabel?: string
}

export function LegalDocumentContent({
  title,
  streamLabel,
  sections,
  isCustom = false,
  incomplete = false,
  incompleteMessage,
  backHref,
  backLabel,
}: LegalDocumentContentProps) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-[calc(var(--nk-nav-h)+1.5rem)] pb-10 sm:pt-[calc(var(--nk-nav-h)+2.5rem)] sm:pb-14">
      <header className="mb-8 sm:mb-10">
        {backHref && backLabel ? (
          <Link
            href={backHref}
            className="mb-6 inline-flex min-h-[44px] items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
          >
            <span aria-hidden>←</span>
            {backLabel}
          </Link>
        ) : null}
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">{streamLabel}</p>
        <h1 className="font-mono text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground">
          {title}
        </h1>
      </header>

      {incomplete && incompleteMessage ? (
        <div
          role="status"
          className="mb-6 border border-amber-700/60 bg-amber-950/40 px-4 py-3 font-mono text-xs text-amber-200/90"
        >
          {incompleteMessage}
        </div>
      ) : null}

      <div className="space-y-6 sm:space-y-8">
        {sections.map((section) => (
          <section
            key={section.id}
            className="border border-border rounded-lg p-4 sm:p-6 bg-card/60"
          >
            {!isCustom && (
              <h2 className="font-mono text-sm sm:text-base font-bold text-primary uppercase tracking-wide mb-3 sm:mb-4">
                {section.title}
              </h2>
            )}
            <div className="space-y-3 font-mono text-sm leading-relaxed text-muted-foreground break-words">
              {section.paragraphs.map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
