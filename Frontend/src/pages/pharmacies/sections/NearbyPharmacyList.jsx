import { useEffect, useState } from 'react'
import {
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineTruck,
  HiOutlineCalendarDays,
  HiBookmark,
  HiOutlineBookmark,
} from 'react-icons/hi2'
import { MdLocalPharmacy } from 'react-icons/md'
import Badge from '../../../components/ui/Badge'
import pharmacyService from '../../../services/pharmacyService'
// =======================================================
// Stock configuration
// =======================================================
const AVAIL_CONFIG = {
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
// =======================================================
// Convert backend pharmacy → UI pharmacy
// =======================================================

function formatPharmacy(pharmacy) {
  const stockStatus = String(
    pharmacy.stock_status ?? ''
  ).toLowerCase()

  let availability = 'unavailable'

  if (
    stockStatus === 'in stock' ||
    stockStatus === 'available'
  ) {
    availability = 'available'
  } else if (
    stockStatus === 'low stock' ||
    stockStatus === 'limited stock'
  ) {
    availability = 'limited'
  }

  return {
    id: pharmacy.pharmacy_id,

    name: pharmacy.pharmacy_name,

    address: [
      pharmacy.address,
      pharmacy.city,
      pharmacy.state,
      pharmacy.pin_code,
    ]
      .filter(Boolean)
      .join(', '),

    distance:
      pharmacy.distance_km !== undefined &&
      pharmacy.distance_km !== null
        ? `${Number(pharmacy.distance_km).toFixed(2)} km`
        : '—',

    availability,

    availableQuantity:
      pharmacy.available_quantity ?? 0,

    mrp:
      pharmacy.mrp ?? null,

    // ===================================================
    // Real pharmacy coordinates from backend
    // ===================================================

    latitude:
      pharmacy.latitude ?? null,

    longitude:
      pharmacy.longitude ?? null,

    // ===================================================
    // Backend currently does not return these fields.
    // Keep safe defaults until backend support is added.
    // ===================================================

    isOpen: null,

    isJanAushadhi: false,

    travelTime: '—',

    hours: '—',

    rating: '—',

    ratingCount: 0,

    phone: '',
  }
}

// =======================================================
// Pharmacy Card
// =======================================================

function NearbyPharmacyCard({
  pharmacy,
  isSelected,
  onSelect,
  onViewDetails,
  onReserve,
  onViewOnMap,
}) {
  const [saved, setSaved] = useState(false)

  const avail =
    AVAIL_CONFIG[pharmacy.availability] ??
    AVAIL_CONFIG.unavailable

  return (
    <article
      aria-label={`${pharmacy.name} — ${avail.label}`}
      onClick={() => onSelect?.(pharmacy.id)}
      className={[
        'relative flex flex-col gap-3 p-5 rounded-2xl bg-white border cursor-pointer',
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',

        isSelected
          ? 'border-2 border-primary-400 ring-2 ring-primary-100 shadow-md'
          : 'border-slate-100 shadow-sm',
      ].join(' ')}
    >
      {/* ===================================================
          Selected indicator
         =================================================== */}

      {isSelected && (
        <div className="absolute top-3 right-3">
          <Badge
            variant="primary"
            size="sm"
            dot
          >
            Selected
          </Badge>
        </div>
      )}

      {/* ===================================================
          Top row
         =================================================== */}

      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-secondary-50 shrink-0">
          <MdLocalPharmacy
            size={22}
            className="text-secondary-600"
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-bold text-slate-900 truncate max-w-[220px]">
              {pharmacy.name}
            </h3>

            {pharmacy.isJanAushadhi && (
              <Badge
                variant="info"
                size="sm"
              >
                Jan Aushadhi
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* =================================================
                Opening status

                Backend does not currently provide opening hours.
                Therefore don't falsely display "Open".
               ================================================= */}

            {pharmacy.isOpen !== null && (
              <Badge
                variant={
                  pharmacy.isOpen
                    ? 'success'
                    : 'danger'
                }
                dot
                size="sm"
              >
                {pharmacy.isOpen
                  ? 'Open'
                  : 'Closed'}
              </Badge>
            )}

            <Badge
              variant={avail.variant}
              size="sm"
            >
              {avail.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* ===================================================
          Address
         =================================================== */}

      <div className="flex items-start gap-1.5 text-xs text-slate-500">
        <HiOutlineMapPin
          size={12}
          className="mt-0.5 shrink-0 text-slate-400"
          aria-hidden="true"
        />

        <span>
          {pharmacy.address ||
            'Address unavailable'}
        </span>
      </div>

      {/* ===================================================
          Distance / Stock / Pharmacy info
         =================================================== */}

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500">
        {/* Distance */}

        <span className="flex items-center gap-1">
          <HiOutlineMapPin
            size={11}
            className="text-secondary-400"
            aria-hidden="true"
          />

          {pharmacy.distance}
        </span>

        {/* Travel time */}

        <span className="flex items-center gap-1">
          <HiOutlineTruck
            size={11}
            aria-hidden="true"
          />

          {pharmacy.travelTime}
        </span>

        {/* Opening hours */}

        <span className="flex items-center gap-1">
          <HiOutlineClock
            size={11}
            aria-hidden="true"
          />

          {pharmacy.hours}
        </span>

        {/* Rating */}

        <span className="flex items-center gap-1">
          <HiOutlineStar
            size={11}
            className="text-warning-400"
            aria-hidden="true"
          />

          {pharmacy.rating}
        </span>
      </div>

      {/* ===================================================
          Stock quantity
         =================================================== */}

      <div className="text-xs text-slate-500">
        Available quantity:{' '}

        <span className="font-semibold text-slate-700">
          {pharmacy.availableQuantity ?? '—'}
        </span>
      </div>

      {/* ===================================================
          MRP
         =================================================== */}

      {pharmacy.mrp !== null &&
        pharmacy.mrp !== undefined && (
          <div className="text-xs text-slate-500">
            MRP:{' '}

            <span className="font-semibold text-slate-700">
              ₹{Number(pharmacy.mrp).toFixed(2)}
            </span>
          </div>
        )}

      {/* ===================================================
          Actions
         =================================================== */}

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        {/* View Details */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails?.(pharmacy.id)
          }}
          aria-label={`View details for ${pharmacy.name}`}
          className="flex-1 text-xs font-semibold py-2 rounded-xl bg-secondary-600 text-white hover:bg-secondary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
        >
          View Details
        </button>

        {/* Map */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onViewOnMap?.(pharmacy.id)
          }}
          aria-label={`View ${pharmacy.name} on map`}
          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:border-secondary-300 hover:text-secondary-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
        >
          <HiOutlineMapPin
            size={13}
            aria-hidden="true"
          />

          Map
        </button>

        {/* Reserve */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onReserve?.(pharmacy.id)
          }}
          aria-label={`Reserve medicine at ${pharmacy.name}`}
          disabled={
            pharmacy.availability ===
            'unavailable'
          }
          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-success-300 text-xs text-success-700 hover:bg-success-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <HiOutlineCalendarDays
            size={13}
            aria-hidden="true"
          />

          Reserve
        </button>

        {/* Save */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setSaved((s) => !s)
          }}
          aria-label={
            saved
              ? `Remove ${pharmacy.name} from saved`
              : `Save ${pharmacy.name}`
          }
          aria-pressed={saved}
          className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 text-slate-400 hover:text-warning-500 hover:border-warning-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-400"
        >
          {saved ? (
            <HiBookmark
              size={14}
              aria-hidden="true"
            />
          ) : (
            <HiOutlineBookmark
              size={14}
              aria-hidden="true"
            />
          )}
        </button>

        {/* Phone */}

        {pharmacy.phone && (
          <a
            href={`tel:${pharmacy.phone.replace(
              /\s/g,
              ''
            )}`}
            onClick={(e) =>
              e.stopPropagation()
            }
            aria-label={`Call ${pharmacy.name}`}
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 text-slate-400 hover:text-secondary-600 hover:border-secondary-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
          >
            <HiOutlinePhone
              size={14}
              aria-hidden="true"
            />
          </a>
        )}
      </div>
    </article>
  )
}

// =======================================================
// Nearby Pharmacy List
// =======================================================

function NearbyPharmacyList({
  selectedId,
  onSelect,
  onViewDetails,
  onReserve,
  userLocation,
  medicineId,
}) {
  const [pharmacies, setPharmacies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // =====================================================
  // Normalize location
  //
  // InteractiveMapSection uses:
  //     { lat, lng }
  //
  // This component previously expected:
  //     { latitude, longitude }
  //
  // Support both formats so the components remain
  // compatible.
  // =====================================================

  const latitude =
    userLocation?.latitude ??
    userLocation?.lat ??
    null

  const longitude =
    userLocation?.longitude ??
    userLocation?.lng ??
    null

  // =====================================================
  // Fetch nearby pharmacies
  // =====================================================

  useEffect(() => {
    let isMounted = true

    async function fetchNearbyPharmacies() {
      try {
        setIsLoading(true)
        setIsError(false)

        const response =
          await pharmacyService.getNearby({
            medicine_id: medicineId,
            latitude,
            longitude,
          })

        if (!isMounted) {
          return
        }

        const formattedPharmacies =
          Array.isArray(response.data)
            ? response.data.map(formatPharmacy)
            : []

        setPharmacies(
          formattedPharmacies
        )
      } catch (error) {
        console.error(
          'Nearby Pharmacy Error:',
          error
        )

        if (!isMounted) {
          return
        }

        setIsError(true)
        setPharmacies([])
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // ===================================================
    // Do not call API until all required information
    // is available.
    // ===================================================

    if (
      !medicineId ||
      latitude === null ||
      longitude === null
    ) {
      setPharmacies([])
      setIsLoading(false)
      return
    }

    fetchNearbyPharmacies()

    return () => {
      isMounted = false
    }
  }, [
    medicineId,
    latitude,
    longitude,
  ])

  // =====================================================
  // View on map
  // =====================================================

  function handleViewOnMap(id) {
    onSelect?.(id)
  }

  // =====================================================
  // Loading
  // =====================================================

  if (isLoading) {
    return (
      <section
        aria-labelledby="pharmacy-list-heading"
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="pharmacy-list-heading"
            className="text-base font-bold text-slate-900"
          >
            Nearby Pharmacies
          </h2>
        </div>

        <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-100">
          Finding nearby pharmacies...
        </div>
      </section>
    )
  }

  // =====================================================
  // Error
  // =====================================================

  if (isError) {
    return (
      <section
        aria-labelledby="pharmacy-list-heading"
      >
        <h2
          id="pharmacy-list-heading"
          className="text-base font-bold text-slate-900 mb-4"
        >
          Nearby Pharmacies
        </h2>

        <div className="p-8 text-center text-sm text-red-600 bg-white rounded-2xl border border-slate-100">
          Failed to load nearby pharmacies.
        </div>
      </section>
    )
  }
  // =====================================================
  // Missing location / medicine
  // =====================================================
  if (
    !medicineId ||
    latitude === null ||
    longitude === null
  ) {
    return (
      <section
        aria-labelledby="pharmacy-list-heading"
      >
        <h2
          id="pharmacy-list-heading"
          className="text-base font-bold text-slate-900 mb-4"
        >
          Nearby Pharmacies
        </h2>
        <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-100">
          Location and medicine information are
          required to find nearby pharmacies.
        </div>
      </section>
    )
  }
  // =====================================================
  // No pharmacies found
  // =====================================================
  if (pharmacies.length === 0) {
    return (
      <section
        aria-labelledby="pharmacy-list-heading"
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="pharmacy-list-heading"
            className="text-base font-bold text-slate-900"
          >
            Nearby Pharmacies
          </h2>
          <Badge
            variant="primary"
            size="sm"
          >
            0 found
          </Badge>
        </div>
        <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-100">
          No nearby pharmacies currently have
          this medicine in stock.
        </div>
      </section>
    )
  }
  // =====================================================
  // Pharmacy list
  // =====================================================
  return (
    <section
      aria-labelledby="pharmacy-list-heading"
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          id="pharmacy-list-heading"
          className="text-base font-bold text-slate-900"
        >
          Nearby Pharmacies
        </h2>
        <Badge
          variant="primary"
          size="sm"
        >
          {pharmacies.length} found
        </Badge>
      </div>
      <div
        className="flex flex-col gap-4"
        role="list"
        aria-label="Nearby pharmacy list"
      >
        {pharmacies.map((pharmacy) => (
          <div
            key={pharmacy.id}
            role="listitem"
          >
            <NearbyPharmacyCard
              pharmacy={pharmacy}
              isSelected={
                pharmacy.id === selectedId
              }
              onSelect={onSelect}
              onViewDetails={
                onViewDetails
              }
              onReserve={onReserve}
              onViewOnMap={
                handleViewOnMap
              }
            />
          </div>
        ))}
      </div>
    </section>
  )
}
export default NearbyPharmacyList