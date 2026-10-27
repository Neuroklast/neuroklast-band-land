'use client'

import type { ReactNode } from 'react'

export interface AdminEditorTab<Id extends string> {
  id: Id
  label: string
}

interface AdminEditorLayoutProps<Id extends string> {
  tabs: readonly AdminEditorTab<Id>[]
  activeTab: Id
  onTabChange: (id: Id) => void
  idPrefix: string
  children: ReactNode
}

/** Reusable editor navigation. Pages own their form state, not this layout. */
export function AdminEditorLayout<Id extends string>({
  tabs, activeTab, onTabChange, idPrefix, children,
}: AdminEditorLayoutProps<Id>) {
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[190px_minmax(0,1fr)] xl:gap-6">
      <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
        <nav aria-label="Editor sections" className="flex gap-1 overflow-x-auto border-b border-zinc-800 pb-2 xl:flex-col xl:overflow-visible xl:border-b-0 xl:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`${idPrefix}-nav-${tab.id}`}
              type="button"
              aria-controls={`${idPrefix}-panel-${tab.id}`}
              aria-current={tab.id === activeTab ? 'location' : undefined}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-11 shrink-0 rounded border px-3 py-2 text-left text-sm transition-colors xl:w-full ${
                tab.id === activeTab
                  ? 'border-red-800/60 bg-red-950/50 font-medium text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 pb-2">{children}</div>
    </div>
  )
}
