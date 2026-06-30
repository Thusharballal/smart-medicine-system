import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  RiSearchLine, RiMicLine, RiUpload2Line,
  RiFilterLine, RiCloseLine,
  RiGridLine, RiListUnordered, RiArrowDownSLine,
} from 'react-icons/ri'
import { useMedicine } from '../../contexts/MedicineContext'
import { useToast } from '../../components/common/Toast'
import MedicineCard from '../../components/medicine/MedicineCard'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import Pagination from '../../components/common/Pagination'
import { CATEGORIES } from '../../mocks/medicines'

const AVAILABILITY_OPTIONS = ['All', 'In Stock', 'Limited Stock', 'Out of Stock']
const SORT_OPTIONS = [
  { label: 'Name A–Z',               value: 'name_asc' },
  { label: 'Name Z–A',               value: 'name_desc' },
  { label: 'Price: Low to High',     value: 'price_asc' },
  { label: 'Price: High to Low',     value: 'price_desc' },
  { label: 'Savings: High to Low',   value: 'savings_desc' },
]
const PAGE_SIZE = 9
const ALLOWED = /[^a-zA-Z0-9\-().\s]/g

export default function MedicinesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { medicines, toggleWatchlist, isInWatchlist, addRecentSearch } = useMedicine()
  const { toast } = useToast()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState('All')
  const [availability, setAvailability] = useState('All')
  const [type, setType] = useState('All')
  const [priceMax, setPriceMax] = useState(1000)
  const [sort, setSort] = useState('name_asc')
  const [layout, setLayout] = useState('card') // 'card' | 'list'
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const inputRef = useRef(null)

  // Simulate a brief loading state on search
  useEffect(() => {
    if (!query) return
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [query])

  // Sync URL → state
  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setQuery(q)
    setInputValue(q)
    if (q) addRecentSearch(q)
    setPage(1)
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = query
      ? `Search: "${query}" – JanAushadhi`
      : 'Medicine Search – JanAushadhi'
    return () => { document.title = 'JanAushadhi Smart Medicine' }
  }, [query])

  // ── Filter + sort ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...medicines]

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.genericComposition.toLowerCase().includes(q) ||
          (m.brandName ?? '').toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q),
      )
    }
    if (category !== 'All') list = list.filter((m) => m.category === category)
    if (availability !== 'All') list = list.filter((m) => m.availability === availability)
    if (type !== 'All') list = list.filter((m) => m.type === type)
    list = list.filter((m) => m.mrp <= priceMax)

    // sort
    list.sort((a, b) => {
      if (sort === 'name_asc')    return a.name.localeCompare(b.name)
      if (sort === 'name_desc')   return b.name.localeCompare(a.name)
      if (sort === 'price_asc')   return a.mrp - b.mrp
      if (sort === 'price_desc')  return b.mrp - a.mrp
      if (sort === 'savings_desc') {
        const sa = a.mrp - (a.janAushadhiPrice ?? a.mrp)
        const sb = b.mrp - (b.janAushadhiPrice ?? b.mrp)
        return sb - sa
      }
      return 0
    })
    return list
  }, [medicines, query, category, availability, type, priceMax, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(e) {
    e?.preventDefault()
    const q = inputValue.trim()
    setSearchParams(q ? { q } : {})
  }

  function handleWatchlistToggle(med) {
    toggleWatchlist(med)
    toast(
      isInWatchlist(med.id)
        ? `Removed "${med.name}" from watchlist.`
        : `Added "${med.name}" to watchlist.`,
      { variant: isInWatchlist(med.id) ? 'info' : 'success' },
    )
  }

  function resetFilters() {
    setCategory('All'); setAvailability('All'); setType('All'); setPriceMax(1000)
    setSort('name_asc')
  }

  const activeFilterCount = [
    category !== 'All', availability !== 'All', type !== 'All',
    priceMax !== 1000, sort !== 'name_asc',
  ].filter(Boolean).length

  return (
    <div className="space-y-5 pb-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Medicine Search</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Search 10,000+ medicines and find cheaper Jan Aushadhi alternatives
        </p>
      </div>

      {/* ── Search bar ── */}
      <form
        onSubmit={handleSearch}
        role="search"
        aria-label="Medicine search"
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <RiSearchLine
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.replace(ALLOWED, '').slice(0, 100))}
            placeholder="Search by name, generic composition, brand…"
            aria-label="Search medicines"
            autoComplete="off"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors"
          />
        </div>
        <Button type="submit" variant="primary" size="md" aria-label="Search">
          Search
        </Button>
        <button
          type="button"
          title="Voice search (coming soon)"
          aria-label="Voice search – coming soon"
          className="p-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <RiMicLine size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          title="Upload prescription (coming soon)"
          aria-label="Upload prescription – coming soon"
          className="p-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <RiUpload2Line size={18} aria-hidden="true" />
        </button>
      </form>

      {/* ── Filter / sort bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <RiFilterLine size={15} aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-primary-600 text-white">
              {activeFilterCount}
            </span>
          )}
          <RiArrowDownSLine
            size={15}
            className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {/* Sort select */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1) }}
          aria-label="Sort results"
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Layout toggle */}
        <div className="ml-auto flex gap-1">
          <button
            type="button"
            onClick={() => setLayout('card')}
            aria-pressed={layout === 'card'}
            aria-label="Card layout"
            className={`p-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${layout === 'card' ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400' : 'border-gray-300 dark:border-gray-600 text-gray-500'}`}
          >
            <RiGridLine size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setLayout('list')}
            aria-pressed={layout === 'list'}
            aria-label="List layout"
            className={`p-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${layout === 'list' ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400' : 'border-gray-300 dark:border-gray-600 text-gray-500'}`}
          >
            <RiListUnordered size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Expanded filter panel ── */}
      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-fade-in">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Type</label>
            <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600">
              {['All', 'branded', 'janaushadhi'].map((t) => <option key={t} value={t}>{t === 'All' ? 'All' : t === 'branded' ? 'Branded' : 'Jan Aushadhi'}</option>)}
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Availability</label>
            <select value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1) }} className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600">
              {AVAILABILITY_OPTIONS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>

          {/* Max price */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Max Price: <span className="text-primary-600">₹{priceMax}</span>
            </label>
            <input
              type="range"
              min={0} max={1000} step={10}
              value={priceMax}
              onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1) }}
              aria-label="Maximum price filter"
              className="w-full accent-primary-600"
            />
          </div>

          {/* Reset */}
          <div className="col-span-full flex justify-end">
            <Button variant="ghost" size="sm" onClick={resetFilters} leftIcon={<RiCloseLine size={14} />}>
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* ── Results summary ── */}
      {!loading && (
        <p
          className="text-sm text-gray-500 dark:text-gray-400"
          aria-live="polite"
          aria-atomic="true"
        >
          {query
            ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`
            : `${filtered.length} medicines`}
        </p>
      )}

      {/* ── Results ── */}
      {loading ? (
        <div className={layout === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} variant="medicineCard" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<RiSearchLine size={32} />}
          title="No medicines found"
          description={query ? `No results for "${query}". Try a different name or remove filters.` : 'No medicines match the current filters.'}
          action={{ label: 'Clear Filters', onClick: resetFilters }}
          className="py-16 rounded-2xl border border-gray-200 dark:border-gray-700"
        />
      ) : (
        <>
          <div
            className={layout === 'card'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-3'}
            aria-label="Medicine search results"
            aria-live="polite"
          >
            {pageItems.map((med) => (
              <MedicineCard
                key={med.id}
                medicine={{ ...med, isInWatchlist: isInWatchlist(med.id) }}
                layout={layout}
                onWatchlistToggle={handleWatchlistToggle}
                onFindAlternative={(m) => navigate(`/medicines/${m.id}`)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
