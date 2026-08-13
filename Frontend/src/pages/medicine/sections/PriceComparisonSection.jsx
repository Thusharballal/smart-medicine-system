import { HiOutlineCurrencyRupee } from 'react-icons/hi2'
import Badge from '../../../components/ui/Badge'
// =====================================================
// Price Comparison Section
// =====================================================
function PriceComparisonSection({ medicine = {} }) {
const {
  brand_names = [],
  generic_name = 'Medicine',
  jan_aushadhi_name = '',
  branded_price = 0,
  jan_aushadhi_price = 0,
} = medicine
const savings = Math.max(
  0,
  branded_price - jan_aushadhi_price
)
  return (
    <section aria-labelledby="price-comparison-heading">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineCurrencyRupee
            size={18}
            className="text-primary-600"
            aria-hidden="true"
          />
          <h2
            id="price-comparison-heading"
            className="text-base font-bold text-slate-900"
          >
            Price Comparison
          </h2>
          <Badge variant="success" size="sm">
            Save More
          </Badge>
        </div>
        {/* Price comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Brand Price */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Brand Medicine
            </p>
            <p className="text-base font-bold text-slate-700">
              {brand_names.join(', ') || 'Branded Medicine'} 
           </p>
            <p className="text-2xl font-extrabold text-slate-800">
              ₹{branded_price}
            </p>
          </div>
          {/* Jan Aushadhi Price */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-primary-50 border border-primary-200 text-center">
            <p className="text-[11px] font-semibold text-primary-500 uppercase tracking-wider">
              Jan Aushadhi
            </p>
            <p className="text-base font-bold text-primary-700">
              {jan_aushadhi_name || generic_name}
            </p>
            <p className="text-2xl font-extrabold text-primary-700">
              ₹{jan_aushadhi_price}
            </p>
          </div>
          {/* Savings */}
          <div className="flex flex-col justify-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider">
              You Save
            </p>
            <p className="text-3xl font-extrabold text-green-700">
              ₹{savings}
            </p>
          </div>
        </div>
        {/* Footer note */}
        <p className="text-[10px] text-slate-400 mt-4 text-center">
          Price comparison is based on the medicine data currently available
          in the system.
        </p>

      </div>
    </section>
  )
}
export default PriceComparisonSection