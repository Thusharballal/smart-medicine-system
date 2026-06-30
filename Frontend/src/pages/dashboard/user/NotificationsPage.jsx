import React, { useEffect } from 'react'
import { RiBellLine } from 'react-icons/ri'
import { useNotifications } from '../../../contexts/NotificationContext'
import NotificationCard from '../../../components/notifications/NotificationCard'
import Button from '../../../components/common/Button'
import EmptyState from '../../../components/common/EmptyState'

// Seed some demo notifications on first load
const DEMO_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'Price_Drop',
    title: 'Metformin price dropped!',
    message: 'Metformin 500mg (Jan Aushadhi) is now available at ₹4 per strip — down from ₹5.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    isRead: false,
  },
  {
    id: 'n2',
    type: 'Stock_Available',
    title: 'Atorvastatin back in stock',
    message: 'Atorvastatin 10mg (Jan Aushadhi) is now available at your nearest pharmacy.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isRead: false,
  },
  {
    id: 'n3',
    type: 'System_Announcement',
    title: 'New Jan Aushadhi stores added',
    message: '45 new Jan Aushadhi pharmacies have been added across Delhi NCR.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
  },
]

function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, addNotification } = useNotifications()

  // Seed demo notifications if none exist
  useEffect(() => {
    if (notifications.length === 0) {
      DEMO_NOTIFICATIONS.forEach((n) => addNotification(n))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5 pb-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <RiBellLine size={24} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={<RiBellLine size={32} />}
          title="No notifications yet"
          description="You'll be notified about price drops, stock updates, and platform announcements here."
          className="py-16 rounded-2xl border border-gray-200 dark:border-gray-700"
        />
      ) : (
        <div
          className="space-y-2"
          role="feed"
          aria-live="polite"
          aria-label="Notifications list"
        >
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={markRead}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
