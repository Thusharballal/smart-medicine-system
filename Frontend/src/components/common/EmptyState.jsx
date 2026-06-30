import React from 'react'
import { RiSearchLine, RiFileList2Line } from 'react-icons/ri'
import Button from './Button'

/**
 * EmptyState – no-results / no-data placeholder.
 *
 * Props:
 *   icon        – React node for the illustration (default: search icon)
 *   title       – heading text
 *   description – supporting text
 *   action      – { label, onClick, variant? } primary CTA
 *   secondaryAction – { label, onClick } secondary CTA
 *   className   – extra wrapper classes
 */
function EmptyState({
  icon,
  title = 'No results found',
  description,
  action,
  secondaryAction,
  className = '',
}) {
  const Icon = icon ? null : RiSearchLine

  return (
    <div
      role="status"
      aria-label={title}
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      {/* Illustration */}
      <div
        className="mb-5 p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
        aria-hidden="true"
      >
        {icon ?? <Icon size={36} />}
      </div>

      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
          {action && (
            <Button
              variant={action.variant ?? 'primary'}
              size="md"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" size="md" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
