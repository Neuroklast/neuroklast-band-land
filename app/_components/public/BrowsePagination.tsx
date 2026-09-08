'use client'

import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useLocale } from '@/contexts/LocaleContext'
import { getPaginationRange } from '@/lib/browse-pagination'

interface BrowsePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function BrowsePagination({ currentPage, totalPages, onPageChange }: BrowsePaginationProps) {
  const { t } = useLocale()
  if (totalPages <= 1) return null

  const pages = getPaginationRange(currentPage, totalPages)

  return (
    <nav aria-label={t('browse.pagination')} className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 border border-border px-3 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        aria-label={t('browse.prevPage')}
      >
        <CaretLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{t('browse.prev')}</span>
      </button>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 font-mono text-xs text-muted-foreground"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={t('browse.pageN').replace('{0}', String(page))}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center border px-3 font-mono text-xs uppercase tracking-wider transition-colors ${
              page === currentPage
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 border border-border px-3 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        aria-label={t('browse.nextPage')}
      >
        <span className="hidden sm:inline">{t('browse.next')}</span>
        <CaretRight className="h-4 w-4" />
      </button>
    </nav>
  )
}