import React, { useState, useEffect, useMemo } from 'react'
import {
  RiBellLine, RiSearchLine, RiDeleteBinLine,
  RiCheckDoubleLine, RiFilterLine,
  RiMailLine, RiSmartphoneLine,
} from 'react-icons/ri'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useToast } from '../../../components/common/Toast'
import NotificationCard from '../../../components/notifications/NotificationCard'
import Button from '../../../components/common/Button'
import EmptyState from '../../../components/common/EmptyState'
import { EXTENDED_NOTIFICATIONS, MOCK_NOTIFICATION_PREFS } from '../../../mocks/userProfile'

const FILTER_TABS = [
  { label: 'All',           value: 'all'                  },
  { label: 'Price Drop',    value: 'Price_Drop'           },
  { label: 'In Stock',      value: 'Stock_Available'      },
  { label: 'System',        value: 'System_Announcement'  },
]

function ToggleSwitch({ checked, onChange, id, label }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} aria-hidden="true" />
    </button>
  )
}

export default function NotificationCenterPage() {
  const { notifications, unreadCount, markRead, markAllRead, removeNotification, addNotification } = useNotifications()
  const { toast } = useToast()

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [prefs, setPrefs] = useState(MOCK_NOTIFICATION_PREFS)

  // Seed extended notifications on mount if empty
  useEffect(() => {
    if (notifications.length === 0) {
      EXTENDED_NOTIFICATIONS.forEach((n) => addNotification(n))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let list = [...notifications]
    if (filter !== 'all') list = list.filter((n) => n.type === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q))
    }
    return list
  }, [notifications, filter, search])

  function handleDelete(id) {
    removeNotification(id)
    toast('Notification deleted.', { variant: 'info' })
  }

  function setPref(key, value) {
    setPrefs((p) => ({ ...p, [key]: value }))
    toast('Preference updated.', { variant: 'success' })
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <RiBellLine size={24} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />
            Notification Center
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" leftIcon={<RiCheckDoubleLine size={15} />} onClick={markAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Notifications list ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <RiSearchLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications…"
              aria-label="Search notifications"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Notification filter">
            {FILTER_TABS.map((tab) => {
              const count = tab.value === 'all'
                ? notifications.length
                : notifications.filter((n) => n.type === tab.value).length
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={[
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                    filter === tab.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                  ].join(' ')}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${filter === tab.value ? 'bg-white/20 text-white' : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<RiBellLine size={32} className="opacity-40" />}
              title={search ? 'No notifications match your search' : 'No notifications'}
              description={search ? 'Try different keywords.' : 'You\'re all caught up!'}
              className="py-12 rounded-2xl border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div
              className="space-y-2"
              role="feed"
              aria-live="polite"
              aria-label="Notifications"
            >
              {filtered.map((n) => (
                <div key={n.id} className="relative group">
                  <NotificationCard
                    notification={n}
                    onMarkRead={markRead}
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    aria-label={`Delete notification: ${n.title}`}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-all focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger-500"
                  >
                    <RiDeleteBinLine size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Notification Preferences ── */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 h-fit">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications',      label: 'Email Notifications',      icon: RiMailLine,         desc: 'Receive alerts via email' },
              { key: 'pushNotifications',       label: 'Push Notifications',       icon: RiSmartphoneLine,   desc: 'Browser push alerts' },
              { key: 'priceAlerts',             label: 'Price Drop Alerts',        icon: RiBellLine,         desc: 'When medicine prices drop' },
              { key: 'stockAlerts',             label: 'Stock Availability',       icon: RiBellLine,         desc: 'When items come back in stock' },
              { key: 'medicineRecommendations', label: 'Medicine Recommendations', icon: RiBellLine,         desc: 'Personalised suggestions' },
              { key: 'systemAnnouncements',     label: 'System Announcements',     icon: RiBellLine,         desc: 'Platform updates and news' },
            ].map(({ key, label, icon: Icon, desc }) => (
              <div key={key} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Icon size={16} className="text-primary-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
                <ToggleSwitch
                  id={`pref-${key}`}
                  checked={prefs[key]}
                  onChange={(v) => setPref(key, v)}
                  label={label}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
