import React from 'react'

/**
 * Button – premium multi-variant button.
 * Variants: primary | secondary | outline | ghost | danger | success
 * Sizes:    sm | md | lg
 */

const variantClasses = {
  primary:
    'bg-gradient-to-b from-primary-600 to-primary-800 text-white ' +
    'hover:from-primary-500 hover:to-primary-700 ' +
    'active:from-primary-700 active:to-primary-900 ' +
    'shadow-sm hover:shadow-md hover:shadow-primary-500/20 ' +
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ' +
    'dark:from-primary-600 dark:to-primary-800',
  secondary:
    'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 ' +
    'border border-gray-200 dark:border-gray-700 ' +
    'hover:bg-gray-50 dark:hover:bg-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 ' +
    'active:bg-gray-100 dark:active:bg-gray-700 ' +
    'shadow-xs hover:shadow-sm ' +
    'focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
  outline:
    'border border-primary-400 dark:border-primary-500 text-primary-700 dark:text-primary-400 bg-transparent ' +
    'hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:border-primary-500 ' +
    'active:bg-primary-100 dark:active:bg-primary-950 ' +
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  ghost:
    'text-gray-600 dark:text-gray-400 bg-transparent ' +
    'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 ' +
    'active:bg-gray-200 dark:active:bg-gray-700 ' +
    'focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
  danger:
    'bg-gradient-to-b from-danger-500 to-danger-700 text-white ' +
    'hover:from-danger-400 hover:to-danger-600 ' +
    'active:from-danger-600 active:to-danger-800 ' +
    'shadow-sm hover:shadow-md hover:shadow-danger-500/20 ' +
    'focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2',
  success:
    'bg-gradient-to-b from-accent-500 to-accent-700 text-white ' +
    'hover:from-accent-400 hover:to-accent-600 ' +
    'active:from-accent-600 active:to-accent-800 ' +
    'shadow-sm hover:shadow-md hover:shadow-accent-500/20 ' +
    'focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
}

const sizeClasses = {
  xs: 'px-2.5 py-1 text-xs gap-1 min-h-[30px] rounded-lg',
  sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[34px] rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 min-h-[40px] rounded-xl',
  lg: 'px-5 py-2.5 text-base gap-2 min-h-[46px] rounded-xl',
  xl: 'px-6 py-3 text-base gap-2.5 min-h-[52px] rounded-2xl',
}

function Spinner({ size }) {
  const s = size === 'sm' || size === 'xs' ? 14 : 16
  return (
    <svg className="animate-spin shrink-0" width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-150',
        'focus-visible:outline-none',
        variantClasses[variant] ?? variantClasses.primary,
        sizeClasses[size] ?? sizeClasses.md,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none saturate-50' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {loading
        ? <Spinner size={size} />
        : leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children && <span className="truncate">{children}</span>}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
}

export default Button
