import React from 'react'
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri'

/**
 * DashboardCard – premium stat / metric card.
 */

const accentMap = {
  primary: {
    iconBg:     'bg-primary-50  dark:bg-primary-950/60',
    iconColor:  'text-primary-700 dark:text-primary-400',
    topBar:     'from-primary-500 to-primary-700',
    glow:       'hover:shadow-glow-primary',
  },
  accent: {
    iconBg:     'bg-accent-50   dark:bg-accent-950/60',
    iconColor:  'text-accent-700  dark:text-accent-400',
    topBar:     'from-accent-400  to-accent-600',
    glow:       'hover:shadow-glow-accent',
  },
  warning: {
    iconBg:     'bg-warning-50  dark:bg-warning-950/60',
    iconColor:  'text-warning-700 dark:text-warning-400',
    topBar:     'from-warning-400 to-warning-600',
    glow:       '',
  },
  danger: {
    iconBg:     'bg-danger-50   dark:bg-danger-950/60',
    iconColor:  'text-danger-700  dark:text-danger-400',
    topBar:     'from-danger-400  to-danger-600',
    glow:       'hover:shadow-glow-danger',
  },
}

function SkeletonContent() {
  return (
    <div className="animate-pulse flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between">
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="h-3 w-28 bg-gray-100 dark:bg-gray-800 rounded-full" />
    </div>
  )
}

function DashboardCard({
  title,
  value,
  icon,
  trend,
  accent = 'primary',
  onClick,
  loading = false,
  className = '',
}) {
  const colors = accentMap[accent] ?? accentMap.primary
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={onClick ? `View ${title} details` : undefined}
      className={[
        'relative overflow-hidden rounded-2xl text-left w-full',
        'bg-white dark:bg-gray-800/90',
        'border border-gray-200/80 dark:border-gray-700/60',
        'shadow-card transition-all duration-200',
        onClick
          ? `cursor-pointer hover:-translate-y-0.5 hover:shadow-card-md ${colors.glow} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500`
          : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors.topBar}`} aria-hidden="true" />

      {loading ? (
        <SkeletonContent />
      ) : (
        <div className="p-5 flex flex-col gap-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-none pt-0.5">
              {title}
            </span>
            {icon && (
              <div className={`p-2.5 rounded-xl shrink-0 ${colors.iconBg}`} aria-hidden="true">
                <span className={`${colors.iconColor} block`}>{icon}</span>
              </div>
            )}
          </div>

          {/* Value */}
          <div className="animate-count-up">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 leading-none font-display tracking-tight">
              {value ?? '—'}
            </span>
          </div>

          {/* Trend */}
          {trend && (
            <div className={`flex items-center gap-1 ${trend.direction === 'up' ? 'stat-up' : 'stat-down'}`}
                 aria-label={`${trend.direction === 'up' ? 'Increased' : 'Decreased'} by ${trend.value}`}>
              <span className={`flex items-center justify-center h-4 w-4 rounded-full ${trend.direction === 'up' ? 'bg-accent-100 dark:bg-accent-950' : 'bg-danger-100 dark:bg-danger-950'}`} aria-hidden="true">
                {trend.direction === 'up'
                  ? <RiArrowUpLine   size={10} />
                  : <RiArrowDownLine size={10} />}
              </span>
              <span>{trend.value}</span>
              {trend.label && <span className="font-normal text-gray-400 dark:text-gray-500 ml-0.5">{trend.label}</span>}
            </div>
          )}
        </div>
      )}
    </Tag>
  )
}

export default DashboardCard
