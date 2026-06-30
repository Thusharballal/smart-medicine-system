import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { RiHome5Line, RiArrowRightSLine } from 'react-icons/ri'

/**
 * Breadcrumb – automatic route-aware breadcrumb trail.
 *
 * Can be used in two modes:
 *
 * 1. Auto mode – pass `routeLabels` map; component derives crumbs from useLocation.
 *    routeLabels: { '/dashboard/user': 'My Dashboard', '/medicines': 'Medicines', … }
 *
 * 2. Manual mode – pass explicit `items` array.
 *    items: [{ label: 'Home', href: '/' }, { label: 'Medicines', href: '/medicines' }, { label: 'Paracetamol' }]
 *
 * Props:
 *   items        – manual breadcrumb items (array of { label, href? })
 *   routeLabels  – path → label map for auto mode
 *   showHome     – prepend a home icon crumb (default: true)
 *   className    – extra wrapper classes
 */

function Breadcrumb({ items, routeLabels = {}, showHome = true, className = '' }) {
  const location = useLocation()

  // Auto-derive crumbs from the current path if items not provided
  const crumbs = items ?? (() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.map((seg, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/')
      const label = routeLabels[href] ?? seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      return { label, href }
    })
  })()

  const allCrumbs = showHome ? [{ label: 'Home', href: '/', icon: true }, ...crumbs] : crumbs

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
        role="list"
      >
        {allCrumbs.map((crumb, idx) => {
          const isLast = idx === allCrumbs.length - 1

          return (
            <li key={idx} className="flex items-center gap-1">
              {idx > 0 && (
                <RiArrowRightSLine
                  size={16}
                  className="text-gray-400 dark:text-gray-600 shrink-0"
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]"
                >
                  {crumb.icon ? (
                    <span className="flex items-center gap-1">
                      <RiHome5Line size={15} aria-hidden="true" />
                      <span className="sr-only">Home</span>
                    </span>
                  ) : (
                    crumb.label
                  )}
                </span>
              ) : (
                <Link
                  to={crumb.href}
                  className="hover:text-primary-900 dark:hover:text-primary-400 transition-colors
                             truncate max-w-[180px] focus-visible:outline-none
                             focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
                >
                  {crumb.icon ? (
                    <span className="flex items-center gap-1">
                      <RiHome5Line size={15} aria-hidden="true" />
                      <span className="sr-only">Home</span>
                    </span>
                  ) : (
                    crumb.label
                  )}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
