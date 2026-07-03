/**
 * Component: SearchResultsPage
 *
 * Description:
 *   Displays medicines matching the user's search query.
 *   The primary interface for discovering medicines, comparing
 *   alternatives, saving favourites, and locating pharmacies.
 *
 * Responsibilities:
 *   - Read search query from URL param (?q=...)
 *   - Manage layout, sort, compare mode, selected medicines state
 *   - Compose SearchSummary, ResultsToolbar, ResultsGrid, CompareBar
 *   - Show loading / empty / error states (reuses existing components)
 *
 * Route: /search/results?q={query}  (inside ProtectedRoute → UserLayout)
 *
 * Backend readiness:
 *   - Replace PLACEHOLDER_RESULTS with TanStack Query:
 *     const { data, isLoading, isError } = useQuery({
 *       queryKey: ['medicines', 'search', query],
 *       queryFn: () => medicineService.search({ q: query }),
 *     })
 *   All placeholder data is clearly marked with TODO comments.
 *
 * Dependencies:
 *   - SearchSummarySection, ResultsToolbar, ResultsGrid, CompareBar
 *   - SearchEmptyState, SearchErrorState (reused from Module 7A)
 *   - MedicineCardSkeleton (reused from feedback components)
 *   - useSearchParams (React Router v7)
 */

import { useState, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate }   from 'react-router-dom'
import SearchSummarySection from './sections/SearchSummarySection'
import ResultsToolbar       from './sections/ResultsToolbar'
import ResultsGrid          from './sections/ResultsGrid'
import CompareBar           from './sections/CompareBar'
import SearchEmptyState     from '../search/sections/SearchEmptyState'
import { ROUTES } from '../../constants/routes'

// ======================================
// Placeholder medicine data
// TODO: Replace with GET /api/v1/medicines/search?q={query} in Module 7B Part 2
// Shape must match the medicine object expected by SearchResultCard.
// ======================================
const PLACEHOLDER_RESULTS = [
  {
    id: 'm1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen',
    composition: 'Paracetamol 500mg', manufacturer: 'Jan Aushadhi',
    strength: '500mg', type: 'Tablet', category: 'Analgesic',
    price: 18, mrp: 35, availability: 'available',
    isGeneric: true, isJanAushadhi: true, isAffordable: true,
    nearbyPharmacyCount: 5,
  },
  {
    id: 'm2', name: 'Crocin 500', genericName: 'Paracetamol',
    composition: 'Paracetamol 500mg', manufacturer: 'GSK',
    strength: '500mg', type: 'Tablet', category: 'Analgesic',
    price: 32, mrp: 32, availability: 'available',
    isGeneric: false, nearbyPharmacyCount: 8,
  },
  {
    id: 'm3', name: 'Dolo 650', genericName: 'Paracetamol',
    composition: 'Paracetamol 650mg', manufacturer: 'Micro Labs',
    strength: '650mg', type: 'Tablet', category: 'Analgesic',
    price: 30, mrp: 30, availability: 'available',
    isGeneric: false, nearbyPharmacyCount: 12,
  },
  {
    id: 'm4', name: 'Paracetamol IP 650mg', genericName: 'Acetaminophen',
    composition: 'Paracetamol 650mg', manufacturer: 'Jan Aushadhi',
    strength: '650mg', type: 'Tablet', category: 'Analgesic',
    price: 22, mrp: 40, availability: 'available',
    isGeneric: true, isJanAushadhi: true, isAffordable: true,
    nearbyPharmacyCount: 4,
  },
  {
    id: 'm5', name: 'Paracetamol Syrup 120mg/5ml', genericName: 'Acetaminophen',
    composition: 'Paracetamol 120mg/5ml', manufacturer: 'Jan Aushadhi',
    strength: '120mg/5ml', type: 'Syrup', category: 'Analgesic',
    price: 28, mrp: 55, availability: 'available',
    isGeneric: true, isJanAushadhi: true, nearbyPharmacyCount: 3,
  },
  {
    id: 'm6', name: 'Calpol 250mg Suspension', genericName: 'Paracetamol',
    composition: 'Paracetamol 250mg/5ml', manufacturer: 'GSK',
    strength: '250mg/5ml', type: 'Syrup', category: 'Pediatric',
    price: 65, mrp: 65, availability: 'limited',
    nearbyPharmacyCount: 2,
  },
]

const MAX_COMPARE = 4

// ======================================
// Search Results Page
// ======================================
function SearchResultsPage() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const query           = searchParams.get('q') ?? ''

  // ── UI state ───────────────────────────────────────────────────────────
  const [layout,      setLayout]      = useState('grid')
  const [sortBy,      setSortBy]      = useState('relevance')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filterOpen,  setFilterOpen]  = useState(false)

  // Placeholder data states — replace with TanStack Query in Module 7B Part 2
  // const isLoading = false
  // const isError   = false
  const medicines = PLACEHOLDER_RESULTS

  // ── Sorted medicines ───────────────────────────────────────────────────
  const sortedMedicines = useMemo(() => {
    // TODO: server-side sort in Module 7B Part 2 (sort_by query param)
    const copy = [...medicines]
    if (sortBy === 'price_asc')  copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    if (sortBy === 'price_desc') copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    if (sortBy === 'name_asc')   copy.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'name_desc')  copy.sort((a, b) => b.name.localeCompare(a.name))
    return copy
  }, [medicines, sortBy])

  // ── Compare handlers ───────────────────────────────────────────────────
  const handleToggleCompare = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < MAX_COMPARE) {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleClearCompare  = useCallback(() => { setSelectedIds(new Set()) }, [])
  const handleCompareAction = useCallback(() => {
    // TODO: Module 7B Part 2 — navigate to compare page or open compare modal
  }, [])

  const handleCompareToggle = useCallback(() => {
    setCompareMode((m) => !m)
    if (compareMode) setSelectedIds(new Set())
  }, [compareMode])

  // ── Navigation ─────────────────────────────────────────────────────────
  const handleViewMedicine = useCallback((id) => {
    // TODO: Module 7B Part 2 — navigate to /medicine/:id
    navigate(ROUTES.USER.MEDICINE_DETAIL.replace(':id', id))
  }, [navigate])

  const handleRetrySearch   = useCallback(() => {
    navigate(ROUTES.USER.SEARCH)
  }, [navigate])

  // Selected medicine objects for CompareBar
  const selectedMedicines = sortedMedicines.filter((m) => selectedIds.has(m.id))

  return (
    <article aria-label="Search Results">

      {/* ====================================== */}
      {/* Search Summary                         */}
      {/* ====================================== */}
      <SearchSummarySection
        query={query}
        resultCount={sortedMedicines.length}
      />

      {/* ====================================== */}
      {/* Results Toolbar                        */}
      {/* ====================================== */}
      <ResultsToolbar
        layout={layout}
        onLayoutChange={setLayout}
        sortBy={sortBy}
        onSortChange={setSortBy}
        compareMode={compareMode}
        onCompareToggle={handleCompareToggle}
        selectedCount={selectedIds.size}
        onCompareAction={handleCompareAction}
        onFilterToggle={() => setFilterOpen((o) => !o)}
        filterActive={filterOpen}
        resultCount={sortedMedicines.length}
      />

      {/* ====================================== */}
      {/* Search Results Grid                    */}
      {/* ====================================== */}
      <div className="mt-4">
        {sortedMedicines.length > 0 ? (
          <ResultsGrid
            medicines={sortedMedicines}
            layout={layout}
            compareMode={compareMode}
            selectedIds={selectedIds}
            onToggleCompare={handleToggleCompare}
            onView={handleViewMedicine}
          />
        ) : (
          <SearchEmptyState query={query} onRetry={handleRetrySearch} />
        )}
      </div>

      {/*
        ====================================
        Deferred to Module 7B Part 2:
          - Pagination / infinite scroll
          - Medicine detail navigation
          - Compare page / modal
          - Filter panel integration
          - Backend search API wiring
        ====================================
      */}

      {/* ====================================== */}
      {/* Error State placeholder                */}
      {/* Uncomment to preview error UI:         */}
      {/* <SearchErrorState onRetry={handleRetrySearch} /> */}
      {/* ====================================== */}

      {/* Loading skeleton preview (placeholder)  */}
      {/* Uncomment to preview loading UI:         */}
      {/*
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <MedicineCardSkeleton key={i} />)}
      </div>
      */}

      {/* ====================================== */}
      {/* Compare Bar (floating, portal-style)   */}
      {/* ====================================== */}
      {compareMode && (
        <CompareBar
          selectedMedicines={selectedMedicines}
          onRemove={handleToggleCompare}
          onCompare={handleCompareAction}
          onClear={handleClearCompare}
        />
      )}

    </article>
  )
}

export default SearchResultsPage
