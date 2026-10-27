'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FloppyDisk } from '@phosphor-icons/react'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import type { SiteLanguage } from '@/lib/i18n'

interface TranslationsEditorProps {
  strings: Record<string, Record<string, string>>
  defaultStrings: Record<string, Record<string, string>>
  languages: SiteLanguage[]
}

export default function TranslationsEditor({
  strings,
  defaultStrings,
  languages: initialLanguages,
}: TranslationsEditorProps) {
  const router = useRouter()
  const [values, setValues] = useState(strings)
  const languages = initialLanguages
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function updateField(key: string, locale: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [key]: { ...prev[key], [locale]: value },
    }))
  }

  async function saveConfig(key: string, value: unknown): Promise<{ error?: string }> {
    const fd = new FormData()
    fd.set('key', key)
    fd.set('value', JSON.stringify(value))
    return updateSiteConfig(fd)
  }

  async function handleSave() {
    setStatus('saving')
    setErrorMsg(null)

    const overrides: Record<string, Record<string, string>> = {}
    for (const key of Object.keys(defaultStrings)) {
      const entry = values[key]
      if (!entry) continue
      const def = defaultStrings[key]
      const patch: Record<string, string> = {}
      for (const lang of languages) {
        const value = entry[lang.code]?.trim()
        const fallback = def[lang.code] ?? def.en ?? ''
        if (value && value !== fallback) {
          patch[lang.code] = value
        }
      }
      if (Object.keys(patch).length > 0) {
        overrides[key] = patch
      }
    }

    const languagesPayload = languages.map(({ code, label }) => ({ code, label }))

    const translationsResult = await saveConfig('translations', overrides)
    if (translationsResult.error) {
      setStatus('error')
      setErrorMsg(translationsResult.error)
      return
    }

    const languagesResult = await saveConfig('languages', languagesPayload)
    if (languagesResult.error) {
      setStatus('error')
      setErrorMsg(languagesResult.error)
      return
    }

    setStatus('saved')
    router.refresh()
    setTimeout(() => setStatus('idle'), 2000)
  }

  const gridCols = `minmax(10rem, 12rem) repeat(${languages.length}, minmax(10rem, 1fr))`

  return (
    <div>
      <div className="mb-4 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Languages</h2>
        <p className="mb-3 text-sm text-zinc-400">
          The public website uses English and German. Other translations remain archived in the repository.
        </p>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <span key={lang.code} className="inline-flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-sm text-zinc-200">
              <code className="font-mono text-xs text-zinc-400">{lang.code}</code>
              <span>{lang.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <div className="min-w-max">
          <div
            className="grid items-center gap-3 border-b border-zinc-800 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400"
            style={{ gridTemplateColumns: gridCols }}
          >
            <span className="sticky left-0 z-[1] bg-zinc-900 pr-2">Key</span>
            {languages.map((lang) => (
              <span key={lang.code} className="min-w-0 truncate" title={lang.label}>
                {lang.label}
              </span>
            ))}
          </div>
          <div className="divide-y divide-zinc-800/60">
            {Object.entries(values).map(([key, entry]) => (
              <div
                key={key}
                className="grid items-center gap-3 px-4 py-2"
                style={{ gridTemplateColumns: gridCols }}
              >
                <code
                  className="sticky left-0 z-[1] truncate bg-zinc-900 pr-2 font-mono text-xs text-zinc-400"
                  title={key}
                >
                  {key}
                </code>
                {languages.map((lang) => {
                  const placeholder = defaultStrings[key]?.[lang.code] ?? defaultStrings[key]?.en ?? ''
                  return (
                    <input
                      key={lang.code}
                      type="text"
                      value={entry[lang.code] ?? ''}
                      onChange={(e) => updateField(key, lang.code, e.target.value)}
                      placeholder={placeholder}
                      aria-label={`${key} ${lang.label}`}
                      className="min-w-0 w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        {status === 'saved' && <span className="text-xs text-green-400">Saved</span>}
        {status === 'error' && <span className="text-xs text-red-400">{errorMsg ?? 'Error'}</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm rounded font-medium transition-colors"
        >
          <FloppyDisk className="h-4 w-4" aria-hidden="true" />
          {status === 'saving' ? 'Saving…' : 'Save Translations'}
        </button>
      </div>
    </div>
  )
}