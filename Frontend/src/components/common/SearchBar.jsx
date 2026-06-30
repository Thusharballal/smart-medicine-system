import React, { useState, useRef, useEffect, useCallback, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiSearchLine, RiCloseLine, RiLoaderLine } from 'react-icons/ri'

/**
 * SearchBar – medicine search input with debounced autocomplete.
 *
 * Requirements:
 *   - Accepts letters, digits, hyphens, parentheses, periods, spaces (max 100 chars).
 *   - Shows autocomplete suggestions after 3+ chars with 300 ms debounce.
 *   - Clears suggestions for < 3 chars.
 *   - Navigates to /medicines?q=<query> on submit or suggestion select.
 *   - Fully keyboard accessible (arrow keys, Escape, Enter).
 *
 * Props:
 *   onSearch       – (query: string) => Promise<suggestion[]> | suggestion[]
 *                    Each suggestion: { id, name, type: 'branded'|'janaushadhi', genericComposition? }
 *   onSubmit       – override navigate; (query: string) => void
 *   placeholder    – input placeholder
 *   size           – 'sm' | 'md' | 'lg' (default: 'md')
 *   autoFocus
 *   className
 */

const ALLOWED_PATTERN = /[^a-zA-Z0-9\-().\ ]/g
const MIN_CHARS = 3
const DEBOUNCE_MS = 300
const MAX_CHARS = 100

const sizeMap = {
  sm: { input: 'py-2 pl-9 pr-9 text-sm', icon: 16, wrapper: 'h-10' },
  md: { input: 'py-2.5 pl-10 pr-10 text-sm', icon: 18, wrapper: 'h-11' },
  lg: { input: 'py-3 pl-11 pr-11 text-base', icon: 20, wrapper: 'h-12' },
}

function SearchBar({
  onSearch,
  onSubmit,
  placeholder = 'Search medicines by name or composition…',
  size = 'md',
  autoFocus = false,
  className = '',
}) {
  const navigate = useNavigate()
  const listId = useId()
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef(null)

  const { input: inputSize, icon: iconSize, wrapper: wrapperH } = sizeMap[size] ?? sizeMap.md

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(
    (value) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (!onSearch || value.length < MIN_CHARS) {
        setSuggestions([])
        setIsOpen(false)
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await onSearch(value)
          setSuggestions(Array.isArray(results) ? results : [])
          setIsOpen(true)
        } catch {
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      }, DEBOUNCE_MS)
    },
    [onSearch],
  )

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (!containerRef.current?.contains(e.target)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleChange(e) {
    const raw = e.target.value.replace(ALLOWED_PATTERN, '').slice(0, MAX_CHARS)
    setQuery(raw)
    setActiveIndex(-1)
    fetchSuggestions(raw)
  }

  function handleSubmit(e) {
    e?.preventDefault()
    const q = suggestions[activeIndex]?.name ?? query
    if (!q.trim()) return
    setIsOpen(false)
    if (onSubmit) onSubmit(q)
    else navigate(`/medicines?q=${encodeURIComponent(q.trim())}`)
  }

  function handleSuggestionSelect(suggestion) {
    setQuery(suggestion.name)
    setIsOpen(false)
    if (onSubmit) onSubmit(suggestion.name)
    else navigate(`/medicines/${suggestion.id}`)
  }

  function handleKeyDown(e) {
    if (!isOpen || !suggestions.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSuggestionSelect(suggestions[activeIndex])
    }
  }

  function clearQuery() {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} role="search" aria-label="Medicine search">
        <div className={`relative flex items-center ${wrapperH}`}>
          {/* Search icon */}
          <span
            className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none"
            aria-hidden="true"
          >
            {isLoading
              ? <RiLoaderLine size={iconSize} className="animate-spin" />
              : <RiSearchLine size={iconSize} />}
          </span>

          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={isOpen && suggestions.length > 0}
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            aria-label={placeholder}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= MIN_CHARS && suggestions.length && setIsOpen(true)}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            maxLength={MAX_CHARS}
            className={[
              'w-full rounded-xl border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
              'transition-colors duration-150',
              inputSize,
            ].join(' ')}
          />

          {/* Clear button */}
          {query.length > 0 && (
            <button
              type="button"
              onClick={clearQuery}
              aria-label="Clear search"
              className="absolute right-3 p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                         focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600"
            >
              <RiCloseLine size={iconSize} aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          className={[
            'absolute top-full left-0 right-0 z-50 mt-1',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700 rounded-xl',
            'shadow-lg overflow-hidden',
            'max-h-64 overflow-y-auto scrollbar-thin',
            'animate-fade-in',
          ].join(' ')}
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.id ?? idx}
              id={`suggestion-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              className={[
                'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                idx === activeIndex
                  ? 'bg-primary-50 dark:bg-primary-950'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700',
              ].join(' ')}
              onMouseDown={(e) => { e.preventDefault(); handleSuggestionSelect(s) }}
            >
              <RiSearchLine
                size={14}
                className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium truncate">{s.name}</p>
                {s.genericComposition && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.genericComposition}</p>
                )}
              </div>
              {s.type && (
                <span
                  className={[
                    'shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium',
                    s.type === 'janaushadhi'
                      ? 'bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
                  ].join(' ')}
                >
                  {s.type === 'janaushadhi' ? 'Generic' : 'Branded'}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar
