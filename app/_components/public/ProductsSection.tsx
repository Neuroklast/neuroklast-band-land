'use client'

import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveSectionHeading } from '@/lib/section-display'
import { sanitizeProductHref } from '@/lib/sanitize-href'
import { CdnImage } from './CdnImage'
import { SectionWrapper, SectionEmpty, SectionHeading, SectionIntro } from './SectionWrapper'

export interface PublicProductItem {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  href: string | null
  priceLabel: string | null
}

interface ProductsSectionProps {
  items: PublicProductItem[]
  heading?: string
  intro?: string
}

function ProductCard({ item }: { item: PublicProductItem }) {
  const href = sanitizeProductHref(item.href)
  const imageBlock = (
    <div className="relative aspect-square overflow-hidden border border-border bg-muted transition-colors group-hover:border-primary/40">
      {item.imageUrl ? (
        <CdnImage
          src={item.imageUrl}
          alt={item.title}
          widths={[240, 320, 480, 640]}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-mono text-xs text-muted-foreground">NO IMAGE</span>
        </div>
      )}
    </div>
  )
  const body = (
    <>
      {imageBlock}
      <p className="mt-3 font-mono text-sm text-foreground">{item.title}</p>
      {item.description ? (
        <p className="mt-1 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body, inherit)' }}>
          {item.description}
        </p>
      ) : null}
      {item.priceLabel ? (
        <p className="mt-2 font-mono text-xs text-primary">{item.priceLabel}</p>
      ) : null}
    </>
  )

  if (!href) {
    return <div className="group block">{body}</div>
  }

  if (href.startsWith('/')) {
    return (
      <Link href={href} className="group block" aria-label={item.title}>
        {body}
      </Link>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      aria-label={item.title}
    >
      {body}
    </a>
  )
}

export function ProductsSection({ items, heading, intro }: ProductsSectionProps) {
  const { t } = useLocale()
  const title = resolveSectionHeading(heading, 'products', t)

  return (
    <SectionWrapper id="products" data-theme-color="foreground card border primary">
      <SectionHeading sectionId="products" dataText={title}>{title}</SectionHeading>
      <SectionIntro sectionId="products">{intro}</SectionIntro>
      {items.length > 0 ? (
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <SectionEmpty label={t('section.empty')} />
      )}
    </SectionWrapper>
  )
}
