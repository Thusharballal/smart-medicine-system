/**
 * MedicineCard Component
 *
 * Purpose : Displays a medicine's key information in a compact card
 *           for search results, recommendations, and favourites lists.
 * Location : src/components/cards/MedicineCard.jsx
 *
 * Features : availability badge, generic name, manufacturer, price,
 *            savings indicator, action buttons slot, click handler
 *
 * Future usage : Module 4 (search results, Janaushadhi recommendations,
 *   saved medicines list), Module 5 (pharmacy inventory view).
 *
 * Props :
 *   medicine — { id, name, genericName, manufacturer, price,
 *                mrp, availability, category, image? }
 *   onView   — callback when card is clicked / View Details pressed
 *   actions  — custom action buttons slot
 *   compact  — smaller layout for list views
 */

import { MdMedication } from 'react-icons/md'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import Badge from '../ui/Badge'

const AVAILABILITY_MAP = {
  available:     { variant: 'success', label: 'In Stock'    },
  unavailable:   { variant: 'danger',  label: 'Out of Stock' },
  limited:       { variant: 'warning', label: 'Limited Stock'},
}

function MedicineCard({ medicine = {}, onView, actions, compact = false }) {
const {
  name = 'Medicine Name',
  genericName = 'Generic Name',
  manufacturer = 'Manufacturer',
  jan_aushadhi_price,
  branded_price,
  availability = 'available',
  category,
} = medicine

  const avail   = AVAILABILITY_MAP[availability] ?? AVAILABILITY_MAP.available
  const savings =
    branded_price && jan_aushadhi_price
      ? Math.round(
          ((branded_price - jan_aushadhi_price) / branded_price) * 100
        )
      : null

  return (
    <article
      className="card hover-lift cursor-pointer group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onClick={onView}
      aria-label={`${name} — ${avail.label}`}
    >
      <div className={`flex flex-col gap-4 ${compact ? 'p-0' : ''}`}>
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 shadow-sm shrink-0">
            <MdMedication size={22} aria-hidden="true" />
          </div>

          {/* Name block */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-snug truncate">
              {name}
            </h3>
            <p className="text-xs text-slate-500 truncate">{genericName}</p>
          </div>

          {/* Availability badge */}
          <Badge
            variant={avail.variant}
            size="sm"
            pill
            dot
          >            {avail.label}
          </Badge>
        </div>

        {/* Manufacturer */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <HiOutlineBuildingOffice2 size={13} aria-hidden="true" />
          <span className="truncate">{manufacturer}</span>
          {category && (
            <>
              <span aria-hidden="true">·</span>
              <Badge variant="neutral" size="sm">{category}</Badge>
            </>
          )}
        </div>
                {/* Price row */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            {jan_aushadhi_price != null ? (
              <>
                <span className="text-xl font-bold text-slate-900">
                  ₹{jan_aushadhi_price}
                </span>

                {branded_price != null &&
                  branded_price !== jan_aushadhi_price && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{branded_price}
                    </span>
                  )}

                {savings > 0 && (
                  <Badge variant="success" size="sm">
                    {savings}% off
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-sm text-slate-400">
                Price not available
              </span>
            )}
          </div>

          {/* Actions slot or default View button */}
          {actions ?? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onView?.()
              }}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-md hover:bg-primary-50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default MedicineCard
