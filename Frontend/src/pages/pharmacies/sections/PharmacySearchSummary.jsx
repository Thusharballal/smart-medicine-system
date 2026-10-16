import {
  HiOutlineMapPin,
  HiOutlineBuildingStorefront,
} from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'
import Badge from '../../../components/ui/Badge'

// =======================================================
// Pharmacy Search Summary
// =======================================================

function PharmacySearchSummary({
  medicine = {},
  pharmacyCount = 0,
  userLocation = null,
  radius = 10,
}) {
  // =====================================================
  // MEDICINE INFORMATION
  // =====================================================

  const medicineName =
    medicine?.name ||
    medicine?.brand_name ||
    medicine?.jan_aushadhi_name ||
    'Medicine'

  const genericName =
    medicine?.genericName ||
    medicine?.generic_name ||
    'Generic medicine'

  // =====================================================
  // LOCATION INFORMATION
  // =====================================================

  const locationName =
    userLocation?.name ||
    userLocation?.displayName ||
    userLocation?.city ||
    'Your current location'

  // =====================================================
  // COORDINATES
  // =====================================================

  const hasCoordinates =
    Number.isFinite(Number(userLocation?.lat)) &&
    Number.isFinite(Number(userLocation?.lng))

  // =====================================================
  // LOCATION SUBTEXT
  // =====================================================

  let locationSubtext = 'Location not selected'

  if (hasCoordinates) {
    locationSubtext = `${Number(userLocation.lat).toFixed(5)}, ${Number(
      userLocation.lng
    ).toFixed(5)}`
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section aria-labelledby="pharmacy-summary-heading">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-3">

          {/* =================================================
              SELECTED MEDICINE
             ================================================= */}

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <MdMedication
                size={20}
                className="text-slate-500"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Selected Medicine
              </p>

              <p className="truncate text-sm font-bold text-slate-900">
                {medicineName}
              </p>

              <p className="truncate text-[11px] text-slate-500">
                {genericName}
              </p>
            </div>
          </div>

          {/* =================================================
              YOUR LOCATION
             ================================================= */}

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-50">
              <HiOutlineMapPin
                size={20}
                className="text-secondary-600"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Your Location
              </p>

              <p className="truncate text-sm font-bold text-slate-900">
                {locationName}
              </p>

              <p className="truncate text-[11px] text-slate-400">
                {locationSubtext}
              </p>
            </div>
          </div>

          {/* =================================================
              NEARBY PHARMACIES
             ================================================= */}

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
              <HiOutlineBuildingStorefront
                size={20}
                className="text-primary-600"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Nearby Pharmacies
              </p>

              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">
                  {pharmacyCount} found
                </p>

                <Badge
                  variant="success"
                  dot
                  size="sm"
                >
                  In stock
                </Badge>
              </div>

              <p className="text-[11px] text-slate-400">
                Within {radius} km radius
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
export default PharmacySearchSummary