import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineArrowPath,
  HiOutlineXMark,
  HiOutlineArchiveBox,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
} from 'react-icons/hi2'
import { MdMedication, MdInventory2 } from 'react-icons/md'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'
import batchService from '../../services/batchService'
import medicineService from '../../services/medicineService'

const PAGE_SIZE = 8

// ─────────────────────────────────────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    variant: 'success',
    text: 'text-success-600',
    bg: 'bg-success-50',
    border: 'border-success-200',
  },
  low: {
    label: 'Low Stock',
    variant: 'warning',
    text: 'text-warning-600',
    bg: 'bg-warning-50',
    border: 'border-warning-200',
  },
  critical: {
    label: 'Critical',
    variant: 'danger',
    text: 'text-danger-600',
    bg: 'bg-danger-50',
    border: 'border-danger-200',
  },
  out: {
    label: 'Out of Stock',
    variant: 'danger',
    text: 'text-danger-600',
    bg: 'bg-danger-50',
    border: 'border-danger-200',
  },
  expiring: {
    label: 'Near Expiry',
    variant: 'warning',
    text: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
}

const STATUS_TABS = [
  { value: '', label: 'All Medicines' },
  { value: 'available', label: 'Available' },
  { value: 'low', label: 'Low Stock' },
  { value: 'critical', label: 'Critical' },
  { value: 'out', label: 'Out of Stock' },
  { value: 'expiring', label: 'Near Expiry' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getId(item) {
  return item?.id || item?._id || ''
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getDaysUntilExpiry(value) {
  if (!value) return Infinity

  const expiry = new Date(value)
  const now = new Date()

  if (Number.isNaN(expiry.getTime())) {
    return Infinity
  }

  return Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
}

function getStatus(batch) {
  const quantity = Number(batch.available_quantity ?? 0)
  const daysUntilExpiry = getDaysUntilExpiry(batch.expiry_date)

  if (quantity <= 0) {
    return 'out'
  }

  if (daysUntilExpiry <= 90) {
    return 'expiring'
  }

  if (quantity <= 5) {
    return 'critical'
  }

  if (quantity <= 20) {
    return 'low'
  }

  return 'available'
}

function getMedicineName(medicine) {
  if (!medicine) return 'Unknown Medicine'

  if (medicine.name) return medicine.name

  if (Array.isArray(medicine.brand_names) && medicine.brand_names.length > 0) {
    return medicine.brand_names[0]
  }

  return medicine.generic_name || 'Unknown Medicine'
}

function normalizeMedicine(medicine) {
  const id = getId(medicine)

  return {
    id,
    name: getMedicineName(medicine),
    genericName: medicine.generic_name || '-',
    janAushadhiName: medicine.jan_aushadhi_name || '-',
    composition: medicine.composition || '-',
    strength: medicine.strength || '-',
    dosageForm: medicine.dosage_form || '-',
    manufacturer: medicine.manufacturer || '-',
    category: medicine.category || '-',
    description: medicine.description || '',
    brandedPrice: medicine.branded_price ?? null,
    janAushadhiPrice: medicine.jan_aushadhi_price ?? null,
  }
}

function normalizeBatch(batch, medicine) {
  const status = getStatus(batch)

  return {
    id: getId(batch),
    medicineId: batch.medicine_id,
    name: getMedicineName(medicine),
    genericName: medicine?.generic_name || '-',
    janAushadhiName: medicine?.jan_aushadhi_name || '-',
    composition: medicine?.composition || '-',
    strength: medicine?.strength || '-',
    dosageForm: medicine?.dosage_form || '-',
    manufacturer: medicine?.manufacturer || '-',
    category: medicine?.category || '-',

    batch: batch.batch_number || '-',
    mfgDate: formatDate(batch.manufacturing_date),
    expiry: formatDate(batch.expiry_date),

    quantityReceived: Number(batch.quantity_received ?? 0),
    qty: Number(batch.available_quantity ?? 0),

    purchasePrice: Number(batch.purchase_price ?? 0),
    price: Number(batch.mrp ?? 0),

    supplier: batch.supplier_name || '-',
    invoiceNumber: batch.invoice_number || '-',

    status,

    createdAt: batch.created_at,
    updatedAt: batch.updated_at,
    lastUpdated: formatDate(batch.updated_at || batch.created_at),

    isArchived: Boolean(batch.is_archived),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────────────────────────

function ModalShell({ title, onClose, children, size = 'md' }) {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative bg-white rounded-2xl shadow-xl w-full ${widths[size]} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100"
          >
            <HiOutlineXMark size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// View details
// ─────────────────────────────────────────────────────────────────────────────

function ViewDetailsModal({ item, onClose }) {
  const config = STATUS_CONFIG[item.status]

  const rows = [
    ['Medicine', item.name],
    ['Generic Name', item.genericName],
    ['Jan Aushadhi Name', item.janAushadhiName],
    ['Composition', item.composition],
    ['Strength', item.strength],
    ['Dosage Form', item.dosageForm],
    ['Manufacturer', item.manufacturer],
    ['Category', item.category],
    ['Batch Number', item.batch],
    ['Manufacturing Date', item.mfgDate],
    ['Expiry Date', item.expiry],
    ['Quantity Received', item.quantityReceived],
    ['Available Quantity', item.qty],
    ['Purchase Price', `₹ ${item.purchasePrice.toFixed(2)}`],
    ['MRP', `₹ ${item.price.toFixed(2)}`],
    ['Supplier', item.supplier],
    ['Invoice Number', item.invoiceNumber],
  ]

  return (
    <ModalShell
      title="Medicine Details"
      onClose={onClose}
      size="lg"
    >
      <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary-100">
          <MdMedication
            size={24}
            className="text-secondary-600"
          />
        </div>

        <div>
          <p className="text-base font-bold text-slate-900">
            {item.name}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={config.variant}
              size="sm"
              dot
            >
              {config.label}
            </Badge>

            <span className="text-lg font-extrabold text-slate-900">
              {item.qty}
            </span>

            <span className="text-xs text-slate-400">
              units
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 py-2.5 text-xs"
          >
            <span className="text-slate-500 font-medium">
              {label}
            </span>

            <span className="text-slate-900 font-semibold text-right max-w-[60%]">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </ModalShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete / Archive dialog
// ─────────────────────────────────────────────────────────────────────────────

function ArchiveDialog({ item, onConfirm, onClose, loading }) {
  return (
    <ModalShell
      title="Archive Batch"
      onClose={onClose}
      size="sm"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-danger-100">
          <HiOutlineTrash
            size={26}
            className="text-danger-600"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            Are you sure you want to archive this batch?
          </p>

          <p className="text-sm text-primary-700 font-bold mt-1">
            {item.name}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Batch: {item.batch}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="danger"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Archiving...' : 'Archive Batch'}
        </Button>
      </div>
    </ModalShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile card
// ─────────────────────────────────────────────────────────────────────────────

function MobileCard({ item, onView, onArchive }) {
  const config = STATUS_CONFIG[item.status]

  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-xl border ${config.bg} ${config.border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white">
            <MdMedication
              size={16}
              className={config.text}
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {item.name}
            </p>

            <p className="text-xs text-slate-500 truncate">
              {item.genericName}
            </p>
          </div>
        </div>

        <Badge
          variant={config.variant}
          size="sm"
        >
          {config.label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-slate-400">Batch</p>
          <p className="font-semibold text-slate-700 truncate">
            {item.batch}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Expiry</p>
          <p className="font-semibold text-slate-700 truncate">
            {item.expiry}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Stock</p>
          <p className={`text-lg font-extrabold ${config.text}`}>
            {item.qty}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onView(item)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50"
        >
          <HiOutlineEye size={13} />
          View
        </button>

        <button
          type="button"
          onClick={() => onArchive(item)}
          className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg border border-danger-200 bg-danger-50 text-xs text-danger-600 hover:bg-danger-100"
        >
          <HiOutlineTrash size={13} />
          Archive
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Inventory Page
// ─────────────────────────────────────────────────────────────────────────────

function InventoryPage() {
  const [inventory, setInventory] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const [modal, setModal] = useState(null)
  const [archiveLoading, setArchiveLoading] = useState(false)

  // ───────────────────────────────────────────────────────────────────────────
  // Load REAL inventory from backend
  // ───────────────────────────────────────────────────────────────────────────

  async function loadInventory() {
    try {
      setLoading(true)
      setError('')

  const [batchResponse, medicineResponse] = await Promise.all([
    batchService.getAll(),
    medicineService.getAll(),
  ])

      const batches = Array.isArray(batchResponse.data)
        ? batchResponse.data
        : []

      const medicines = Array.isArray(medicineResponse.data)
        ? medicineResponse.data
        : []

      const medicineMap = new Map()

      medicines.forEach((medicine) => {
        medicineMap.set(
          getId(medicine),
          normalizeMedicine(medicine)
        )
      })

      const realInventory = batches
        .filter((batch) => !batch.is_archived)
        .map((batch) => {
          const medicine = medicineMap.get(batch.medicine_id)

          return normalizeBatch(batch, medicine)
        })

      setInventory(realInventory)
    } catch (err) {
      console.error('Failed to load pharmacy inventory:', err)

      setError(
        err?.response?.data?.detail ||
        'Unable to load inventory from the server.'
      )

      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  // ───────────────────────────────────────────────────────────────────────────
  // Sorting
  // ───────────────────────────────────────────────────────────────────────────

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((direction) =>
        direction === 'asc' ? 'desc' : 'asc'
      )
    } else {
      setSortKey(key)
      setSortDir('asc')
    }

    setPage(1)
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Search + filtering + sorting
  // ───────────────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let data = [...inventory]

    if (search.trim()) {
      const query = search.toLowerCase().trim()

      data = data.filter((item) =>
        [
          item.name,
          item.genericName,
          item.janAushadhiName,
          item.composition,
          item.manufacturer,
          item.batch,
          item.category,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
    }

    if (activeTab) {
      data = data.filter(
        (item) => item.status === activeTab
      )
    }

    data.sort((a, b) => {
      const first = String(
        a[sortKey] ?? ''
      ).toLowerCase()

      const second = String(
        b[sortKey] ?? ''
      ).toLowerCase()

      return sortDir === 'asc'
        ? first.localeCompare(second)
        : second.localeCompare(first)
    })

    return data
  }, [
    inventory,
    search,
    activeTab,
    sortKey,
    sortDir,
  ])

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  )

  const paged = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  // ───────────────────────────────────────────────────────────────────────────
  // Statistics
  // ───────────────────────────────────────────────────────────────────────────

  const stats = useMemo(
    () => ({
      total: inventory.length,

      low: inventory.filter(
        (item) =>
          item.status === 'low' ||
          item.status === 'critical'
      ).length,

      out: inventory.filter(
        (item) => item.status === 'out'
      ).length,

      expiring: inventory.filter(
        (item) => item.status === 'expiring'
      ).length,
    }),
    [inventory]
  )

  // ───────────────────────────────────────────────────────────────────────────
  // Archive real batch
  // ───────────────────────────────────────────────────────────────────────────

  async function handleArchive() {
    if (!modal?.item?.id) return

    try {
      setArchiveLoading(true)

      await batchService.archive(modal.item.id)

      setInventory((previous) =>
        previous.filter(
          (item) => item.id !== modal.item.id
        )
      )

      setModal(null)
    } catch (err) {
      console.error('Failed to archive batch:', err)

      setError(
        err?.response?.data?.detail ||
        'Failed to archive the batch.'
      )
    } finally {
      setArchiveLoading(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Sort icon
  // ───────────────────────────────────────────────────────────────────────────

  function SortIcon({ column }) {
    if (sortKey !== column) {
      return (
        <HiOutlineChevronDown
          size={11}
          className="text-slate-300"
        />
      )
    }

    return sortDir === 'asc' ? (
      <HiOutlineChevronUp
        size={11}
        className="text-primary-500"
      />
    ) : (
      <HiOutlineChevronDown
        size={11}
        className="text-primary-500"
      />
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Loading
  // ───────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <article
        aria-label="Inventory Management"
        className="flex flex-col gap-5"
      >
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <MdInventory2
              size={22}
              className="text-secondary-600"
            />
            Inventory Management
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Manage medicines, stock levels, batches and expiry information.
          </p>
        </div>

        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="flex flex-col items-center gap-3">
            <HiOutlineArrowPath
              size={28}
              className="text-primary-500 animate-spin"
            />

            <p className="text-sm text-slate-500">
              Loading your inventory...
            </p>
          </div>
        </div>
      </article>
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <article
      aria-label="Inventory Management"
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <MdInventory2
              size={22}
              className="text-secondary-600"
            />
            Inventory Management
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Manage medicines, stock levels, batches and expiry information.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.PHARMACY.INVENTORY_ADD}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary-600 text-white text-sm font-semibold hover:bg-secondary-700 transition-colors"
          >
            <HiOutlinePlus size={15} />
            Add Medicine
          </Link>

          <button
            type="button"
            onClick={loadInventory}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
          >
            <HiOutlineArrowPath size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-danger-50 border border-danger-200">
          <HiOutlineExclamationTriangle
            size={20}
            className="text-danger-600 shrink-0"
          />

          <div className="flex-1">
            <p className="text-sm font-semibold text-danger-700">
              Unable to load inventory
            </p>

            <p className="text-xs text-danger-600 mt-1">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={loadInventory}
            className="text-xs font-semibold text-danger-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Medicines',
            value: stats.total,
            icon: HiOutlineArchiveBox,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
          },
          {
            label: 'Low Stock',
            value: stats.low,
            icon: HiOutlineExclamationTriangle,
            color: 'text-warning-600',
            bg: 'bg-warning-50',
          },
          {
            label: 'Out of Stock',
            value: stats.out,
            icon: HiOutlineExclamationTriangle,
            color: 'text-danger-600',
            bg: 'bg-danger-50',
          },
          {
            label: 'Near Expiry',
            value: stats.expiring,
            icon: HiOutlineClock,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm"
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}
            >
              <stat.icon
                size={20}
                className={stat.color}
              />
            </div>

            <div>
              <p className="text-xl font-extrabold text-slate-900">
                {stat.value}
              </p>

              <p className="text-xs text-slate-500">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <HiOutlineMagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Search your medicines..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Status tabs */}
      <div
        className="flex gap-1 flex-wrap"
        role="group"
        aria-label="Filter by stock status"
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setActiveTab(tab.value)
              setPage(1)
            }}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeTab === tab.value
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300',
            ].join(' ')}
          >
            {tab.label}

            {tab.value && (
              <span className="ml-1.5 opacity-70">
                (
                {
                  inventory.filter(
                    (item) =>
                      item.status === tab.value
                  ).length
                }
                )
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {inventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
            <MdInventory2
              size={32}
              className="text-slate-300"
            />
          </div>

          <div className="text-center">
            <p className="text-base font-bold text-slate-700">
              No medicines in inventory
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Add a medicine and batch to start managing your inventory.
            </p>
          </div>

          <Link
            to={ROUTES.PHARMACY.INVENTORY_ADD}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary-600 text-white text-sm font-semibold hover:bg-secondary-700"
          >
            <HiOutlinePlus size={16} />
            Add Medicine
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold text-slate-600">
            No medicines match your search or filter.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch('')
              setActiveTab('')
              setPage(1)
            }}
            className="mt-2 text-xs text-primary-600 font-semibold"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="table-base"
                aria-label="Medicine inventory"
              >
                <thead>
                  <tr>
                    {[
                      { key: 'name', label: 'Medicine' },
                      { key: 'genericName', label: 'Generic' },
                      { key: 'batch', label: 'Batch' },
                      { key: 'expiry', label: 'Expiry' },
                      { key: 'qty', label: 'Stock' },
                      { key: 'status', label: 'Status' },
                      { key: 'lastUpdated', label: 'Updated' },
                      { key: '_actions', label: 'Actions' },
                    ].map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        onClick={
                          column.key !== '_actions'
                            ? () => toggleSort(column.key)
                            : undefined
                        }
                        style={
                          column.key !== '_actions'
                            ? { cursor: 'pointer' }
                            : {}
                        }
                      >
                        <span className="flex items-center gap-1">
                          {column.label}

                          {column.key !== '_actions' && (
                            <SortIcon column={column.key} />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paged.map((item) => {
                    const config =
                      STATUS_CONFIG[item.status]

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary-50">
                              <MdMedication
                                size={14}
                                className="text-secondary-600"
                              />
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                {item.name}
                              </p>

                              <p className="text-[10px] text-slate-400">
                                {item.composition}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="text-xs text-slate-500">
                          {item.genericName}
                        </td>

                        <td className="text-xs text-slate-400 font-mono">
                          {item.batch}
                        </td>

                        <td
                          className={`text-xs ${
                            item.status === 'expiring'
                              ? 'text-orange-600 font-semibold'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.expiry}
                        </td>

                        <td className="text-xs font-bold text-slate-900">
                          {item.qty}
                        </td>

                        <td>
                          <Badge
                            variant={config.variant}
                            size="sm"
                            dot
                          >
                            {config.label}
                          </Badge>
                        </td>

                        <td className="text-[11px] text-slate-400">
                          {item.lastUpdated}
                        </td>

                        <td>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setModal({
                                  type: 'view',
                                  item,
                                })
                              }
                              title="View Details"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50"
                            >
                              <HiOutlineEye size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setModal({
                                  type: 'archive',
                                  item,
                                })
                              }
                              title="Archive Batch"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50"
                            >
                              <HiOutlineTrash size={14} />
                            </button>
                          </div>
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
                Showing{' '}
                {filtered.length === 0
                  ? 0
                  : (page - 1) * PAGE_SIZE + 1}
                –
                {Math.min(
                  page * PAGE_SIZE,
                  filtered.length
                )}{' '}
                of {filtered.length}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  disabled={page === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-40"
                >
                  ← Prev
                </button>

                {Array.from({
                  length: totalPages,
                }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setPage(index + 1)
                    }
                    className={`w-8 h-7 rounded-lg text-xs ${
                      page === index + 1
                        ? 'bg-primary-600 text-white'
                        : 'border border-slate-200 text-slate-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={page === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="sm:hidden flex flex-col gap-3">
            {paged.map((item) => (
              <MobileCard
                key={item.id}
                item={item}
                onView={(selected) =>
                  setModal({
                    type: 'view',
                    item: selected,
                  })
                }
                onArchive={(selected) =>
                  setModal({
                    type: 'archive',
                    item: selected,
                  })
                }
              />
            ))}

            <div className="flex justify-center gap-2 py-2">
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
              >
                ← Prev
              </button>

              <span className="flex items-center text-xs text-slate-500">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {modal?.type === 'view' && (
        <ViewDetailsModal
          item={modal.item}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'archive' && (
        <ArchiveDialog
          item={modal.item}
          loading={archiveLoading}
          onConfirm={handleArchive}
          onClose={() => setModal(null)}
        />
      )}
    </article>
  )
}
export default InventoryPage