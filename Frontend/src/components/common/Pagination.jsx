import React from 'react'
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri'

/**
 * Pagination – accessible page navigation.
 *
 * Props:
 *   currentPage   – 1-based current page
 *   totalPages    – total page count
 *   onPageChange  – (page: number) => void
 *   siblingCount  – pages shown on each side of current (default: 1)
 *   className     – extra wrapper classes
 */

function range(start, end) {
  const length = end - start + 1
  return Array.from({ length }, (_, i) => start + i)
}

function getPages(current, total, siblings = 1) {
  const totalSlots = siblings * 2 + 5 // left + right ellipsis + first + last + current
  if (total <= totalSlots) return range(1, total)

  const leftSibling = Math.max(current - siblings, 1)
  const rightSibling = Math.min(current + siblings, total)

  const showLeftDots = leftSibling > 2
  const showRightDots = rightSibling < total - 1

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, 3 + siblings * 2)
    return [...leftRange, '…', total]
  }
  if (showLeftDots && !showRightDots) {
    const rightRange = range(total - (2 + siblings * 2), total)
    return [1, '…', ...rightRange]
  }
  return [1, '…', ...range(leftSibling, rightSibling), '…', total]
}

function PageButton({ page, isActive, onClick, disabled }) {
  if (page === '…') {
    return (
      <span className="px-2 py-1 text-sm text-gray-500 select-none" aria-hidden="true">
        …
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      disabled={disabled}
      aria-label={`Page ${page}`}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'min-w-[36px] h-9 px-2 rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
        isActive
          ? 'bg-primary-900 text-white dark:bg-primary-700'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {page}
    </button>
  )
}

function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1, className = '' }) {
  if (totalPages <= 1) return null

  const pages = getPages(currentPage, totalPages, siblingCount)

  return (
    <nav
      role="navigation"
      aria-label="Pagination navigation"
      className={`flex items-center gap-1 ${className}`}
    >
      {/* Previous */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className={[
          'h-9 w-9 flex items-center justify-center rounded-md',
          'text-gray-600 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
          'transition-colors',
          currentPage === 1 ? 'opacity-40 cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <RiArrowLeftSLine size={20} aria-hidden="true" />
      </button>

      {pages.map((page, idx) => (
        <PageButton
          key={`${page}-${idx}`}
          page={page}
          isActive={page === currentPage}
          onClick={onPageChange}
          disabled={page === '…'}
        />
      ))}

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className={[
          'h-9 w-9 flex items-center justify-center rounded-md',
          'text-gray-600 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
          'transition-colors',
          currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <RiArrowRightSLine size={20} aria-hidden="true" />
      </button>
    </nav>
  )
}

export default Pagination
