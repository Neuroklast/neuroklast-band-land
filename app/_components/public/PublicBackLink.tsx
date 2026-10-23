'use client'

import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'

export function PublicBackLink({ href = '/', label }: { href?: string; label?: string }) {
  const { t } = useLocale()
  return (
    <Link
      href={href}
      className="mb-6 inline-flex min-h-[44px] items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
    >
      <span aria-hidden>←</span>
      {label ?? t('newsletter.backHome')}
    </Link>
  )
}
