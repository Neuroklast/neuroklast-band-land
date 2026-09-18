'use client'

import type { ReactNode } from 'react'
import { OverlayFrame, OverlayItem, OverlayReveal } from '@/components/motion/overlay-motion'
import type { OverlayType } from '@/lib/overlay-choreography'

function Bar({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted/40 ${className ?? ''}`} />
}

function LabelBar({ className = 'w-24' }: { className?: string }) {
  return <Bar className={`h-2 ${className}`} />
}

function MemberSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <OverlayItem className="relative h-40 w-40 shrink-0 bg-muted/40 sm:h-48 sm:w-48">
        <OverlayFrame />
      </OverlayItem>
      <div className="min-w-0 flex-1 space-y-3">
        <OverlayItem>
          <LabelBar />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-7 w-2/3" />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-3 w-1/3" />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-2 w-full" />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-2 w-5/6" />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-9 w-28" />
        </OverlayItem>
      </div>
    </div>
  )
}

function NewsSkeleton() {
  return (
    <div className="space-y-6">
      <OverlayItem className="relative h-48 w-full overflow-hidden bg-muted/40">
        <OverlayFrame />
      </OverlayItem>
      <div className="space-y-3">
        <OverlayItem>
          <LabelBar className="w-20" />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-3 w-28" />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-7 w-3/4" />
        </OverlayItem>
        <OverlayItem className="space-y-2">
          <Bar className="h-2 w-full" />
          <Bar className="h-2 w-11/12" />
          <Bar className="h-2 w-4/5" />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-9 w-32" />
        </OverlayItem>
      </div>
    </div>
  )
}

function GigSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <OverlayItem>
          <LabelBar className="w-40" />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-3 w-24" />
        </OverlayItem>
        <OverlayItem className="relative h-40 w-full overflow-hidden bg-muted/40">
          <OverlayFrame />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-8 w-2/3" />
        </OverlayItem>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <OverlayItem className="space-y-3 border border-border p-4">
          <LabelBar className="w-16" />
          <Bar className="h-5 w-3/4" />
          <Bar className="h-2 w-1/2" />
        </OverlayItem>
        <OverlayItem className="space-y-3 border border-border p-4">
          <LabelBar className="w-20" />
          <Bar className="h-5 w-2/3" />
          <Bar className="h-2 w-1/3" />
        </OverlayItem>
      </div>
      <OverlayItem className="flex flex-wrap gap-2">
        <Bar className="h-7 w-24" />
        <Bar className="h-7 w-20" />
        <Bar className="h-7 w-28" />
      </OverlayItem>
      <OverlayItem className="flex flex-wrap gap-3">
        <Bar className="h-10 w-32" />
        <Bar className="h-10 w-32" />
      </OverlayItem>
    </div>
  )
}

function ReleaseSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <OverlayItem className="relative aspect-square w-full overflow-hidden bg-muted/40">
          <OverlayFrame />
        </OverlayItem>
        <div className="space-y-3">
          <OverlayItem>
            <LabelBar className="w-36" />
          </OverlayItem>
          <OverlayItem>
            <Bar className="h-7 w-3/4" />
          </OverlayItem>
          <OverlayItem>
            <Bar className="h-3 w-1/2" />
          </OverlayItem>
          <OverlayItem>
            <Bar className="h-2 w-full" />
          </OverlayItem>
          <OverlayItem className="flex flex-wrap gap-2">
            <Bar className="h-8 w-24" />
            <Bar className="h-8 w-24" />
            <Bar className="h-8 w-24" />
          </OverlayItem>
        </div>
      </div>
      <OverlayItem className="space-y-2 border-t border-border pt-4">
        <Bar className="h-2 w-full" />
        <Bar className="h-2 w-5/6" />
        <Bar className="h-2 w-3/4" />
        <Bar className="h-2 w-4/5" />
      </OverlayItem>
    </div>
  )
}

function GallerySkeleton() {
  return (
    <div className="space-y-4">
      <OverlayItem>
        <LabelBar className="w-32" />
      </OverlayItem>
      <OverlayItem className="relative min-h-[40vh] w-full overflow-hidden bg-muted/40">
        <OverlayFrame />
      </OverlayItem>
      <OverlayItem className="flex justify-center gap-2">
        <Bar className="h-2 w-2" />
        <Bar className="h-2 w-2" />
        <Bar className="h-2 w-2" />
        <Bar className="h-2 w-2" />
      </OverlayItem>
    </div>
  )
}

function ContactSkeleton() {
  return (
    <div className="space-y-6">
      <OverlayItem>
        <LabelBar className="w-32" />
      </OverlayItem>
      <OverlayItem>
        <Bar className="h-8 w-1/2" />
      </OverlayItem>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <OverlayItem key={i} className="space-y-2 border border-border p-4">
            <Bar className="h-2 w-16" />
            <Bar className="h-3 w-3/4" />
            <Bar className="h-2 w-1/2" />
          </OverlayItem>
        ))}
      </div>
      <OverlayItem className="space-y-3 border border-border p-4">
        <Bar className="h-2 w-24" />
        <Bar className="h-10 w-full" />
        <Bar className="h-10 w-full" />
        <Bar className="h-20 w-full" />
      </OverlayItem>
    </div>
  )
}

function PartnerSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <OverlayItem className="relative h-24 w-full max-w-[200px] overflow-hidden bg-muted/40">
        <OverlayFrame />
      </OverlayItem>
      <div className="flex-1 space-y-3">
        <OverlayItem>
          <Bar className="h-6 w-1/2" />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-2 w-full" />
        </OverlayItem>
        <OverlayItem>
          <Bar className="h-2 w-5/6" />
        </OverlayItem>
        <OverlayItem className="flex gap-2">
          <Bar className="h-8 w-8" />
          <Bar className="h-8 w-8" />
          <Bar className="h-8 w-8" />
        </OverlayItem>
      </div>
    </div>
  )
}

function ExplorerSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <OverlayItem className="space-y-2 border border-border p-4">
        <Bar className="h-2 w-20" />
        <Bar className="h-2 w-28" />
        <Bar className="h-2 w-24" />
        <Bar className="h-2 w-16" />
      </OverlayItem>
      <OverlayItem className="space-y-3 border border-border p-4">
        <Bar className="h-5 w-1/2" />
        <Bar className="h-2 w-full" />
        <Bar className="h-2 w-4/5" />
      </OverlayItem>
    </div>
  )
}

function GenericSkeleton() {
  return (
    <div className="space-y-4">
      <OverlayItem>
        <LabelBar className="w-28" />
      </OverlayItem>
      <OverlayItem>
        <Bar className="h-7 w-2/3" />
      </OverlayItem>
      <OverlayItem className="space-y-2">
        <Bar className="h-2 w-full" />
        <Bar className="h-2 w-5/6" />
        <Bar className="h-2 w-3/4" />
      </OverlayItem>
    </div>
  )
}

const SKELETONS: Record<string, () => ReactNode> = {
  member: MemberSkeleton,
  news: NewsSkeleton,
  gig: GigSkeleton,
  release: ReleaseSkeleton,
  gallery: GallerySkeleton,
  media: GenericSkeleton,
  contact: ContactSkeleton,
  partner: PartnerSkeleton,
  explorer: ExplorerSkeleton,
}

/**
 * Type-aware boot layer: assembles a ghost of the real content skeleton while
 * the shell transitions from loading to the live body.
 */
export function OverlaySkeletonBoot({ type }: { type: OverlayType }) {
  const Skeleton = SKELETONS[type] ?? GenericSkeleton
  return (
    <div className="min-h-[min(400px,50vh)] px-4 py-14 md:px-12">
      <OverlayReveal stagger={0.05} delayChildren={0.02}>
        <Skeleton />
      </OverlayReveal>
    </div>
  )
}
