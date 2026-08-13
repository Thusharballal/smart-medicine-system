/**
 * Component: MedicineOverviewSection
 *
 * Description:
 * Hero overview card for the Medicine Details page.
 *
 * Displays:
 * - Medicine name
 * - Generic name
 * - Jan Aushadhi name
 * - Composition
 * - Strength
 * - Dosage form
 * - Category
 * - Manufacturer
 * - Description
 * - Active / Jan Aushadhi badges
 */

import {
  HiOutlineBuildingOffice2,
  HiOutlineShieldCheck,
} from 'react-icons/hi2'
import Badge from '../../../components/ui/Badge'

// =====================================================
// Medicine Image Placeholder
// =====================================================
function MedicineImageCard({ type, name }) {
  return (
    <div
      aria-label={`Medicine image placeholder for ${name}`}
      className="relative flex flex-col items-center justify-center w-full aspect-square max-w-[220px] mx-auto rounded-2xl bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-2 border-primary-100 shadow-md overflow-hidden"
    >
      <MdMedication
        size={64}
        className="text-primary-500"
        aria-hidden="true"
      />

      <p className="mt-3 text-sm font-semibold text-slate-600">
        {type || 'Medicine'}
      </p>

      <p className="mt-1 text-xs text-slate-400 text-center px-4">
        {name || 'Medicine'}
      </p>
    </div>
  )
}

// =====================================================
// Detail Row
// =====================================================
function DetailRow({ label, value, valueClass = '' }) {
  if (!value) return null

  return (
    <div className="flex items-start gap-4 py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-xs font-semibold text-slate-400 w-28 shrink-0">
        {label}
      </span>

      <span
        className={`text-xs text-slate-700 flex-1 ${valueClass}`}
      >
        {value}
      </span>
    </div>
  )
}

// =====================================================
// Medicine Overview Section
// =====================================================
function MedicineOverviewSection({ medicine = {} }) {
  const {
    generic_name = 'Medicine',
    jan_aushadhi_name = '',
    composition = '',
    strength = '',
    dosage_form = '',
    category = '',
    manufacturer = '',
    description = '',
    is_archived = false,
  } = medicine

  return (
    <section
      aria-labelledby="medicine-overview-heading"
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* =================================================
            Left: Medicine image + badges
           ================================================= */}
        <div className="flex flex-col justify-center">
          <MedicineImageCard
            type={dosage_form}
            name={generic_name}
          />

          <div className="flex flex-wrap justify-center gap-2 mt-4">

            {!is_archived && (
              <Badge variant="success" size="sm">
                Active
              </Badge>
            )}

            {!is_archived && (
              <Badge variant="info" size="sm">
                Jan Aushadhi
              </Badge>
            )}

            {is_archived && (
              <Badge variant="neutral" size="sm">
                Archived
              </Badge>
            )}

          </div>
        </div>

        {/* =================================================
            Right: Medicine identity + details
           ================================================= */}
        <div className="md:col-span-2 flex flex-col gap-4">

          {/* Name */}
          <div>
            <h1
              id="medicine-overview-heading"
              className="text-2xl font-extrabold text-slate-900 leading-tight"
            >
              {generic_name}
            </h1>

            {jan_aushadhi_name && (
              <p className="text-sm text-slate-500 mt-1 italic">
                {jan_aushadhi_name}
              </p>
            )}

            {description && (
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-1">

            <DetailRow
              label="Composition"
              value={composition}
            />

            <DetailRow
              label="Strength"
              value={strength}
            />

            <DetailRow
              label="Dosage Form"
              value={dosage_form}
            />

            <DetailRow
              label="Category"
              value={category}
            />

            <DetailRow
              label="Manufacturer"
              value={manufacturer}
            />

          </div>

          {/* Footer metadata */}
          <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 pt-1">

            {manufacturer && (
              <span className="flex items-center gap-1">
                <HiOutlineBuildingOffice2
                  size={12}
                  aria-hidden="true"
                />
                {manufacturer}
              </span>
            )}

            {!is_archived && (
              <span className="flex items-center gap-1 text-success-600">
                <HiOutlineShieldCheck
                  size={12}
                  aria-hidden="true"
                />
                Jan Aushadhi
              </span>
            )}

          </div>

        </div>
      </div>
    </section>
  )
}
export default MedicineOverviewSection