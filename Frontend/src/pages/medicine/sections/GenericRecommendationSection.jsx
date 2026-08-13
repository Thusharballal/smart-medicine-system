import {
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
} from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'
import Badge from '../../../components/ui/Badge'
import { ROUTES } from '../../../constants/routes'
import { Link } from 'react-router-dom'
function GenericRecommendationSection({ generic = {}, brandName = '' }) {
const {
  generic_name = 'Medicine',
  jan_aushadhi_name = '',
  composition = '',
  jan_aushadhi_price = 0,
  manufacturer = '',
} = generic
  return (
    <section aria-labelledby="generic-rec-heading">
      <div className="relative bg-gradient-to-br from-success-50 to-primary-50 rounded-2xl border-2 border-success-200 shadow-md p-6 overflow-hidden">
        {/* Background accent */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-32 h-32 bg-success-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"
        />
        {/* Header */}
        <div className="flex flex-wrap gap-2 mb-4 relative">
          <Badge
            variant="success"
            size="md"
            icon={<span aria-hidden="true">⭐</span>}
          >
            Recommended Alternative
          </Badge>
          <Badge
            variant="info"
            size="md"
            icon={<span aria-hidden="true">🏥</span>}
          >
            PM Jan Aushadhi
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
          {/* LEFT */}
          <div className="flex flex-col gap-4">
            {/* Brand → Generic → Jan Aushadhi */}
            <div className="rounded-xl bg-white border border-success-200 p-4">
              {brandName && (
                <div className="mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Brand searched
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {brandName}
                  </p>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success-100 shrink-0">
                  <MdMedication
                    size={26}
                    className="text-success-700"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Generic Medicine
                  </p>
                  <h2
                    id="generic-rec-heading"
                    className="text-base font-bold text-slate-900"
                  >
                    {generic_name}
                  </h2>
                  <p className="text-xs text-primary-700 font-semibold mt-1">
                    Jan Aushadhi: {jan_aushadhi_name}
                  </p>
                </div>
              </div>
            </div>
            {/* Medicine information */}
            <div className="flex flex-col gap-2">
              {composition && (
                <div className="flex items-center gap-2 text-xs text-success-700">
                  <HiOutlineCheckCircle size={14} aria-hidden="true" />
                  <span>
                    Composition: {composition}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-primary-700">
                <HiOutlineShieldCheck size={14} aria-hidden="true" />
                <span>
                  Jan Aushadhi medicine
                </span>
              </div>
              {manufacturer && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <HiOutlineCheckCircle size={14} aria-hidden="true" />
                  <span>
                    Manufactured by: {manufacturer}
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex flex-col justify-between gap-4">
            {/* Price */}
            <div className="bg-white rounded-xl border border-success-200 p-4 text-center shadow-sm">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Jan Aushadhi Price
              </p>
              <p className="text-3xl font-extrabold text-success-700">
                ₹{jan_aushadhi_price}
              </p>
            </div>
            {/* CTA */}
            <div className="flex flex-col gap-2">

              <Link
                to={ROUTES.USER.NEARBY_PHARMACIES}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success-600 text-white text-sm font-semibold hover:bg-success-700 transition-colors"
              >
                Find at Nearby Pharmacy
                <HiOutlineArrowRight
                  size={15}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default GenericRecommendationSection