import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { RiErrorWarningLine } from 'react-icons/ri'

/**
 * ConfirmDialog – confirmation modal with customisable intent.
 *
 * Props:
 *   isOpen      – controls visibility
 *   onClose     – cancel callback
 *   onConfirm   – confirm callback
 *   title       – dialog heading (default: 'Are you sure?')
 *   message     – body text or React node
 *   confirmLabel– confirm button text (default: 'Confirm')
 *   cancelLabel – cancel button text (default: 'Cancel')
 *   intent      – 'danger' | 'warning' | 'primary' (default: 'danger')
 *   loading     – disables buttons and shows spinner on confirm
 *   icon        – override the header icon (React node)
 */
const intentConfig = {
  danger: {
    iconClass: 'text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-950',
    confirmVariant: 'danger',
  },
  warning: {
    iconClass: 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-950',
    confirmVariant: 'primary',
  },
  primary: {
    iconClass: 'text-primary-900 dark:text-primary-400 bg-primary-50 dark:bg-primary-950',
    confirmVariant: 'primary',
  },
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  intent = 'danger',
  loading = false,
  icon,
}) {
  const config = intentConfig[intent] ?? intentConfig.danger

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showClose={false}
      title={null}
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            size="md"
            onClick={onConfirm}
            loading={loading}
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`p-3 rounded-full ${config.iconClass}`}>
          {icon ?? <RiErrorWarningLine size={28} aria-hidden="true" />}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {title}
          </h3>
          {message && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
