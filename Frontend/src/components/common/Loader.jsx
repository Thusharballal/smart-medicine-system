import React from 'react'

/**
 * Loader – full-screen or inline spinner.
 *
 * Props:
 *   fullScreen – centres spinner in the viewport (default: false)
 *   size       – sm | md | lg (default: 'md')
 *   label      – aria-label / visible text for screen readers
 *   className  – extra wrapper classes
 */
const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
}

function Loader({ fullScreen = false, size = 'md', label = 'Loading…', className = '' }) {
  const spinner = (
    <div
      role="status"
      aria-label={label}
      className={`flex flex-col items-center gap-3 ${className}`}
    >
      <div
        className={[
          'rounded-full border-t-primary-900 border-gray-200',
          'animate-spin dark:border-gray-700 dark:border-t-primary-400',
          sizeMap[size] ?? sizeMap.md,
        ].join(' ')}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default Loader
