import { useCallback, useEffect, useState } from 'react'
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineArrowPath,
} from 'react-icons/hi2'
import NotificationCard from '../../components/cards/NotificationCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/feedback/EmptyState'
import notificationService from '../../services/notificationService'

// ============================================================
// Format notification time
// ============================================================
function formatNotificationTime(value) {
  if (!value) {
    return ''
  }
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (seconds < 60) {
    return 'Just now'
  }
  if (minutes < 60) {
    return `${minutes} min ago`
  }
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  }
  if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
// ============================================================
// Map backend notification → frontend notification
// ============================================================
function mapNotification(notification) {
  return {
    ...notification,
    // Backend → frontend naming
    isRead: Boolean(notification.is_read),
    // Backend created_at → UI time
    time: formatNotificationTime(notification.created_at),
  }
}
// ============================================================
// Notifications Page
// ============================================================
function NotificationsPage() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isError, setIsError] = useState(false)
  const [actionId, setActionId] = useState(null)
  // ============================================================
  // Load notifications
  // ============================================================
  const loadNotifications = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setIsError(false)
      const response = await notificationService.getAll()
      const notifications = Array.isArray(response.data)
        ? response.data.map(mapNotification)
        : []
      setItems(notifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setIsError(true)
      setItems([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // ============================================================
  // Initial load
  // ============================================================
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])
  // ============================================================
  // Mark one notification as read
  // ============================================================
  const handleRead = async (id) => {
    try {
      setActionId(id)
      await notificationService.markAsRead(id)
      setItems((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      )
    } catch (error) {
      console.error(
        'Failed to mark notification as read:',
        error
      )
    } finally {
      setActionId(null)
    }
  }

  // ============================================================
  // Delete notification
  // ============================================================
  const handleDelete = async (id) => {
    try {
      setActionId(id)

      await notificationService.delete(id)

      setItems((previous) =>
        previous.filter(
          (notification) => notification.id !== id
        )
      )
    } catch (error) {
      console.error(
        'Failed to delete notification:',
        error
      )
    } finally {
      setActionId(null)
    }
  }

  // ============================================================
  // Mark all notifications as read
  // ============================================================
  const handleReadAll = async () => {
    try {
      setActionId('all')

      await notificationService.markAllAsRead()

      setItems((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      )
    } catch (error) {
      console.error(
        'Failed to mark all notifications as read:',
        error
      )
    } finally {
      setActionId(null)
    }
  }

  // ============================================================
  // Count unread notifications
  // ============================================================
  const unread = items.filter(
    (notification) => !notification.isRead
  ).length

  return (
    <article
      aria-label="Notification Centre"
      className="w-full max-w-3xl mx-auto flex flex-col gap-5"
    >
      {/* ============================================================
          Header
         ============================================================ */}
      <div className="flex items-start justify-between gap-4">
        {/* Header title */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
            <HiOutlineBell
              size={22}
              className="text-warning-500 shrink-0"
              aria-hidden="true"
            />

            <span>Notifications</span>

            {unread > 0 && (
              <Badge
                variant="danger"
                size="sm"
              >
                {unread} new
              </Badge>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {items.length} notification
            {items.length !== 1 ? 's' : ''} · {unread} unread
          </p>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Refresh */}
          <button
            type="button"
            onClick={() => loadNotifications(true)}
            disabled={isRefreshing || isLoading}
            aria-label="Refresh notifications"
            className="
              flex
              items-center
              justify-center
              w-9
              h-9
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-500
              hover:text-primary-600
              hover:bg-primary-50
              transition-colors
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            <HiOutlineArrowPath
              size={17}
              className={
                isRefreshing ? 'animate-spin' : ''
              }
              aria-hidden="true"
            />
          </button>

          {/* Mark all as read */}
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={
                <HiOutlineCheckCircle size={14} />
              }
              onClick={handleReadAll}
              disabled={actionId === 'all'}
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================
          Loading
         ============================================================ */}
      {isLoading && (
        <div
          className="
            bg-white
            border
            border-slate-100
            rounded-2xl
            shadow-sm
            p-10
            text-center
          "
        >
          <div
            className="
              mx-auto
              w-8
              h-8
              rounded-full
              border-2
              border-primary-200
              border-t-primary-600
              animate-spin
            "
            aria-hidden="true"
          />

          <p className="text-sm text-slate-500 mt-4">
            Loading notifications...
          </p>
        </div>
      )}

      {/* ============================================================
          Error
         ============================================================ */}
      {!isLoading && isError && (
        <div
          className="
            bg-white
            border
            border-danger-100
            rounded-2xl
            shadow-sm
            p-8
            text-center
          "
        >
          <p className="text-sm font-semibold text-danger-600">
            Failed to load notifications.
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Please check your connection and try again.
          </p>

          <button
            type="button"
            onClick={() => loadNotifications()}
            className="
              mt-4
              px-4
              py-2
              rounded-lg
              bg-primary-600
              text-white
              text-xs
              font-semibold
              hover:bg-primary-700
              transition-colors
            "
          >
            Try Again
          </button>
        </div>
      )}

      {/* ============================================================
          Empty State
         ============================================================ */}
      {!isLoading &&
        !isError &&
        items.length === 0 && (
          <EmptyState
            title="You're all caught up"
            description="No notifications at the moment. We'll let you know when something important happens."
            size="md"
          />
        )}

      {/* ============================================================
          Notification List
         ============================================================ */}
      {!isLoading &&
        !isError &&
        items.length > 0 && (
          <div
            className="space-y-3"
            aria-live="polite"
            aria-label="Notification list"
          >
            {items.map((notification) => (
              <div
                key={notification.id}
                className="relative group"
              >
                {/* Notification card */}
                <NotificationCard
                  notification={notification}
                  onRead={() =>
                    handleRead(notification.id)
                  }
                  onClick={() => {
                    if (!notification.isRead) {
                      handleRead(notification.id)
                    }
                  }}
                />

                {/* Delete notification */}
                <button
                  type="button"
                  onClick={() =>
                    handleDelete(notification.id)
                  }
                  disabled={
                    actionId === notification.id
                  }
                  aria-label={`Delete notification: ${notification.title}`}
                  className="
                    absolute
                    top-3
                    right-3
                    opacity-0
                    group-hover:opacity-100
                    flex
                    items-center
                    justify-center
                    w-7
                    h-7
                    rounded-md
                    text-slate-300
                    hover:text-danger-500
                    hover:bg-danger-50
                    transition-all
                    focus-visible:opacity-100
                    focus-visible:outline-none
                    focus-visible:ring-1
                    focus-visible:ring-danger-400
                    disabled:opacity-50
                  "
                >
                  <HiOutlineXMark
                    size={14}
                    aria-hidden="true"
                  />
                </button>
              </div>
            ))}
          </div>
        )}

      {/* ============================================================
          Notification Information
         ============================================================ */}
      <div
        className="
          mt-1
          p-4
          rounded-xl
          bg-slate-50
          border
          border-dashed
          border-slate-200
          text-center
        "
      >
        <p className="text-xs text-slate-400">
          You'll receive notifications about medicine
          availability, generic recommendations, pharmacy
          stock updates and reminders.
        </p>
      </div>
    </article>
  )
}

export default NotificationsPage