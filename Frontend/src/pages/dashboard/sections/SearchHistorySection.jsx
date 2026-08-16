import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineArrowRight,
} from 'react-icons/hi2'
import { ROUTES } from '../../../constants/routes'
// TODO: Replace with:
// GET /api/v1/users/me/search-history
const INIT_HISTORY = [
  {
    id: 'h1',
    query: 'Paracetamol',
    type: 'Medicine Name',
    date: '2 hours ago',
  },
  {
    id: 'h2',
    query: 'Azithromycin',
    type: 'Medicine Name',
    date: '1 day ago',
  },
  {
    id: 'h3',
    query: 'Metformin',
    type: 'Generic Name',
    date: '2 days ago',
  },
  {
    id: 'h4',
    query: 'Cetirizine',
    type: 'Composition',
    date: '3 days ago',
  },
  {
    id: 'h5',
    query: 'Vitamin D3',
    type: 'Medicine Name',
    date: '5 days ago',
  },
]

function SearchHistorySection() {
  const [items, setItems] = useState(INIT_HISTORY)
  const navigate = useNavigate()

  // =====================================================
  // Search again
  // =====================================================
  function handleResearch(query) {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return
    }

    navigate(
      `${ROUTES.USER.SEARCH_RESULTS}?q=${encodeURIComponent(
        trimmedQuery
      )}`
    )
  }
  // =====================================================
  // Remove one history item
  // =====================================================
  function handleRemove(id) {
    setItems((previous) =>
      previous.filter((item) => item.id !== id)
    )
  }

  // =====================================================
  // Clear complete history
  // =====================================================
  function handleClearAll() {
    setItems([])
  }

  return (
    <section
      aria-labelledby="search-history-heading"
      className="w-full"
    >
      {/* =====================================================
          Section Header
         ===================================================== */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2
          id="search-history-heading"
          className="
            flex
            items-center
            gap-2
            text-base
            font-bold
            text-slate-900
          "
        >
          <HiOutlineClock
            size={17}
            className="text-slate-400 shrink-0"
            aria-hidden="true"
          />

          Recent Searches
        </h2>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="
              shrink-0
              text-xs
              font-medium
              text-slate-400
              hover:text-danger-500
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-danger-400
              rounded
            "
          >
            Clear All
          </button>
        )}
      </div>

      {/* =====================================================
          Search History Container
         ===================================================== */}
      <div
        className="
          bg-white
          rounded-2xl
          border
          border-slate-100
          shadow-sm
          overflow-hidden
        "
      >
        {items.length === 0 ? (

          /* =================================================
             Empty State
             ================================================= */
          <div className="py-10 px-4 text-center">

            <div
              className="
                mx-auto
                flex
                items-center
                justify-center
                w-11
                h-11
                rounded-full
                bg-slate-100
                text-slate-400
                mb-3
              "
            >
              <HiOutlineClock
                size={20}
                aria-hidden="true"
              />
            </div>

            <p className="text-sm font-medium text-slate-600">
              No recent searches
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Your recent medicine searches will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate(ROUTES.USER.SEARCH)}
              className="
                inline-flex
                items-center
                gap-1.5
                mt-4
                px-3
                py-2
                rounded-lg
                bg-primary-600
                text-white
                text-xs
                font-semibold
                hover:bg-primary-700
                transition-colors
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary-500
              "
            >
              <HiOutlineMagnifyingGlass
                size={14}
                aria-hidden="true"
              />

              Search Medicine
            </button>
          </div>

        ) : (

          /* =================================================
             History List
             ================================================= */
          <ul
            aria-label="Recent medicine searches"
            className="divide-y divide-slate-100"
          >
            {items.map((item) => (
              <li
                key={item.id}
                className="
                  group
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  hover:bg-slate-50
                  transition-colors
                "
              >

                {/* =================================================
                   Search Icon
                   ================================================= */}
                <button
                  type="button"
                  onClick={() => handleResearch(item.query)}
                  aria-label={`Search for ${item.query}`}
                  className="
                    shrink-0
                    flex
                    items-center
                    justify-center
                    w-9
                    h-9
                    rounded-lg
                    bg-primary-50
                    text-primary-600
                    hover:bg-primary-100
                    transition-colors
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary-500
                  "
                >
                  <HiOutlineMagnifyingGlass
                    size={16}
                    aria-hidden="true"
                  />
                </button>

                {/* =================================================
                   Search Information
                   ================================================= */}
                <button
                  type="button"
                  onClick={() => handleResearch(item.query)}
                  className="
                    flex-1
                    min-w-0
                    text-left
                    rounded
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary-500
                  "
                >
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-800
                      truncate
                      group-hover:text-primary-700
                      transition-colors
                    "
                  >
                    {item.query}
                  </p>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {item.type} · {item.date}
                  </p>
                </button>

                {/* =================================================
                   Search Again
                   Desktop
                   ================================================= */}
                <button
                  type="button"
                  onClick={() => handleResearch(item.query)}
                  className="
                    hidden
                    sm:inline-flex
                    shrink-0
                    items-center
                    gap-1
                    text-[11px]
                    font-semibold
                    text-primary-600
                    hover:text-primary-700
                    px-2
                    py-1.5
                    rounded-lg
                    hover:bg-primary-50
                    transition-colors
                    focus-visible:outline-none
                    focus-visible:ring-1
                    focus-visible:ring-primary-400
                  "
                >
                  Search

                  <HiOutlineArrowRight
                    size={12}
                    aria-hidden="true"
                  />
                </button>

                {/* =================================================
                   Remove
                   ================================================= */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  aria-label={`Remove ${item.query} from search history`}
                  className="
                    shrink-0
                    flex
                    items-center
                    justify-center
                    w-7
                    h-7
                    rounded-md
                    text-slate-300
                    hover:text-danger-500
                    hover:bg-danger-50
                    transition-colors
                    focus-visible:outline-none
                    focus-visible:ring-1
                    focus-visible:ring-danger-400
                  "
                >
                  <HiOutlineXMark
                    size={15}
                    aria-hidden="true"
                  />
                </button>

              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
export default SearchHistorySection