'use client'

import { useRef, useState, useTransition } from 'react'
import { Upload } from '@phosphor-icons/react'
import { importSiteConfigContent } from '@/app/admin/_actions/siteConfigContentImport'

export function SiteConfigContentImportClient() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const confirmed = window.confirm(
      'Import the legacy site-config-content JSON? Content will be upserted into Supabase and media re-hosted to Cloudflare R2. Continue?',
    )
    if (!confirmed) {
      e.target.value = ''
      return
    }

    setMessage(null)
    setError(null)

    const reader = new FileReader()
    reader.onerror = () => setError('Could not read the file')
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      startTransition(async () => {
        const result = await importSiteConfigContent(text)
        if (!result.ok) {
          setError(result.error ?? 'Import failed')
          return
        }
        const summary = Object.entries(result.summary ?? {})
          .map(([table, count]) => `${table}: ${count}`)
          .join(', ')
        const mediaNote = result.media
          ? `Media → R2: ${result.media.uploaded} uploaded, ${result.media.failed} failed.`
          : ''
        setMessage(
          summary
            ? `Imported — ${summary}. ${mediaNote}`
            : `Import completed (no rows matched). ${mediaNote}`,
        )
        if (result.errors && result.errors.length > 0) {
          setError(`Some tables failed: ${result.errors.join('; ')}`)
        }
      })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Import Site Config Content (legacy)</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Upload an old <code className="text-zinc-300">site-config-content-*.json</code> export. Bio
          (story + achievements + collabs), members, partners/friends, gigs, releases, news, gallery,
          media downloads, social links, impressum/datenschutz and the hero/sections look are mapped
          into Supabase. Images and files are re-hosted to Cloudflare R2.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        aria-label="Import site config content JSON"
        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded font-medium transition-colors disabled:opacity-50 min-h-[44px]"
      >
        <Upload className="h-4 w-4" aria-hidden="true" />
        {pending ? 'Importing…' : 'Import Content JSON'}
      </button>
      {message && <p className="text-xs text-green-400">{message}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
