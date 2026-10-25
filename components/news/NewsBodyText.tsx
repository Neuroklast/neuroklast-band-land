import type { ReactNode } from 'react'
import { sanitizeExternalHref } from '@/lib/sanitize-href'

const URL_PATTERN = /https?:\/\/[^\s<>"']+/g

/** Render plain-text news with safe, clickable web links. Never inject HTML. */
export function NewsBodyText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  let cursor = 0

  for (const match of text.matchAll(URL_PATTERN)) {
    const index = match.index
    if (index === undefined) continue
    const raw = match[0]
    const url = raw.replace(/[),.!?;:]+$/, '')
    const href = sanitizeExternalHref(url)
    if (!href) continue
    nodes.push(text.slice(cursor, index))
    nodes.push(
      <a
        key={index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-primary underline underline-offset-2 hover:text-foreground"
      >
        {url}
      </a>,
    )
    nodes.push(raw.slice(url.length))
    cursor = index + raw.length
  }
  nodes.push(text.slice(cursor))
  return <>{nodes}</>
}
