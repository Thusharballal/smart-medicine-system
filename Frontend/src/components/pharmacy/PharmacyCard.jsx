import React from 'react'
import {
  RiMapPinLine,
  RiTimeLine,
  RiPhoneLine,
  RiMedicineBottleLine,
  RiNavigationLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri'
import Button from '../common/Button'

/**
 * PharmacyCard – displays pharmacy summary info.
 *
 * Props:
 *   pharmacy – {
 *     id, name, address, operatingHours, contactNumber,
 *     medicineCount, distanceKm, isJanAushadhi: boolean,
 *     isVerified: boolean
 *   }
 *   onSelect       – (pharmacy) => void  (pan map to this pharmacy)
 *   onGetDirections– (pharmacy) => void
 *   isSelected     – highlight when selected in list
 *   className
 */

function PharmacyCard({ pharmacy, onSelect, onGetDirections, isSelected = false, className = '' }) {
  if (!pharmacy) return null

  const {
    id,
    name,
    address,
    operatingHours,
    contactNumber,
    medicineCount,
    distanceKm,
    isJanAushadhi,
    isVerified,
  } = pharmacy

  return (
    <article
      aria-label={`Pharmacy: ${name}`}
      aria-selected={isSelected}
      className={[
        'flex gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-150',
        'bg-white dark:bg-gray-800',
        isSelected
          ? 'border-primary-600 ring-1 ring-primary-600 shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600',
        className,
      ].join(' ')}
      onClick={() => onSelect?.(pharmacy)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(pharmacy)}
      tabIndex={0}
      role="button"
    >
      {/* Marker colour indicator */}
      <div
        className={[
          'shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold mt-0.5',
          isJanAushadhi
            ? 'bg-accent-600 dark:bg-accent-700'
            : 'bg-primary-900 dark:bg-primary-700',
        ].join(' ')}
        aria-hidden="true"
      >
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-start gap-2">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-snug flex-1">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {isJanAushadhi && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300">
                Jan Aushadhi
              </span>
            )}
            {isVerified && (
              <RiCheckboxCircleLine
                size={16}
                className="text-accent-600 dark:text-accent-400"
                title="Verified pharmacy"
                aria-label="Verified pharmacy"
              />
            )}
          </div>
        </div>

        {/* Address */}
        {address && (
          <p className="flex items-start gap-1 text-xs text-gray-500 dark:text-gray-400">
            <RiMapPinLine size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span className="line-clamp-2">{address}</span>
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          {operatingHours && (
            <span className="flex items-center gap-1">
              <RiTimeLine size={12} aria-hidden="true" />
              {operatingHours}
            </span>
          )}
          {contactNumber && (
            <a
              href={`tel:${contactNumber}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-primary-900 dark:hover:text-primary-400 transition-colors focus-visible:underline"
              aria-label={`Call ${name}: ${contactNumber}`}
            >
              <RiPhoneLine size={12} aria-hidden="true" />
              {contactNumber}
            </a>
          )}
          {medicineCount != null && (
            <span className="flex items-center gap-1">
              <RiMedicineBottleLine size={12} aria-hidden="true" />
              {medicineCount} medicines
            </span>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-1 gap-2">
          {distanceKm != null && (
            <span className="text-xs font-medium text-primary-900 dark:text-primary-400">
              {distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} m away` : `${distanceKm.toFixed(1)} km away`}
            </span>
          )}
          {onGetDirections && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RiNavigationLine size={14} aria-hidden="true" />}
              onClick={(e) => { e.stopPropagation(); onGetDirections(pharmacy) }}
              aria-label={`Get directions to ${name}`}
            >
              Directions
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

export default PharmacyCard
