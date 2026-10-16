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
  HiOutlineFunnel,
  HiOutlineEllipsisVertical,
  HiOutlineCalendarDays,
  HiOutlineBuildingStorefront,
  HiOutlineInformationCircle,
   HiOutlineCurrencyRupee,
  HiOutlineCube,
  HiOutlinePencilSquare,
  HiOutlineCheck,
} from 'react-icons/hi2'
import { MdInventory2 } from 'react-icons/md'
import ROUTES from '../../constants/routes'
import batchService from '../../services/batchService'
import medicineService from '../../services/medicineService'
// ==========================================================
// STATUS CONFIGURATION
// ==========================================================
const STATUS_CONFIG = {
  available: {
    label: 'Available',
    badge: 'success',
    className: 'bg-green-100 text-green-700',
  },

  low: {
    label: 'Low Stock',
    badge: 'warning',
    className: 'bg-yellow-100 text-yellow-700',
  },

  critical: {
    label: 'Critical',
    badge: 'danger',
    className: 'bg-red-100 text-red-700',
  },

  out: {
    label: 'Out of Stock',
    badge: 'danger',
    className: 'bg-red-100 text-red-700',
  },

  expiring: {
    label: 'Expiring Soon',
    badge: 'warning',
    className: 'bg-orange-100 text-orange-700',
  },
}


// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

const getValue = (object, ...keys) => {
  for (const key of keys) {
    if (
      object &&
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key]
    }
  }

  return null
}


// ----------------------------------------------------------
// ObjectId helper
// ----------------------------------------------------------

const getId = (object) => {
  if (!object) return null

  return (
    object.id ||
    object._id ||
    object.medicine_id ||
    object.batch_id ||
    null
  )
}


// ----------------------------------------------------------
// Number helper
// ----------------------------------------------------------

const toNumber = (value) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}


// ----------------------------------------------------------
// Date helper
// ----------------------------------------------------------

const parseDate = (value) => {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}


// ----------------------------------------------------------
// Currency
// ----------------------------------------------------------

const formatCurrency = (value) => {
  const amount = toNumber(value)

  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}


// ----------------------------------------------------------
// Date formatting
// ----------------------------------------------------------

const formatDate = (value) => {
  const date = parseDate(value)

  if (!date) {
    return '—'
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}


// ----------------------------------------------------------
// Days until expiry
// ----------------------------------------------------------

const getDaysUntilExpiry = (value) => {
  const expiryDate = parseDate(value)

  if (!expiryDate) {
    return null
  }

  const now = new Date()

  const difference =
    expiryDate.getTime() - now.getTime()

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  )
}


// ==========================================================
// MEDICINE NORMALIZATION
// ==========================================================

const normalizeMedicine = (medicine) => {
  if (!medicine) {
    return null
  }

  return {
    id:
      medicine.id ||
      medicine._id ||
      medicine.medicine_id ||
      null,

    genericName:
      medicine.generic_name ||
      medicine.genericName ||
      medicine.name ||
      'Unknown Medicine',

    janAushadhiName:
      medicine.jan_aushadhi_name ||
      medicine.janAushadhiName ||
      medicine.janaushadhi_name ||
      '—',

    brandName:
      medicine.brand_name ||
      medicine.brandName ||
      medicine.brand ||
      '—',

    brandMapping:
      medicine.brand_mapping ||
      medicine.brandMapping ||
      '—',

    composition:
      medicine.composition ||
      '—',

    strength:
      medicine.strength ||
      '—',

    manufacturer:
      medicine.manufacturer ||
      '—',

    category:
      medicine.category ||
      '—',

    dosageForm:
      medicine.dosage_form ||
      medicine.dosageForm ||
      '—',

    mrp:
      medicine.mrp ??
      medicine.maximum_retail_price ??
      medicine.maximumRetailPrice ??
      0,

    janAushadhiMrp:
      medicine.jan_aushadhi_mrp ??
      medicine.janAushadhiMrp ??
      0,

    isArchived:
      medicine.is_archived ??
      medicine.isArchived ??
      false,
  }
}


// ==========================================================
// BATCH NORMALIZATION
// ==========================================================

const normalizeBatch = (batch, medicine) => {
  const normalizedMedicine =
    normalizeMedicine(medicine)

  const quantity = toNumber(
    getValue(
      batch,
      'available_quantity',
      'availableQuantity',
      'quantity',
      'stock',
    )
  )

  const minimumStock = toNumber(
    getValue(
      batch,
      'minimum_stock',
      'minimumStock',
      'min_stock',
      'minStock',
    )
  )

  const purchasePrice = toNumber(
    getValue(
      batch,
      'purchase_price',
      'purchasePrice',
    )
  )

  const sellingPrice = toNumber(
    getValue(
      batch,
      'selling_price',
      'sellingPrice',
      'sale_price',
      'salePrice',
      'mrp',
    )
  )

  const expiryDate =
    getValue(
      batch,
      'expiry_date',
      'expiryDate',
    )

  const batchNumber =
    getValue(
      batch,
      'batch_number',
      'batchNumber',
      'batch_no',
      'batchNo',
    ) || '—'

  const medicineId =
    getValue(
      batch,
      'medicine_id',
      'medicineId',
    ) ||
    normalizedMedicine?.id ||
    null

  const batchId =
    getValue(
      batch,
      'id',
      '_id',
      'batch_id',
      'batchId',
    ) || null

  return {
    id: batchId,

    batchId,

    medicineId,

    medicine: normalizedMedicine,

    genericName:
      normalizedMedicine?.genericName ||
      'Unknown Medicine',

    janAushadhiName:
      normalizedMedicine?.janAushadhiName ||
      '—',

    brandName:
      normalizedMedicine?.brandName ||
      '—',

    composition:
      normalizedMedicine?.composition ||
      '—',

    strength:
      normalizedMedicine?.strength ||
      '—',

    manufacturer:
      normalizedMedicine?.manufacturer ||
      '—',

    category:
      normalizedMedicine?.category ||
      '—',

    dosageForm:
      normalizedMedicine?.dosageForm ||
      '—',

    batchNumber,

    quantity,

    availableQuantity: quantity,

    minimumStock,

    purchasePrice,

    sellingPrice,

    // IMPORTANT: MRP belongs to the batch.
    // Do not fall back to the medicine-level MRP.
    mrp: sellingPrice,

    expiryDate,

    supplier:
      getValue(
        batch,
        'supplier',
        'supplier_name',
        'supplierName',
      ) || '—',

    invoiceNumber:
      getValue(
        batch,
        'invoice_number',
        'invoiceNumber',
      ) || '—',

    location:
      getValue(
        batch,
        'storage_location',
        'storageLocation',
        'location',
      ) || '—',

    status:
      getStatus(batch),
  }
}


// ==========================================================
// STATUS CALCULATION
// ==========================================================

const getStatus = (batch) => {
  const quantity = toNumber(
    getValue(
      batch,
      'available_quantity',
      'availableQuantity',
      'quantity',
      'stock',
    )
  )

  if (quantity <= 0) {
    return 'out'
  }

  const expiryDate =
    getValue(
      batch,
      'expiry_date',
      'expiryDate',
    )

  const daysUntilExpiry =
    getDaysUntilExpiry(expiryDate)

  if (
    daysUntilExpiry !== null &&
    daysUntilExpiry >= 0 &&
    daysUntilExpiry <= 90
  ) {
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


// ==========================================================
// COMPONENT
// ==========================================================

const InventoryPage = () => {
  // --------------------------------------------------------
  // State
  // --------------------------------------------------------

  const [inventory, setInventory] = useState([])

  const [loading, setLoading] = useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] =
    useState('')

  const [activeStatus, setActiveStatus] =
    useState('all')

  const [sortField, setSortField] =
    useState('genericName')

  const [sortDirection, setSortDirection] =
    useState('asc')

  const [selectedItem, setSelectedItem] =
    useState(null)

  const [showDetailsModal, setShowDetailsModal] =
    useState(false)

  const [showArchiveModal, setShowArchiveModal] =
    useState(false)

  const [showEditModal, setShowEditModal] =
    useState(false)

  const [editing, setEditing] =
    useState(false)

  const [editForm, setEditForm] = useState({
    purchasePrice: '',
    mrp: '',
    supplierName: '',
    invoiceNumber: '',
  })

  const [editError, setEditError] =
    useState('')

  const [archiving, setArchiving] =
    useState(false)


  // ========================================================
  // LOAD INVENTORY
  // ========================================================

  const loadInventory = async (
    isRefresh = false
  ) => {
    try {
      setError('')

      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // ----------------------------------------------------
      // STEP 1:
      // Get pharmacy batches
      // ----------------------------------------------------

      const batchResponse =
        await batchService.getAll()

      const batchData =
        batchResponse?.data

      let batches = []

      if (Array.isArray(batchData)) {
        batches = batchData
      } else if (
        Array.isArray(batchData?.data)
      ) {
        batches = batchData.data
      } else if (
        Array.isArray(batchData?.batches)
      ) {
        batches = batchData.batches
      } else if (
        Array.isArray(batchData?.items)
      ) {
        batches = batchData.items
      }

      // ----------------------------------------------------
      // STEP 2:
      // Remove archived batches
      // ----------------------------------------------------

      batches = batches.filter(
        (batch) => {
          const archived =
            batch?.is_archived ??
            batch?.isArchived ??
            false

          return !archived
        }
      )

      // ----------------------------------------------------
      // STEP 3:
      // Extract unique medicine IDs
      // ----------------------------------------------------

      const medicineIds = [
        ...new Set(
          batches
            .map(
              (batch) =>
                batch?.medicine_id ||
                batch?.medicineId
            )
            .filter(Boolean)
            .map(String)
        ),
      ]

      // ----------------------------------------------------
      // STEP 4:
      // Fetch medicine information individually
      //
      // IMPORTANT:
      // We intentionally DO NOT call:
      //
      // medicineService.getAll()
      //
      // because your current backend list route was
      // returning 404.
      // ----------------------------------------------------

      const medicineMap = new Map()

      await Promise.all(
        medicineIds.map(
          async (medicineId) => {
            try {
              const response =
                await medicineService.getById(
                  medicineId
                )

              const medicineData =
                response?.data

              const medicine =
                medicineData?.data ||
                medicineData?.medicine ||
                medicineData

              if (medicine) {
                medicineMap.set(
                  String(medicineId),
                  normalizeMedicine(
                    medicine
                  )
                )
              }
            } catch (medicineError) {
              console.error(
                `Failed to load medicine ${medicineId}:`,
                medicineError
              )
            }
          }
        )
      )

      // ----------------------------------------------------
      // STEP 5:
      // Combine batch + medicine
      // ----------------------------------------------------

      const normalizedInventory =
        batches
          .map((batch) => {
            const medicineId =
              batch?.medicine_id ||
              batch?.medicineId

            const medicine =
              medicineMap.get(
                String(medicineId)
              )

            return normalizeBatch(
              batch,
              medicine
            )
          })
          .filter(
            (item) => item.id
          )

      setInventory(
        normalizedInventory
      )

    } catch (requestError) {
      console.error(
        'Inventory loading failed:',
        requestError
      )

      const message =
        requestError?.response?.data
          ?.detail ||
        requestError?.response?.data
          ?.message ||
        requestError?.message ||
        'Unable to load inventory.'

      setError(message)

    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }


  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    loadInventory()
  }, [])


  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh = () => {
    loadInventory(true)
  }


  // ========================================================
  // EDIT BATCH
  // ========================================================

  const openEditModal = (item) => {
    setSelectedItem(item)
    setEditError('')
    setEditForm({
      purchasePrice: item?.purchasePrice ?? '',
      mrp: item?.sellingPrice ?? item?.mrp ?? '',
      supplierName: item?.supplier ?? '',
      invoiceNumber: item?.invoiceNumber ?? '',
    })
    setShowDetailsModal(false)
    setShowArchiveModal(false)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    if (editing) return
    setShowEditModal(false)
    setEditError('')
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()

    if (!selectedItem?.id) return

    const purchasePrice = Number(editForm.purchasePrice)
    const mrp = Number(editForm.mrp)
    const supplierName = editForm.supplierName.trim()
    const invoiceNumber = editForm.invoiceNumber.trim()

    if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
      setEditError('Purchase price must be greater than 0.')
      return
    }

    if (!Number.isFinite(mrp) || mrp <= 0) {
      setEditError('MRP must be greater than 0.')
      return
    }

    if (mrp < purchasePrice) {
      setEditError('MRP must be greater than or equal to the purchase price.')
      return
    }

    if (supplierName.length < 2) {
      setEditError('Supplier name must contain at least 2 characters.')
      return
    }

    if (invoiceNumber.length < 2) {
      setEditError('Invoice number must contain at least 2 characters.')
      return
    }

    try {
      setEditing(true)
      setEditError('')

      const updateData = {
        purchase_price: purchasePrice,
        mrp: mrp,
        supplier_name: supplierName,
        invoice_number: invoiceNumber,
      }

      console.log('Updating batch:', selectedItem.id)
      console.log('Update data:', updateData)

      const response = await batchService.update(
        selectedItem.id,
        updateData
      )

      console.log(
        'Update response:',
        response?.data
      )

      // Reload from the backend so the screen shows
      // the values actually saved in MongoDB.
      await loadInventory()

      setShowEditModal(false)
      setSelectedItem(null)

    } catch (requestError) {
      console.error('Failed to update batch:', requestError)

      const message =
        requestError?.response?.data?.detail ||
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Failed to update batch.'

      setEditError(message)
    } finally {
      setEditing(false)
    }
  }


  // ========================================================
  // ARCHIVE
  // ========================================================

  const handleArchive = async () => {
    if (!selectedItem?.id) {
      return
    }

    try {
      setArchiving(true)

      await batchService.archive(
        selectedItem.id
      )

      setInventory(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== selectedItem.id
          )
      )

      setSelectedItem(null)
      setShowArchiveModal(false)

    } catch (requestError) {
      console.error(
        'Failed to archive batch:',
        requestError
      )

      const message =
        requestError?.response?.data
          ?.detail ||
        requestError?.message ||
        'Failed to archive batch.'

      setError(message)

    } finally {
      setArchiving(false)
    }
  }


  // ========================================================
  // SORT
  // ========================================================

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(
        (previous) =>
          previous === 'asc'
            ? 'desc'
            : 'asc'
      )
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }


  // ========================================================
  // FILTER + SEARCH + SORT
  // ========================================================

  const filteredInventory = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase()

    let result =
      inventory.filter((item) => {
        // --------------------------------------------------
        // Status filter
        // --------------------------------------------------

        if (
          activeStatus !== 'all' &&
          item.status !== activeStatus
        ) {
          return false
        }

        // --------------------------------------------------
        // Search
        // --------------------------------------------------

        if (!search) {
          return true
        }

        const searchableText = [
          item.genericName,
          item.janAushadhiName,
          item.brandName,
          item.composition,
          item.strength,
          item.manufacturer,
          item.category,
          item.batchNumber,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(
          search
        )
      })

    // ------------------------------------------------------
    // Sort
    // ------------------------------------------------------

    result.sort((a, b) => {
      let first = a?.[sortField]
      let second = b?.[sortField]

      if (
        sortField === 'expiryDate'
      ) {
        first =
          parseDate(first)?.getTime() ||
          0

        second =
          parseDate(second)?.getTime() ||
          0
      }

      if (
        typeof first === 'number' &&
        typeof second === 'number'
      ) {
        return sortDirection === 'asc'
          ? first - second
          : second - first
      }

      first =
        String(first || '')
          .toLowerCase()

      second =
        String(second || '')
          .toLowerCase()

      if (first < second) {
        return sortDirection === 'asc'
          ? -1
          : 1
      }

      if (first > second) {
        return sortDirection === 'asc'
          ? 1
          : -1
      }

      return 0
    })

    return result
  }, [
    inventory,
    searchTerm,
    activeStatus,
    sortField,
    sortDirection,
  ])


  // ========================================================
  // INVENTORY STATISTICS
  // ========================================================

  const statistics = useMemo(() => {
    const totalBatches =
      inventory.length

    const totalStock =
      inventory.reduce(
        (sum, item) =>
          sum +
          toNumber(
            item.quantity
          ),
        0
      )

    const available =
      inventory.filter(
        (item) =>
          item.status === 'available'
      ).length

    const lowStock =
      inventory.filter(
        (item) =>
          item.status === 'low' ||
          item.status === 'critical'
      ).length

    const outOfStock =
      inventory.filter(
        (item) =>
          item.status === 'out'
      ).length

    const expiring =
      inventory.filter(
        (item) =>
          item.status === 'expiring'
      ).length

    const inventoryValue =
      inventory.reduce(
        (sum, item) =>
          sum +
          toNumber(
            item.quantity
          ) *
            toNumber(
              item.purchasePrice
            ),
        0
      )

    return {
      totalBatches,
      totalStock,
      available,
      lowStock,
      outOfStock,
      expiring,
      inventoryValue,
    }
  }, [inventory])


  // ========================================================
  // STATUS TABS
  // ========================================================

  const statusTabs = [
    {
      key: 'all',
      label: 'All',
      count: inventory.length,
    },

    {
      key: 'available',
      label: 'Available',
      count: statistics.available,
    },

    {
      key: 'low',
      label: 'Low Stock',
      count: inventory.filter(
        (item) =>
          item.status === 'low'
      ).length,
    },

    {
      key: 'critical',
      label: 'Critical',
      count: inventory.filter(
        (item) =>
          item.status === 'critical'
      ).length,
    },

    {
      key: 'out',
      label: 'Out of Stock',
      count: statistics.outOfStock,
    },

    {
      key: 'expiring',
      label: 'Expiring',
      count: statistics.expiring,
    },
  ]


  // ========================================================
  // STATUS BADGE
  // ========================================================

  const renderStatus = (status) => {
    const config =
      STATUS_CONFIG[status] ||
      STATUS_CONFIG.available

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          config.className || ''
        }`}
      >
        {config.label}
      </span>
    )
  }


  // ========================================================
  // SORT ICON
  // ========================================================

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return null
    }

    return sortDirection === 'asc' ? (
      <HiOutlineChevronUp className="h-4 w-4" />
    ) : (
      <HiOutlineChevronDown className="h-4 w-4" />
    )
  }


  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <HiOutlineArrowPath className="h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm text-gray-500">
            Loading inventory...
          </p>
        </div>
      </div>
    )
  }


  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <MdInventory2 className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Inventory
              </h1>

              <p className="text-sm text-gray-500">
                Manage your pharmacy medicines and stock.
              </p>
            </div>

          </div>
        </div>


        <div className="flex flex-wrap items-center gap-2">

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <HiOutlineArrowPath
              className={`h-5 w-5 ${
                refreshing
                  ? 'animate-spin'
                  : ''
              }`}
            />

            Refresh
          </button>


          <Link
            to={ROUTES.PHARMACY_ADD_MEDICINE}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <HiOutlinePlus className="h-5 w-5" />

            Add Medicine
          </Link>

        </div>

      </div>


      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

          <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div className="flex-1">

            <p className="font-semibold text-red-800">
              Unable to load inventory
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>

        </div>
      )}


      {/* ================================================== */}
      {/* STATISTICS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Batches */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Batches
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.totalBatches}
              </p>
            </div>

            <div className="rounded-lg bg-blue-100 p-3">
              <HiOutlineCube className="h-6 w-6 text-blue-600" />
            </div>

          </div>

        </div>


        {/* Total Stock */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Stock Units
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.totalStock.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="rounded-lg bg-green-100 p-3">
              <HiOutlineCube className="h-6 w-6 text-green-600" />
            </div>

          </div>

        </div>


        {/* Low Stock */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Low / Critical
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.lowStock}
              </p>
            </div>

            <div className="rounded-lg bg-yellow-100 p-3">
              <HiOutlineExclamationTriangle className="h-6 w-6 text-yellow-600" />
            </div>

          </div>

        </div>


        {/* Inventory Value */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Inventory Value
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(
                  statistics.inventoryValue
                )}
              </p>
            </div>

            <div className="rounded-lg bg-purple-100 p-3">
              <HiOutlineCurrencyRupee className="h-6 w-6 text-purple-600" />
            </div>

          </div>

        </div>

      </div>


      {/* ================================================== */}
      {/* STATUS FILTERS */}
      {/* ================================================== */}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">

        <div className="flex min-w-max border-b border-gray-200">

          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() =>
                setActiveStatus(tab.key)
              }
              className={`border-b-2 px-5 py-4 text-sm font-medium transition ${
                activeStatus === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>
                {tab.label}
              </span>

              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  activeStatus === tab.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}

        </div>

      </div>


      {/* ================================================== */}
      {/* SEARCH */}
      {/* ================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="relative">

          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search medicine, brand, batch, manufacturer..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm('')
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          )}

        </div>

      </div>


      {/* ================================================== */}
      {/* TABLE */}
      {/* ================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="hidden overflow-x-auto lg:block">

          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">

              <tr>

                <th
                  scope="col"
                  className="px-5 py-3 text-left"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        'genericName'
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
                  >
                    Medicine

                    {renderSortIcon(
                      'genericName'
                    )}
                  </button>
                </th>


                <th
                  scope="col"
                  className="px-5 py-3 text-left"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Batch
                  </span>
                </th>


                <th
                  scope="col"
                  className="px-5 py-3 text-left"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        'quantity'
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
                  >
                    Quantity

                    {renderSortIcon(
                      'quantity'
                    )}
                  </button>
                </th>


                <th
                  scope="col"
                  className="px-5 py-3 text-left"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Price
                  </span>
                </th>


                <th
                  scope="col"
                  className="px-5 py-3 text-left"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        'expiryDate'
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
                  >
                    Expiry

                    {renderSortIcon(
                      'expiryDate'
                    )}
                  </button>
                </th>


                <th
                  scope="col"
                  className="px-5 py-3 text-left"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </span>
                </th>


                <th
                  scope="col"
                  className="px-5 py-3 text-right"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </span>
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-200">

              {filteredInventory.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >

                    <MdInventory2 className="mx-auto h-12 w-12 text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      No inventory found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Try changing your search or filter.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredInventory.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* Medicine */}

                      <td className="px-5 py-4">

                        <div>

                          <p className="font-semibold text-gray-900">
                            {item.genericName}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {item.brandName}
                            {item.strength &&
                              item.strength !==
                                '—'
                              ? ` • ${item.strength}`
                              : ''}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {item.manufacturer}
                          </p>

                        </div>

                      </td>


                      {/* Batch */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-gray-800">
                          {item.batchNumber}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.category}
                        </p>

                      </td>


                      {/* Quantity */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-gray-900">
                          {item.quantity.toLocaleString(
                            'en-IN'
                          )}
                        </p>

                        {item.minimumStock >
                          0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Min: {item.minimumStock}
                          </p>
                        )}

                      </td>


                      {/* Price */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            item.sellingPrice
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Buy:{' '}
                          {formatCurrency(
                            item.purchasePrice
                          )}
                        </p>

                      </td>


                      {/* Expiry */}

                      <td className="px-5 py-4">

                        <p className="text-sm text-gray-800">
                          {formatDate(
                            item.expiryDate
                          )}
                        </p>

                        {(() => {
                          const days =
                            getDaysUntilExpiry(
                              item.expiryDate
                            )

                          if (
                            days === null
                          ) {
                            return null
                          }

                          return (
                            <p
                              className={`mt-1 text-xs ${
                                days <= 30
                                  ? 'font-semibold text-red-600'
                                  : days <= 90
                                    ? 'text-yellow-600'
                                    : 'text-gray-500'
                              }`}
                            >
                              {days < 0
                                ? 'Expired'
                                : `${days} days left`}
                            </p>
                          )
                        })()}

                      </td>


                      {/* Status */}

                      <td className="px-5 py-4">
                        {renderStatus(
                          item.status
                        )}
                      </td>


                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItem(
                                item
                              )

                              setShowDetailsModal(
                                true
                              )
                            }}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                            title="View details"
                          >
                            <HiOutlineEye className="h-5 w-5" />
                          </button>


                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-yellow-50 hover:text-yellow-600"
                            title="Edit batch"
                          >
                            <HiOutlinePencilSquare className="h-5 w-5" />
                          </button>


                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItem(
                                item
                              )

                              setShowArchiveModal(
                                true
                              )
                            }}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Archive batch"
                          >
                            <HiOutlineArchiveBox className="h-5 w-5" />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )

              )}

            </tbody>

          </table>

        </div>


        {/* ================================================= */}
        {/* MOBILE CARDS */}
        {/* ================================================= */}

        <div className="divide-y divide-gray-200 lg:hidden">

          {filteredInventory.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <MdInventory2 className="mx-auto h-12 w-12 text-gray-300" />

              <p className="mt-3 text-sm font-medium text-gray-700">
                No inventory found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filter.
              </p>

            </div>

          ) : (

            filteredInventory.map(
              (item) => (
                <div
                  key={item.id}
                  className="p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="truncate font-semibold text-gray-900">
                        {item.genericName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.brandName}
                        {item.strength &&
                          item.strength !==
                            '—'
                          ? ` • ${item.strength}`
                          : ''}
                      </p>

                    </div>

                    {renderStatus(
                      item.status
                    )}

                  </div>


                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-lg bg-gray-50 p-3">

                      <p className="text-xs text-gray-500">
                        Batch
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {item.batchNumber}
                      </p>

                    </div>


                    <div className="rounded-lg bg-gray-50 p-3">

                      <p className="text-xs text-gray-500">
                        Quantity
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {item.quantity.toLocaleString(
                          'en-IN'
                        )}
                      </p>

                    </div>


                    <div className="rounded-lg bg-gray-50 p-3">

                      <p className="text-xs text-gray-500">
                        Selling Price
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatCurrency(
                          item.sellingPrice
                        )}
                      </p>

                    </div>


                    <div className="rounded-lg bg-gray-50 p-3">

                      <p className="text-xs text-gray-500">
                        Expiry
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatDate(
                          item.expiryDate
                        )}
                      </p>

                    </div>

                  </div>


                  <div className="mt-4 flex justify-end gap-2">

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(
                          item
                        )

                        setShowDetailsModal(
                          true
                        )
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <HiOutlineEye className="h-4 w-4" />

                      View
                    </button>


                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-2 rounded-lg border border-yellow-200 px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50"
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" />

                      Edit
                    </button>


                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(
                          item
                        )

                        setShowArchiveModal(
                          true
                        )
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <HiOutlineArchiveBox className="h-4 w-4" />

                      Archive
                    </button>

                  </div>

                </div>
              )
            )

          )}

        </div>

      </div>


      {/* ================================================== */}
      {/* RESULT COUNT */}
      {/* ================================================== */}

      <div className="text-sm text-gray-500">

        Showing{' '}

        <span className="font-semibold text-gray-700">
          {filteredInventory.length}
        </span>{' '}

        of{' '}

        <span className="font-semibold text-gray-700">
          {inventory.length}
        </span>{' '}

        inventory batches

      </div>


      {/* ================================================== */}
      {/* DETAILS MODAL */}
      {/* ================================================== */}

      {showDetailsModal &&
        selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Medicine Details
                  </h2>

                  <p className="text-sm text-gray-500">
                    {selectedItem.genericName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(
                      false
                    )

                    setSelectedItem(null)
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <HiOutlineXMark className="h-6 w-6" />
                </button>

              </div>


              {/* Body */}

              <div className="space-y-6 p-6">

                {/* Status */}

                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Current Status
                    </p>

                    <div className="mt-2">
                      {renderStatus(
                        selectedItem.status
                      )}
                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-xs text-gray-500">
                      Quantity
                    </p>

                    <p className="text-2xl font-bold text-gray-900">
                      {selectedItem.quantity.toLocaleString(
                        'en-IN'
                      )}
                    </p>

                  </div>

                </div>


                {/* Medicine information */}

                <div>

                  <h3 className="mb-3 text-sm font-bold text-gray-900">
                    Medicine Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-xs text-gray-500">
                        Generic Name
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedItem.genericName}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Jan Aushadhi Name
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedItem.janAushadhiName}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Brand
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedItem.brandName}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Strength
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedItem.strength}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Composition
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedItem.composition}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Manufacturer
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedItem.manufacturer}
                      </p>
                    </div>

                  </div>

                </div>


                {/* Batch information */}

                <div>

                  <h3 className="mb-3 text-sm font-bold text-gray-900">
                    Batch Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-xs text-gray-500">
                        Batch Number
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedItem.batchNumber}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Expiry Date
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                        <HiOutlineCalendarDays className="h-4 w-4 text-gray-400" />

                        {formatDate(
                          selectedItem.expiryDate
                        )}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Purchase Price
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {formatCurrency(
                          selectedItem.purchasePrice
                        )}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Selling Price
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {formatCurrency(
                          selectedItem.sellingPrice
                        )}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Minimum Stock
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedItem.minimumStock}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Supplier
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                        <HiOutlineBuildingStorefront className="h-4 w-4 text-gray-400" />

                        {selectedItem.supplier}
                      </p>
                    </div>

                  </div>

                </div>

              </div>


              {/* Footer */}

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(
                      false
                    )

                    setSelectedItem(null)
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>


                <button
                  type="button"
                  onClick={() => openEditModal(selectedItem)}
                  className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-50"
                >
                  <HiOutlinePencilSquare className="h-5 w-5" />

                  Edit Batch
                </button>


                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(
                      false
                    )

                    setShowArchiveModal(
                      true
                    )
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <HiOutlineArchiveBox className="h-5 w-5" />

                  Archive Batch
                </button>

              </div>

            </div>

          </div>
        )}


      {/* ================================================== */}
      {/* EDIT BATCH MODAL */}
      {/* ================================================== */}

      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Batch
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedItem.genericName} • {selectedItem.batchNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={editing}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="space-y-5 p-6">

                {editError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
                    <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <p className="text-sm text-red-700">{editError}</p>
                  </div>
                )}

                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <HiOutlineInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <p className="text-xs leading-5 text-blue-800">
                      You can edit pricing and supplier information here. Quantity, batch number, medicine, manufacturing date, and expiry date are not editable from this screen. Stock changes will be handled through Stock Adjustment.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Purchase Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editForm.purchasePrice}
                        onChange={(event) => setEditForm((previous) => ({ ...previous, purchasePrice: event.target.value }))}
                        disabled={editing}
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      MRP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editForm.mrp}
                        onChange={(event) => setEditForm((previous) => ({ ...previous, mrp: event.target.value }))}
                        disabled={editing}
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    minLength={2}
                    maxLength={150}
                    value={editForm.supplierName}
                    onChange={(event) => setEditForm((previous) => ({ ...previous, supplierName: event.target.value }))}
                    disabled={editing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    minLength={2}
                    maxLength={100}
                    value={editForm.invoiceNumber}
                    onChange={(event) => setEditForm((previous) => ({ ...previous, invoiceNumber: event.target.value }))}
                    disabled={editing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editing}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editing}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editing ? (
                    <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                  ) : (
                    <HiOutlineCheck className="h-4 w-4" />
                  )}
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ================================================== */}
      {/* ARCHIVE CONFIRMATION MODAL */}
      {/* ================================================== */}

      {showArchiveModal &&
        selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

              <div className="p-6">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">

                  <HiOutlineTrash className="h-6 w-6 text-red-600" />

                </div>


                <h2 className="mt-4 text-center text-lg font-bold text-gray-900">
                  Archive Batch?
                </h2>


                <p className="mt-2 text-center text-sm leading-6 text-gray-500">

                  Are you sure you want to archive batch{' '}

                  <span className="font-semibold text-gray-700">
                    {selectedItem.batchNumber}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-gray-700">
                    {selectedItem.genericName}
                  </span>
                  ?
                </p>
                <p className="mt-3 text-center text-xs text-gray-400">
                  Archived batches will no longer appear in the active inventory.
                </p>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  disabled={archiving}
                  onClick={() => {
                    setShowArchiveModal(
                      false
                    )

                    setSelectedItem(null)
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={archiving}
                  onClick={handleArchive}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {archiving && (
                    <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                  )}

                  {archiving
                    ? 'Archiving...'
                    : 'Archive Batch'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
export default InventoryPage