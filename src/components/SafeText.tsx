import ProtectedText from '@/components/ProtectedText'
import type { ReactNode } from 'react'

/**
 * Regex patterns for detecting phone numbers and email addresses in text.
 * Phone: international format (+XX ...) or local formats with common separators.
 * Email: standard user@domain pattern.
 */
const PHONE_RE = /(\+?\d[\d\s\-().]{6,}\d)/g
const EMAIL_RE = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g

/** Combined regex that matches either a phone number or an email address */
const SENSITIVE_RE = new RegExp(`${PHONE_RE.source}|${EMAIL_RE.source}`, 'g')

interface SafeTextProps {
  /** The raw text that may contain phone numbers or email addresses */
  children: string
  /** Optional CSS class applied to wrapping span */
  className?: string
  /** Font size for ProtectedText canvas rendering (default: 14) */
  fontSize?: number
}

/**
 * Renders a string while automatically replacing phone numbers and email
 * addresses with `<ProtectedText>` canvas elements to prevent bot scraping.
 *
 * Safe to use anywhere plain text would be rendered.
 */
export default function SafeText({ children: text, className, fontSize = 14 }: SafeTextProps) {
  if (!text) return null

  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  const regex = new RegExp(SENSITIVE_RE.source, 'g')

  while ((match = regex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    // Push protected match
    parts.push(
      <ProtectedText key={match.index} text={match[0]} fontSize={fontSize} />
    )
    lastIndex = regex.lastIndex
  }

  // If no matches were found, return the text as-is (no wrapper needed)
  if (parts.length === 0) {
    return className ? <span className={className}>{text}</span> : <>{text}</>
  }

  // Append any remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return className ? <span className={className}>{parts}</span> : <>{parts}</>
}
