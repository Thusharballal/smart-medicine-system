import { useEffect, useState } from 'react'
import {
  HiOutlineBell,
  HiOutlineTrash,
  HiOutlineCheck,
} from 'react-icons/hi2'
import NotificationCard from '../../../components/cards/NotificationCard'
import Badge from '../../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import notificationService from '../../../services/notificationService'
// ======================================================
// Notification Center
// ======================================================
function NotificationCenter() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // ====================================================
  // Load notifications
  // ====================================================
  async function loadNotifications() {
    try {
      setLoading(true)
      setError('')
      const response = await notificationService.getAll()
      setItems(response.data || [])
    } catch (error) {
      console.error(
        'Failed to load notifications:',
        error
      )
      setError(
        error.response?.data?.detail ||
        'Failed to load notifications.'
      )
    } finally {
      setLoading(false)
    }
  }
  // ====================================================
  // Initial load
  // ====================================================
  useEffect(() => {
    loadNotifications()
  }, [])

  // ====================================================
  // Unread count
  // ====================================================
  const unread = items.filter(
    (notification) => !notification.is_read
  ).length
  // ====================================================
  // Mark single notification as read
  // ====================================================
  async function handleRead(id) {
    try {
      const response =
        await notificationService.markAsRead(id)
      const updatedNotification = response.data
      setItems((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? updatedNotification
            : notification
        )
      )
    } catch (error) {
      console.error(
        'Failed to mark notification as read:',
        error
      )
    }
  }
  // ====================================================
  // Mark all notifications as read
  // ====================================================
  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead()

      setItems((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      )
    } catch (error) {
      console.error(
        'Failed to mark all notifications as read:',
        error
      )
    }
  }

  // ====================================================
  // Delete notification
  // ====================================================
  async function handleDelete(id) {
    try {
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
    }
  }
  // ====================================================
  // Render
  // ====================================================
  return (
    <section
      aria-labelledby="notification-center-heading"
    >

      {/* ==================================================
          Header
         ================================================== */}

      <div className="flex items-center justify-between gap-3 mb-3">

        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          <h2
            id="notification-center-heading"
            className="
              text-base
              font-bold
              text-slate-900
              flex
              items-center
              gap-2
            "
          >
            <HiOutlineBell
              size={17}
              className="text-slate-400 shrink-0"
              aria-hidden="true"
            />

            <span>
              Notification Center
            </span>
          </h2>

          {unread > 0 && (
            <Badge
              variant="danger"
              size="sm"
            >
              {unread} new
            </Badge>
          )}

        </div>

        {/* Right */}

        <div className="flex items-center gap-3 shrink-0">

          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="
                hidden
                sm:inline-flex
                items-center
                gap-1
                text-xs
                font-medium
                text-slate-500
                hover:text-primary-600
                transition-colors
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary-500
                rounded
              "
            >
              <HiOutlineCheck
                size={13}
                aria-hidden="true"
              />

              Mark all read
            </button>
          )}

          <Link
            to={ROUTES.USER.NOTIFICATIONS}
            className="
              text-xs
              font-medium
              text-primary-600
              hover:text-primary-700
              hover:underline
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary-500
              rounded
            "
          >
            View All
          </Link>

        </div>

      </div>

      {/* ==================================================
          Loading
         ================================================== */}

      {loading && (
        <div
          className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            shadow-sm
            px-4
            py-8
            text-center
          "
        >
          <p className="text-sm text-slate-400">
            Loading notifications...
          </p>
        </div>
      )}

      {/* ==================================================
          Error
         ================================================== */}

      {!loading && error && (
        <div
          className="
            bg-white
            rounded-2xl
            border
            border-danger-100
            shadow-sm
            px-4
            py-8
            text-center
          "
        >
          <HiOutlineBell
            size={22}
            className="mx-auto text-danger-300"
            aria-hidden="true"
          />

          <p className="text-sm font-semibold text-danger-600 mt-2">
            Unable to load notifications
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {error}
          </p>

          <button
            type="button"
            onClick={loadNotifications}
            className="
              mt-3
              text-xs
              font-semibold
              text-primary-600
              hover:text-primary-700
            "
          >
            Try Again
          </button>
        </div>
      )}

      {/* ==================================================
          Empty state
         ================================================== */}

      {!loading &&
        !error &&
        items.length === 0 && (

          <div
            className="
              bg-white
              rounded-2xl
              border
              border-slate-100
              shadow-sm
              px-4
              py-10
              text-center
            "
          >

            <div
              className="
                mx-auto
                flex
                items-center
                justify-center
                w-11
                h-11
                rounded-full
                bg-slate-100
                text-slate-400
                mb-3
              "
            >
              <HiOutlineBell
                size={20}
                aria-hidden="true"
              />
            </div>

            <p className="text-sm font-semibold text-slate-600">
              No notifications
            </p>

            <p className="text-xs text-slate-400 mt-1">
              You're all caught up.
            </p>

          </div>
        )}

      {/* ==================================================
          Notifications
         ================================================== */}
      {!loading &&
        !error &&
        items.length > 0 && (
          <div
            className="space-y-2"
            aria-live="polite"
            aria-label="Notifications"
          >
            {items.slice(0, 4).map((notification) => (
              <div
                key={notification.id}
                className="relative group"
              >
                <NotificationCard
                  notification={{
                    ...notification,
                    isRead: notification.is_read,
                    time: notification.created_at,
                  }}
                  onRead={() =>
                    handleRead(notification.id)
                  }
                  onClick={() =>
                    handleRead(notification.id)
                  }
                />
                {/* Delete */}
                <button
                  type="button"
                  onClick={() =>
                    handleDelete(notification.id)
                  }
                  aria-label={`Delete notification: ${notification.title}`}
                  className="
                    absolute
                    top-3
                    right-3
                    opacity-0
                    group-hover:opacity-100
                    focus:opacity-100
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
                    focus-visible:outline-none
                    focus-visible:ring-1
                    focus-visible:ring-danger-400
                  "
                >
                  <HiOutlineTrash
                    size={13}
                    aria-hidden="true"
                  />
                </button>
              </div>
            ))}
            {/* More notifications indicator */}
            {items.length > 4 && (
              <div className="text-center pt-1">
                <Link
                  to={ROUTES.USER.NOTIFICATIONS}
                  className="
                    text-xs
                    font-medium
                    text-slate-400
                    hover:text-primary-600
                    transition-colors
                  "
                >
                  View {items.length - 4} more notifications
                </Link>
              </div>
            )}
          </div>
        )}
    </section>
  )
}
export default NotificationCenter