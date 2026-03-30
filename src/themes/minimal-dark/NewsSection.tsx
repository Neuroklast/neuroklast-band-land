import type { NewsItem, SectionLabels } from '@/lib/types'

interface MinimalDarkNewsProps {
  news: NewsItem[]
  siteName: string
  sectionLabels?: SectionLabels
}

export default function NewsSection({ news, siteName, sectionLabels: _sectionLabels }: MinimalDarkNewsProps) {
  if (!news || news.length === 0) return null

  return (
    <div className="bg-background text-foreground p-4">
      <h1 className="text-3xl mb-4" style={{ color: 'var(--primary)' }}>
        {siteName}
      </h1>
      {news.map((item) => (
        <div key={item.id} className="border border-border p-2 mb-2">
          <h2>{item.text}</h2>
          <p>{item.details}</p>
        </div>
      ))}
    </div>
  )
}
