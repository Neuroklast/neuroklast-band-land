'use client'

import { useState, useTransition } from 'react'
import { setProductsSectionVisible } from '@/app/admin/_actions/products'

export function ProductSectionToggle({ visible: initialVisible }: { visible: boolean }) {
  const [visible, setVisible] = useState(initialVisible)
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    const next = !visible
    setVisible(next)
    startTransition(async () => {
      const result = await setProductsSectionVisible(next)
      if (result?.error) setVisible(!next)
    })
  }

  return (
    <div className="mb-6 rounded border border-zinc-800 bg-zinc-950/60 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-200">Public Products section</p>
          <p className="text-xs text-zinc-500">
            {visible
              ? 'Shown on the homepage and /neurokore is reachable.'
              : 'Hidden on the site. License keys still work from this admin.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          aria-pressed={visible}
          aria-label={visible ? 'Hide Products section on the public site' : 'Show Products section on the public site'}
          className={`text-xs px-3 py-1.5 rounded border transition-colors disabled:opacity-50 min-h-[44px] ${
            visible
              ? 'border-green-700/50 text-green-400 hover:border-green-600'
              : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {visible ? 'Section on' : 'Section off'}
        </button>
      </div>
    </div>
  )
}
