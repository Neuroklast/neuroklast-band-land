'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import {
  CONTACT_SPAM_CONFIG_KEY,
  MAX_CONTACT_SPAM_WORDS,
  contactSpamConfigSchema,
  normalizeBlockedWords,
  type ContactSpamConfig,
} from '@/lib/contact-spam-filter'

export function ContactSpamEditor({ initialConfig }: { initialConfig: ContactSpamConfig }) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(initialConfig.enabled)
  const [words, setWords] = useState(initialConfig.blockedWords.join('\n'))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const blockedWords = normalizeBlockedWords(words.split(/\r?\n/u).filter((entry) => entry.trim()))
      const parsed = contactSpamConfigSchema.safeParse({ enabled, blockedWords })
      if (!parsed.success) {
        setError('Invalid rules. Use one word or phrase per line, 2–80 characters each, up to ' +
          MAX_CONTACT_SPAM_WORDS + ' rules. Control characters are not allowed.')
        return
      }

      const form = new FormData()
      form.set('key', CONTACT_SPAM_CONFIG_KEY)
      form.set('value', JSON.stringify(parsed.data))
      const result = await updateSiteConfig(form)
      if (result.error) {
        setError(result.error)
        return
      }
      setWords(blockedWords.join('\n'))
      setMessage('Spam filter saved. The updated rules apply to new messages.')
      router.refresh()
    } catch {
      setError('Unable to save spam filter settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(event) => void save(event)} className="max-w-3xl space-y-5 border border-zinc-800 bg-zinc-950 p-5">
      <label className="flex items-center gap-3 text-sm text-zinc-100">
        <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)}
          className="h-4 w-4 accent-red-600" />
        Enable word blacklist
      </label>
      <div>
        <label htmlFor="contact-spam-words" className="mb-2 block text-sm font-semibold text-white">
          Blocked words and phrases
        </label>
        <textarea id="contact-spam-words" value={words} onChange={(event) => setWords(event.target.value)}
          rows={12} maxLength={18000} spellCheck={false}
          className="w-full resize-y border border-zinc-700 bg-black p-3 font-mono text-sm text-white"
          placeholder={'example phrase\nsecond phrase'} />
        <p className="mt-2 text-xs leading-6 text-zinc-400">
          One word or phrase per line. Matching is case-insensitive, uses whole words and checks
          the subject and message. No partial matches inside other words. Maximum {MAX_CONTACT_SPAM_WORDS} entries.
        </p>
      </div>
      <p className="text-xs leading-6 text-zinc-400">
        Rejected submissions are not stored in the contact inbox or sent by email.
        Visitors see a spam-suspicion error with a link to the legal notice for an alternative contact address.
        The existing honeypot and rate limiting remain active.
      </p>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      {message && <p role="status" className="text-sm text-green-300">{message}</p>}
      <button type="submit" disabled={saving}
        className="min-h-11 border border-red-700 bg-red-900/30 px-5 text-sm font-semibold text-white hover:bg-red-900/50 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save spam filter'}
      </button>
    </form>
  )
}
