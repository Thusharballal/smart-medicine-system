import React, { useState, useMemo } from 'react'
import {
  RiHistoryLine, RiSearchLine, RiHeartLine,
  RiMapPinLine, RiUserLine, RiFilterLine,
} from 'react-icons/ri'
import EmptyState from '../../../components/common/EmptyState'
import { MOCK_ACTIVITY } from '../../../mocks/userProfile'

const TYPE_CONFIG = {
  search:   { Icon: RiSearchLine,  color: 'bg-primary-50  text-primary-700  dark:bg-primary-950  dark:text-primary-400'  },
  saved:    { Icon: RiHeartLine,   color: 'bg-danger-50   text-danger-600   dark:bg-danger-950   dark:text-danger-400'   },
  pharmacy: { Icon: RiMapPinLine,  color: 'bg-accent-50   text-accent-700   dark:bg-accent-950   dark:text-accent-400'   },
  profile:  { Icon: RiUserLine,    color: 'bg-warning-50  text-warning-700  dark:bg-warning-950  dark:text-warning-400'  },
}

const FILTERS = ['All', 'Searches', 'Saved', 'Pharmacies', 'Profile']

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const filterMap = {
  All: null,
  Searches:   'search',
  Saved:      'saved',
  Pharmacies: 'pharmacy',
  Profile:    'profile',
}

export default function ActivityHistoryPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')

  const activities = useMemo(() => {
    let list = [...MOCK_ACTIVITY]
    const type = filterMap[activeFilter]
    if (type) list = list.filter((a) => a.type === type)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    }
    return list
  }, [activeFilter, search])

  return (
    <div className="space-y-5 pb-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <RiHistoryLine size={24} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />
        Activity History
      </h1>

      {/* Search */}
      <div className="relative">
        <RiSearchLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activity…"
          aria-label="Search activity history"
          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Activity type filter">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={activeFilter === f}
            onClick={() => setActiveFilter(f)}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
              activeFilter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
            ].join(' ')}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Activity timeline */}
      {activities.length === 0 ? (
        <EmptyState
          icon={<RiHistoryLine size={32} />}
          title="No activity found"
          description="Your recent actions will appear here."
          action={search ? { label: 'Clear search', onClick: () => setSearch('') } : undefined}
          className="py-12 rounded-2xl border border-gray-200 dark:border-gray-700"
        />
      ) : (
        <ol className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-0">
          {activities.map((activity, idx) => {
            const { Icon, color } = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.search
            return (
              <li key={activity.id} className="mb-0 ml-6">
                {/* Dot */}
                <span
                  className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900 ${color}`}
                  aria-hidden="true"
                >
                  <Icon size={14} />
                </span>

                <div className={`rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 ${idx < activities.length - 1 ? 'mb-4' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activity.title}</p>
                    <time
                      dateTime={activity.timestamp}
                      className="text-xs text-gray-400 dark:text-gray-500 shrink-0"
                    >
                      {timeAgo(activity.timestamp)}
                    </time>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.description}</p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
