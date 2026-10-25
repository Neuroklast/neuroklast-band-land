'use client'

import { useState } from 'react'
import { Check, Copy, FacebookLogo, RedditLogo, ShareNetwork, WhatsappLogo, XLogo } from '@phosphor-icons/react'

interface NewsShareActionsProps {
  slug: string
  title: string
  excerpt?: string | null
  variant?: 'full' | 'compact' | 'admin'
}

export function getNewsArticleUrl(slug: string): string {
  return 'https://neuroklast.net/news/' + encodeURIComponent(slug)
}

const iconButtonClass =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'
const primaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 border border-primary/35 px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-primary/70 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'

export function NewsShareActions({
  slug,
  title,
  excerpt,
  variant = 'full',
}: NewsShareActionsProps) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)
  const url = getNewsArticleUrl(slug)

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

  const socials = [
    { name: 'WhatsApp', href: 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url), icon: <WhatsappLogo size={19} aria-hidden /> },
    { name: 'Facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), icon: <FacebookLogo size={19} aria-hidden /> },
    { name: 'X', href: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title), icon: <XLogo size={18} aria-hidden /> },
    { name: 'Reddit', href: 'https://www.reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title), icon: <RedditLogo size={19} aria-hidden /> },
  ]

  return (
    <div role="group" className="flex min-w-0 flex-wrap items-center gap-1 sm:gap-2" aria-label="Share this news article">
      {variant === 'compact' ? (
        <button type="button" onClick={share} className={iconButtonClass} aria-label={`Share ${title}`} title="Share article">
          <ShareNetwork size={18} aria-hidden />
        </button>
      ) : (
        <>
          {variant !== 'admin' ? (
            <button type="button" onClick={share} className={primaryButtonClass} aria-label="Share article">
              <ShareNetwork size={16} aria-hidden />
              Share
            </button>
          ) : null}
          <button
            type="button"
            onClick={copyLink}
            className={variant === 'admin'
              ? 'inline-flex min-h-10 items-center gap-2 px-2 font-mono text-xs text-zinc-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white'
              : primaryButtonClass}
            aria-label="Copy article link"
          >
            {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          {variant === 'full' ? (
            <div className="ml-auto flex items-center gap-0 border-l border-border/50 pl-1 sm:pl-3" aria-label="Social networks">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={iconButtonClass}
                  aria-label={`Share on ${social.name}`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          ) : null}
        </>
      )}
      {error ? <span role="status" className="basis-full text-xs text-red-400">Could not copy link</span> : null}
    </div>
  )
}
