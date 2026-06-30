import React, { useId } from 'react'

/**
 * Input – premium accessible labelled input.
 */
function Input({
  label,
  id: idProp,
  error,
  helpText,
  leftIcon,
  rightIcon,
  required = false,
  disabled = false,
  className = '',
  inputClass = '',
  ...rest
}) {
  const autoId    = useId()
  const inputId   = idProp ?? autoId
  const errorId   = error    ? `${inputId}-error` : undefined
  const helpId    = helpText ? `${inputId}-help`  : undefined
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined

  const borderClass = error
    ? 'border-danger-400 dark:border-danger-500 bg-danger-50/30 dark:bg-danger-950/20'
    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'

  const focusClass = error
    ? 'focus:border-danger-500 focus:ring-0'
    : 'focus:border-primary-500 dark:focus:border-primary-400 focus:ring-0'

  const shadowClass = error
    ? 'focus:shadow-input-error'
    : 'focus:shadow-input-focus'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-danger-500 dark:text-danger-400" aria-hidden="true"> *</span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 flex items-center text-gray-400 dark:text-gray-500 pointer-events-none z-10" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={[
            'w-full rounded-xl border bg-white dark:bg-gray-800/80',
            'text-sm text-gray-900 dark:text-gray-100',
            'py-2.5 px-3.5',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'transition-all duration-200',
            'outline-none',
            'shadow-xs',
            borderClass,
            focusClass,
            shadowClass,
            leftIcon  ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            disabled  ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50' : '',
            inputClass,
          ].filter(Boolean).join(' ')}
          {...rest}
        />

        {rightIcon && (
          <span className="absolute right-3.5 flex items-center text-gray-400 dark:text-gray-500 z-10" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger-600 dark:text-danger-400 flex items-center gap-1 leading-none">
          <span aria-hidden="true">↑</span>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={helpId} className="text-xs text-gray-500 dark:text-gray-400 leading-none">
          {helpText}
        </p>
      )}
    </div>
  )
}

export default Input
