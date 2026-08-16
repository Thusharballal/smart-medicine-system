import { HiOutlineInformationCircle, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineBellAlert } from 'react-icons/hi2'

const TYPE_CONFIG = {
  info:    { icon: HiOutlineInformationCircle, iconClass: 'text-primary-500',   bg: 'bg-primary-50'   },
  success: { icon: HiOutlineCheckCircle,       iconClass: 'text-success-500',   bg: 'bg-success-50'   },
  warning: { icon: HiOutlineExclamationTriangle, iconClass: 'text-warning-500', bg: 'bg-warning-50'   },
  alert:   { icon: HiOutlineBellAlert,         iconClass: 'text-danger-500',    bg: 'bg-danger-50'    },
}

function NotificationCard({ notification = {}, onRead, onClick }) {
  const {
    title       = 'Notification',
    description = '',
    time        = '',
    type        = 'info',
    isRead      = false,
  } = notification

  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.info
  const Icon   = config.icon

  return (
    <article
      role="article"
      aria-label={`${isRead ? '' : 'Unread: '}${title}`}
      className={[
      'flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:shadow-lg',        isRead
          ? 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          : 'bg-primary-50/50 border-primary-200 hover:bg-primary-100',
      ].join(' ')}
      onClick={onClick}
    >
      {/* Type icon */}
      <div className={`flex items-center justify-center w-11 h-11 rounded-xl shadow-sm shrink-0 ${config.bg}`}>
        <Icon className={`w-5 h-5 ${config.iconClass}`} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-base leading-snug ${isRead ? 'font-normal text-slate-700' : 'font-semibold text-slate-900'}`}>
            {title}
          </p>
          {!isRead && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-1" aria-label="Unread" />
          )}
        </div>

        {description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">{time}</span>
          {!isRead && onRead && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRead() }}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline focus-visible:outline-none"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default NotificationCard
