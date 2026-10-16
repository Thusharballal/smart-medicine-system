import { Link } from 'react-router-dom'
import {
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineArrowRight,
  HiOutlineTruck,
} from 'react-icons/hi2'
import { MdLocalPharmacy } from 'react-icons/md'

import Badge from '../../../components/ui/Badge'
import { ROUTES } from '../../../constants/routes'

// ======================================================
// Nearby Pharmacy Workflow
// ======================================================
function NearbyPharmacyWorkflow({
  pharmacy = {},
  medicineId,
}) {
  // ======================================================
  // Backend pharmacy data
  // ======================================================
  const {
    pharmacy_name,
    address,
    distance_km,
    phone_number,
    available_quantity,
    mrp,
    stock_status,
  } = pharmacy

  // ======================================================
  // Stock status configuration
  // ======================================================
  const stockConfig = {
    'In Stock': {
      variant: 'success',
      label: 'In Stock',
    },

    'Low Stock': {
      variant: 'warning',
      label: 'Low Stock',
    },

    'Out of Stock': {
      variant: 'danger',
      label: 'Out of Stock',
    },
  }

  const stock =
    stockConfig[stock_status] ??
    stockConfig['In Stock']

  // ======================================================
  // Build nearby pharmacy URL
  //
  // IMPORTANT:
  // medicineId comes from:
  //
  // GenericRecommendationPage
  //        ↓
  // <NearbyPharmacyWorkflow medicineId={id} />
  //
  // Result:
  // /pharmacies/nearby?medicine_id=XXXXX
  // ======================================================
  const mapUrl = medicineId
    ? `${ROUTES.USER.NEARBY_PHARMACIES}?medicine_id=${encodeURIComponent(
        medicineId
      )}`
    : ROUTES.USER.NEARBY_PHARMACIES

  // ======================================================
  // Render
  // ======================================================
  return (
    <section
      aria-labelledby="pharmacy-workflow-heading"
    >
      <div className="bg-white rounded-2xl border border-secondary-200 shadow-sm p-6">

        {/* ==================================================
            Header
           ================================================== */}
        <div className="flex items-center justify-between gap-3 mb-4">

          <div className="flex items-center gap-2">

            <MdLocalPharmacy
              size={18}
              className="text-secondary-600"
              aria-hidden="true"
            />

            <h2
              id="pharmacy-workflow-heading"
              className="text-base font-bold text-slate-900"
            >
              Nearest Pharmacy
            </h2>

          </div>

          <Badge
            variant={stock.variant}
            size="sm"
          >
            {stock.label}
          </Badge>

        </div>

        {/* ==================================================
            Pharmacy Information
           ================================================== */}

        {pharmacy_name ? (

          <div className="rounded-xl bg-secondary-50 border border-secondary-100 p-4 space-y-2.5 mb-4">

            {/* Pharmacy Name */}

            <h3 className="text-sm font-semibold text-slate-900">
              {pharmacy_name}
            </h3>

            {/* Address */}

            {address && (
              <div className="flex items-start gap-1.5 text-xs text-slate-500">

                <HiOutlineMapPin
                  size={12}
                  className="mt-0.5 shrink-0 text-secondary-500"
                  aria-hidden="true"
                />

                <span>
                  {address}
                </span>

              </div>
            )}

            {/* Pharmacy Details */}

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">

              {/* Distance */}

              {distance_km !== undefined && (
                <span className="flex items-center gap-1">

                  <HiOutlineMapPin
                    size={11}
                    aria-hidden="true"
                  />

                  {distance_km} km

                </span>
              )}

              {/* Available Quantity */}

              {available_quantity !== undefined && (
                <span className="flex items-center gap-1">

                  <HiOutlineTruck
                    size={11}
                    aria-hidden="true"
                  />

                  {available_quantity} available

                </span>
              )}

              {/* MRP */}

              {mrp !== undefined && (
                <span className="flex items-center gap-1">

                  ₹{mrp}

                </span>
              )}

              {/* Phone */}

              {phone_number && (
                <a
                  href={`tel:${phone_number.replace(/\s/g, '')}`}
                  className="
                    flex
                    items-center
                    gap-1
                    hover:text-secondary-600
                    transition-colors
                    focus-visible:outline-none
                    focus-visible:ring-1
                    focus-visible:ring-secondary-500
                    rounded
                  "
                  aria-label={`Call ${pharmacy_name}`}
                >

                  <HiOutlinePhone
                    size={11}
                    aria-hidden="true"
                  />

                  {phone_number}

                </a>
              )}

              {/* Pharmacy */}

              <span className="flex items-center gap-1">

                <HiOutlineClock
                  size={11}
                  aria-hidden="true"
                />

                Pharmacy

              </span>

            </div>

          </div>

        ) : (

          /* ==================================================
             No Pharmacy
             ================================================== */

          <div
            className="
              rounded-xl
              bg-slate-50
              border
              border-slate-100
              p-4
              mb-4
              text-center
            "
          >

            <MdLocalPharmacy
              size={25}
              className="mx-auto text-slate-400 mb-2"
            />

            <p className="text-sm font-medium text-slate-700">
              No pharmacy found
            </p>

            <p className="text-xs text-slate-400 mt-1">
              No pharmacy with this medicine is currently
              available nearby.
            </p>

          </div>
        )}

        {/* ==================================================
            CTA Buttons
           ================================================== */}

        <div className="flex flex-col sm:flex-row gap-3">

          {/* ==================================================
              View on Map
             ================================================== */}

          <Link
            to={mapUrl}
            className="
              flex
              items-center
              justify-center
              gap-2
              flex-1
              px-4
              py-3
              rounded-xl
              bg-secondary-600
              text-white
              text-sm
              font-semibold
              hover:bg-secondary-700
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-secondary-500
            "
            aria-label="View pharmacies on interactive map"
          >

            <HiOutlineMapPin
              size={15}
              aria-hidden="true"
            />

            View on Map

          </Link>

          {/* ==================================================
              Find More Pharmacies
             ================================================== */}

          <Link
            to={mapUrl}
            className="
              flex
              items-center
              justify-center
              gap-2
              flex-1
              px-4
              py-3
              rounded-xl
              border
              border-secondary-300
              text-secondary-700
              text-sm
              font-medium
              hover:bg-secondary-50
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-secondary-500
            "
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

export default NearbyPharmacyWorkflow