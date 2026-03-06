import { motion } from 'framer-motion'
import { ArrowSquareOut, ShareNetwork, Copy, Check } from '@phosphor-icons/react'
import ProgressiveImage from '@/components/ProgressiveImage'
import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { NewsItem, SectionLabels } from '@/lib/types'
import { useLocale } from '@/contexts/LocaleContext'

/** Format a news date for display */
export function formatNewsDate(date: string): string {
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

/** Safely render markdown to sanitized HTML */
function renderMarkdown(text: string): string {
  const raw = marked.parse(text, { async: false }) as string
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'span', 'img'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'title', 'class', 'src', 'alt'],
  })
}

/** Sanitize an external URL to prevent javascript: and other dangerous protocols */
function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined
  if (/^(javascript|data|vbscript|file):/i.test(url.trim())) return undefined
  return url
}

interface NewsContentProps {
  item: NewsItem
  sectionLabels?: SectionLabels
}

/**
 * News item body content — headline, photo, details, link, share actions.
 * Renders without a header/close button; the parent OverlayModal provides those.
 */
export default function NewsContent({ item, sectionLabels }: NewsContentProps) {
  const [copied, setCopied] = useState(false)
  const { t } = useLocale()

  const detailsHtml = useMemo(
    () => item.details ? renderMarkdown(item.details) : '',
    [item.details]
  )

  const shareUrl = `${window.location.origin}/share/news/${item.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for very old browsers that don't support navigator.clipboard
      // document.execCommand is deprecated but still works in older environments
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.text,
          text: item.details ? item.text + ' — ' + item.details.slice(0, 100) : item.text,
          url: shareUrl,
        })
      } catch {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Share actions toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-primary/10">
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors tracking-wider"
          title="Share"
        >
          <ShareNetwork size={12} />
          {t('news.share')}
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors tracking-wider"
          title="Copy link"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? t('news.copied') : t('news.link')}
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto p-6 space-y-4 max-h-[60dvh]">
        {item.photo && (
          <div className="w-full rounded-sm border border-primary/20">
            <ProgressiveImage
              src={item.photo}
              alt={item.text}
              className="w-full h-auto object-contain"
            />
          </div>
        )}

        <h3 className="text-xl md:text-2xl font-bold text-foreground/95 leading-relaxed">
          {item.text}
        </h3>

        {item.details && (
          <div
            className="text-sm md:text-base text-foreground/80 leading-relaxed prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-a:text-primary prose-strong:text-foreground/90"
            dangerouslySetInnerHTML={{ __html: detailsHtml }}
          />
        )}

        {item.link && sanitizeUrl(item.link) && (
          <a
            href={sanitizeUrl(item.link)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-xs tracking-wider transition-all hover:shadow-[0_0_15px_var(--primary-glow)]"
          >
            <ArrowSquareOut size={16} />
            {t('news.openLink')}
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-[9px] text-primary/40 px-4 py-2 border-t border-primary/20 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
        <span>{t('news.entry')}</span>
        <span className="ml-auto">{t('news.version')}</span>
      </div>
    </motion.div>
  )
}
