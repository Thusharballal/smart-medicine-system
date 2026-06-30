import React, { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  RiArrowLeftLine, RiHeartLine, RiHeartFill, RiLeafLine,
  RiMedicineBottleLine, RiCheckboxCircleLine, RiAlertLine,
  RiInformationLine, RiMapPinLine, RiArrowRightLine,
  RiQuestionLine, RiShieldCheckLine,
} from 'react-icons/ri'
import { useMedicine } from '../../contexts/MedicineContext'
import { useToast } from '../../components/common/Toast'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import { MEDICINES, JAN_AUSHADHI_ALTERNATIVES } from '../../mocks/medicines'

/* ── Availability badge ─────────────────────────────────────────────── */
function AvailBadge({ status }) {
  const cfg = {
    'In Stock':      'bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300',
    'Limited Stock': 'bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-300',
    'Out of Stock':  'bg-danger-100 text-danger-800 dark:bg-danger-950 dark:text-danger-300',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg[status] ?? cfg['In Stock']}`}>
      {status}
    </span>
  )
}

/* ── Confidence badge ───────────────────────────────────────────────── */
function ConfidenceBadge({ level }) {
  const cfg = {
    'Exact Match':          { cls: 'bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300', icon: RiShieldCheckLine },
    'Composition Match':    { cls: 'bg-primary-50 text-primary-800 dark:bg-primary-950 dark:text-primary-300', icon: RiCheckboxCircleLine },
    'Therapeutic Equivalent': { cls: 'bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-300', icon: RiInformationLine },
  }
  const { cls, icon: Icon } = cfg[level] ?? cfg['Exact Match']
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <Icon size={11} aria-hidden="true" />
      {level}
    </span>
  )
}

export default function MedicineDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toggleWatchlist, isInWatchlist } = useMedicine()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [freq, setFreq] = useState(2)
  const [whyOpen, setWhyOpen] = useState(false)
  const [freqError, setFreqError] = useState('')

  const medicine = useMemo(() => MEDICINES.find((m) => m.id === id), [id])
  const alternative = useMemo(() => JAN_AUSHADHI_ALTERNATIVES[id], [id])

  if (!medicine) {
    return (
      <EmptyState
        title="Medicine not found"
        description="We couldn't find the medicine you're looking for."
        action={{ label: 'Back to Search', onClick: () => navigate('/medicines') }}
        className="py-20"
      />
    )
  }

  const inWatchlist = isInWatchlist(medicine.id)
  const saving = alternative ? medicine.mrp - alternative.mrp : 0
  const savingPct = alternative ? ((saving / medicine.mrp) * 100).toFixed(1) : 0

  const annualSaving = useMemo(() => {
    if (!alternative) return 0
    const n = parseInt(freq)
    if (!n || n < 1 || n > 365) return null
    return saving * n * 12
  }, [alternative, freq, saving])

  function handleFreqChange(v) {
    const n = parseInt(v)
    setFreq(v)
    if (!v) { setFreqError(''); return }
    if (isNaN(n) || n < 1 || n > 365) setFreqError('Enter a value between 1 and 365.')
    else setFreqError('')
  }

  function handleWatchlist() {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/medicines/${id}`)}`)
      return
    }
    toggleWatchlist(medicine)
    toast(
      inWatchlist ? `Removed "${medicine.name}" from watchlist.` : `Added "${medicine.name}" to watchlist.`,
      { variant: inWatchlist ? 'info' : 'success' },
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
      >
        <RiArrowLeftLine size={16} aria-hidden="true" />
        Back to Search
      </button>

      {/* ── Medicine header ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${medicine.type === 'janaushadhi' ? 'bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300' : 'bg-primary-50 text-primary-800 dark:bg-primary-950 dark:text-primary-300'}`}>
                {medicine.type === 'janaushadhi' ? <RiLeafLine size={11} /> : <RiMedicineBottleLine size={11} />}
                {medicine.type === 'janaushadhi' ? 'Jan Aushadhi' : 'Branded'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{medicine.category}</span>
              <AvailBadge status={medicine.availability} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{medicine.name}</h1>
            {medicine.brandName && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Brand: {medicine.brandName}</p>}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">by {medicine.manufacturer}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{medicine.mrp}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{medicine.packSize}</p>
            </div>
            <button
              type="button"
              onClick={handleWatchlist}
              aria-pressed={inWatchlist}
              aria-label={inWatchlist ? `Remove ${medicine.name} from watchlist` : `Add ${medicine.name} to watchlist`}
              className="p-2.5 rounded-full border border-gray-200 dark:border-gray-600 hover:border-danger-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-400"
            >
              {inWatchlist
                ? <RiHeartFill size={22} className="text-danger-500" aria-hidden="true" />
                : <RiHeartLine size={22} className="text-gray-400" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Medicine Details ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Medicine info table */}
          <section aria-labelledby="medicine-info-heading" className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h2 id="medicine-info-heading" className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Medicine Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {[
                ['Generic Composition', medicine.genericComposition],
                ['Dosage Form', medicine.dosageForm],
                ['Strength', medicine.strength],
                ['Pack Size', medicine.packSize],
                ['Manufacturer', medicine.manufacturer],
                ['Category', medicine.category],
                ['Availability', medicine.availability],
                ['MRP', `₹${medicine.mrp}`],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{k}</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Description</dt>
              <dd className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{medicine.description}</dd>
            </div>
          </section>

          {/* Dosage */}
          <section aria-labelledby="dosage-heading" className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h2 id="dosage-heading" className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Dosage Instructions</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{medicine.dosageInstructions}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Storage</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{medicine.storageInstructions}</p>
            </div>
          </section>

          {/* Side effects */}
          <section aria-labelledby="side-effects-heading" className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h2 id="side-effects-heading" className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <RiAlertLine size={18} className="text-warning-600" aria-hidden="true" />
              Side Effects
            </h2>
            <ul className="flex flex-wrap gap-2">
              {medicine.sideEffects.map((s) => (
                <li key={s} className="px-2.5 py-1 rounded-full text-xs bg-warning-50 text-warning-800 dark:bg-warning-950 dark:text-warning-300 border border-warning-200 dark:border-warning-800">
                  {s}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── Right: Price comparison + Generic recommendation ── */}
        <div className="space-y-5">

          {/* Price comparison */}
          {alternative && (
            <section aria-labelledby="price-compare-heading" className="rounded-2xl border-2 border-accent-200 dark:border-accent-800 bg-accent-50 dark:bg-accent-950/30 p-5">
              <h2 id="price-compare-heading" className="text-base font-semibold text-accent-900 dark:text-accent-200 mb-4 flex items-center gap-2">
                <RiLeafLine size={18} aria-hidden="true" />
                Price Comparison
              </h2>
              <table className="w-full text-sm" aria-label="Price comparison between branded and Jan Aushadhi">
                <thead>
                  <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-accent-200 dark:border-accent-800">
                    <th className="text-left pb-2 font-semibold">Type</th>
                    <th className="text-right pb-2 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-accent-100 dark:border-accent-900">
                    <td className="py-2 text-gray-700 dark:text-gray-300">Branded (MRP)</td>
                    <td className="py-2 text-right font-semibold text-gray-900 dark:text-gray-100">₹{medicine.mrp}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-accent-700 dark:text-accent-300 flex items-center gap-1">
                      <RiLeafLine size={12} aria-hidden="true" /> Jan Aushadhi
                    </td>
                    <td className="py-2 text-right font-bold text-accent-700 dark:text-accent-300">₹{alternative.mrp}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-accent-300 dark:border-accent-700">
                    <td className="pt-3 font-semibold text-gray-900 dark:text-gray-100">You save</td>
                    <td className="pt-3 text-right">
                      <span className="font-bold text-accent-700 dark:text-accent-300">₹{saving} ({savingPct}%)</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </section>
          )}

          {/* Generic recommendation */}
          {alternative ? (
            <section aria-labelledby="generic-rec-heading" className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <h2 id="generic-rec-heading" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Jan Aushadhi Alternative
                </h2>
                <ConfidenceBadge level={alternative.confidence} />
              </div>

              <div className="rounded-xl bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800 p-4">
                <p className="text-sm font-semibold text-accent-900 dark:text-accent-200">{alternative.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{alternative.genericComposition}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">by {alternative.manufacturer}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-bold text-accent-700 dark:text-accent-300">₹{alternative.mrp}</span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-accent-200 text-accent-900 dark:bg-accent-800 dark:text-accent-100">
                    Save {savingPct}%
                  </span>
                </div>
                <AvailBadge status={alternative.availability} />
              </div>

              {/* Why this recommendation? */}
              <button
                type="button"
                onClick={() => setWhyOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
              >
                <RiQuestionLine size={13} aria-hidden="true" />
                Why this recommendation?
              </button>

              {/* Prescription frequency → annual saving */}
              <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-3">
                <label htmlFor="freq-input" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Times per month
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="freq-input"
                    type="number"
                    min={1} max={365}
                    value={freq}
                    onChange={(e) => handleFreqChange(e.target.value)}
                    className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                    aria-describedby={freqError ? 'freq-error' : undefined}
                  />
                  {annualSaving !== null && !freqError && (
                    <span className="text-sm font-semibold text-accent-600 dark:text-accent-400">
                      = ₹{annualSaving.toLocaleString()} / year saved
                    </span>
                  )}
                </div>
                {freqError && <p id="freq-error" role="alert" className="text-xs text-danger-600 dark:text-danger-400 mt-1">{freqError}</p>}
              </div>

              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleWatchlist}
                leftIcon={inWatchlist ? <RiHeartFill size={16} /> : <RiHeartLine size={16} />}
              >
                {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </Button>
            </section>
          ) : (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No Jan Aushadhi alternative currently available. Check back later.
              </p>
            </div>
          )}

          {/* Find pharmacy */}
          <Link to="/pharmacy-locator">
            <Button
              variant="outline"
              size="md"
              fullWidth
              leftIcon={<RiMapPinLine size={16} />}
              rightIcon={<RiArrowRightLine size={14} />}
            >
              Find Nearby Pharmacy
            </Button>
          </Link>
        </div>
      </div>

      {/* Why modal */}
      <Modal
        isOpen={whyOpen}
        onClose={() => setWhyOpen(false)}
        title="Why this recommendation?"
        size="md"
      >
        {alternative && (
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800">
              <RiShieldCheckLine size={20} className="text-accent-600 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-accent-900 dark:text-accent-200 mb-1">{alternative.confidence}</p>
                <p>{alternative.confidenceDetail}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p><strong>Branded reference price:</strong> ₹{medicine.mrp} per {medicine.packSize}</p>
              <p><strong>Jan Aushadhi price:</strong> ₹{alternative.mrp} per {alternative.packSize}</p>
              <p><strong>Matched composition:</strong> {alternative.genericComposition}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              Jan Aushadhi medicines are WHO-GMP certified and NABL-accredited lab tested — same active ingredient, same strength, at a fraction of the cost.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
