'use client'

import { useState } from 'react'
import { Check, Copy, ShareNetwork } from '@phosphor-icons/react'

interface NewsShareActionsProps {
  slug: string
  title: string
  excerpt?: string | null
  variant?: 'full' | 'compact' | 'admin'
}

export function getNewsArticleUrl(slug: string): string {
  return 'https://neuroklast.net/news/' + encodeURIComponent(slug)
}

export function NewsShareActions({
  slug,
  title,
  excerpt,
  variant = 'full',
}: NewsShareActionsProps) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)
  const url = getNewsArticleUrl(slug)
  const buttonClass = variant === 'admin'
    ? 'inline-flex min-h-10 items-center justify-center gap-2 border border-zinc-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
    : 'inline-flex min-h-10 items-center justify-center gap-2 border border-primary/30 px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-primary/70 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const input = document.createElement('textarea')
        input.value = url
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        try {
          input.select()
          if (!document.execCommand('copy')) throw new Error('Copy unavailable')
        } finally {
          input.remove()
        }
      }
      setCopied(true)
      setError(false)
    } catch {
      setError(true)
      setCopied(false)
    }
  }

  async function share() {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text: excerpt || title, url })
        return
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === 'AbortError') return
      }
    }
    await copyLink()
  }

  return (
    <div role="group" className="flex flex-wrap items-center gap-2" aria-label="Share this news article">
      {variant !== 'admin' ? (
        <button type="button" onClick={share} className={buttonClass} aria-label="Share article">
          <ShareNetwork size={16} aria-hidden />
          Share
        </button>
      ) : null}
      <button type="button" onClick={copyLink} className={buttonClass} aria-label="Copy article link">
        {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      {variant === 'full' ? (
        <>
          <a className={buttonClass} href={'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url)} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">WhatsApp</a>
          <a className={buttonClass} href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">Facebook</a>
          <a className={buttonClass} href={'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title)} target="_blank" rel="noopener noreferrer" aria-label="Share on X">X</a>
          <a className={buttonClass} href={'https://www.reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title)} target="_blank" rel="noopener noreferrer" aria-label="Share on Reddit">Reddit</a>
        </>
      ) : null}
      {error ? <span role="status" className="text-xs text-red-400">Could not copy link</span> : null}
    </div>
  )
}
