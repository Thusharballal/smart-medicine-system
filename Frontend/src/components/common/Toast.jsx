import React, { useEffect, useCallback, createContext, useContext, useReducer } from 'react'
import { createPortal } from 'react-dom'
import {
  RiCheckboxCircleLine, RiErrorWarningLine,
  RiInformationLine,   RiAlertLine, RiCloseLine,
} from 'react-icons/ri'

const ToastContext = createContext(null)

function toastReducer(state, action) {
  if (action.type === 'ADD')    return [...state, action.toast]
  if (action.type === 'REMOVE') return state.filter(t => t.id !== action.id)
  return state
}

let _tid = 0

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, [])

  const toast = useCallback((message, options = {}) => {
    const id = ++_tid
    dispatch({ type: 'ADD', toast: { id, message, variant: options.variant ?? 'info', duration: options.duration ?? 5000, action: options.action ?? null } })
    return id
  }, [])

  const dismiss = useCallback(id => dispatch({ type: 'REMOVE', id }), [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

const variantConfig = {
  success: { Icon: RiCheckboxCircleLine, bar: 'bg-accent-500',   iconClass: 'text-accent-600  dark:text-accent-400',  label: 'Success' },
  error:   { Icon: RiErrorWarningLine,   bar: 'bg-danger-500',   iconClass: 'text-danger-600  dark:text-danger-400',  label: 'Error'   },
  warning: { Icon: RiAlertLine,          bar: 'bg-warning-500',  iconClass: 'text-warning-600 dark:text-warning-400', label: 'Warning' },
  info:    { Icon: RiInformationLine,    bar: 'bg-primary-600',  iconClass: 'text-primary-700 dark:text-primary-400', label: 'Info'    },
}

function ToastItem({ toast, dismiss }) {
  const { id, message, variant, duration, action } = toast
  const cfg  = variantConfig[variant] ?? variantConfig.info
  const Icon = cfg.Icon

  useEffect(() => {
    if (!duration) return
    const t = setTimeout(() => dismiss(id), duration)
    return () => clearTimeout(t)
  }, [id, duration, dismiss])

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={[
        'group relative flex items-start gap-3 w-full max-w-sm',
        'rounded-2xl bg-white dark:bg-gray-800',
        'shadow-floating ring-1 ring-gray-200/80 dark:ring-gray-700/60',
        'px-4 py-3.5 overflow-hidden',
        'animate-slide-in-right',
      ].join(' ')}
    >
      {/* Coloured left bar */}
      <div className={`absolute left-0 inset-y-0 w-1 rounded-l-2xl ${cfg.bar}`} aria-hidden="true" />

      {/* Icon */}
      <div className={`shrink-0 mt-0.5 p-1.5 rounded-xl ${cfg.bar.replace('bg-', 'bg-').replace('-500','-50').replace('-600','-50')} dark:bg-gray-700`} aria-hidden="true">
        <Icon size={15} className={cfg.iconClass} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug break-words">
          {message}
        </p>
        {action && (
          <button
            type="button"
            onClick={() => { action.onClick?.(); dismiss(id) }}
            className="mt-1 text-xs font-bold text-primary-700 dark:text-primary-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => dismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 mt-0.5 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
      >
        <RiCloseLine size={14} aria-hidden="true" />
      </button>

      {/* Progress bar */}
      {duration && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-700 rounded-b-2xl overflow-hidden" aria-hidden="true">
          <div
            className={`h-full ${cfg.bar} opacity-40 origin-left`}
            style={{ animation: `progressBar ${duration}ms linear forwards` }}
          />
        </div>
      )}
    </div>
  )
}

function ToastContainer({ toasts, dismiss }) {
  if (!toasts.length) return null
  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[200] flex flex-col gap-2.5 pointer-events-none w-full max-w-sm"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} dismiss={dismiss} />
        </div>
      ))}
    </div>,
    document.body,
  )
}

export default ToastItem
