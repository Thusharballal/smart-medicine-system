/**
 * Component: InventoryDashboard
 *
 * Purpose:
 *   Live Pharmacy Inventory Dashboard
 *
 * Route:
 *   /pharmacy/inventory-dashboard
 *
 * Backend:
 *   GET /api/v1/inventory/dashboard
 *   GET /api/v1/inventory/low-stock
 *   GET /api/v1/inventory/near-expiry
 *   GET /api/v1/inventory/out-of-stock
 *   GET /api/v1/inventory/recent-activities
 */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineArchiveBox,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlinePlus,
  HiOutlineDocumentArrowUp,
  HiOutlineReceiptRefund,
  HiOutlineCheckCircle,
  HiOutlineShoppingCart,
  HiOutlineChartBarSquare,
  HiOutlineArrowTrendingDown,
  HiOutlineArrowPath,
  HiOutlineArrowUpCircle,
  HiOutlineArrowDownCircle,
  HiOutlineArrowUturnLeft,
  HiOutlineAdjustmentsHorizontal,
} from 'react-icons/hi2'
import {
  MdInventory2,
  MdMedication,
  MdLocalPharmacy,
  MdAnalytics,
} from 'react-icons/md'
import InfoCard from '../../components/cards/InfoCard'
import Badge from '../../components/ui/Badge'
import { ROUTES } from '../../constants/routes'
import axiosClient from '../../config/axiosClient'
// ============================================================
// HELPERS
// ============================================================
function formatNumber(value) {
  const number = Number(value || 0)
  return number.toLocaleString('en-IN')
}
function formatCurrency(value) {
  const number = Number(value || 0)
  return `₹${number.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
function formatActivityTime(value) {
  if (!value) {
    return 'Unknown time'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown time'
  }
  const now = new Date()
  const difference = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  )
  if (difference < 0) {
    return 'Just now'
  }
  if (difference < 60) {
    return 'Just now'
  }
  if (difference < 3600) {
    const minutes = Math.floor(difference / 60)
    return `${minutes} min ago`
  }
  if (difference < 86400) {
    const hours = Math.floor(difference / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  }
  if (difference < 604800) {
    const days = Math.floor(difference / 86400)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
function formatDate(value) {
  if (!value) {
    return '—'
  }
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
// ============================================================
// STATUS HELPERS
// ============================================================
function getActivityStyle(activityType) {
  const type = String(activityType || '').toLowerCase()

  // ----------------------------------------------------------
  // PURCHASE
  // ----------------------------------------------------------

  if (
    type.includes('purchase') ||
    type.includes('purchased')
  ) {
    return {
      icon: HiOutlineArrowDownCircle,
      iconBg: 'bg-success-100',
      iconColor: 'text-success-600',
      status: 'success',
    }
  }

  // ----------------------------------------------------------
  // SALE
  // ----------------------------------------------------------

  if (
    type.includes('sale') ||
    type.includes('sold')
  ) {
    return {
      icon: HiOutlineArrowUpCircle,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      status: 'success',
    }
  }

  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  if (
    type.includes('return') ||
    type.includes('returned')
  ) {
    return {
      icon: HiOutlineArrowUturnLeft,
      iconBg: 'bg-secondary-100',
      iconColor: 'text-secondary-600',
      status: 'success',
    }
  }

  // ----------------------------------------------------------
  // STOCK ADJUSTMENT
  // ----------------------------------------------------------

  if (
    type.includes('adjustment') ||
    type.includes('adjust')
  ) {
    return {
      icon: HiOutlineAdjustmentsHorizontal,
      iconBg: 'bg-warning-100',
      iconColor: 'text-warning-600',
      status: 'warning',
    }
  }

  // ----------------------------------------------------------
  // BATCH
  // ----------------------------------------------------------

  if (type.includes('batch')) {
    return {
      icon: HiOutlineArchiveBox,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      status: 'success',
    }
  }

  // ----------------------------------------------------------
  // MEDICINE
  // ----------------------------------------------------------

  if (type.includes('medicine')) {
    return {
      icon: HiOutlinePlus,
      iconBg: 'bg-secondary-100',
      iconColor: 'text-secondary-600',
      status: 'success',
    }
  }

  // ----------------------------------------------------------
  // STOCK
  // ----------------------------------------------------------

  if (type.includes('stock')) {
    return {
      icon: HiOutlineArrowTrendingDown,
      iconBg: 'bg-warning-100',
      iconColor: 'text-warning-600',
      status: 'warning',
    }
  }

  // ----------------------------------------------------------
  // DEFAULT
  // ----------------------------------------------------------

  return {
    icon: HiOutlineCheckCircle,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    status: 'success',
  }
}


// ============================================================
// COMPONENT
// ============================================================

function InventoryDashboard() {
  const [dashboard, setDashboard] = useState(null)

  const [lowStockItems, setLowStockItems] = useState([])
  const [nearExpiryItems, setNearExpiryItems] = useState([])
  const [outOfStockItems, setOutOfStockItems] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')

      const [
        dashboardResponse,
        lowStockResponse,
        nearExpiryResponse,
        outOfStockResponse,
        activitiesResponse,
      ] = await Promise.all([
        axiosClient.get('/inventory/dashboard'),

        axiosClient.get('/inventory/low-stock'),

        axiosClient.get('/inventory/near-expiry'),

        axiosClient.get('/inventory/out-of-stock'),

        axiosClient.get('/inventory/recent-activities'),
      ])

      setDashboard(
        dashboardResponse?.data || null
      )

      setLowStockItems(
        Array.isArray(lowStockResponse?.data)
          ? lowStockResponse.data
          : []
      )

      setNearExpiryItems(
        Array.isArray(nearExpiryResponse?.data)
          ? nearExpiryResponse.data
          : []
      )

      setOutOfStockItems(
        Array.isArray(outOfStockResponse?.data)
          ? outOfStockResponse.data
          : []
      )

      setRecentActivities(
        Array.isArray(activitiesResponse?.data)
          ? activitiesResponse.data
          : []
      )

    } catch (err) {
      console.error(
        'Failed to load inventory dashboard:',
        err
      )

      setError(
        err?.response?.data?.detail ||
        'Unable to load inventory dashboard.'
      )

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadDashboard()
  }, [])


  // ==========================================================
  // DASHBOARD VALUES
  // ==========================================================

  const stats = useMemo(() => {
    return {
      totalMedicines:
        dashboard?.total_medicines ?? 0,
      totalBatches:
        dashboard?.total_batches ?? 0,
      totalStockUnits:
        dashboard?.total_stock_units ?? 0,
      lowStock:
        dashboard?.low_stock_batches ?? 0,
      outOfStock:
        dashboard?.out_of_stock_batches ?? 0,
      nearExpiry:
        dashboard?.near_expiry_batches ?? 0,
      inventoryHealth:
        dashboard?.inventory_health ?? 100,
      inventoryValue:
        dashboard?.total_inventory_value ?? 0,
      averageStock:
        dashboard?.average_stock_per_batch ?? 0,
      todaySales: 
        dashboard?.today_sales ?? 0,
    }
  }, [dashboard])
  // ==========================================================
  // HEALTH STATUS
  // ==========================================================

  const healthStatus = useMemo(() => {
    const health = Number(
      stats.inventoryHealth
    )

    if (health >= 80) {
      return {
        label: 'Healthy',
        text: 'text-success-700',
        bg: 'bg-success-100',
        border: 'border-success-200',
        dot: 'bg-success-500',
      }
    }

    if (health >= 60) {
      return {
        label: 'Needs Attention',
        text: 'text-warning-700',
        bg: 'bg-warning-100',
        border: 'border-warning-200',
        dot: 'bg-warning-500',
      }
    }

    return {
      label: 'Critical',
      text: 'text-danger-700',
      bg: 'bg-danger-100',
      border: 'border-danger-200',
      dot: 'bg-danger-500',
    }
  }, [stats.inventoryHealth])


  // ==========================================================
  // HEALTHY BATCH CALCULATION
  // ==========================================================

  const estimatedHealthyBatches = useMemo(() => {
    const totalBatches = Number(
      stats.totalBatches || 0
    )

    const health = Number(
      stats.inventoryHealth || 0
    )

    if (totalBatches <= 0) {
      return 0
    }

    const estimated = Math.round(
      (totalBatches * health) / 100
    )

    return Math.min(
      Math.max(estimated, 0),
      totalBatches
    )
  }, [
    stats.totalBatches,
    stats.inventoryHealth,
  ])


  // ==========================================================
  // ATTENTION COUNT
  // ==========================================================

  const attentionCount = useMemo(() => {
    return (
      Number(stats.lowStock || 0) +
      Number(stats.nearExpiry || 0) +
      Number(stats.outOfStock || 0)
    )
  }, [
    stats.lowStock,
    stats.nearExpiry,
    stats.outOfStock,
  ])


  // ==========================================================
  // QUICK ACTIONS
  // ==========================================================

  const quickActions = [
    {
      id: 'add',
      icon: HiOutlinePlus,
      emoji: '➕',
      label: 'Add Medicine',
      desc: 'Add medicine and batch stock',
      color: 'bg-primary-100 text-primary-700',
      border:
        'border-primary-200 hover:border-primary-400 hover:bg-primary-50',
      to: ROUTES.PHARMACY.INVENTORY_ADD,
    },

    {
      id: 'import',
      icon: HiOutlineDocumentArrowUp,
      emoji: '📄',
      label: 'Import Stock',
      desc: 'Import supplier stock',
      color: 'bg-secondary-100 text-secondary-700',
      border:
        'border-secondary-200 hover:border-secondary-400 hover:bg-secondary-50',
      to: ROUTES.PHARMACY.IMPORT_STOCK,
    },

    {
      id: 'bill',
      icon: HiOutlineReceiptRefund,
      emoji: '🧾',
      label: 'Generate Bill',
      desc: 'Create a medicine bill',
      color: 'bg-success-100 text-success-700',
      border:
        'border-success-200 hover:border-success-400 hover:bg-success-50',
      to: null,
    },

    {
      id: 'inventory',
      icon: MdInventory2,
      emoji: '📦',
      label: 'View Inventory',
      desc: 'Manage pharmacy stock',
      color: 'bg-accent-100 text-accent-700',
      border:
        'border-accent-200 hover:border-accent-400 hover:bg-accent-50',
      to: ROUTES.PHARMACY.INVENTORY,
    },
  ]
  // ==========================================================
  // LOADING STATE
  // ==========================================================
  if (loading) {
    return (
      <article
        aria-label="Inventory Dashboard"
        className="flex flex-col gap-6"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <MdAnalytics
              size={26}
              className="text-primary-600"
            />
            Inventory Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Loading live inventory information...
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-slate-100 animate-pulse"
              />
            )
          )}
        </div>
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
      </article>
    )
  }
  // ==========================================================
  // ERROR STATE
  // ==========================================================
  if (error) {
    return (
      <article
        aria-label="Inventory Dashboard"
        className="flex flex-col gap-6"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <MdAnalytics
              size={26}
              className="text-primary-600"
            />
            Inventory Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pharmacy inventory overview
          </p>
        </div>
        <div className="rounded-2xl border border-danger-200 bg-danger-50 p-6">
          <div className="flex items-start gap-3">
            <HiOutlineExclamationTriangle
              size={24}
              className="text-danger-600 shrink-0"
            />
            <div className="flex-1">
              <h2 className="font-bold text-danger-800">
                Unable to load inventory
              </h2>
              <p className="text-sm text-danger-700 mt-1">
                {error}
              </p>
              <button
                type="button"
                onClick={loadDashboard}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-danger-600 text-white text-sm font-semibold hover:bg-danger-700"
              >
                <HiOutlineArrowPath size={16} />
                Retry
              </button>
            </div>
          </div>
        </div>
      </article>
    )
  }
  // ==========================================================
  // MAIN UI
  // ==========================================================
  return (
    <article
      aria-label="Inventory Dashboard"
      className="flex flex-col gap-6"
    >
      {/* ======================================================
          HEADER
          ====================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <MdAnalytics
              size={26}
              className="text-primary-600"
              aria-hidden="true"
            />
            Inventory Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Live pharmacy inventory overview and stock health
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadDashboard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowPath size={15} />
            Refresh
          </button>
          <Link
            to={ROUTES.PHARMACY.INVENTORY_ADD}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <HiOutlinePlus
              size={15}
              aria-hidden="true"
            />
            Add Medicine
          </Link>
          <Link
            to={ROUTES.PHARMACY.INVENTORY}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <MdInventory2
              size={15}
              aria-hidden="true"
            />
            View Inventory
          </Link>
        </div>
      </div>
      {/* ======================================================
          STATISTICS
          ====================================================== */}
      <section aria-labelledby="inv-stats-heading">
        <h2
          id="inv-stats-heading"
          className="sr-only"
        >
          Inventory Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoCard
            label="Total Medicines"
            value={formatNumber(stats.totalMedicines)}
            icon={
              <MdMedication size={20} />
            }
            variant="primary"
            subtitle={`${formatNumber(stats.totalBatches)} active batches`}
          />
          <InfoCard
            label="Total Stock Units"
            value={formatNumber(stats.totalStockUnits)}
            icon={
              <HiOutlineArchiveBox size={20} />
            }
            variant="secondary"
            subtitle={`Avg ${formatNumber(stats.averageStock)} / batch`}
          />
          <InfoCard
            label="Low Stock"
            value={formatNumber(stats.lowStock)}
            icon={
              <HiOutlineArrowTrendingDown size={20} />
            }
            variant="warning"
            subtitle={
              stats.lowStock > 0
                ? 'Needs reorder'
                : 'All stock levels good'
            }
          />
          <InfoCard
            label="Out of Stock"
            value={formatNumber(stats.outOfStock)}
            icon={
              <HiOutlineExclamationTriangle size={20} />
            }
            variant="danger"
            subtitle={
              stats.outOfStock > 0
                ? 'Urgent attention'
                : 'No stock-outs'
            }
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <InfoCard
            label="Near Expiry"
            value={formatNumber(stats.nearExpiry)}
            icon={
              <HiOutlineClock size={20} />
            }
            variant="warning"
            subtitle="Within 90 days"
          />
          <InfoCard
            label="Inventory Value"
            value={formatCurrency(stats.inventoryValue)}
            icon={
              <HiOutlineCurrencyRupee size={20} />
            }
            variant="success"
            subtitle="Current purchase value"
          />
          <InfoCard
              label="Today's Sales"
              value={formatCurrency(stats.todaySales)}
              icon={
                <HiOutlineShoppingCart size={20} />
              }
              variant="default"
              subtitle="Total sales today"
            />
        </div>
      </section>
      {/* ======================================================
          QUICK ACTIONS
          ====================================================== */}
      <section aria-labelledby="quick-actions-heading">
        <h2
          id="quick-actions-heading"
          className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"
        >
          <HiOutlineChartBarSquare
            size={16}
            className="text-primary-600"
          />
          Quick Actions
        </h2>
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          role="list"
        >
          {quickActions.map(action => {
            const Icon = action.icon
            const card = (
              <div
                className={[
                  'flex flex-col gap-3 p-5 rounded-2xl bg-white border-2 h-full',
                  'shadow-sm hover:shadow-md hover:-translate-y-1',
                  'transition-all duration-200',
                  action.border,
                ].join(' ')}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl ${action.color}`}
                >
                  <Icon
                    size={22}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {action.emoji} {action.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    {action.desc}
                  </p>
                </div>
                {!action.to && (
                  <Badge
                    variant="neutral"
                    size="sm"
                    className="w-fit"
                  >
                    Coming Soon
                  </Badge>
                )}
              </div>
            )
            return (
              <div
                key={action.id}
                role="listitem"
              >
                {action.to ? (
                  <Link
                    to={action.to}
                    className="block h-full rounded-2xl"
                  >
                    {card}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="block w-full h-full text-left cursor-not-allowed opacity-70"
                  >
                    {card}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>
      {/* ======================================================
          INVENTORY HEALTH + ALERTS
          ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ====================================================
            INVENTORY HEALTH
            ==================================================== */}
        <section aria-labelledby="health-heading">
          <h2
            id="health-heading"
            className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"
          >
            <MdLocalPharmacy
              size={16}
              className="text-secondary-600"
            />
            Inventory Health
          </h2>
          {/* Health score */}
          <div
            className={[
              'rounded-2xl border p-5 mb-4',
              healthStatus.bg,
              healthStatus.border,
            ].join(' ')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-bold ${healthStatus.text}`}
                >
                  Overall Inventory Health
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-3 h-3 rounded-full ${healthStatus.dot}`}
                  />
                  <span
                    className={`text-xs font-semibold ${healthStatus.text}`}
                  >
                    {healthStatus.label}
                  </span>
                </div>
              </div>
              <div
                className={`text-4xl font-extrabold ${healthStatus.text}`}
              >
                {Number(stats.inventoryHealth).toFixed(1)}%
              </div>
            </div>
            <div className="mt-4 h-3 bg-white/70 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  Number(stats.inventoryHealth) >= 80
                    ? 'bg-success-500'
                    : Number(stats.inventoryHealth) >= 60
                      ? 'bg-warning-500'
                      : 'bg-danger-500'
                }`}
                style={{
                  width: `${Math.min(
                    Math.max(
                      Number(stats.inventoryHealth),
                      0
                    ),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
          {/* Health metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-success-200 bg-success-50">
              <p className="text-xs font-semibold text-success-700">
                Healthy Stock
              </p>
              <p className="text-2xl font-extrabold text-success-700 mt-1">
                {formatNumber(
                  estimatedHealthyBatches
                )}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Estimated healthy batches
              </p>
            </div>
            <div className="p-4 rounded-xl border border-warning-200 bg-warning-50">
              <p className="text-xs font-semibold text-warning-700">
                Needs Attention
              </p>
              <p className="text-2xl font-extrabold text-warning-700 mt-1">
                {formatNumber(
                  attentionCount
                )}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Includes stock and expiry alerts
              </p>
            </div>
            <div className="p-4 rounded-xl border border-danger-200 bg-danger-50">
              <p className="text-xs font-semibold text-danger-700">
                Out of Stock
              </p>
              <p className="text-2xl font-extrabold text-danger-700 mt-1">
                {formatNumber(stats.outOfStock)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Need replenishment
              </p>
            </div>
          </div>
          {/* ==================================================
              ATTENTION REQUIRED
              ================================================== */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Attention Required
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stock and expiry alerts
                </p>
              </div>
              <Link
                to={ROUTES.PHARMACY.INVENTORY}
                className="text-xs font-medium text-primary-600 hover:underline"
              >
                View All →
              </Link>
            </div>
            {lowStockItems.length === 0 &&
            nearExpiryItems.length === 0 &&
            outOfStockItems.length === 0 ? (
              <div className="py-8 text-center">
                <HiOutlineCheckCircle
                  size={32}
                  className="mx-auto text-success-500"
                />
                <p className="text-sm font-semibold text-slate-700 mt-2">
                  Inventory looks good
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  No immediate stock alerts
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  ...outOfStockItems.map(item => ({
                    ...item,
                    alertType: 'Out of Stock',
                    alertClass:
                      'text-danger-700',
                  })),
                  ...lowStockItems.map(item => ({
                    ...item,
                    alertType: 'Low Stock',
                    alertClass:
                      'text-warning-700',
                  })),
                  ...nearExpiryItems.map(item => ({
                    ...item,
                    alertType: 'Near Expiry',
                    alertClass:
                      'text-orange-700',
                  })),
                ]
                  .slice(0, 6)
                  .map((item, index) => (
                    <div
                      key={`${item.batch_id}-${item.alertType}-${index}`}
                      className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 shrink-0">
                        <MdMedication
                          size={16}
                          className={item.alertClass}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.jan_aushadhi_name ||
                           item.generic_name ||
                           'Unknown Medicine'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Batch: {item.batch_number || '—'}
                        </p>
                        {item.alertType === 'Near Expiry' &&
                        item.expiry_date && (
                          <p className="text-[10px] text-slate-400">
                            Expires: {formatDate(item.expiry_date)}
                            {typeof item.days_remaining === 'number'
                              ? ` • ${item.days_remaining} days`
                              : ''}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`text-sm font-extrabold ${item.alertClass}`}
                        >
                          {formatNumber(
                            item.available_quantity
                          )}{' '}
                          units
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.alertType}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
        {/* ====================================================
            RECENT ACTIVITY
            ==================================================== */}
        <section aria-labelledby="activity-heading">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="activity-heading"
                className="text-base font-bold text-slate-900 flex items-center gap-2"
              >
                <HiOutlineCheckCircle
                  size={16}
                  className="text-success-600"
                />
                Recent Activity
              </h2>
              <button
                type="button"
                onClick={loadDashboard}
                className="text-slate-400 hover:text-primary-600"
                title="Refresh activity"
              >
                <HiOutlineArrowPath size={16} />
              </button>
            </div>
            {recentActivities.length === 0 ? (
              <div className="py-10 text-center">
                <HiOutlineClock
                  size={30}
                  className="mx-auto text-slate-300"
                />
                <p className="text-sm font-semibold text-slate-600 mt-2">
                  No recent activity
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Inventory activity will appear here
                </p>
              </div>
            ) : (
              <ol
                aria-label="Recent inventory activity"
                className="relative"
              >
                {recentActivities.map(
                  (activity, index) => {
                    const style =
                      getActivityStyle(
                        activity.activity_type
                      )
                    const Icon = style.icon
                    return (
                      <li
                        key={`${activity.activity_time}-${activity.activity_type}-${index}`}
                        className="flex gap-3 pb-4 last:pb-0"
                      >
                        <div className="flex flex-col items-center shrink-0 w-9">
                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-full ${style.iconBg}`}
                          >
                            <Icon
                              size={15}
                              className={style.iconColor}
                            />
                          </div>
                          {index <
                            recentActivities.length - 1 && (
                            <div
                              className="w-0.5 flex-1 mt-1 bg-slate-100"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-semibold text-slate-800">
                              {activity.activity_type ||
                                'Inventory Activity'}
                            </p>
                            <Badge
                              variant={
                                style.status
                              }
                              size="sm"
                            >
                              Live
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {activity.description ||
                              'Inventory updated'}
                          </p>
                          {activity.batch_number && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Batch: {activity.batch_number}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatActivityTime(
                              activity.activity_time
                            )}
                          </p>
                        </div>
                      </li>
                    )
                  }
                )}
              </ol>
            )}
          </div>
        </section>
      </div>
      {/* ======================================================
          INVENTORY SUMMARY
          ====================================================== */}
      <section>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Inventory Summary
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current pharmacy stock overview
              </p>
            </div>
            <Link
              to={ROUTES.PHARMACY.INVENTORY}
              className="text-xs font-semibold text-primary-600 hover:underline"
            >
              Manage Inventory →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Active Batches
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatNumber(stats.totalBatches)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Stock Units
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatNumber(stats.totalStockUnits)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Inventory Value
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatCurrency(stats.inventoryValue)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Avg. Stock / Batch
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatNumber(stats.averageStock)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
export default InventoryDashboard