'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import { SignOut, List, X, MagnifyingGlass, CaretDown } from '@phosphor-icons/react'
import { openAdminHelp } from '@/app/admin/_components/AdminHelpPalette'
import { getAdminHelpShortcutLabel } from '@/lib/admin-help-shortcut'
import {
  House,
  Gear,
  TextAlignLeft,
  Disc,
  Waveform,
  TShirt,
  Package,
  Calendar,
  Images,
  Users,
  UserCircle,
  Share,
  Heartbeat,
  ChartBar,
  Export,
  Translate,
  Key,
  Newspaper,
  Lock,
  Envelope,
  Receipt,
  ShieldCheck,
  Scroll,
  Cpu,
  Cube,
  Robot,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import {
  ADMIN_NAV_GROUPS,
  isNavItemActive,
  resolveActiveNavGroupId,
  type AdminNavItemData,
} from '@/app/admin/_config/nav-groups'

const NAV_ICONS: Record<string, Icon> = {
  '/admin': House,
  '/admin/site-config': Gear,
  '/admin/legal': Scroll,
  '/admin/security': Lock,
  '/admin/privacy': ShieldCheck,
  '/admin/orders': Receipt,
  '/admin/contact-inbox': Envelope,
  '/admin/contact-spam': ShieldCheck,
  '/admin/withdrawals': Receipt,
  '/admin/media': Images,
  '/admin/translations': Translate,
  '/admin/bio': TextAlignLeft,
  '/admin/members': UserCircle,
  '/admin/gallery': Images,
  '/admin/partners': Users,
  '/admin/music-highlights': Waveform,
  '/admin/releases': Disc,
  '/admin/releases/sync': Disc,
  '/admin/gigs': Calendar,
  '/admin/merchandise': TShirt,
  '/admin/products': Cube,
  '/admin/plugins': Cpu,
  '/admin/soundpacks': Package,
  '/admin/news': Newspaper,
  '/admin/social': Share,
  '/admin/analytics': ChartBar,
  '/admin/ai-content': Robot,
  '/admin/integrations': Robot,
  '/admin/api-keys': Key,
  '/admin/health': Heartbeat,
  '/admin/data': Export,
}

const NAV_GROUP_ICONS: Record<string, Icon> = {
  site: Gear,
  artist: UserCircle,
  content: Disc,
  shop: Package,
  support: Heartbeat,
  ai: Robot,
  system: Lock,
}

function NavLink({ item, onClick }: { item: AdminNavItemData; onClick?: () => void }) {
  const pathname = usePathname()
  const active = isNavItemActive(pathname, item)
  const Icon = NAV_ICONS[item.href] ?? House

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={item.label}
      className={[
        'flex min-h-11 items-center gap-3 rounded px-3 py-3 text-sm font-medium transition-colors',
        active
          ? 'bg-red-900/30 text-red-400 border border-red-900/40'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent',
      ].join(' ')}
    >
      <Icon weight={active ? 'fill' : 'regular'} className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

function HelpSearchButton({ onClick }: { onClick?: () => void }) {
  const shortcutLabel = getAdminHelpShortcutLabel()

  return (
    <button
      type="button"
      onClick={() => {
        openAdminHelp()
        onClick?.()
      }}
      className="w-full flex items-center gap-2 rounded px-3 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors text-left mb-3 min-h-[44px]"
      aria-label="Open admin help and quick search"
    >
      <MagnifyingGlass className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 min-w-0 leading-snug">Help &amp; Search</span>
      <kbd className="shrink-0 text-[10px] font-mono text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5">
        {shortcutLabel}
      </kbd>
    </button>
  )
}

function NavLinks({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()
  const activeGroupId = resolveActiveNavGroupId(pathname)
  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({})
  const accordionId = useId()

  return (
    <nav className="flex flex-col gap-2" aria-label="Admin navigation">
      {/* The dashboard is always visible, not buried inside an accordion. */}
      <div className="pb-2 border-b border-zinc-800/80">
        <NavLink item={ADMIN_NAV_GROUPS[0].items[0]} onClick={onNavClick} />
      </div>
      <div className="flex flex-col gap-1">
        {ADMIN_NAV_GROUPS.filter((group) => group.id !== 'overview').map((group) => {
          const expanded = expandedOverrides[group.id] ?? group.id === activeGroupId
          const GroupIcon = NAV_GROUP_ICONS[group.id] ?? Gear
          const containsActive = group.id === activeGroupId
          const panelId = `${accordionId}-${group.id}`

          return (
            <section key={group.id}>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setExpandedOverrides((prev) => ({
                  ...prev,
                  [group.id]: !expanded,
                }))}
                className={[
                  'flex w-full min-h-11 items-center gap-2.5 rounded px-3 py-2.5 text-left text-xs font-semibold transition-colors',
                  containsActive
                    ? 'text-zinc-100 bg-zinc-900/80'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
                ].join(' ')}
              >
                <GroupIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{group.label}</span>
                <CaretDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={panelId}
                role="group"
                aria-label={group.label}
                className={`ml-5 mt-0.5 mb-2 border-l border-zinc-800 pl-2 flex-col gap-0.5 ${expanded ? 'flex' : 'hidden'}`}
              >
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} onClick={onNavClick} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </nav>
  )
}

interface AdminNavProps {
  /** Mobile header + drawer only (desktop sidebar rendered by AdminShell). */
  mobileOnly?: boolean
  /** Desktop sidebar only (inside resizable panel). */
  sidebarOnly?: boolean
  className?: string
}

function SignOutButton({ onClick }: { onClick?: () => void }) {
  return (
    <form method="POST" action="/admin/logout" className="contents">
      <button
        type="submit"
        onClick={onClick}
        className="w-full flex min-h-11 items-center gap-3 rounded px-3 py-2 text-sm font-medium text-red-400 hover:bg-zinc-900 hover:text-red-300 transition-colors text-left"
      >
        <SignOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        Sign Out
      </button>
    </form>
  )
}

function DesktopSidebar({ className = '' }: { className?: string }) {
  return (
    <aside className={`flex flex-col w-full bg-zinc-950 border-r border-zinc-800 min-h-0 h-full ${className}`}>
      <div className="p-4 border-b border-zinc-800 shrink-0">
        <span className="font-mono font-bold tracking-[0.2em] text-sm text-white uppercase">Neuroklast</span>
        <span className="ml-2 text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Admin</span>
      </div>
      <div className="shrink-0 px-3 pt-3">
        <HelpSearchButton />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
        <NavLinks />
      </div>
      <div className="shrink-0 border-t border-zinc-800 px-3 py-2">
        <SignOutButton />
      </div>
    </aside>
  )
}

export function AdminNav({ mobileOnly = false, sidebarOnly = false, className = '' }: AdminNavProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const showMobile = !sidebarOnly
  const showDesktop = !mobileOnly

  useEffect(() => {
    if (!mobileOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  return (
    <>
      {showDesktop ? (
        sidebarOnly ? (
          <DesktopSidebar className={className} />
        ) : (
          <div className="hidden md:block">
            <DesktopSidebar />
          </div>
        )
      ) : null}

      {showMobile ? (
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span className="font-mono font-bold tracking-[0.2em] text-sm text-white uppercase">
          Neuroklast <span className="text-zinc-500 text-[10px] font-mono">Admin</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Open admin help and quick search"
            onClick={() => openAdminHelp()}
            className="inline-flex items-center justify-center text-zinc-400 hover:text-white p-2 min-h-[44px] min-w-[44px] rounded transition-colors"
          >
            <MagnifyingGlass className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center text-zinc-400 hover:text-white p-2 min-h-[44px] min-w-[44px] rounded transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        </div>
      </div>
      ) : null}

      {showMobile && mobileOpen ? (
        <>
        <div
          className="md:hidden fixed inset-0 z-[55] bg-black/80"
          onClick={() => setMobileOpen(false)}
        />
      <aside
        className="md:hidden fixed inset-y-0 left-0 z-[60] w-72 max-w-[90vw] bg-zinc-950 border-r border-zinc-800 flex flex-col"
        aria-label="Mobile admin navigation"
      >
        <div className="p-4 border-b border-zinc-800 flex shrink-0 items-center justify-between">
          <span className="font-mono font-bold tracking-[0.2em] text-sm text-white uppercase">Admin</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center text-zinc-400 hover:text-white p-2 min-h-[44px] min-w-[44px] rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="shrink-0 px-3 pt-3">
          <HelpSearchButton onClick={() => setMobileOpen(false)} />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
          <NavLinks onNavClick={() => setMobileOpen(false)} />
        </div>
        <div className="shrink-0 border-t border-zinc-800 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <SignOutButton onClick={() => setMobileOpen(false)} />
        </div>
      </aside>
        </>
      ) : null}
    </>
  )
}