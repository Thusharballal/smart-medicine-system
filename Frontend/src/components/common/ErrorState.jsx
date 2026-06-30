import React from 'react'
import { RiErrorWarningLine, RiWifiOffLine, RiFileList2Line } from 'react-icons/ri'
import Button from './Button'

/**
 * ErrorState – error / failure placeholder with retry support.
 *
 * Props:
 *   variant     – 'generic' | 'network' | 'notFound' | 'forbidden' (default: 'generic')
 *   title       – override heading
 *   description – override description
 *   onRetry     – if provided, shows a "Try again" button
 *   onHome      – if provided, shows a "Go home" button
 *   className   – extra wrapper classes
 */

const presets = {
  generic: {
    Icon: RiErrorWarningLine,
    iconClass: 'text-danger-500 dark:text-danger-400',
    bgClass: 'bg-danger-50 dark:bg-danger-950',
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
  },
  network: {
    Icon: RiWifiOffLine,
    iconClass: 'text-warning-600 dark:text-warning-400',
    bgClass: 'bg-warning-50 dark:bg-warning-950',
    title: 'Network error',
    description: 'Unable to connect. Please check your internet connection and try again.',
  },
  notFound: {
    Icon: RiFileList2Line,
    iconClass: 'text-gray-400 dark:text-gray-500',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    title: 'Not found',
    description: 'The resource you requested could not be found.',
  },
  forbidden: {
    Icon: RiErrorWarningLine,
    iconClass: 'text-warning-600 dark:text-warning-400',
    bgClass: 'bg-warning-50 dark:bg-warning-950',
    title: 'Access denied',
    description: "You don't have permission to view this content.",
  },
}

function ErrorState({
  variant = 'generic',
  title,
  description,
  onRetry,
  onHome,
  className = '',
}) {
  const preset = presets[variant] ?? presets.generic
  const { Icon, iconClass, bgClass } = preset
  const displayTitle = title ?? preset.title
  const displayDesc = description ?? preset.description

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      <div className={`mb-5 p-4 rounded-full ${bgClass}`} aria-hidden="true">
        <Icon size={36} className={iconClass} aria-hidden="true" />
      </div>

      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {displayTitle}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{displayDesc}</p>

      {(onRetry || onHome) && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
          {onRetry && (
            <Button variant="primary" size="md" onClick={onRetry}>
              Try again
            </Button>
          )}
          {onHome && (
            <Button variant="ghost" size="md" onClick={onHome}>
              Go home
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default ErrorState
