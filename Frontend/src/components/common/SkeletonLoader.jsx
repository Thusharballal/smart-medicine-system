import React from 'react'

/**
 * SkeletonLoader – animated placeholder UI for loading states.
 *
 * Variants:
 *   text         – single line of text width
 *   paragraph    – 3 stacked text lines
 *   card         – a generic card placeholder (image + text lines)
 *   medicineCard – medicine search result card skeleton
 *   pharmacyCard – pharmacy list card skeleton
 *   dashboardCard– stat card skeleton
 *   avatar       – circular avatar placeholder
 *   custom       – renders children as skeleton cells
 *
 * Props:
 *   variant   – shape preset (default: 'card')
 *   count     – how many skeleton cards to render (default: 1)
 *   className – extra classes on the wrapper
 */

function SkeletonLine({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

function MedicineCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col gap-3">
      <SkeletonLine className="h-3 w-20 rounded-full" />
      <SkeletonLine className="h-5 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
      <div className="flex gap-2 mt-1">
        <SkeletonLine className="h-6 w-16 rounded-full" />
        <SkeletonLine className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center mt-2">
        <SkeletonLine className="h-6 w-20" />
        <SkeletonLine className="h-9 w-28 rounded-md" />
      </div>
    </div>
  )
}

function PharmacyCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex gap-4">
      <SkeletonLine className="h-14 w-14 rounded-full shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <SkeletonLine className="h-4 w-1/2" />
        <SkeletonLine className="h-3 w-3/4" />
        <SkeletonLine className="h-3 w-1/3" />
      </div>
    </div>
  )
}

function DashboardCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col gap-3">
      <SkeletonLine className="h-4 w-24" />
      <SkeletonLine className="h-8 w-16" />
      <SkeletonLine className="h-3 w-32" />
    </div>
  )
}

function TextSkeleton() {
  return <SkeletonLine className="h-4 w-full max-w-xs" />
}

function ParagraphSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-5/6" />
      <SkeletonLine className="h-3 w-4/6" />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col gap-3">
      <SkeletonLine className="h-36 w-full rounded-md" />
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-3 w-1/2" />
      <SkeletonLine className="h-9 w-full rounded-md mt-2" />
    </div>
  )
}

function AvatarSkeleton() {
  return <SkeletonLine className="h-10 w-10 rounded-full" />
}

const variantMap = {
  text: TextSkeleton,
  paragraph: ParagraphSkeleton,
  card: CardSkeleton,
  medicineCard: MedicineCardSkeleton,
  pharmacyCard: PharmacyCardSkeleton,
  dashboardCard: DashboardCardSkeleton,
  avatar: AvatarSkeleton,
}

function SkeletonLoader({ variant = 'card', count = 1, className = '', children }) {
  if (variant === 'custom') {
    return (
      <div className={`skeleton ${className}`} aria-hidden="true" aria-label="Loading">
        {children}
      </div>
    )
  }

  const Skeleton = variantMap[variant] ?? CardSkeleton

  return (
    <div role="status" aria-label="Loading content" className={className}>
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  )
}

export default SkeletonLoader
