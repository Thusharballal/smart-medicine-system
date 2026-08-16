import { useState } from 'react'
import {
  HiOutlineArrowRight,
  HiOutlineTrash,
  HiOutlineShare,
  HiOutlineArrowsRightLeft,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'
import { ROUTES } from '../../../constants/routes'

// TODO: Replace with:
// GET /api/v1/users/me/saved-medicines
const INIT_SAVED = [
  {
    id: 's1',
    name: 'Paracetamol IP 500mg',
    genericAlt: 'Jan Aushadhi Generic',
    savedDate: '2 days ago',
    availability: 'available',
  },
  {
    id: 's2',
    name: 'Azithromycin 500mg',
    genericAlt: 'Generic Available',
    savedDate: '5 days ago',
    availability: 'available',
  },
  {
    id: 's3',
    name: 'Metformin 500mg',
    genericAlt: 'Jan Aushadhi Generic',
    savedDate: '1 week ago',
    availability: 'limited',
  },
  {
    id: 's4',
    name: 'Cetirizine 10mg',
    genericAlt: 'Generic Available',
    savedDate: '2 weeks ago',
    availability: 'available',
  },
]

const AVAILABILITY = {
  available: {
    variant: 'success',
    label: 'In Stock',
  },
  limited: {
    variant: 'warning',
    label: 'Limited Stock',
  },
  unavailable: {
    variant: 'danger',
    label: 'Out of Stock',
  },
}

function SavedMedicineCard({ medicine, onRemove, onCompare, onShare }) {
  const navigate = useNavigate()

  const availability =
    AVAILABILITY[medicine.availability] ?? AVAILABILITY.available

  // ---------------------------------------------------------
  // View medicine
  //
  // We intentionally search by medicine name instead of using
  // medicine.id because the current demo IDs (s1, s2...) are
  // not real MongoDB medicine IDs.
  // ---------------------------------------------------------
  function handleView() {
    navigate(
      `${ROUTES.USER.SEARCH_RESULTS}?q=${encodeURIComponent(
        medicine.name
      )}`
    )
  }

  return (
    <article
      aria-label={medicine.name}
      className="
        flex
        items-start
        gap-3
        p-4
        rounded-xl
        bg-white
        border
        border-slate-100
        shadow-sm
        hover:shadow-md
        hover:-translate-y-0.5
        transition-all
        duration-200
      "
    >
      {/* Medicine icon */}
      <div
        className="
          flex
          items-center
          justify-center
          w-10
          h-10
          rounded-xl
          bg-primary-50
          shrink-0
        "
      >
        <MdMedication
          size={20}
          className="text-primary-600"
          aria-hidden="true"
        />
      </div>

      {/* Medicine information */}
      <div className="flex-1 min-w-0">

        {/* Name + availability */}
        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {medicine.name}
            </h3>

            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {medicine.genericAlt}
            </p>
          </div>

          <Badge
            variant={availability.variant}
            dot
            size="sm"
          >
            {availability.label}
          </Badge>
        </div>

        {/* Saved date */}
        <p className="text-[10px] text-slate-400 mt-1">
          Saved {medicine.savedDate}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">

          {/* View */}
          <button
            type="button"
            onClick={handleView}
            className="
              inline-flex
              items-center
              gap-1
              text-[11px]
              font-medium
              text-primary-600
              hover:text-primary-700
              px-2
              py-1
              rounded-lg
              hover:bg-primary-50
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary-500
            "
          >
            <HiOutlineArrowRight
              size={11}
              aria-hidden="true"
            />
            View
          </button>

          {/* Compare */}
          <button
            type="button"
            onClick={() => onCompare(medicine)}
            className="
              inline-flex
              items-center
              gap-1
              text-[11px]
              font-medium
              text-slate-500
              hover:text-primary-600
              px-2
              py-1
              rounded-lg
              hover:bg-slate-50
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-slate-300
            "
          >
            <HiOutlineArrowsRightLeft
              size={11}
              aria-hidden="true"
            />
            Compare
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => onShare(medicine)}
            className="
              inline-flex
              items-center
              gap-1
              text-[11px]
              font-medium
              text-slate-500
              hover:text-secondary-600
              px-2
              py-1
              rounded-lg
              hover:bg-slate-50
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-slate-300
            "
          >
            <HiOutlineShare
              size={11}
              aria-hidden="true"
            />
            Share
          </button>

          {/* Remove */}
          <button
            type="button"
            onClick={() => onRemove(medicine.id)}
            aria-label={`Remove ${medicine.name} from saved medicines`}
            className="
              inline-flex
              items-center
              gap-1
              text-[11px]
              font-medium
              text-slate-400
              hover:text-danger-500
              px-2
              py-1
              rounded-lg
              hover:bg-danger-50
              transition-colors
              ml-auto
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-danger-400
            "
          >
            <HiOutlineTrash
              size={11}
              aria-hidden="true"
            />
            Remove
          </button>

        </div>
      </div>
    </article>
  )
}

// ======================================================
// Saved Medicines
// ======================================================
function SavedMedicinesSection() {
  const [items, setItems] = useState(INIT_SAVED)
  const navigate = useNavigate()

  // ---------------------------------------------------------
  // Remove medicine
  // ---------------------------------------------------------
  function handleRemove(id) {
    setItems((previous) =>
      previous.filter((item) => item.id !== id)
    )
  }

  // ---------------------------------------------------------
  // Compare
  //
  // Comparison UI is not connected to a backend yet.
  // For now, navigate to search so the medicine can be
  // searched and compared from the results page.
  // ---------------------------------------------------------
  function handleCompare(medicine) {
    navigate(
      `${ROUTES.USER.SEARCH_RESULTS}?q=${encodeURIComponent(
        medicine.name
      )}`
    )
  }

  // ---------------------------------------------------------
  // Share
  // ---------------------------------------------------------
  async function handleShare(medicine) {
    const shareText = `Medicine: ${medicine.name}\nAlternative: ${medicine.genericAlt}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: medicine.name,
          text: shareText,
        })
        return
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        window.alert('Medicine information copied to clipboard.')
        return
      }

      window.alert(shareText)
    } catch (error) {
      // User cancelled the native share dialog.
      if (error?.name !== 'AbortError') {
        console.error('Medicine Share Error:', error)
      }
    }
  }

  return (
    <section aria-labelledby="saved-medicines-heading">

      {/* =====================================================
          Header
         ===================================================== */}
      <div className="flex items-center justify-between mb-3">

        <h2
          id="saved-medicines-heading"
          className="text-base font-bold text-slate-900"
        >
          Saved Medicines
        </h2>

        <div className="flex items-center gap-2">
          <Badge
            variant="primary"
            size="sm"
          >
            {items.length}
          </Badge>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.USER.SEARCH)}
              className="
                hidden
                sm:inline-flex
                items-center
                gap-1
                text-xs
                font-medium
                text-primary-600
                hover:text-primary-700
              "
            >
              Search more
              <HiOutlineArrowRight
                size={12}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

      </div>

      {/* =====================================================
          Empty state
         ===================================================== */}
      {items.length === 0 ? (

        <div
          className="
            bg-white
            border
            border-slate-100
            rounded-2xl
            shadow-sm
            text-center
            py-10
            px-4
          "
        >
          <div
            className="
              mx-auto
              flex
              items-center
              justify-center
              w-12
              h-12
              rounded-full
              bg-primary-50
              text-primary-600
              mb-3
            "
          >
            <MdMedication
              size={22}
              aria-hidden="true"
            />
          </div>

          <p className="text-sm font-semibold text-slate-700">
            No saved medicines yet
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Save medicines to quickly access them later.
          </p>

          <button
            type="button"
            onClick={() => navigate(ROUTES.USER.SEARCH)}
            className="
              inline-flex
              items-center
              gap-2
              mt-4
              px-4
              py-2
              rounded-lg
              bg-primary-600
              text-white
              text-xs
              font-semibold
              hover:bg-primary-700
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary-500
            "
          >
            <HiOutlineMagnifyingGlass
              size={14}
              aria-hidden="true"
            />
            Search Medicine
          </button>
        </div>

      ) : (

        /* ===================================================
           Medicine cards
           =================================================== */
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-3
          "
          role="list"
        >
          {items.map((medicine) => (
            <div
              key={medicine.id}
              role="listitem"
            >
              <SavedMedicineCard
                medicine={medicine}
                onRemove={handleRemove}
                onCompare={handleCompare}
                onShare={handleShare}
              />
            </div>
          ))}
        </div>

      )}

    </section>
  )
}

export default SavedMedicinesSection