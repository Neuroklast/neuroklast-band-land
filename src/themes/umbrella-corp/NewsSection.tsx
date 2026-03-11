import { useLocale } from '@/hooks/use-locale'
import { motion } from 'framer-motion'
import { ArrowSquareOut, Plus, PencilSimple, Trash } from '@phosphor-icons/react'
import ProgressiveImage from '@/components/ProgressiveImage'
import { Button } from '@/components/ui/button'
import type { NewsItem, SectionLabels } from '@/lib/types'
import { format } from 'date-fns'

interface UmbrellaNewsProps {
  news?: NewsItem[]
  editMode?: boolean
  sectionLabels?: SectionLabels
  onNewsClick?: (item: NewsItem) => void
  onUpdate?: (news: NewsItem[]) => void
  onLabelChange?: (key: keyof SectionLabels, value: string) => void
}

const INITIAL_VISIBLE_COUNT = 3

function formatNewsDate(date: string): string {
  if (!date) return '---'
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    if (/^\d{4}-\d{2}$/.test(date)) {
      const [year, month] = date.split('-')
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      return `${monthNames[parseInt(month) - 1]} ${year}`
    }
    return date
  }
  return format(d, 'dd.MM.yyyy')
}

export default function UmbrellaCorpNewsSection({
  news = [],
  editMode,
  sectionLabels,
  onNewsClick,
  onLabelChange
}: UmbrellaNewsProps) {
  const { t } = useLocale()
  const titleText = sectionLabels?.news || t('news.defaultTitle')

  const sortedNews = [...news].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const visibleNews = editMode ? sortedNews : sortedNews.slice(0, INITIAL_VISIBLE_COUNT)

  if (!editMode && (!news || news.length === 0)) return null

  return (
    <section className="py-24 px-4 bg-background relative" id="news">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-mono text-primary uppercase umbrella-corp-glow-text tracking-widest">
            {titleText}
          </h2>

          {editMode && (
            <div className="flex gap-2 items-center">
              {onLabelChange && (
                <input
                  type="text"
                  value={sectionLabels?.news || ''}
                  onChange={(e) => onLabelChange('news', e.target.value)}
                  placeholder={t('news.defaultTitle')}
                  className="bg-transparent border border-primary/30 px-2 py-1 text-xs font-mono text-primary w-32 focus:outline-none focus:border-primary"
                />
              )}
              <Button className="bg-primary hover:bg-accent font-mono text-xs tracking-wider">
                <Plus size={16} className="mr-2" />
                ADD NEWS
              </Button>
            </div>
          )}
        </div>

        <div className="umbrella-corp-warning-stripe mb-12" />

        <div className="grid grid-cols-1 gap-6">
          {visibleNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="umbrella-corp-card p-4 md:p-6 group cursor-pointer"
              onClick={() => !editMode && onNewsClick && onNewsClick(item)}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {item.photo && (
                  <div className="w-full md:w-48 h-48 flex-shrink-0 border border-primary/30">
                    <ProgressiveImage
                      src={item.photo}
                      alt={item.text}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                )}

                <div className="flex flex-col flex-1">
                  <div className="umbrella-corp-data-label mb-2">
                    LOG ENTRY // {formatNewsDate(item.date)}
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-4">
                    {item.text}
                  </h3>

                  {item.details && (
                    <p className="text-muted-foreground line-clamp-2 md:line-clamp-3 mb-4 max-w-2xl">
                      {item.details}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-mono text-xs hover:text-accent transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowSquareOut size={16} />
                        ACCESS LINK
                      </a>
                    ) : (
                      <span className="text-primary/50 font-mono text-[10px] umbrella-corp-data-label">
                        [READ FULL REPORT]
                      </span>
                    )}

                    {editMode && (
                      <div className="flex gap-2">
                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors border border-border hover:border-primary/50">
                          <PencilSimple size={16} />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-destructive transition-colors border border-border hover:border-destructive/50">
                          <Trash size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}