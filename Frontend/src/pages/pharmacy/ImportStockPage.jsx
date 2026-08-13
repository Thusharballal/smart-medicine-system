/**
 * Component: ImportStockPage — Phase 3 PDF Order Import Module
 *
 * Route: /pharmacy/import-stock  (ProtectedRoute → PharmacyLayout)
 *
 * Purpose:
 *   Allows pharmacy staff to upload a supplier order PDF, preview
 *   the extracted medicines, review an import summary, and confirm
 *   adding them to the inventory.
 *
 * Phases / UI states:
 *   idle     → Upload area (drag & drop + choose file)
 *   uploading → Progress bar animation
 *   preview  → Medicine preview table + import summary
 *   success  → Success dialog with action buttons
 *   error    → Error card with retry button
 *
 * ⚠ FRONTEND PLACEHOLDER ONLY — No real PDF parsing or OCR.
 * Future backend integration points:
 *   TODO: POST /api/v1/pharmacy/import/pdf        → upload PDF, get extracted medicines
 *         (FastAPI + pdfminer / Tesseract OCR)
 *   TODO: POST /api/v1/pharmacy/inventory/bulk    → bulk-add extracted medicines
 *         (FastAPI Inventory CRUD API)
 *   TODO: GET  /api/v1/pharmacy/suppliers         → supplier list
 *         (FastAPI Supplier API)
 *   TODO: GET  /api/v1/pharmacy/import/history    → import history
 *         (FastAPI Import Audit API)
 */

import { useState, useCallback } from 'react'
import { Link, useNavigate }     from 'react-router-dom'
import {
  HiOutlineDocumentArrowUp, HiOutlineArrowLeft,
  HiOutlineCheckCircle, HiOutlineExclamationTriangle,
  HiOutlineXMark, HiOutlineMagnifyingGlass,
  HiOutlineArrowDownTray, HiOutlineDocumentText,
  HiOutlineExclamationCircle, HiOutlineArchiveBox,
  HiOutlineInformationCircle,
} from 'react-icons/hi2'
import { MdMedication, MdInventory2, MdPictureAsPdf } from 'react-icons/md'
import Badge  from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'

// ── Sample extracted medicine data ────────────────────────────────────────
// TODO: Replace with response from POST /api/v1/pharmacy/import/pdf
// These records simulate what the PDF parsing + OCR backend would return.
const SAMPLE_EXTRACTED = [
  { id: 'e1',  name: 'Paracetamol IP 500mg',    genericName: 'Acetaminophen',   qty: 200, batch: 'SUP-B1234', expiry: '2027-12-31', status: 'new',       duplicate: false },
  { id: 'e2',  name: 'Azithromycin 500mg',       genericName: 'Azithromycin',    qty: 50,  batch: 'SUP-B1235', expiry: '2026-08-30', status: 'duplicate', duplicate: true  },
  { id: 'e3',  name: 'Metformin 500mg',           genericName: 'Metformin HCl',   qty: 150, batch: 'SUP-B1236', expiry: '2027-01-14', status: 'new',       duplicate: false },
  { id: 'e4',  name: 'Cetirizine 10mg',           genericName: 'Cetirizine HCl',  qty: 100, batch: 'SUP-B1237', expiry: '2026-09-30', status: 'new',       duplicate: false },
  { id: 'e5',  name: 'Amoxicillin 500mg',         genericName: 'Amoxicillin',     qty: 80,  batch: 'SUP-B1238', expiry: '2026-06-19', status: 'warning',   duplicate: false },
  { id: 'e6',  name: 'Pantoprazole 40mg',         genericName: 'Pantoprazole',    qty: 120, batch: 'SUP-B1239', expiry: '2025-09-04', status: 'warning',   duplicate: false },
  { id: 'e7',  name: 'Vitamin D3 60000 IU',       genericName: 'Cholecalciferol', qty: 60,  batch: 'SUP-B1240', expiry: '2026-07-24', status: 'new',       duplicate: false },
  { id: 'e8',  name: 'Ibuprofen 400mg',           genericName: 'Ibuprofen',       qty: 90,  batch: 'SUP-B1241', expiry: '2027-02-14', status: 'new',       duplicate: false },
]

// Row status badge config
const ROW_STATUS = {
  new:       { variant: 'success', label: 'Ready',     dot: true  },
  duplicate: { variant: 'warning', label: 'Duplicate', dot: true  },
  warning:   { variant: 'warning', label: 'Warning',   dot: true  },
  error:     { variant: 'danger',  label: 'Error',     dot: true  },
}

// Error type content
const ERROR_CONTENT = {
  invalid:   { icon: HiOutlineExclamationCircle,  title: 'Invalid PDF File',   desc: 'The file you uploaded is not a valid PDF. Please upload a supplier order PDF file.' },
  unsupported:{ icon: HiOutlineDocumentText,      title: 'Unsupported Format', desc: 'Only PDF files are supported. Please upload a .pdf file from your supplier.' },
  empty:     { icon: HiOutlineArchiveBox,         title: 'Empty File',         desc: 'The uploaded PDF appears to be empty or could not be read. Please check the file and try again.' },
  failed:    { icon: HiOutlineExclamationTriangle,title: 'Upload Failed',      desc: 'An error occurred while uploading the file. Please check your connection and try again.' },
}

// ── Upload Area ───────────────────────────────────────────────────────────
function UploadArea({ onFileSelected, isDragging, onDragEnter, onDragLeave, onDrop }) {
  function handleFileInput(e) {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      className={[
        'flex flex-col items-center justify-center gap-5',
        'border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center',
        'transition-all duration-200 cursor-pointer',
        isDragging
          ? 'border-secondary-500 bg-secondary-50 scale-[1.01]'
          : 'border-slate-300 bg-slate-50 hover:border-secondary-400 hover:bg-secondary-50',
      ].join(' ')}
      role="button"
      tabIndex={0}
      aria-label="Upload supplier order PDF — click to choose a file or drag and drop"
      onKeyDown={e => e.key === 'Enter' && document.getElementById('pdf-file-input')?.click()}
      onClick={() => document.getElementById('pdf-file-input')?.click()}
    >
      {/* Hidden native file input */}
      {/* TODO: On selection → POST /api/v1/pharmacy/import/pdf (FastAPI + pdfminer / Tesseract OCR) */}
      <input
        id="pdf-file-input"
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={handleFileInput}
        aria-label="Choose PDF file"
      />

      {/* Icon */}
      <div className={`flex items-center justify-center w-20 h-20 rounded-full transition-colors ${isDragging ? 'bg-secondary-200' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <MdPictureAsPdf size={40} className={isDragging ? 'text-secondary-600' : 'text-slate-300'} aria-hidden="true" />
      </div>

      {/* Text */}
      <div>
        <p className="text-lg font-bold text-slate-800">
          {isDragging ? 'Drop your PDF here' : '📄 Upload Supplier Order PDF'}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Drag &amp; drop your supplier invoice PDF here, or click to browse
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Supported format: <span className="font-semibold">PDF</span> · Maximum size: <span className="font-semibold">10 MB</span>
        </p>
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); document.getElementById('pdf-file-input')?.click() }}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary-600 text-white text-sm font-bold hover:bg-secondary-700 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
      >
        <HiOutlineDocumentArrowUp size={16} aria-hidden="true" />
        Choose File
      </button>
    </div>
  )
}

// ── Upload Progress ───────────────────────────────────────────────────────
function UploadProgress({ filename, progress }) {
  return (
    <div className="flex flex-col items-center gap-5 py-12">
      {/* Animated icon */}
      <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-secondary-100">
        <MdPictureAsPdf size={38} className="text-secondary-600" aria-hidden="true" />
        <span className="absolute -top-1 -right-1 flex w-5 h-5 rounded-full bg-secondary-600 border-2 border-white">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75" />
        </span>
      </div>

      <div className="text-center">
        <p className="text-base font-bold text-slate-900">Uploading &amp; Processing PDF…</p>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">{filename}</p>
        <p className="text-xs text-slate-400 mt-1">
          {/* TODO: Real progress from POST /api/v1/pharmacy/import/pdf streaming response */}
          Parsing supplier order and extracting medicine details…
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Processing</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemax={100}>
          <div
            className="h-full bg-secondary-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Error State ───────────────────────────────────────────────────────────
function ErrorState({ errorType, onRetry }) {
  const content = ERROR_CONTENT[errorType] ?? ERROR_CONTENT.failed
  const Icon = content.icon
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-danger-100">
        <Icon size={28} className="text-danger-600" aria-hidden="true" />
      </div>
      <div>
        <p className="text-base font-bold text-slate-900">{content.title}</p>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{content.desc}</p>
      </div>
      <Button variant="danger" onClick={onRetry} leftIcon={<HiOutlineDocumentArrowUp size={15} />}>
        Try Again
      </Button>
    </div>
  )
}

// ── Success Dialog ────────────────────────────────────────────────────────
function SuccessDialog({ importedCount, onViewInventory, onImportAnother }) {
  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="success-title"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center gap-5 text-center">
        {/* Success icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success-100">
          <HiOutlineCheckCircle size={32} className="text-success-600" aria-hidden="true" />
        </div>

        <div>
          <h2 id="success-title" className="text-lg font-extrabold text-slate-900">
            Import Successful!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {importedCount} medicines have been added to your inventory.
          </p>
        </div>

        {/* Checklist */}
        <div className="w-full bg-success-50 rounded-xl px-5 py-4 space-y-2.5 text-left">
          {[
            '✓ PDF Processed Successfully',
            '✓ Medicines Ready for Inventory',
            '✓ Inventory Updated',
          ].map(item => (
            <p key={item} className="text-xs font-semibold text-success-700">{item}</p>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <Button variant="primary" fullWidth onClick={onViewInventory}>
            View Inventory
          </Button>
          <Button variant="outline" fullWidth onClick={onImportAnother}>
            Import Another PDF
          </Button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
function ImportStockPage() {
  const navigate = useNavigate()

  // Phase state
  const [phase,     setPhase]     = useState('idle')     // idle|uploading|preview|success|error
  const [errorType, setErrorType] = useState('failed')
  const [progress,  setProgress]  = useState(0)
  const [filename,  setFilename]  = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Preview state
  const [medicines, setMedicines] = useState(SAMPLE_EXTRACTED.map(m => ({ ...m, selected: true })))
  const [previewSearch, setPreviewSearch] = useState('')
  const [previewFilter, setPreviewFilter] = useState('all')
  const [page, setPage]                   = useState(1)
  const PAGE_SIZE = 6

  // ── File handling ─────────────────────────────────────────────────────
  const processFile = useCallback((file) => {
    if (!file) return

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      setErrorType('unsupported')
      setPhase('error')
      return
    }
    // Validate file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorType('failed')
      setPhase('error')
      return
    }

    setFilename(file.name)
    setPhase('uploading')
    setProgress(0)

    /**
     * TODO: Replace simulation with real API call:
     *   const formData = new FormData()
     *   formData.append('pdf', file)
     *   const res = await axios.post('/api/v1/pharmacy/import/pdf', formData, {
     *     onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100))
     *   })
     *   setMedicines(res.data.medicines)
     *   setPhase('preview')
     *
     * FastAPI backend (future):
     *   POST /api/v1/pharmacy/import/pdf
     *   → pdfminer.six parses text → LLM / regex extracts medicine table
     *   → Tesseract OCR fallback for scanned PDFs
     *   Response: { medicines: [...], summary: {...} }
     */
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 18 + 5
      if (p >= 100) {
        p = 100
        clearInterval(interval)
        setProgress(100)
        setTimeout(() => {
          setMedicines(SAMPLE_EXTRACTED.map(m => ({ ...m, selected: true })))
          setPhase('preview')
        }, 400)
      } else {
        setProgress(Math.round(p))
      }
    }, 180)
  }, [])

  function handleFileSelected(file) { processFile(file) }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleRetry() {
    setPhase('idle')
    setProgress(0)
    setFilename('')
  }

  // ── Row selection ─────────────────────────────────────────────────────
  function toggleRow(id)   { setMedicines(p => p.map(m => m.id === id ? { ...m, selected: !m.selected } : m)) }
  function toggleAll()     {
    const allSelected = filteredPreview.every(m => m.selected)
    const ids = new Set(filteredPreview.map(m => m.id))
    setMedicines(p => p.map(m => ids.has(m.id) ? { ...m, selected: !allSelected } : m))
  }

  // ── Filtered preview ──────────────────────────────────────────────────
  const filteredPreview = medicines.filter(m => {
    const matchSearch = !previewSearch.trim() ||
      m.name.toLowerCase().includes(previewSearch.toLowerCase()) ||
      m.genericName.toLowerCase().includes(previewSearch.toLowerCase())
    const matchFilter = previewFilter === 'all' || m.status === previewFilter
    return matchSearch && matchFilter
  })
  const totalPages  = Math.max(1, Math.ceil(filteredPreview.length / PAGE_SIZE))
  const pagedPreview = filteredPreview.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  // ── Summary stats ─────────────────────────────────────────────────────
  const selected    = medicines.filter(m => m.selected)
  const newCount    = medicines.filter(m => m.status === 'new').length
  const dupCount    = medicines.filter(m => m.duplicate).length
  const warnCount   = medicines.filter(m => m.status === 'warning').length

  // ── Import action ─────────────────────────────────────────────────────
  function handleImport() {
    /**
     * TODO: POST /api/v1/pharmacy/inventory/bulk
     *   Request body: { medicines: selected.map(m => ({ ...m })) }
     *   Response: { imported: N, skipped: K }
     */
    setPhase('success')
  }

  // ─────────────────────────────────────────────────────────────────────
  return (
    <article aria-label="Import Stock from PDF" className="flex flex-col gap-6">

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.PHARMACY.INVENTORY_DASHBOARD}
            aria-label="Back to Inventory Dashboard"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <HiOutlineArrowLeft size={16} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <HiOutlineDocumentArrowUp size={22} className="text-secondary-600" aria-hidden="true" />
              Import Stock
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload supplier order PDFs and preview medicines before importing into inventory.
            </p>
          </div>
        </div>
        {phase === 'preview' && (
          <button type="button" onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            <HiOutlineDocumentArrowUp size={14} aria-hidden="true" />
            Upload New PDF
          </button>
        )}
      </div>

      {/* ── Phase: idle — upload area ─────────────────────────────────── */}
      {phase === 'idle' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <UploadArea
            onFileSelected={handleFileSelected}
            isDragging={isDragging}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          />
          {/* Info note */}
          <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-info-50 border border-info-100">
            <HiOutlineInformationCircle size={15} className="text-info-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-info-700">
              <span className="font-semibold">Tip:</span> Upload a supplier invoice or stock order PDF.
              The system will extract medicine names, quantities, batch numbers and expiry dates automatically.{' '}
              {/* TODO: FastAPI + pdfminer / Tesseract OCR integration */}
              <span className="text-info-500 italic">PDF parsing is a placeholder — backend integration pending.</span>
            </p>
          </div>
        </div>
      )}

      {/* ── Phase: uploading ─────────────────────────────────────────── */}
      {phase === 'uploading' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <UploadProgress filename={filename} progress={progress} />
        </div>
      )}

      {/* ── Phase: error ─────────────────────────────────────────────── */}
      {phase === 'error' && (
        <div className="bg-white rounded-2xl border border-danger-100 shadow-sm p-6">
          <ErrorState errorType={errorType} onRetry={handleRetry} />
        </div>
      )}

      {/* ── Phase: preview ───────────────────────────────────────────── */}
      {phase === 'preview' && (
        <>
          {/* Import Summary cards */}
          {/* TODO: These counts come from POST /api/v1/pharmacy/import/pdf response */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Extracted',    value: medicines.length, icon: HiOutlineDocumentText,        color: 'text-primary-600',   bg: 'bg-primary-50',   desc: 'Medicines found in PDF' },
              { label: 'Ready to Import',    value: newCount,         icon: HiOutlineCheckCircle,         color: 'text-success-600',   bg: 'bg-success-50',   desc: 'New medicines' },
              { label: 'Duplicates',         value: dupCount,         icon: HiOutlineExclamationTriangle, color: 'text-warning-600',   bg: 'bg-warning-50',   desc: 'Already in inventory' },
              { label: 'Warnings',           value: warnCount,        icon: HiOutlineExclamationCircle,   color: 'text-orange-600',    bg: 'bg-orange-50',    desc: 'Require review' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${s.bg} shrink-0`}>
                  <s.icon size={20} className={s.color} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{s.label}</p>
                  <p className="text-[10px] text-slate-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* PDF file info bar */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <MdPictureAsPdf size={22} className="text-secondary-600 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{filename || 'supplier_order.pdf'}</p>
              <p className="text-xs text-slate-400">
                {medicines.length} medicines extracted · PDF parsed successfully
                {/* TODO: Show actual parsing metadata from /api/v1/pharmacy/import/pdf */}
              </p>
            </div>
            <Badge variant="success" size="sm" dot>Processed</Badge>
          </div>

          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={previewSearch}
                onChange={e => { setPreviewSearch(e.target.value); setPage(1) }}
                placeholder="Search extracted medicines…"
                aria-label="Search preview medicines"
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 placeholder:opacity-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {[
                { value:'all',      label:'All'         },
                { value:'new',      label:'New'         },
                { value:'duplicate',label:'Duplicates'  },
                { value:'warning',  label:'Warnings'    },
              ].map(tab => (
                <button key={tab.value} type="button"
                  onClick={() => { setPreviewFilter(tab.value); setPage(1) }}
                  aria-pressed={previewFilter === tab.value}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${previewFilter === tab.value ? 'bg-primary-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-primary-300'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base" role="grid" aria-label="Extracted medicines preview">
                <thead>
                  <tr>
                    <th scope="col" className="w-10">
                      <input type="checkbox"
                        checked={filteredPreview.length > 0 && filteredPreview.every(m => m.selected)}
                        onChange={toggleAll}
                        aria-label="Select all medicines"
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
                      />
                    </th>
                    <th scope="col">Medicine Name</th>
                    <th scope="col" className="hidden md:table-cell">Generic Name</th>
                    <th scope="col">Quantity</th>
                    <th scope="col" className="hidden sm:table-cell">Batch Number</th>
                    <th scope="col" className="hidden lg:table-cell">Expiry Date</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPreview.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-sm text-slate-400">
                        No medicines match your search or filter.
                      </td>
                    </tr>
                  ) : pagedPreview.map(m => {
                    const sc = ROW_STATUS[m.status] ?? ROW_STATUS.new
                    return (
                      <tr key={m.id} className={m.selected ? '' : 'opacity-50'}>
                        <td>
                          <input type="checkbox" checked={m.selected} onChange={() => toggleRow(m.id)}
                            aria-label={`Select ${m.name}`}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary-50 shrink-0">
                              <MdMedication size={14} className="text-secondary-600" aria-hidden="true" />
                            </div>
                            <p className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">{m.name}</p>
                          </div>
                        </td>
                        <td className="hidden md:table-cell text-xs text-slate-500">{m.genericName}</td>
                        <td className="text-xs font-bold text-slate-900">{m.qty}</td>
                        <td className="hidden sm:table-cell text-xs text-slate-400 font-mono">{m.batch}</td>
                        <td className="hidden lg:table-cell text-xs text-slate-500">{m.expiry}</td>
                        <td>
                          <Badge variant={sc.variant} size="sm" dot={sc.dot}>{sc.label}</Badge>
                          {m.duplicate && (
                            <p className="text-[10px] text-warning-600 mt-0.5">Already in stock</p>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-500">
                {selected.length} of {medicines.length} selected
              </p>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  ← Prev
                </button>
                <span className="text-xs text-slate-500 px-2">{page} / {totalPages}</span>
                <button type="button" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Duplicate warning */}
          {dupCount > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-50 border border-warning-200">
              <HiOutlineExclamationTriangle size={15} className="text-warning-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-warning-700">
                <span className="font-semibold">{dupCount} duplicate {dupCount === 1 ? 'medicine' : 'medicines'} found.</span>{' '}
                These already exist in your inventory. Importing will update their stock quantities.
              </p>
            </div>
          )}

          {/* Import actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-600">
              <span className="font-bold text-slate-900">{selected.length}</span> medicines selected for import.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleRetry}>Cancel</Button>
              <Button
                variant="secondary"
                disabled={selected.length === 0}
                onClick={handleImport}
                leftIcon={<HiOutlineArchiveBox size={15} />}
              >
                Import {selected.length} {selected.length === 1 ? 'Medicine' : 'Medicines'}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── Phase: success dialog ─────────────────────────────────────── */}
      {phase === 'success' && (
        <SuccessDialog
          importedCount={selected.length}
          onViewInventory={() => navigate(ROUTES.PHARMACY.INVENTORY)}
          onImportAnother={handleRetry}
        />
      )}

    </article>
  )
}

export default ImportStockPage
