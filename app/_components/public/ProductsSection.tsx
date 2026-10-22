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

function ProductCard({ item, featured }: { item: PublicProductItem; featured: boolean }) {
  const href = sanitizeProductHref(item.href)
  const body = (
    <article className={
      'group relative h-full overflow-hidden border border-white/15 bg-black/95 transition-colors hover:border-primary/60 focus-within:border-primary/60 ' +
      (featured ? 'grid items-center md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]' : 'flex flex-col')
    }>
      <div className={
        'relative flex w-full items-center justify-center overflow-hidden bg-[#090909] ' +
        (featured ? 'min-h-48 aspect-[16/10] md:aspect-auto md:h-full md:min-h-[290px]' : 'aspect-[16/10]')
      }>
        {item.imageUrl ? (
          <CdnImage
            src={item.imageUrl}
            alt={item.title + ' product preview'}
            widths={[320, 480, 640, 960]}
            sizes={featured
              ? '(max-width: 768px) 90vw, 50vw'
              : '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 32vw'}
            className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.025]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="px-4 text-center font-mono text-xs text-white/55">Product preview unavailable</span>
        )}
      </div>

      <div className={'flex min-w-0 flex-1 flex-col justify-center ' + (featured ? 'gap-4 p-6 md:p-9' : 'gap-3 p-5')}>
        <h3 className={'break-words font-bold tracking-tight text-white ' + (featured ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl')}>
          {item.title}
        </h3>
        {item.description && (
          <p className={'text-sm leading-relaxed text-zinc-300 sm:text-base ' + (featured ? 'line-clamp-5' : 'line-clamp-3')}
            style={{ fontFamily: 'var(--font-body, inherit)' }}>
            {item.description}
          </p>
        )}
        {item.priceLabel && <p className="font-mono text-xs text-primary">{item.priceLabel}</p>}
        {href && (
          <span className="mt-1 inline-flex min-h-11 w-fit items-center gap-3 border border-white/35 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white transition-colors group-hover:border-primary group-hover:text-primary group-focus-within:border-primary">
            View product <span aria-hidden="true">→</span>
          </span>
        )}
      </div>
    </article>
  )

  if (!href) return body
  if (href.startsWith('/')) {
    return <Link href={href} className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label={'View ' + item.title}>{body}</Link>
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      aria-label={'View ' + item.title}>
      {body}
    </a>
  )
}

export function ProductsSection({ items, heading, intro }: ProductsSectionProps) {
  const { t } = useLocale()
  const title = resolveSectionHeading(heading, 'products', t)
  const featured = items.length === 1

  return (
    <SectionWrapper id="products" data-theme-color="foreground card border primary"
      className="py-10 md:py-14">
      <SectionHeading sectionId="products" dataText={title}>{title}</SectionHeading>
      <SectionIntro sectionId="products">{intro}</SectionIntro>
      {items.length > 0 ? (
        <div className={'grid gap-5 ' + (featured ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3')}>
          {items.map(item => <ProductCard key={item.id} item={item} featured={featured} />)}
        </div>
      ) : <SectionEmpty label={t('section.empty')} />}
    </SectionWrapper>
  )
}
