import React, { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { RiCloseLine } from 'react-icons/ri'

const sizeMap = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
  full: 'max-w-full mx-4',
}

function Modal({ isOpen, onClose, title, size = 'md', showClose = true, children, footer, className = '' }) {
  const dialogRef = useRef(null)
  const prevFocusRef = useRef(null)

  const handleKey = useCallback((e) => {
    if (!isOpen) return
    if (e.key === 'Escape') { onClose?.(); return }
    if (e.key !== 'Tab') return
    const d = dialogRef.current
    if (!d) return
    const els = d.querySelectorAll('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])')
    const first = els[0]; const last = els[els.length - 1]
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus() } }
    else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus() } }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
      setTimeout(() => dialogRef.current?.focus(), 60)
    } else {
      document.body.style.overflow = ''
      prevFocusRef.current?.focus()
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={[
          'relative z-10 w-full flex flex-col max-h-[90vh]',
          'bg-white dark:bg-gray-800',
          'rounded-3xl',
          'shadow-modal',
          'ring-1 ring-gray-200/80 dark:ring-gray-700/60',
          'animate-scale-in',
          'focus:outline-none',
          sizeMap[size] ?? sizeMap.md,
          className,
        ].filter(Boolean).join(' ')}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-gray-700/60 shrink-0">
            {title && (
              <h2 id="modal-title" className="text-lg font-bold text-gray-900 dark:text-gray-100 font-display tracking-tight">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="ml-auto -mr-1 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all duration-150"
              >
                <RiCloseLine size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/60 shrink-0 bg-gray-50/60 dark:bg-gray-800/40 rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
