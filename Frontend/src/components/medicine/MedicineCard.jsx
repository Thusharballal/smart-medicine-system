import React from 'react'
import { Link } from 'react-router-dom'
import {
  RiHeartLine, RiHeartFill, RiLeafLine,
  RiMedicineBottleLine, RiArrowRightLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri'
import Button from '../common/Button'

function SavingsBadge({ mrp, janAushadhiPrice }) {
  if (!mrp || !janAushadhiPrice || janAushadhiPrice <= 0) return null
  const saving = mrp - janAushadhiPrice
  const pct    = ((saving / mrp) * 100).toFixed(1)
  if (saving <= 0) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-accent-100 text-accent-800 dark:bg-accent-950/80 dark:text-accent-300 ring-1 ring-accent-200 dark:ring-accent-800/50">
      <RiLeafLine size={10} aria-hidden="true" />
      Save {pct}%
    </span>
  )
}

function TypeBadge({ type }) {
  const isGeneric = type === 'janaushadhi'
  return (
    <span className={[
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset',
      isGeneric
        ? 'bg-accent-50  text-accent-800  ring-accent-200  dark:bg-accent-950/60  dark:text-accent-300  dark:ring-accent-800/50'
        : 'bg-primary-50 text-primary-800 ring-primary-200 dark:bg-primary-950/60 dark:text-primary-300 dark:ring-primary-800/50',
    ].join(' ')}>
      {isGeneric
        ? <RiLeafLine          size={10} aria-hidden="true" />
        : <RiMedicineBottleLine size={10} aria-hidden="true" />}
      {isGeneric ? 'Jan Aushadhi' : 'Branded'}
    </span>
  )
}

function AvailBadge({ status }) {
  const cfg = {
    'In Stock':      'bg-accent-50   text-accent-700   ring-accent-200   dark:bg-accent-950/40   dark:text-accent-400',
    'Limited Stock': 'bg-warning-50  text-warning-700  ring-warning-200  dark:bg-warning-950/40  dark:text-warning-400',
    'Out of Stock':  'bg-danger-50   text-danger-700   ring-danger-200   dark:bg-danger-950/40   dark:text-danger-400',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-inset ${cfg[status] ?? cfg['In Stock']}`}>
      <RiCheckboxCircleLine size={9} aria-hidden="true" />
      {status}
    </span>
  )
}

function MedicineCard({ medicine, onWatchlistToggle, onFindAlternative, layout = 'card', className = '' }) {
  if (!medicine) return null
  const { id, name, genericComposition, manufacturer, dosageForm, strength, mrp, janAushadhiPrice, category, type, isInWatchlist, availability } = medicine
  const isBranded = type === 'branded'

  if (layout === 'list') {
    return (
      <article
        aria-label={`Medicine: ${name}`}
        className={[
          'flex items-center gap-4 p-4 rounded-2xl',
          'bg-white dark:bg-gray-800/90',
          'border border-gray-200/80 dark:border-gray-700/60',
          'shadow-card hover:shadow-card-md hover:-translate-y-px',
          'transition-all duration-200',
          className,
        ].join(' ')}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <TypeBadge type={type} />
            {isBranded && janAushadhiPrice && <SavingsBadge mrp={mrp} janAushadhiPrice={janAushadhiPrice} />}
          </div>
          <Link
            to={`/medicines/${id}`}
            className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-700 dark:hover:text-primary-400 text-sm transition-colors focus-visible:outline-none focus-visible:underline"
          >
            {name}
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{genericComposition}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">₹{mrp}</p>
          {janAushadhiPrice > 0 && (
            <p className="text-xs text-accent-600 dark:text-accent-400 font-semibold">₹{janAushadhiPrice}</p>
          )}
        </div>
      </article>
    )
  }

  return (
    <article
      aria-label={`Medicine: ${name}`}
      className={[
        'group flex flex-col rounded-2xl overflow-hidden',
        'bg-white dark:bg-gray-800/90',
        'border border-gray-200/80 dark:border-gray-700/60',
        'shadow-card hover:shadow-card-hover hover:-translate-y-1',
        'transition-all duration-200',
        className,
      ].join(' ')}
    >
      {/* Top strip */}
      {isBranded && janAushadhiPrice && janAushadhiPrice > 0 && (
        <div className="h-0.5 bg-gradient-to-r from-accent-400 to-accent-600" aria-hidden="true" />
      )}

      {/* Header */}
      <div className="px-4 pt-4 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <TypeBadge type={type} />
          {category && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700/80 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-700">
              {category}
            </span>
          )}
          {availability && <AvailBadge status={availability} />}
        </div>
        {onWatchlistToggle && (
          <button
            type="button"
            onClick={() => onWatchlistToggle(medicine)}
            aria-label={isInWatchlist ? `Remove ${name} from watchlist` : `Add ${name} to watchlist`}
            aria-pressed={isInWatchlist}
            className="shrink-0 p-1.5 rounded-xl text-gray-300 hover:text-danger-500 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-400"
          >
            {isInWatchlist
              ? <RiHeartFill size={18} className="text-danger-500" aria-hidden="true" />
              : <RiHeartLine size={18} aria-hidden="true" />}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-2.5 pb-4 flex flex-col gap-1 flex-1">
        <Link
          to={`/medicines/${id}`}
          className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug hover:text-primary-700 dark:hover:text-primary-400 transition-colors focus-visible:outline-none focus-visible:underline"
        >
          {name}
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{genericComposition}</p>
        {(dosageForm || strength) && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500">{[dosageForm, strength].filter(Boolean).join(' · ')}</p>
        )}
        {manufacturer && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">by {manufacturer}</p>
        )}
      </div>

      {/* Pricing footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2 bg-gray-50/50 dark:bg-gray-900/20">
        <div>
          <span className="text-base font-bold text-gray-900 dark:text-gray-100">₹{mrp}</span>
          {isBranded && janAushadhiPrice && janAushadhiPrice > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-gray-400 line-through">MRP ₹{mrp}</span>
              <SavingsBadge mrp={mrp} janAushadhiPrice={janAushadhiPrice} />
            </div>
          )}
        </div>
        {isBranded && onFindAlternative && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFindAlternative(medicine)}
            rightIcon={<RiArrowRightLine size={13} aria-hidden="true" />}
            aria-label={`Find Jan Aushadhi alternative for ${name}`}
          >
            Generic
          </Button>
        )}
      </div>
    </article>
  )
}

export default MedicineCard
