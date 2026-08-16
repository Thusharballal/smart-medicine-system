import {
  HiOutlineBookmark,
  HiOutlineMagnifyingGlass,
  HiOutlineSparkles,
  HiOutlineMapPin,
  HiOutlineBell,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'

import InfoCard from '../../../components/cards/InfoCard'
import { ROUTES } from '../../../constants/routes'

/*
 * Dashboard statistics
 *
 * Temporary frontend values.
 *
 * TODO:
 * Replace these values with:
 * GET /api/v1/users/me/stats
 */

const STATS = [
  {
    label: 'Medicines Saved',
    value: '12',
    variant: 'primary',
    icon: <HiOutlineBookmark size={20} />,
    subtitle: 'Personal medicine list',

    // No dedicated saved-medicines route exists yet.
    // Keep user on the medicine area for now.
    route: ROUTES.USER.SEARCH,
  },

  {
    label: 'Searches Performed',
    value: '38',
    variant: 'default',
    icon: <HiOutlineMagnifyingGlass size={20} />,
    subtitle: 'Recent searches',
    route: ROUTES.USER.SEARCH,
  },

  {
    label: 'Generic Recommendations',
    value: '9',
    variant: 'success',
    icon: <HiOutlineSparkles size={20} />,
    subtitle: 'Jan Aushadhi alternatives',

    // Generic recommendation currently depends on a medicine.
    // Therefore we do not navigate to a fake standalone route.
    route: ROUTES.USER.SEARCH,
  },

  {
    label: 'Nearby Pharmacies',
    value: '5',
    variant: 'warning',
    icon: <HiOutlineMapPin size={20} />,
    subtitle: 'Available nearby',
    route: ROUTES.USER.NEARBY_PHARMACIES,
  },

  {
    label: 'Notifications',
    value: '3',
    variant: 'danger',
    icon: <HiOutlineBell size={20} />,
    subtitle: 'Unread notifications',
    route: ROUTES.USER.NOTIFICATIONS,
  },
]

function QuickStats() {
  const navigate = useNavigate()

  return (
    <section
      aria-labelledby="quick-stats-heading"
      className="w-full"
    >
      {/* Accessible heading */}
      <h2
        id="quick-stats-heading"
        className="sr-only"
      >
        Dashboard statistics
      </h2>

      {/* Statistics grid */}
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-5
          gap-3
          items-stretch
        "
      >
        {STATS.map((stat) => {
          const handleClick = stat.route
            ? () => navigate(stat.route)
            : undefined

          return (
            <div
              key={stat.label}
              className="min-w-0 h-full"
            >
              <InfoCard
                label={stat.label}
                value={stat.value}
                variant={stat.variant}
                icon={stat.icon}
                subtitle={stat.subtitle}
                onClick={handleClick}
                className="h-full min-h-[150px]"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default QuickStats