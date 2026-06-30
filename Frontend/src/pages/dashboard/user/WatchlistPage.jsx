import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiHeartLine, RiSearchLine,
  RiGridLine, RiListUnordered,
} from 'react-icons/ri'
import { useMedicine } from '../../../contexts/MedicineContext'
import { useToast } from '../../../components/common/Toast'
import MedicineCard from '../../../components/medicine/MedicineCard'
import EmptyState from '../../../components/common/EmptyState'
import Button from '../../../components/common/Button'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import Loader from '../../../components/common/Loader'

const SORT_OPTIONS = [
  { label: 'Name A–Z',             value: 'name_asc'   },
  { label: 'Name Z–A',             value: 'name_desc'  },
  { label: 'Price: Low to High',   value: 'price_asc'  },
  { label: 'Price: High to Low',   value: 'price_desc' },
  { label: 'Savings: High to Low', value: 'savings_desc'},
]

function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useMedicine()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [search, setSearch]         = useState('')
  const [sort, setSort]             = useState('name_asc')
  const [layout, setLayout]         = useState('card')
  const [confirmId, setConfirmId]   = useState(null)
  const [loading]                   = useState(false)

  const filtered = useMemo(() => {
    let list = [...watchlist]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.genericComposition.toLowerCase().includes(q),
      )
    }
    list.sort((a, b) => {
      if (sort === 'name_asc')     return a.name.localeCompare(b.name)
      if (sort === 'name_desc')    return b.name.localeCompare(a.name)
      if (sort === 'price_asc')    return a.mrp - b.mrp
      if (sort === 'price_desc')   return b.mrp - a.mrp
      if (sort === 'savings_desc') {
        const sa = a.mrp - (a.janAushadhiPrice ?? a.mrp)
        const sb = b.mrp - (b.janAushadhiPrice ?? b.mrp)
        return sb - sa
      }
      return 0
    })
    return list
  }, [watchlist, search, sort])

  function handleRemove(id) {
    const med = watchlist.find((m) => m.id === id)
    removeFromWatchlist(id)
    toast(`Removed "${med?.name ?? 'medicine'}" from watchlist.`, { variant: 'info' })
    setConfirmId(null)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <RiHeartLine size={26} className="text-danger-500" aria-hidden="true" />
            My Watchlist
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {watchlist.length} {watchlist.length === 1 ? 'medicine' : 'medicines'} saved
          </p>
        </div>
        <Link to="/medicines">
          <Button variant="primary" size="md" leftIcon={<RiSearchLine size={16} />}>
            Search Medicines
          </Button>
        </Link>
      </div>

      {watchlist.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <RiSearchLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search watchlist…"
              aria-label="Search saved medicines"
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort watchlist"
            className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Layout */}
          <div className="flex gap-1">
            {[
              { v: 'card', Icon: RiGridLine,        label: 'Card layout'  },
              { v: 'list', Icon: RiListUnordered,   label: 'List layout'  },
            ].map(({ v, Icon, label }) => (
              <button
                key={v}
                type="button"
                onClick={() => setLayout(v)}
                aria-pressed={layout === v}
                aria-label={label}
                className={`p-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${layout === v ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400' : 'border-gray-300 dark:border-gray-600 text-gray-500'}`}
              >
                <Icon size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader size="lg" label="Loading watchlist…" />
        </div>
      ) : filtered.length === 0 ? (
        watchlist.length === 0 ? (
          <EmptyState
            icon={<RiHeartLine size={36} />}
            title="Your watchlist is empty"
            description="Search for medicines and save them here to track prices and find Jan Aushadhi alternatives."
            action={{ label: 'Search Medicines', onClick: () => navigate('/medicines') }}
            className="py-16 rounded-2xl border border-gray-200 dark:border-gray-700"
          />
        ) : (
          <EmptyState
            icon={<RiSearchLine size={32} />}
            title="No results"
            description={`No saved medicine matches "${search}".`}
            action={{ label: 'Clear search', onClick: () => setSearch('') }}
            className="py-12 rounded-2xl border border-gray-200 dark:border-gray-700"
          />
        )
      ) : (
        <div
          className={layout === 'card'
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'space-y-3'}
          aria-label="Saved medicines"
          aria-live="polite"
        >
          {filtered.map((med) => (
            <MedicineCard
              key={med.id}
              medicine={{ ...med, isInWatchlist: true }}
              layout={layout}
              onWatchlistToggle={() => setConfirmId(med.id)}
              onFindAlternative={(m) => navigate(`/medicines/${m.id}`)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => handleRemove(confirmId)}
        title="Remove from Watchlist?"
        message={`"${watchlist.find((m) => m.id === confirmId)?.name}" will be removed from your saved medicines.`}
        confirmLabel="Remove"
        intent="danger"
      />
    </div>
  )
}

export default WatchlistPage
