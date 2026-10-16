/**
 * Component: ImportStockPage
 *
 * Route: /pharmacy/import-stock
 *
 * Purpose:
 *   Upload supplier PDF/CSV → preview extracted inventory →
 *   review rows → select valid rows → confirm import.
 *
 * Backend:
 *   POST /api/v1/inventory/import/preview
 *   POST /api/v1/inventory/import/confirm
 *
 * Important:
 *   - No fake/sample inventory data.
 *   - PDF/CSV parsing is performed by FastAPI.
 *   - Scanned PDFs are handled by backend OCR.
 *   - Final import is handled by the backend MongoDB transaction.
 */
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineDocumentArrowUp,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineArchiveBox,
  HiOutlineInformationCircle,
  HiOutlineXMark,
  HiOutlineArrowPath,
} from 'react-icons/hi2'
import {
  MdMedication,
  MdPictureAsPdf,
  MdTableChart,
} from 'react-icons/md'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'
import axiosClient from '../../config/axiosClient'
// ===========================================================
// CONSTANTS
// ============================================================
const MAX_FILE_SIZE = 10 * 1024 * 1024
const PAGE_SIZE = 6
const ROW_STATUS = {
  matched: {
    variant: 'success',
    label: 'Matched',
  },

  review: {
    variant: 'warning',
    label: 'Review',
  },

  unmatched: {
    variant: 'warning',
    label: 'Unmatched',
  },
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const number = Number(value)

  if (Number.isNaN(number)) {
    return '—'
  }

  return `₹${number.toFixed(2)}`
}

function formatConfidence(value) {
  if (value === null || value === undefined) {
    return '0%'
  }

  const number = Number(value)

  if (Number.isNaN(number)) {
    return '0%'
  }

  return `${Math.round(number * 100)}%`
}

function getFileExtension(filename = '') {
  const parts = filename.toLowerCase().split('.')
  return parts.length > 1 ? parts.pop() : ''
}

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail
      .map(item => item?.msg || item)
      .join(', ')
  }

  if (detail?.message) {
    return detail.message
  }

  if (error?.message) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

function getRowStatus(row) {
  if (row?.errors?.length > 0) {
    return 'error'
  }

  if (row?.match_status === 'matched') {
    return 'matched'
  }

  if (row?.match_status === 'review') {
    return 'review'
  }

  return 'unmatched'
}

function getStatusConfig(row) {
  const status = getRowStatus(row)

  if (status === 'error') {
    return {
      variant: 'danger',
      label: 'Error',
    }
  }

  return ROW_STATUS[status] || ROW_STATUS.unmatched
}

function canImportRow(row) {
  return (
    row?.match_status === 'matched' &&
    !row?.errors?.length &&
    !!row?.medicine_id
  )
}

// ============================================================
// UPLOAD AREA
// ============================================================

function UploadArea({
  onFileSelected,
  isDragging,
  onDragEnter,
  onDragLeave,
  onDrop,
}) {
  function handleFileInput(event) {
    const file = event.target.files?.[0]

    if (file) {
      onFileSelected(file)
    }

    event.target.value = ''
  }

  function openFilePicker() {
    document
      .getElementById('inventory-import-file-input')
      ?.click()
  }

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={event => event.preventDefault()}
      onDrop={onDrop}
      onClick={openFilePicker}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openFilePicker()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload supplier PDF or CSV"
      className={[
        'flex flex-col items-center justify-center gap-5',
        'border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center',
        'transition-all duration-200 cursor-pointer',
        isDragging
          ? 'border-secondary-500 bg-secondary-50 scale-[1.01]'
          : 'border-slate-300 bg-slate-50 hover:border-secondary-400 hover:bg-secondary-50',
      ].join(' ')}
    >
      <input
        id="inventory-import-file-input"
        type="file"
        accept=".pdf,.csv,application/pdf,text/csv"
        className="sr-only"
        onChange={handleFileInput}
        aria-label="Choose supplier PDF or CSV"
      />

      <div
        className={[
          'flex items-center justify-center',
          'w-20 h-20 rounded-full transition-colors',
          isDragging
            ? 'bg-secondary-200'
            : 'bg-white border border-slate-200 shadow-sm',
        ].join(' ')}
      >
        {isDragging ? (
          <HiOutlineDocumentArrowUp
            size={40}
            className="text-secondary-600"
            aria-hidden="true"
          />
        ) : (
          <div className="flex items-center gap-1">
            <MdPictureAsPdf
              size={32}
              className="text-slate-300"
              aria-hidden="true"
            />

            <MdTableChart
              size={25}
              className="text-slate-300"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <div>
        <p className="text-lg font-bold text-slate-800">
          {isDragging
            ? 'Drop your file here'
            : '📄 Upload Supplier PDF or CSV'}
        </p>

        <p className="text-sm text-slate-500 mt-1">
          Drag &amp; drop your supplier file here, or click to browse
        </p>

        <p className="text-xs text-slate-400 mt-2">
          Supported formats:{' '}
          <span className="font-semibold">PDF, CSV</span>
          {' · '}
          Maximum size:{' '}
          <span className="font-semibold">10 MB</span>
        </p>
      </div>

      <button
        type="button"
        onClick={event => {
          event.stopPropagation()
          openFilePicker()
        }}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary-600 text-white text-sm font-bold hover:bg-secondary-700 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
      >
        <HiOutlineDocumentArrowUp
          size={16}
          aria-hidden="true"
        />
        Choose File
      </button>
    </div>
  )
}

// ============================================================
// PROCESSING STATE
// ============================================================

function ProcessingState({ filename, progress }) {
  const extension = getFileExtension(filename)

  return (
    <div className="flex flex-col items-center gap-5 py-12">
      <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-secondary-100">
        {extension === 'csv' ? (
          <MdTableChart
            size={38}
            className="text-secondary-600"
            aria-hidden="true"
          />
        ) : (
          <MdPictureAsPdf
            size={38}
            className="text-secondary-600"
            aria-hidden="true"
          />
        )}

        <span className="absolute -top-1 -right-1 flex w-5 h-5 rounded-full bg-secondary-600 border-2 border-white">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75" />
        </span>
      </div>

      <div className="text-center">
        <p className="text-base font-bold text-slate-900">
          Uploading &amp; Processing File…
        </p>

        <p className="text-sm text-slate-500 mt-1 max-w-xs truncate">
          {filename}
        </p>

        <p className="text-xs text-slate-400 mt-1 max-w-md">
          The backend is parsing the supplier file, matching
          medicines and validating inventory information.
        </p>
      </div>

      <div className="w-full max-w-sm">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Uploading</span>
          <span>{progress}%</span>
        </div>

        <div
          className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-secondary-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ERROR STATE
// ============================================================

function ErrorState({
  message,
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-danger-100">
        <HiOutlineExclamationCircle
          size={28}
          className="text-danger-600"
          aria-hidden="true"
        />
      </div>

      <div>
        <p className="text-base font-bold text-slate-900">
          Import Processing Failed
        </p>

        <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          {message}
        </p>
      </div>

      <Button
        variant="danger"
        onClick={onRetry}
        leftIcon={<HiOutlineArrowPath size={15} />}
      >
        Try Again
      </Button>
    </div>
  )
}

// ============================================================
// SUCCESS DIALOG
// ============================================================

function SuccessDialog({
  importedCount,
  onViewInventory,
  onImportAnother,
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-success-title"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center gap-5 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success-100">
          <HiOutlineCheckCircle
            size={32}
            className="text-success-600"
            aria-hidden="true"
          />
        </div>

        <div>
          <h2
            id="import-success-title"
            className="text-lg font-extrabold text-slate-900"
          >
            Import Successful!
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {importedCount}{' '}
            {importedCount === 1 ? 'batch has' : 'batches have'} been
            added to your inventory.
          </p>
        </div>

        <div className="w-full bg-success-50 rounded-xl px-5 py-4 space-y-2.5 text-left">
          {[
            '✓ Supplier file processed successfully',
            '✓ Inventory batches created',
            '✓ Purchase movements recorded',
          ].map(item => (
            <p
              key={item}
              className="text-xs font-semibold text-success-700"
            >
              {item}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Button
            variant="primary"
            fullWidth
            onClick={onViewInventory}
          >
            View Inventory
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={onImportAnother}
          >
            Import Another File
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ROW DETAILS
// ============================================================

function RowDetails({ row }) {
  return (
    <div className="mt-2 space-y-1">
      {row?.errors?.map((error, index) => (
        <p
          key={`error-${index}`}
          className="text-[11px] text-danger-600"
        >
          • {error}
        </p>
      ))}

      {row?.warnings?.map((warning, index) => (
        <p
          key={`warning-${index}`}
          className="text-[11px] text-warning-600"
        >
          • {warning}
        </p>
      ))}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

function ImportStockPage() {
  const navigate = useNavigate()

  // ==========================================================
  // PAGE STATE
  // ==========================================================

  const [phase, setPhase] = useState('idle')
  const [filename, setFilename] = useState('')
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const [preview, setPreview] = useState(null)
  const [medicines, setMedicines] = useState([])

  const [previewSearch, setPreviewSearch] = useState('')
  const [previewFilter, setPreviewFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [errorMessage, setErrorMessage] = useState('')

  const [confirming, setConfirming] = useState(false)

  // ==========================================================
  // FILE VALIDATION
  // ==========================================================

  function validateFile(file) {
    if (!file) {
      return 'Please select a file.'
    }

    const extension = getFileExtension(file.name)

    if (!['pdf', 'csv'].includes(extension)) {
      return 'Only PDF and CSV files are supported.'
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size must not exceed 10 MB.'
    }

    return null
  }

  // ==========================================================
  // PREVIEW API
  // ==========================================================

  async function processFile(file) {
    const validationError = validateFile(file)

    if (validationError) {
      setErrorMessage(validationError)
      setPhase('error')
      return
    }

    setFilename(file.name)
    setProgress(0)
    setErrorMessage('')
    setPreview(null)
    setMedicines([])
    setPage(1)
    setPreviewSearch('')
    setPreviewFilter('all')
    setPhase('uploading')

    try {
      const formData = new FormData()

      formData.append('file', file)

      const response = await axiosClient.post(
        '/inventory/import/preview',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },

          onUploadProgress: event => {
            if (!event.total) {
              return
            }

            const percentage = Math.round(
              (event.loaded / event.total) * 100
            )

            setProgress(Math.min(percentage, 100))
          },
        }
      )

      const data = response.data

      setProgress(100)

      const rows = Array.isArray(data?.rows)
        ? data.rows
        : []

      setPreview(data)
      setMedicines(
        rows.map((row, index) => ({
          ...row,
          id: `${index}-${row.medicine_name}-${row.batch_number || ''}`,
          selected: canImportRow(row),
        }))
      )

      setPhase('preview')
    } catch (error) {
      console.error(
        '❌ Inventory import preview failed:',
        error
      )

      setErrorMessage(
        getErrorMessage(error)
      )

      setPhase('error')
    }
  }

  // ==========================================================
  // FILE HANDLERS
  // ==========================================================

  function handleFileSelected(file) {
    processFile(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]

    if (file) {
      processFile(file)
    }
  }

  function handleRetry() {
    setPhase('idle')
    setProgress(0)
    setFilename('')
    setErrorMessage('')
    setPreview(null)
    setMedicines([])
    setPage(1)
    setPreviewSearch('')
    setPreviewFilter('all')
  }

  // ==========================================================
  // ROW SELECTION
  // ==========================================================

  function toggleRow(id) {
    setMedicines(previous =>
      previous.map(row =>
        row.id === id
          ? {
              ...row,
              selected: !row.selected,
            }
          : row
      )
    )
  }

  function toggleAll() {
    const visibleSelectableRows = filteredPreview.filter(
      canImportRow
    )

    if (!visibleSelectableRows.length) {
      return
    }

    const allSelected = visibleSelectableRows.every(
      row => row.selected
    )

    const visibleIds = new Set(
      visibleSelectableRows.map(row => row.id)
    )

    setMedicines(previous =>
      previous.map(row =>
        visibleIds.has(row.id)
          ? {
              ...row,
              selected: !allSelected,
            }
          : row
      )
    )
  }

  // ==========================================================
  // FILTERING
  // ==========================================================

  const filteredPreview = useMemo(() => {
    const search = previewSearch
      .trim()
      .toLowerCase()

    return medicines.filter(row => {
      const matchesSearch =
        !search ||
        String(row.medicine_name || '')
          .toLowerCase()
          .includes(search) ||
        String(row.generic_name || '')
          .toLowerCase()
          .includes(search) ||
        String(row.jan_aushadhi_name || '')
          .toLowerCase()
          .includes(search) ||
        String(row.batch_number || '')
          .toLowerCase()
          .includes(search)

      const status = getRowStatus(row)

      const matchesFilter =
        previewFilter === 'all' ||
        (previewFilter === 'matched' &&
          status === 'matched') ||
        (previewFilter === 'review' &&
          status === 'review') ||
        (previewFilter === 'unmatched' &&
          status === 'unmatched') ||
        (previewFilter === 'error' &&
          status === 'error')

      return matchesSearch && matchesFilter
    })
  }, [
    medicines,
    previewSearch,
    previewFilter,
  ])

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPreview.length / PAGE_SIZE
    )
  )

  const safePage = Math.min(
    page,
    totalPages
  )

  const pagedPreview = filteredPreview.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const selectedRows = medicines.filter(
    row => row.selected && canImportRow(row)
  )

  const selectedCount = selectedRows.length

  const matchedCount =
    preview?.matched_rows ??
    medicines.filter(
      row => row.match_status === 'matched'
    ).length

  const unmatchedCount =
    preview?.unmatched_rows ??
    medicines.filter(
      row =>
        row.match_status === 'unmatched' ||
        row.match_status === 'review'
    ).length

  const validCount =
    preview?.valid_rows ??
    medicines.filter(canImportRow).length

  const invalidCount =
    preview?.invalid_rows ??
    medicines.filter(
      row => row.errors?.length > 0
    ).length

  const reviewCount = medicines.filter(
    row => row.match_status === 'review'
  ).length

  const errorCount = medicines.filter(
    row => row.errors?.length > 0
  ).length

  const selectedVisibleRows = filteredPreview.filter(
    canImportRow
  )

  const allVisibleSelected =
    selectedVisibleRows.length > 0 &&
    selectedVisibleRows.every(
      row => row.selected
    )

  // ==========================================================
  // CONFIRM IMPORT API
  // ==========================================================

  async function handleImport() {
    if (!selectedRows.length) {
      return
    }

    setConfirming(true)
    setErrorMessage('')

    try {
      const rows = selectedRows.map(row => {
        const {
          id,
          selected,
          ...backendRow
        } = row

        return backendRow
      })

      const response = await axiosClient.post(
        '/inventory/import/confirm',
        {
          rows,
        }
      )

      const result = response.data

      if (
        result?.imported_count === undefined
      ) {
        throw new Error(
          'The server returned an unexpected import response.'
        )
      }

      if (
        Number(result.imported_count) === 0 &&
        Array.isArray(result.errors) &&
        result.errors.length > 0
      ) {
        setErrorMessage(
          result.errors.join(' ')
        )

        return
      }

      setPreview(previous =>
        previous
          ? {
              ...previous,
              confirmed_result: result,
            }
          : previous
      )

      setPhase('success')
    } catch (error) {
      console.error(
        '❌ Inventory import confirmation failed:',
        error
      )

      setErrorMessage(
        getErrorMessage(error)
      )
    } finally {
      setConfirming(false)
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <article
      aria-label="Import Stock from Supplier File"
      className="flex flex-col gap-6"
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.PHARMACY.INVENTORY_DASHBOARD}
            aria-label="Back to Inventory Dashboard"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <HiOutlineArrowLeft
              size={16}
              aria-hidden="true"
            />
          </Link>

          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <HiOutlineDocumentArrowUp
                size={22}
                className="text-secondary-600"
                aria-hidden="true"
              />

              Import Stock
            </h1>

            <p className="text-xs text-slate-500 mt-0.5">
              Upload supplier PDF/CSV files and review
              extracted inventory before importing.
            </p>
          </div>
        </div>

        {phase === 'preview' && (
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <HiOutlineDocumentArrowUp
              size={14}
              aria-hidden="true"
            />

            Upload New File
          </button>
        )}
      </div>

      {/* ======================================================
          IDLE
      ====================================================== */}

      {phase === 'idle' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <UploadArea
            onFileSelected={handleFileSelected}
            isDragging={isDragging}
            onDragEnter={() =>
              setIsDragging(true)
            }
            onDragLeave={() =>
              setIsDragging(false)
            }
            onDrop={handleDrop}
          />

          <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-info-50 border border-info-100">
            <HiOutlineInformationCircle
              size={15}
              className="text-info-600 shrink-0 mt-0.5"
              aria-hidden="true"
            />

            <p className="text-xs text-info-700">
              <span className="font-semibold">
                How it works:
              </span>{' '}
              Upload a supplier invoice or stock order.
              The backend extracts medicine names,
              quantities, batch numbers, dates and prices,
              then matches them against your Medicine Master.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          UPLOADING
      ====================================================== */}

      {phase === 'uploading' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <ProcessingState
            filename={filename}
            progress={progress}
          />
        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {phase === 'error' && (
        <div className="bg-white rounded-2xl border border-danger-100 shadow-sm p-6">
          <ErrorState
            message={errorMessage}
            onRetry={handleRetry}
          />
        </div>
      )}

      {/* ======================================================
          PREVIEW
      ====================================================== */}

      {phase === 'preview' && (
        <>
          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Extracted',
                value:
                  preview?.total_rows ??
                  medicines.length,
                icon: HiOutlineDocumentText,
                color: 'text-primary-600',
                bg: 'bg-primary-50',
                desc: 'Rows found in file',
              },

              {
                label: 'Matched',
                value: matchedCount,
                icon: HiOutlineCheckCircle,
                color: 'text-success-600',
                bg: 'bg-success-50',
                desc: 'Automatically matched',
              },

              {
                label: 'Needs Review',
                value: reviewCount,
                icon: HiOutlineExclamationTriangle,
                color: 'text-warning-600',
                bg: 'bg-warning-50',
                desc: 'Manual review needed',
              },

              {
                label: 'Invalid',
                value: invalidCount,
                icon: HiOutlineExclamationCircle,
                color: 'text-danger-600',
                bg: 'bg-danger-50',
                desc: 'Validation errors',
              },
            ].map(card => (
              <div
                key={card.label}
                className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${card.bg} shrink-0`}
                >
                  <card.icon
                    size={20}
                    className={card.color}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-xl font-extrabold text-slate-900">
                    {card.value}
                  </p>

                  <p className="text-xs font-semibold text-slate-700 leading-tight">
                    {card.label}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ==================================================
              FILE INFO
          ================================================== */}

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
            {getFileExtension(filename) === 'csv' ? (
              <MdTableChart
                size={22}
                className="text-secondary-600 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <MdPictureAsPdf
                size={22}
                className="text-secondary-600 shrink-0"
                aria-hidden="true"
              />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {preview?.file_name || filename}
              </p>

              <p className="text-xs text-slate-400">
                {preview?.total_rows ?? medicines.length}{' '}
                rows extracted ·{' '}
                {preview?.file_type?.toUpperCase() || 'FILE'}
              </p>
            </div>

            <Badge
              variant="success"
              size="sm"
              dot
            >
              Processed
            </Badge>
          </div>

          {/* ==================================================
              STATUS INFORMATION
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-success-50 border border-success-100">
              <p className="text-xs font-semibold text-success-700">
                Ready for Import
              </p>

              <p className="text-lg font-extrabold text-success-800 mt-0.5">
                {validCount}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-warning-50 border border-warning-100">
              <p className="text-xs font-semibold text-warning-700">
                Unmatched / Review
              </p>

              <p className="text-lg font-extrabold text-warning-800 mt-0.5">
                {unmatchedCount}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-danger-50 border border-danger-100">
              <p className="text-xs font-semibold text-danger-700">
                Validation Errors
              </p>

              <p className="text-lg font-extrabold text-danger-800 mt-0.5">
                {errorCount}
              </p>
            </div>
          </div>

          {/* ==================================================
              SEARCH + FILTER
          ================================================== */}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />

              <input
                type="search"
                value={previewSearch}
                onChange={event => {
                  setPreviewSearch(
                    event.target.value
                  )
                  setPage(1)
                }}
                placeholder="Search medicine, generic name or batch…"
                aria-label="Search extracted medicines"
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
              />
            </div>

            <div className="flex gap-1 flex-wrap">
              {[
                {
                  value: 'all',
                  label: 'All',
                },
                {
                  value: 'matched',
                  label: 'Matched',
                },
                {
                  value: 'review',
                  label: 'Review',
                },
                {
                  value: 'unmatched',
                  label: 'Unmatched',
                },
                {
                  value: 'error',
                  label: 'Errors',
                },
              ].map(tab => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setPreviewFilter(
                      tab.value
                    )
                    setPage(1)
                  }}
                  aria-pressed={
                    previewFilter ===
                    tab.value
                  }
                  className={[
                    'px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    previewFilter ===
                    tab.value
                      ? 'bg-primary-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-primary-300',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ==================================================
              PREVIEW TABLE
          ================================================== */}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="table-base"
                role="grid"
                aria-label="Extracted inventory preview"
              >
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="w-10"
                    >
                      <input
                        type="checkbox"
                        checked={
                          allVisibleSelected
                        }
                        onChange={toggleAll}
                        disabled={
                          selectedVisibleRows.length ===
                          0
                        }
                        aria-label="Select all importable medicines"
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer disabled:opacity-40"
                      />
                    </th>

                    <th scope="col">
                      Medicine
                    </th>

                    <th
                      scope="col"
                      className="hidden md:table-cell"
                    >
                      Generic
                    </th>

                    <th scope="col">
                      Qty
                    </th>

                    <th
                      scope="col"
                      className="hidden sm:table-cell"
                    >
                      Batch
                    </th>

                    <th
                      scope="col"
                      className="hidden lg:table-cell"
                    >
                      Expiry
                    </th>

                    <th scope="col">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pagedPreview.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-sm text-slate-400"
                      >
                        No medicines match your
                        search or filter.
                      </td>
                    </tr>
                  ) : (
                    pagedPreview.map(row => {
                      const statusConfig =
                        getStatusConfig(
                          row
                        )

                      const importable =
                        canImportRow(
                          row
                        )

                      return (
                        <tr
                          key={row.id}
                          className={
                            row.selected
                              ? ''
                              : 'opacity-60'
                          }
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={
                                !!row.selected
                              }
                              disabled={
                                !importable
                              }
                              onChange={() =>
                                toggleRow(
                                  row.id
                                )
                              }
                              aria-label={`Select ${row.medicine_name}`}
                              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer disabled:opacity-40"
                            />
                          </td>

                          <td>
                            <div className="flex items-start gap-2">
                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary-50 shrink-0">
                                <MdMedication
                                  size={14}
                                  className="text-secondary-600"
                                  aria-hidden="true"
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">
                                  {
                                    row.medicine_name
                                  }
                                </p>

                                {row.jan_aushadhi_name && (
                                  <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                    {
                                      row.jan_aushadhi_name
                                    }
                                  </p>
                                )}

                                <RowDetails
                                  row={row}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="hidden md:table-cell">
                            <div>
                              <p className="text-xs text-slate-600">
                                {row.generic_name ||
                                  '—'}
                              </p>

                              {row.strength && (
                                <p className="text-[10px] text-slate-400">
                                  {
                                    row.strength
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          <td>
                            <p className="text-xs font-bold text-slate-900">
                              {row.quantity ??
                                '—'}
                            </p>

                            {row.purchase_price !==
                              null &&
                              row.purchase_price !==
                                undefined && (
                                <p className="text-[10px] text-slate-400">
                                  Buy:{' '}
                                  {formatCurrency(
                                    row.purchase_price
                                  )}
                                </p>
                              )}
                          </td>

                          <td className="hidden sm:table-cell">
                            <p className="text-xs text-slate-500 font-mono">
                              {row.batch_number ||
                                '—'}
                            </p>

                            {row.mrp !==
                              null &&
                              row.mrp !==
                                undefined && (
                                <p className="text-[10px] text-slate-400">
                                  MRP:{' '}
                                  {formatCurrency(
                                    row.mrp
                                  )}
                                </p>
                              )}
                          </td>

                          <td className="hidden lg:table-cell">
                            <p className="text-xs text-slate-500">
                              {formatDate(
                                row.expiry_date
                              )}
                            </p>

                            {row.manufacturing_date && (
                              <p className="text-[10px] text-slate-400">
                                Mfg:{' '}
                                {formatDate(
                                  row.manufacturing_date
                                )}
                              </p>
                            )}
                          </td>

                          <td>
                            <Badge
                              variant={
                                statusConfig.variant
                              }
                              size="sm"
                              dot
                            >
                              {
                                statusConfig.label
                              }
                            </Badge>

                            {row.match_confidence >
                              0 && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Match:{' '}
                                {formatConfidence(
                                  row.match_confidence
                                )}
                              </p>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ==================================================
                PAGINATION
            ================================================== */}

            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-500">
                {selectedCount} selected ·{' '}
                {filteredPreview.length} shown
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setPage(previous =>
                      Math.max(
                        1,
                        previous - 1
                      )
                    )
                  }
                  disabled={safePage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>

                <span className="text-xs text-slate-500 px-2">
                  {safePage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage(previous =>
                      Math.min(
                        totalPages,
                        previous + 1
                      )
                    )
                  }
                  disabled={
                    safePage ===
                    totalPages
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================
              UNMATCHED / ERROR NOTICE
          ================================================== */}

          {(unmatchedCount > 0 ||
            invalidCount > 0) && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-50 border border-warning-200">
              <HiOutlineExclamationTriangle
                size={15}
                className="text-warning-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />

              <div className="text-xs text-warning-700">
                {unmatchedCount > 0 && (
                  <p>
                    <span className="font-semibold">
                      {unmatchedCount}{' '}
                      {unmatchedCount === 1
                        ? 'row'
                        : 'rows'}{' '}
                      could not be confidently
                      matched.
                    </span>{' '}
                    Only matched rows can currently
                    be imported.
                  </p>
                )}

                {invalidCount > 0 && (
                  <p className="mt-1">
                    <span className="font-semibold">
                      {invalidCount}{' '}
                      {invalidCount === 1
                        ? 'row contains'
                        : 'rows contain'}{' '}
                      validation errors.
                    </span>{' '}
                    These rows are disabled until
                    corrected.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ==================================================
              CONFIRM ERROR
          ================================================== */}

          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-danger-50 border border-danger-200">
              <HiOutlineExclamationCircle
                size={18}
                className="text-danger-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />

              <div className="flex-1">
                <p className="text-sm font-semibold text-danger-800">
                  Import could not be completed
                </p>

                <p className="text-xs text-danger-700 mt-1 whitespace-pre-line">
                  {errorMessage}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setErrorMessage('')
                }
                className="text-danger-500 hover:text-danger-700"
                aria-label="Dismiss error"
              >
                <HiOutlineXMark
                  size={18}
                />
              </button>
            </div>
          )}

          {/* ==================================================
              IMPORT ACTIONS
          ================================================== */}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-900">
                  {selectedCount}
                </span>{' '}
                {selectedCount === 1
                  ? 'batch'
                  : 'batches'}{' '}
                selected for import.
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Only matched rows without
                validation errors can be imported.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleRetry}
                disabled={confirming}
              >
                Cancel
              </Button>

              <Button
                variant="secondary"
                disabled={
                  selectedCount === 0 ||
                  confirming
                }
                onClick={handleImport}
                leftIcon={
                  confirming ? (
                    <HiOutlineArrowPath
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <HiOutlineArchiveBox
                      size={15}
                    />
                  )
                }
              >
                {confirming
                  ? 'Importing…'
                  : `Import ${selectedCount} ${
                      selectedCount === 1
                        ? 'Batch'
                        : 'Batches'
                    }`}
              </Button>
            </div>
          </div>
        </>
      )}
      {/* ======================================================
          SUCCESS
      ====================================================== */}
      {phase === 'success' && (
        <SuccessDialog
          importedCount={
            preview?.confirmed_result
              ?.imported_count ??
            selectedCount
          }
          onViewInventory={() =>
            navigate(
              ROUTES.PHARMACY.INVENTORY
            )
          }
          onImportAnother={
            handleRetry
          }
        />
      )}
    </article>
  )
}
export default ImportStockPage