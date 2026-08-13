import { useState, useCallback, useMemo, useEffect } from 'react'
import medicineService from '../../services/medicineService'
import { useSearchParams, useNavigate } from 'react-router-dom'
import SearchSummarySection from './sections/SearchSummarySection'
import ResultsToolbar from './sections/ResultsToolbar'
import ResultsGrid from './sections/ResultsGrid'
import CompareBar from './sections/CompareBar'
import SearchEmptyState from '../search/sections/SearchEmptyState'
import { ROUTES } from '../../constants/routes'
const MAX_COMPARE = 4
function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') ?? ''
  // ── UI state ──────────────────────────────────────────────────────────
  const [layout, setLayout] = useState('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filterOpen, setFilterOpen] = useState(false)

  // ── API state ─────────────────────────────────────────────────────────
  const [medicines, setMedicines] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // ── Fetch medicines ────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchMedicines() {
      try {
        setIsLoading(true)
        setIsError(false)

        const response = await medicineService.search({
          q: query,
        })

        const formattedMedicines = response.data.map((medicine) => ({
          ...medicine,

          // ── Important mapping for your project ──────────────────────
          // Brand search → Generic → Jan Aushadhi
          isJanAushadhi: Boolean(medicine.jan_aushadhi_name),
          isGeneric: Boolean(medicine.generic_name),

          // Display Jan Aushadhi medicine as the main name
          name: medicine.jan_aushadhi_name,

          // Display generic medicine below the main name
          genericName: medicine.generic_name,

          // Existing card fields
          composition: medicine.composition,
          manufacturer: medicine.manufacturer,
          strength: medicine.strength,

          // Medicine type
          type: medicine.dosage_form,

          // Category
          category: medicine.category,

          // Price
          price: medicine.price,
        }))

        setMedicines(formattedMedicines)
      } catch (error) {
        console.error('Medicine Search Error:', error)
        setIsError(true)
        setMedicines([])
      } finally {
        setIsLoading(false)
      }
    }

    if (query.trim() !== '') {
      fetchMedicines()
    } else {
      setMedicines([])
    }
  }, [query])

  // ── Sorted medicines ──────────────────────────────────────────────────
  const sortedMedicines = useMemo(() => {
    const copy = [...medicines]

    if (sortBy === 'price_asc') {
      copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    }

    if (sortBy === 'price_desc') {
      copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    }

    if (sortBy === 'name_asc') {
      copy.sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '')
      )
    }

    if (sortBy === 'name_desc') {
      copy.sort((a, b) =>
        (b.name ?? '').localeCompare(a.name ?? '')
      )
    }

    return copy
  }, [medicines, sortBy])

  // ── Compare handlers ──────────────────────────────────────────────────
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

  const handleClearCompare = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleCompareAction = useCallback(() => {
    // Compare functionality can be implemented later.
  }, [])

  const handleCompareToggle = useCallback(() => {
    setCompareMode((current) => !current)

    if (compareMode) {
      setSelectedIds(new Set())
    }
  }, [compareMode])

  // ── Navigation ─────────────────────────────────────────────────────────
  const handleViewMedicine = useCallback(
    (id) => {
      navigate(
        `${ROUTES.USER.MEDICINE_DETAIL.replace(
          ':id',
          id
        )}?searched=${encodeURIComponent(query)}`
      )
    },
    [navigate, query]
  )

  const handleRetrySearch = useCallback(() => {
    navigate(ROUTES.USER.SEARCH)
  }, [navigate])

  // ── Selected medicines ────────────────────────────────────────────────
  const selectedMedicines = sortedMedicines.filter((medicine) =>
    selectedIds.has(medicine.id)
  )

  return (
    <article aria-label="Search Results">

      {/* ===================================================== */}
      {/* Search Summary                                        */}
      {/* ===================================================== */}
      <SearchSummarySection
        query={query}
        resultCount={sortedMedicines.length}
      />

      {/* ===================================================== */}
      {/* Results Toolbar                                       */}
      {/* ===================================================== */}
      <ResultsToolbar
        layout={layout}
        onLayoutChange={setLayout}
        sortBy={sortBy}
        onSortChange={setSortBy}
        compareMode={compareMode}
        onCompareToggle={handleCompareToggle}
        selectedCount={selectedIds.size}
        onCompareAction={handleCompareAction}
        onFilterToggle={() => setFilterOpen((open) => !open)}
        filterActive={filterOpen}
        resultCount={sortedMedicines.length}
      />

      {/* ===================================================== */}
      {/* Search Results                                        */}
      {/* ===================================================== */}
      <div className="mt-4">

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            Searching medicines...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            Failed to search medicines.
            <button
              type="button"
              onClick={handleRetrySearch}
              className="block mx-auto mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Try Again
            </button>
          </div>
        ) : sortedMedicines.length > 0 ? (
          <ResultsGrid
            medicines={sortedMedicines}
            layout={layout}
            compareMode={compareMode}
            selectedIds={selectedIds}
            onToggleCompare={handleToggleCompare}
            onView={handleViewMedicine}
          />
        ) : (
          <SearchEmptyState
            query={query}
            onRetry={handleRetrySearch}
          />
        )}

      </div>

      {/* ===================================================== */}
      {/* Compare Bar                                           */}
      {/* ===================================================== */}
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