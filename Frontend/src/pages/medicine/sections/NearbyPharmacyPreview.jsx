import {
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineArrowRight,
} from 'react-icons/hi2'
import { MdLocalPharmacy } from 'react-icons/md'
import Badge from '../../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'

// =====================================================
// Nearby Pharmacy Preview
// =====================================================
function NearbyPharmacyPreview({
  pharmacies = [],
  medicineId,
}) {
  // =====================================================
  // DEBUG
  // =====================================================
  console.log('========== NEARBY PHARMACY PREVIEW ==========')
  console.log('pharmacies:', pharmacies)
  console.log('medicineId received:', medicineId)

  // =====================================================
  // Get nearest pharmacy
  // Backend already sorts pharmacies by distance
  // =====================================================
  const pharmacy = pharmacies[0]

  // =====================================================
  // No pharmacy available
  // =====================================================
  if (!pharmacy) {
    return (
      <section aria-labelledby="nearby-pharmacy-heading">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <MdLocalPharmacy
              size={18}
              className="text-secondary-600"
              aria-hidden="true"
            />

            <h2
              id="nearby-pharmacy-heading"
              className="text-base font-bold text-slate-900"
            >
              Nearby Pharmacies
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            No nearby pharmacy currently has this medicine in stock.
          </p>
        </div>
      </section>
    )
  }

  // =====================================================
  // Backend field names
  // =====================================================
  const {
    pharmacy_name,
    address,
    city,
    state,
    pin_code,
    distance_km,
    available_quantity,
    mrp,
  } = pharmacy

  // =====================================================
  // Stock status
  // =====================================================
  let stockStatus = 'available'
  if (available_quantity <= 5) {
    stockStatus = 'limited'
  }

  const stockConfig = {
    available: {
      variant: 'success',
      label: 'In Stock',
    },
    limited: {
      variant: 'warning',
      label: 'Limited Stock',
    },
  }

  const stock = stockConfig[stockStatus]

  // =====================================================
  // Nearby pharmacy URL
  // =====================================================
 const nearbyPharmaciesUrl = medicineId
  ? `${ROUTES.USER.NEARBY_PHARMACIES}?medicine_id=${encodeURIComponent(
      medicineId
    )}`
  : ROUTES.USER.NEARBY_PHARMACIES
  // =====================================================
  // DEBUG GENERATED URL
  // =====================================================
  console.log(
    'Generated Nearby Pharmacy URL:',
    nearbyPharmaciesUrl
  )

  return (
    <section aria-labelledby="nearby-pharmacy-heading">

      {/* =====================================================
          Nearby Pharmacy Preview
         ===================================================== */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <MdLocalPharmacy
              size={18}
              className="text-secondary-600"
              aria-hidden="true"
            />

            <h2
              id="nearby-pharmacy-heading"
              className="text-base font-bold text-slate-900"
            >
              Nearest Pharmacy
            </h2>
          </div>

          <Badge
            variant={stock.variant}
            dot
            size="sm"
          >
            {stock.label}
          </Badge>
        </div>

        {/* =====================================================
            Pharmacy Card
           ===================================================== */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {pharmacy_name}
              </h3>

              <div className="flex items-start gap-1 text-xs text-slate-500 mt-1">

                <HiOutlineMapPin
                  size={12}
                  className="shrink-0 mt-0.5"
                  aria-hidden="true"
                />

                <span>
                  {address}, {city}, {state} - {pin_code}
                </span>

              </div>

            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">

              <span className="text-sm font-bold text-primary-700">
                {distance_km} km
              </span>

              <Badge
                variant={stock.variant}
                size="sm"
              >
                {stock.label}
              </Badge>

            </div>

          </div>

          {/* =====================================================
              Meta row
             ===================================================== */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">

            <span className="flex items-center gap-1">
              <HiOutlineClock
                size={11}
                aria-hidden="true"
              />
              Pharmacy details available
            </span>

            <span>
              {available_quantity} units available
            </span>

            <span>
              ₹{mrp}
            </span>

          </div>

        </div>

        {/* =====================================================
            Action Buttons
           ===================================================== */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">

          {/* View on Map */}
          <Link
            to={nearbyPharmaciesUrl}
            className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl bg-secondary-600 text-white text-sm font-semibold hover:bg-secondary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
            aria-label="View pharmacy location on map"
          >
            <HiOutlineMapPin
              size={15}
              aria-hidden="true"
            />

            View on Map
          </Link>

          {/* Find More Pharmacies */}
          <Link
            to={nearbyPharmaciesUrl}
            className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl border border-secondary-300 text-secondary-700 text-sm font-medium hover:bg-secondary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
            aria-label="Find more pharmacies stocking this medicine"
          >
            Find More Pharmacies

            <HiOutlineArrowRight
              size={14}
              aria-hidden="true"
            />
          </Link>

        </div>
      </div>
    </section>
  )
}

export default NearbyPharmacyPreview