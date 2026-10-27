'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminNav } from '@/app/admin/_components/AdminNav'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

const LAYOUT_STORAGE_KEY = 'neuroklast-admin-shell-layout'
type AdminShellLayout = Record<string, number>

/** Percentages for Group defaultLayout (0–100). */
const FALLBACK_LAYOUT: AdminShellLayout = { 'admin-nav': 20, 'admin-main': 80 }

const NAV_MIN_PERCENT = 16
const NAV_MAX_PERCENT = 36

function sanitizeLayout(layout: AdminShellLayout): AdminShellLayout {
  const nav = layout['admin-nav']
  const main = layout['admin-main']
  if (typeof nav !== 'number' || nav < NAV_MIN_PERCENT || nav > NAV_MAX_PERCENT) {
    return FALLBACK_LAYOUT
  }
  if (typeof main !== 'number' || main < 50 || main > 90) {
    return FALLBACK_LAYOUT
  }
  const total = nav + main
  if (total < 95 || total > 105) {
    return FALLBACK_LAYOUT
  }
  return layout
}

function readStoredLayout(): AdminShellLayout {
  if (typeof window === 'undefined') return FALLBACK_LAYOUT
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
    if (!raw) return FALLBACK_LAYOUT
    const parsed = JSON.parse(raw) as Record<string, number>
    if (typeof parsed !== 'object' || parsed === null) return FALLBACK_LAYOUT
    return sanitizeLayout(parsed)
  } catch {
    return FALLBACK_LAYOUT
  }
}

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const [defaultLayout, setDefaultLayout] = useState<AdminShellLayout>(FALLBACK_LAYOUT)
  const [layoutReady, setLayoutReady] = useState(false)
  const [viewport, setViewport] = useState<'unknown' | 'mobile' | 'desktop'>('unknown')

  useEffect(() => {
    setDefaultLayout(readStoredLayout())
    setLayoutReady(true)
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setViewport(mq.matches ? 'desktop' : 'mobile')
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const onLayoutChanged = useCallback((layout: Record<string, number>) => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(sanitizeLayout(layout)))
    } catch {
      // ignore quota / private mode
    }
  }, [])

  if (viewport !== 'desktop') {
    return (
      <>
        <AdminNav mobileOnly />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-8">{children}</main>
      </>
    )
  }

  return (
    <div className="flex min-h-0 h-full flex-1 w-full overflow-hidden">
      {!layoutReady ? (
        <div className="flex min-h-0 h-full flex-1 w-full">
          <div className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950" aria-hidden="true" />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      ) : (
        <ResizablePanelGroup
          key="admin-shell-resizable"
          orientation="horizontal"
          className="min-h-0 h-full flex-1"
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
        >
          <ResizablePanel
            id="admin-nav"
            defaultSize="20%"
            minSize="220px"
            maxSize="36%"
            className="min-w-0 bg-zinc-950"
          >
            <AdminNav sidebarOnly className="h-full" />
          </ResizablePanel>
          <ResizableHandle
            withHandle
            className="w-2 bg-zinc-800/80 hover:bg-zinc-700 transition-colors data-[resize-handle-active]:bg-red-900/50"
          />
          <ResizablePanel id="admin-main" minSize="50%" className="min-w-0">
            <main className="h-full min-h-0 min-w-0 overflow-y-auto overscroll-contain p-8">{children}</main>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  )
}
