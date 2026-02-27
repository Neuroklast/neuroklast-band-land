import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Plus, Trash, PencilSimple, ArrowSquareOut, TextB, TextItalic, TextHOne, LinkSimple, ListBullets, ShareNetwork, Copy, Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ChromaticText } from '@/components/ChromaticText'
import CyberCloseButton from '@/components/CyberCloseButton'
import ProgressiveImage from '@/components/ProgressiveImage'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useTypingEffect } from '@/hooks/use-typing-effect'
import { format } from 'date-fns'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { NewsItem, SectionLabels } from '@/lib/types'
import {
  TITLE_TYPING_SPEED_MS,
  TITLE_TYPING_START_DELAY_MS,
  SECTION_GLITCH_PROBABILITY,
  SECTION_GLITCH_DURATION_MS,
  SECTION_GLITCH_INTERVAL_MS,
} from '@/lib/config'

interface NewsSectionProps {
  news?: NewsItem[]
  editMode?: boolean
  onUpdate?: (news: NewsItem[]) => void
  sectionLabels?: SectionLabels
  onLabelChange?: (key: keyof SectionLabels, value: string) => void
}

const INITIAL_VISIBLE_COUNT = 3
const TEXT_TRUNCATE_THRESHOLD = 120
const DETAILS_TRUNCATE_THRESHOLD = 100

/** Safely render markdown to sanitized HTML */
function renderMarkdown(text: string): string {
  const raw = marked.parse(text, { async: false }) as string
  return DOMPurify.sanitize(raw)
}

/** Format a news date for display */
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

export default function NewsSection({ news = [], editMode, onUpdate, sectionLabels, onLabelChange }: NewsSectionProps) {
  const [glitchActive, setGlitchActive] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const titleText = sectionLabels?.news || 'NEWS'
  const headingPrefix = sectionLabels?.headingPrefix ?? '>'
  const { displayedText: displayedTitle } = useTypingEffect(
    isInView ? titleText : '',
    TITLE_TYPING_SPEED_MS,
    TITLE_TYPING_START_DELAY_MS
  )

  // Update URL hash when a news item is selected/deselected
  const selectNews = useCallback((item: NewsItem | null) => {
    setSelectedNews(item)
    if (item) {
      window.history.replaceState(null, '', `#news/${item.id}`)
    } else {
      // Restore clean #news hash when closing the overlay
      window.history.replaceState(null, '', '#news')
    }
  }, [])

  // Deep-link: open a specific news item when the page loads with #news/{id}
  useEffect(() => {
    if (!news.length) return
    const hash = window.location.hash
    const match = hash.match(/^#news\/(.+)$/)
    if (match) {
      const target = news.find(n => n.id === match[1])
      if (target) {
        setSelectedNews(target)
      }
    }
  }, [news])

  // Listen for hash changes (e.g. browser back/forward navigation)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash
      const match = hash.match(/^#news\/(.+)$/)
      if (match) {
        const target = news.find(n => n.id === match[1])
        if (target) setSelectedNews(target)
      } else {
        setSelectedNews(null)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [news])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > SECTION_GLITCH_PROBABILITY) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), SECTION_GLITCH_DURATION_MS)
      }
    }, SECTION_GLITCH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  const sortedNews = [...news].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const visibleNews = showAll || editMode ? sortedNews : sortedNews.slice(0, INITIAL_VISIBLE_COUNT)
  const hasMore = sortedNews.length > INITIAL_VISIBLE_COUNT

  const handleSave = (item: NewsItem) => {
    if (!onUpdate) return
    const existing = news.find(n => n.id === item.id)
    if (existing) {
      onUpdate(news.map(n => n.id === item.id ? item : n))
    } else {
      onUpdate([...news, item])
    }
    setEditingItem(null)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (!onUpdate) return
    onUpdate(news.filter(n => n.id !== id))
  }

  if (!editMode && (!news || news.length === 0)) return null

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-gradient-to-b from-secondary/5 via-background to-background" id="news">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <motion.h2
            className={`text-4xl md:text-5xl lg:text-6xl font-bold font-mono scanline-text dot-matrix-text ${glitchActive ? 'glitch-text-effect' : ''}`}
            data-text={`${headingPrefix} ${displayedTitle}`}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
            style={{
              textShadow: '0 0 6px oklch(1 0 0 / 0.5), 0 0 12px oklch(0.50 0.22 25 / 0.3), 0 0 18px oklch(0.50 0.22 25 / 0.2)'
            }}
          >
            <ChromaticText intensity={1.5}>
              {headingPrefix} {displayedTitle}
            </ChromaticText>
            <span className="animate-pulse">_</span>
          </motion.h2>
          {editMode && (
            <div className="flex gap-2 items-center">
              {onLabelChange && (
                <input
                  type="text"
                  value={sectionLabels?.news || ''}
                  onChange={(e) => onLabelChange('news', e.target.value)}
                  placeholder="NEWS"
                  className="bg-transparent border border-primary/30 px-2 py-1 text-xs font-mono text-primary w-32 focus:outline-none focus:border-primary"
                />
              )}
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-primary hover:bg-accent active:scale-95 transition-transform touch-manipulation"
              >
                <Plus className="mr-0 md:mr-2" size={20} />
                <span className="hidden md:inline">Add News</span>
              </Button>
            </div>
          )}
        </div>

        <Separator className="bg-gradient-to-r from-primary via-primary/50 to-transparent mb-12 h-0.5" />

        <div className="space-y-4">
          {visibleNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="border border-border hover:border-primary/50 bg-card/50 p-4 md:p-5 transition-all duration-300 hud-element hud-corner group cursor-pointer"
              onClick={() => !editMode && selectNews(item)}
            >
              <span className="corner-bl"></span>
              <span className="corner-br"></span>
              <div className="flex flex-col">
                <div className="font-mono text-[10px] text-primary/60 tracking-wider whitespace-nowrap flex-shrink-0 mb-3">
                  {formatNewsDate(item.date)}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {item.photo && (
                    <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28">
                      <ProgressiveImage 
                        src={item.photo} 
                        alt={item.text}
                        className="w-full h-full object-cover rounded-sm border border-primary/20"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-base md:text-lg font-medium text-foreground/90 leading-relaxed line-clamp-2">{item.text}</p>
                    {item.details && (
                      <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed line-clamp-2">{item.details}</p>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary mt-2 font-mono tracking-wider transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowSquareOut size={12} />
                        LINK
                      </a>
                    )}
                    {!editMode && (item.text.length > TEXT_TRUNCATE_THRESHOLD || (item.details && item.details.length > DETAILS_TRUNCATE_THRESHOLD)) && (
                      <p className="text-[10px] text-primary/50 mt-2 font-mono tracking-wider">CLICK TO READ MORE</p>
                    )}
                  </div>
                  {editMode && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingItem(item) }}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {sortedNews.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-muted-foreground text-lg">No news yet.</p>
          </motion.div>
        )}

        {!editMode && hasMore && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="border-primary/30 hover:bg-primary/10 hover:border-primary transition-all"
            >
              {showAll ? 'Show Less' : `Show More (${sortedNews.length - INITIAL_VISIBLE_COUNT} more)`}
            </Button>
          </div>
        )}
      </div>

      {(editingItem || isAdding) && (
        <NewsEditDialog
          item={editingItem}
          onSave={handleSave}
          onClose={() => { setEditingItem(null); setIsAdding(false) }}
        />
      )}

      <AnimatePresence>
        {selectedNews && (
          <NewsDetailOverlay
            item={selectedNews}
            onClose={() => selectNews(null)}
            sectionLabels={sectionLabels}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

/** Full-screen overlay showing a single news item with full text */
function NewsDetailOverlay({ item, onClose, sectionLabels }: {
  item: NewsItem
  onClose: () => void
  sectionLabels?: SectionLabels
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const detailsHtml = useMemo(
    () => item.details ? renderMarkdown(item.details) : '',
    [item.details]
  )

  const shareUrl = `${window.location.origin}${window.location.pathname}#news/${item.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
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
        // User cancelled or share failed — fall back to copy
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 hud-scanline opacity-20 pointer-events-none" />

      <motion.div
        className="w-full max-w-2xl bg-card border border-primary/30 relative overflow-hidden flex flex-col max-h-[90dvh]"
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 30, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HUD corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

        {/* Header bar */}
        <div className="h-10 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] text-primary/70 tracking-wider uppercase">
              NEWS // {formatNewsDate(item.date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors tracking-wider"
              title="Share"
            >
              <ShareNetwork size={12} />
              SHARE
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors tracking-wider"
              title="Copy link"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? 'COPIED' : 'LINK'}
            </button>
            <CyberCloseButton
              onClick={onClose}
              label={sectionLabels?.closeButtonText || 'CLOSE'}
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4">
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

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-xs tracking-wider transition-all hover:shadow-[0_0_15px_oklch(0.50_0.22_25/0.3)]"
            >
              <ArrowSquareOut size={16} />
              OPEN LINK
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-[9px] text-primary/40 px-4 py-2 border-t border-primary/20 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
          <span>NEWS ENTRY</span>
          <span className="ml-auto">NK-NEWS v1.0</span>
        </div>

        {/* Scanline overlay */}
        <div className="absolute inset-0 hud-scanline pointer-events-none opacity-10" />
      </motion.div>
    </motion.div>
  )
}

/** Insert markdown formatting around selected text in a textarea */
function insertFormatting(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string,
  placeholder: string,
  setValue: (v: string) => void,
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value
  const selected = text.slice(start, end) || placeholder
  const newText = text.slice(0, start) + prefix + selected + suffix + text.slice(end)
  setValue(newText)
  // Restore cursor position after React re-render
  requestAnimationFrame(() => {
    textarea.focus()
    const cursorPos = start + prefix.length + selected.length
    textarea.setSelectionRange(cursorPos, cursorPos)
  })
}

function NewsEditDialog({ item, onSave, onClose }: {
  item: NewsItem | null
  onSave: (item: NewsItem) => void
  onClose: () => void
}) {
  const detailsRef = useRef<HTMLTextAreaElement>(null)
  const [formData, setFormData] = useState<NewsItem>(
    item || { id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, date: new Date().toISOString().slice(0, 7), text: '' }
  )
  const [dateType, setDateType] = useState<'month' | 'date'>(() => {
    // Determine initial date type based on existing date format
    if (item?.date && /^\d{4}-\d{2}$/.test(item.date)) return 'month'
    return 'date'
  })

  const handleDateTypeChange = (newType: 'month' | 'date') => {
    setDateType(newType)
    // Convert date format when switching
    if (newType === 'month' && formData.date) {
      // Convert YYYY-MM-DD to YYYY-MM
      setFormData({ ...formData, date: formData.date.slice(0, 7) })
    } else if (newType === 'date' && formData.date) {
      // If we only have YYYY-MM, append -01 for first day of month
      if (formData.date.length === 7) {
        setFormData({ ...formData, date: `${formData.date}-01` })
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-card border border-primary/30 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="font-mono text-sm text-primary tracking-wider">{item ? 'EDIT NEWS' : 'ADD NEWS'}</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-[10px]">Date Format</Label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => handleDateTypeChange('month')}
                className={`px-3 py-1 text-[10px] font-mono border transition-colors ${
                  dateType === 'month'
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                MONTH/YEAR
              </button>
              <button
                onClick={() => handleDateTypeChange('date')}
                className={`px-3 py-1 text-[10px] font-mono border transition-colors ${
                  dateType === 'date'
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                FULL DATE
              </button>
            </div>
          </div>
          <div>
            <Label className="text-[10px]">{dateType === 'month' ? 'Month' : 'Date'}</Label>
            <Input
              type={dateType}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px]">Text</Label>
            <Input
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="text-xs"
              placeholder="News headline..."
            />
          </div>
          <div>
            <Label className="text-[10px]">Details (optional, supports Markdown)</Label>
            <div className="flex gap-1 mb-1">
              <button
                type="button"
                title="Bold"
                onClick={() => detailsRef.current && insertFormatting(detailsRef.current, '**', '**', 'bold text', (v) => setFormData({ ...formData, details: v || undefined }))}
                className="p-1 border border-border rounded-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <TextB size={14} />
              </button>
              <button
                type="button"
                title="Italic"
                onClick={() => detailsRef.current && insertFormatting(detailsRef.current, '*', '*', 'italic text', (v) => setFormData({ ...formData, details: v || undefined }))}
                className="p-1 border border-border rounded-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <TextItalic size={14} />
              </button>
              <button
                type="button"
                title="Heading"
                onClick={() => detailsRef.current && insertFormatting(detailsRef.current, '## ', '', 'Heading', (v) => setFormData({ ...formData, details: v || undefined }))}
                className="p-1 border border-border rounded-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <TextHOne size={14} />
              </button>
              <button
                type="button"
                title="Link"
                onClick={() => detailsRef.current && insertFormatting(detailsRef.current, '[', '](https://)', 'link text', (v) => setFormData({ ...formData, details: v || undefined }))}
                className="p-1 border border-border rounded-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <LinkSimple size={14} />
              </button>
              <button
                type="button"
                title="Bullet List"
                onClick={() => detailsRef.current && insertFormatting(detailsRef.current, '- ', '', 'list item', (v) => setFormData({ ...formData, details: v || undefined }))}
                className="p-1 border border-border rounded-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <ListBullets size={14} />
              </button>
            </div>
            <textarea
              ref={detailsRef}
              value={formData.details || ''}
              onChange={(e) => setFormData({ ...formData, details: e.target.value || undefined })}
              className="flex w-full rounded-sm border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px] resize-y font-mono"
              rows={5}
              placeholder="Additional details... (supports **bold**, *italic*, ## headings, [links](url), - lists)"
            />
          </div>
          <div>
            <Label className="text-[10px]">Image URL (optional)</Label>
            <Input
              value={formData.photo || ''}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value || undefined })}
              className="text-xs"
              placeholder="https://... or Google Drive link"
            />
            {formData.photo && (
              <div className="mt-2 w-24 h-24">
                <ProgressiveImage 
                  src={formData.photo} 
                  alt="Preview"
                  className="w-full h-full object-cover rounded-sm border border-primary/20"
                />
              </div>
            )}
          </div>
          <div>
            <Label className="text-[10px]">Link (optional)</Label>
            <Input
              value={formData.link || ''}
              onChange={(e) => setFormData({ ...formData, link: e.target.value || undefined })}
              className="text-xs"
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={() => onSave(formData)} className="flex-1">Save</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </motion.div>
    </div>
  )
}
