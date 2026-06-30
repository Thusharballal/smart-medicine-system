import React from 'react'
import {
  RiBellLine,
  RiArchiveLine,
  RiMegaphoneLine,
  RiTimeLine,
} from 'react-icons/ri'

/**
 * NotificationCard – single notification row in the notification panel.
 *
 * Notification types:
 *   Price_Drop        – green bell icon
 *   Stock_Available   – blue box/archive icon
 *   System_Announcement – amber megaphone icon
 *
 * Props:
 *   notification – {
 *     id, type: 'Price_Drop' | 'Stock_Available' | 'System_Announcement',
 *     title, message, createdAt: ISO string, isRead: boolean,
 *     actionUrl?
 *   }
 *   onMarkRead    – (id) => void
 *   onActionClick – (notification) => void
 *   className
 */

const typeConfig = {
  Price_Drop: {
    Icon: RiBellLine,
    iconBg: 'bg-accent-100 dark:bg-accent-950',
    iconColor: 'text-accent-600 dark:text-accent-400',
    label: 'Price Drop',
  },
  Stock_Available: {
    Icon: RiArchiveLine,
    iconBg: 'bg-primary-50 dark:bg-primary-950',
    iconColor: 'text-primary-900 dark:text-primary-400',
    label: 'In Stock',
  },
  System_Announcement: {
    Icon: RiMegaphoneLine,
    iconBg: 'bg-warning-50 dark:bg-warning-950',
    iconColor: 'text-warning-600 dark:text-warning-400',
    label: 'Announcement',
  },
}

function timeAgo(isoString) {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diff = Math.floor((now - then) / 1000) // seconds

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function NotificationCard({ notification, onMarkRead, onActionClick, className = '' }) {
  if (!notification) return null

  const { id, type, title, message, createdAt, isRead, actionUrl } = notification
  const config = typeConfig[type] ?? typeConfig.System_Announcement
  const Icon = config.Icon

  return (
    <div
      role="article"
      aria-label={`Notification: ${title}`}
      className={[
        'flex gap-3 p-4 rounded-lg border transition-colors duration-150',
        isRead
          ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-70'
          : 'bg-primary-50/40 dark:bg-primary-950/30 border-primary-100 dark:border-primary-900',
        className,
      ].join(' ')}
    >
      {/* Icon */}
      <div
        className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${config.iconBg}`}
        aria-hidden="true"
      >
        <Icon size={18} className={config.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {config.label}
            </span>
            <p className={`text-sm font-semibold leading-snug ${isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>
              {title}
            </p>
          </div>
          {/* Unread dot */}
          {!isRead && (
            <span
              className="shrink-0 mt-1 h-2 w-2 rounded-full bg-primary-900 dark:bg-primary-400"
              aria-label="Unread notification"
            />
          )}
        </div>

        {message && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {message.length > 100 ? message.slice(0, 100) + '…' : message}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          {/* Time */}
          {createdAt && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <RiTimeLine size={11} aria-hidden="true" />
              <time dateTime={createdAt}>{timeAgo(createdAt)}</time>
            </span>
          )}

          {/* View link */}
          {actionUrl && onActionClick && (
            <button
              type="button"
              onClick={() => onActionClick(notification)}
              className="text-xs font-medium text-primary-900 dark:text-primary-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600"
            >
              View
            </button>
          )}

          {/* Mark as read */}
          {!isRead && onMarkRead && (
            <button
              type="button"
              onClick={() => onMarkRead(id)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600"
              aria-label="Mark notification as read"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCard
