'use client'

import { useState } from 'react'
import { Plus, X } from '@phosphor-icons/react'
import { updateBio } from '@/app/admin/_actions/bio'

interface BioFormProps {
  initialContent: string
  initialAchievements?: string[]
  initialCollabs?: string[]
}

function ListRowEditor({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string
  placeholder: string
  values: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-zinc-300 mb-1">{label}</label>
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => {
              const next = [...values]
              next[index] = e.target.value
              onChange(next)
            }}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none min-h-[38px]"
          />
          <button
            type="button"
            aria-label={`Remove ${label} item`}
            onClick={() => onChange(values.filter((_, i) => i !== index))}
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ''])}
        className="inline-flex items-center gap-2 px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors min-h-[38px]"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add {label} entry
      </button>
    </div>
  )
}

export default function BioForm({
  initialContent,
  initialAchievements = [],
  initialCollabs = [],
}: BioFormProps) {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [achievements, setAchievements] = useState<string[]>(
    initialAchievements.length > 0 ? initialAchievements : [''],
  )
  const [collabs, setCollabs] = useState<string[]>(initialCollabs.length > 0 ? initialCollabs : [''])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const clean = (list: string[]) => list.map((item) => item.trim()).filter(Boolean)
    formData.set('achievements', JSON.stringify(clean(achievements)))
    formData.set('collabs', JSON.stringify(clean(collabs)))
    const result = await updateBio(formData)
    if (result?.error) setError(result.error)
    else setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Bio Text</label>
        <textarea
          name="content"
          defaultValue={initialContent}
          rows={10}
          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none resize-none"
        />
      </div>

      <ListRowEditor
        label="Achievements"
        placeholder="e.g. Performed at WGT, RESISTANZ, SSM"
        values={achievements}
        onChange={setAchievements}
      />

      <ListRowEditor
        label="Collabs"
        placeholder="e.g. ESA"
        values={collabs}
        onChange={setCollabs}
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {saved && <p className="text-green-400 text-sm">Saved!</p>}
      <button
        type="submit"
        className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors"
      >
        Save Bio
      </button>
    </form>
  )
}
