import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineClock,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlinePrinter,
  HiOutlineArrowDownTray,
  HiOutlineXMark,
  HiOutlineReceiptRefund,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
} from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'
import axiosClient from '../../config/axiosClient'

const PAGE_SIZE = 10

const STATUS_CONFIG = {
  PAID: { variant: 'success', label: 'Paid' },
  paid: { variant: 'success', label: 'Paid' },
  PENDING: { variant: 'warning', label: 'Pending' },
  pending: { variant: 'warning', label: 'Pending' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
}

const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      variant: 'neutral',
      label: status || 'Unknown',
    }
  )
}

function formatDateTime(value) {
  if (!value) {
    return { date: '—', time: '—' }
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return { date: '—', time: '—' }
  }

  return {
    date: date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

function normalizeHistoryBill(bill) {
  const { date, time } = formatDateTime(bill.created_at)

  return {
    id: bill.bill_number,
    billNo: bill.bill_number,
    date,
    time,
    createdAt: bill.created_at,
    customer: bill.customer_name || '',
    customerPhone: bill.customer_phone || '',
    medicineCount: Number(bill.medicine_count || 0),
    total: Number(bill.total_amount || 0),
    paymentMethod: bill.payment_method || '',
    status: bill.payment_status || 'PAID',
    createdBy: bill.created_by || '',
  }
}

function formatCurrency(value) {
  return `₹ ${Number(value || 0).toFixed(2)}`
}

// -----------------------------------------------------------------------------
// Bill Detail Dialog
// -----------------------------------------------------------------------------

function BillDetailDialog({ bill, loading, error, onClose }) {
  const statusConfig = getStatusConfig(bill?.payment_status)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bill-detail-title"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2
            id="bill-detail-title"
            className="text-base font-bold text-slate-900 flex items-center gap-2"
          >
            <HiOutlineReceiptRefund
              size={16}
              className="text-primary-600"
              aria-hidden="true"
            />
            Bill Details
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <HiOutlineXMark size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading && (
            <div className="py-14 text-center">
              <HiOutlineArrowPath
                size={24}
                className="mx-auto animate-spin text-primary-600"
              />
              <p className="text-sm font-semibold text-slate-600 mt-3">
                Loading bill details...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 rounded-xl bg-danger-50 border border-danger-100">
              <p className="text-xs font-semibold text-danger-700">
                Unable to load bill details
              </p>
              <p className="text-xs text-danger-600 mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && bill && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Bill Number</p>
                  <p className="text-slate-900 font-semibold mt-0.5 break-all">
                    {bill.bill_number}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Date</p>
                  <p className="text-slate-900 font-semibold mt-0.5">
                    {formatDateTime(bill.created_at).date}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Time</p>
                  <p className="text-slate-900 font-semibold mt-0.5">
                    {formatDateTime(bill.created_at).time}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Customer</p>
                  <p className="text-slate-900 font-semibold mt-0.5">
                    {bill.customer_name || 'Guest'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Phone</p>
                  <p className="text-slate-900 font-semibold mt-0.5">
                    {bill.customer_phone || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Payment Method</p>
                  <p className="text-slate-900 font-semibold mt-0.5">
                    {bill.payment_method || '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Payment Status:
                </span>
                <Badge
                  variant={statusConfig.variant}
                  size="sm"
                  dot
                >
                  {statusConfig.label}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">
                  Medicines ({bill.items?.length || 0})
                </p>

                <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left px-3 py-2 text-slate-500 font-semibold">
                            Medicine
                          </th>
                          <th className="text-left px-3 py-2 text-slate-500 font-semibold">
                            Batch
                          </th>
                          <th className="text-right px-3 py-2 text-slate-500 font-semibold">
                            Qty
                          </th>
                          <th className="text-right px-3 py-2 text-slate-500 font-semibold">
                            Price
                          </th>
                          <th className="text-right px-3 py-2 text-slate-500 font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {(bill.items || []).map((item, index) => (
                          <tr
                            key={`${item.batch_id || item.medicine_id}-${index}`}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="px-3 py-2">
                              <p className="font-semibold text-slate-800">
                                {item.medicine_name || 'Unknown Medicine'}
                              </p>
                            </td>

                            <td className="px-3 py-2">
                              <p className="font-medium text-slate-700">
                                {item.batch_number || '—'}
                              </p>
                            </td>

                            <td className="px-3 py-2 text-right text-slate-700">
                              {item.quantity}
                            </td>

                            <td className="px-3 py-2 text-right text-slate-700">
                              {formatCurrency(item.unit_price)}
                            </td>

                            <td className="px-3 py-2 text-right font-bold text-slate-900">
                              {formatCurrency(item.total_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(bill.subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Discount</span>
                  <span>- {formatCurrency(bill.discount)}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>GST ({Number(bill.gst_percentage || 0)}%)</span>
                  <span>{formatCurrency(bill.tax)}</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Grand Total</span>
                  <span className="text-primary-700">
                    {formatCurrency(bill.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Print API is not implemented yet"
            className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl border border-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed"
          >
            <HiOutlinePrinter size={13} />
            Print
          </button>

          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Download API is not implemented yet"
            className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl border border-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed"
          >
            <HiOutlineArrowDownTray size={13} />
            Download
          </button>

          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="flex-1 text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Mobile Bill Card
// -----------------------------------------------------------------------------

function MobileBillCard({ bill, onView }) {
  const statusConfig = getStatusConfig(bill.status)

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">
            {bill.billNo}
          </p>

          <p className="text-xs text-slate-400">
            {bill.date} · {bill.time}
          </p>
        </div>

        <Badge variant={statusConfig.variant} size="sm" dot>
          {statusConfig.label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-slate-400">Customer</p>
          <p className="font-semibold text-slate-700 truncate">
            {bill.customer || 'Guest'}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Medicines</p>
          <p className="font-semibold text-slate-700">
            {bill.medicineCount}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Total</p>
          <p className="font-extrabold text-primary-700">
            {formatCurrency(bill.total)}
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => onView(bill)}
          aria-label={`View ${bill.billNo}`}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-primary-200 bg-primary-50 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
        >
          <HiOutlineEye size={13} />
          View
        </button>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-400 cursor-not-allowed"
        >
          <HiOutlinePrinter size={13} />
          Print
        </button>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-400 cursor-not-allowed"
        >
          <HiOutlineArrowDownTray size={13} />
          Download
        </button>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Main Page
// -----------------------------------------------------------------------------

function BillHistoryPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const [bills, setBills] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [viewBill, setViewBill] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const loadBillHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await axiosClient.get('/billing/history', {
        params: {
          page,
          page_size: PAGE_SIZE,
          ...(search.trim()
            ? { search: search.trim() }
            : {}),
          ...(statusFilter
            ? { status: statusFilter }
            : {}),
        },
      })

      const data = response.data || {}

      const historyBills = Array.isArray(data.bills)
        ? data.bills.map(normalizeHistoryBill)
        : []

      setBills(historyBills)
      setTotal(Number(data.total || 0))
      setTotalPages(Number(data.total_pages || 0))
    } catch (err) {
      console.error('Failed to load bill history:', err)

      setBills([])
      setTotal(0)
      setTotalPages(0)

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Unable to load bill history.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    loadBillHistory()
  }, [loadBillHistory])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setPage(1)
  }

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value)
    setPage(1)
  }

  const openBillDetails = async (bill) => {
    setViewBill(null)
    setDetailError('')
    setIsDetailLoading(true)

    try {
      const response = await axiosClient.get(
        `/billing/${encodeURIComponent(bill.billNo)}`
      )

      setViewBill(response.data)
    } catch (err) {
      console.error('Failed to load bill details:', err)

      setDetailError(
        err?.response?.data?.detail ||
          err?.message ||
          'Unable to load bill details.'
      )

      setViewBill({
        bill_number: bill.billNo,
      })
    } finally {
      setIsDetailLoading(false)
    }
  }

  const closeBillDetails = () => {
    setViewBill(null)
    setDetailError('')
    setIsDetailLoading(false)
  }

  const summary = {
    total,
    paid: bills.filter(
      (bill) =>
        String(bill.status).toUpperCase() === 'PAID'
    ).length,
    pending: bills.filter(
      (bill) =>
        String(bill.status).toUpperCase() === 'PENDING'
    ).length,
    cancelled: bills.filter(
      (bill) =>
        String(bill.status).toUpperCase() === 'CANCELLED'
    ).length,
  }

  const hasPreviousPage = page > 1
  const hasNextPage =
    totalPages > 0 && page < totalPages

  return (
    <article
      aria-label="Bill History"
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <HiOutlineClock
              size={22}
              className="text-primary-600"
              aria-hidden="true"
            />
            Bill History
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            View previously generated customer bills.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBillHistory}
          disabled={isLoading}
          title="Refresh bill history"
          className="flex items-center justify-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineArrowPath
            size={15}
            className={isLoading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Bills',
            value: summary.total,
            icon: HiOutlineReceiptRefund,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
          },
          {
            label: 'Paid',
            value: summary.paid,
            icon: HiOutlineCheckCircle,
            color: 'text-success-600',
            bg: 'bg-success-50',
          },
          {
            label: 'Pending',
            value: summary.pending,
            icon: HiOutlineClock,
            color: 'text-warning-600',
            bg: 'bg-warning-50',
          },
          {
            label: 'Cancelled',
            value: summary.cancelled,
            icon: HiOutlineExclamationTriangle,
            color: 'text-danger-600',
            bg: 'bg-danger-50',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm"
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-xl ${item.bg} shrink-0`}
            >
              <item.icon
                size={18}
                className={item.color}
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-xl font-extrabold text-slate-900">
                {item.value}
              </p>

              <p className="text-xs text-slate-500 leading-tight">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />

          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search bill number, customer name or phone..."
            aria-label="Search bills"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={handleStatusChange}
          aria-label="Filter by payment status"
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:border-primary-500 outline-none transition"
        >
          {STATUS_FILTERS.map((filter) => (
            <option
              key={filter.value}
              value={filter.value}
            >
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-danger-50 border border-danger-100">
          <p className="text-xs font-semibold text-danger-700">
            Billing History Error
          </p>

          <p className="text-xs text-danger-600 mt-1">
            {error}
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <HiOutlineArrowPath
            size={28}
            className="animate-spin text-primary-600"
          />

          <p className="text-sm font-semibold text-slate-600 mt-3">
            Loading bill history...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Fetching bills from the pharmacy account.
          </p>
        </div>
      ) : bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100">
            <HiOutlineReceiptRefund
              size={26}
              className="text-slate-300"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600">
              {error
                ? 'Unable to display bills'
                : 'No bills available'}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              {error
                ? 'Try refreshing the page or check the backend.'
                : search || statusFilter
                  ? 'No bills match your current filters.'
                  : 'Generated bills will appear here.'}
            </p>
          </div>

          {!search && !statusFilter && (
            <Link
              to={ROUTES.PHARMACY.BILLING}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Go to Billing
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop / Tablet */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="table-base"
                role="grid"
                aria-label="Bill history"
              >
                <thead>
                  <tr>
                    <th scope="col">Bill Number</th>
                    <th scope="col">Date</th>
                    <th
                      scope="col"
                      className="hidden md:table-cell"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="hidden lg:table-cell"
                    >
                      Customer
                    </th>
                    <th scope="col">Medicines</th>
                    <th scope="col">Total</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {bills.map((bill) => {
                    const statusConfig =
                      getStatusConfig(bill.status)

                    return (
                      <tr key={bill.id}>
                        <td className="font-mono text-xs font-semibold text-slate-800">
                          {bill.billNo}
                        </td>

                        <td className="text-xs text-slate-600">
                          {bill.date}
                        </td>

                        <td className="hidden md:table-cell text-xs text-slate-500">
                          {bill.time}
                        </td>

                        <td className="hidden lg:table-cell text-xs text-slate-600">
                          {bill.customer || (
                            <span className="text-slate-300 italic">
                              Guest
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="flex items-center gap-1.5">
                            <MdMedication
                              size={13}
                              className="text-secondary-500"
                              aria-hidden="true"
                            />

                            <span className="text-xs font-semibold text-slate-700">
                              {bill.medicineCount}
                            </span>
                          </div>
                        </td>

                        <td className="text-xs font-extrabold text-primary-700">
                          {formatCurrency(bill.total)}
                        </td>

                        <td>
                          <Badge
                            variant={statusConfig.variant}
                            size="sm"
                            dot
                          >
                            {statusConfig.label}
                          </Badge>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              openBillDetails(bill)
                            }
                            title="View bill"
                            aria-label={`View ${bill.billNo}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            <HiOutlineEye
                              size={14}
                              aria-hidden="true"
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Server-side pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-500">
                Showing{' '}
                {total === 0
                  ? 0
                  : (page - 1) * PAGE_SIZE + 1}
                {'–'}
                {Math.min(
                  page * PAGE_SIZE,
                  total
                )}{' '}
                of {total}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  disabled={!hasPreviousPage || isLoading}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>

                {Array.from({
                  length: Math.max(
                    totalPages,
                    1
                  ),
                }).map((_, index) => {
                  const pageNumber = index + 1

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() =>
                        setPage(pageNumber)
                      }
                      aria-label={`Page ${pageNumber}`}
                      aria-current={
                        page === pageNumber
                          ? 'page'
                          : undefined
                      }
                      className={`w-8 h-7 rounded-lg text-xs font-medium transition-colors ${
                        page === pageNumber
                          ? 'bg-primary-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        Math.max(totalPages, 1),
                        current + 1
                      )
                    )
                  }
                  disabled={!hasNextPage || isLoading}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="sm:hidden flex flex-col gap-3">
            {bills.map((bill) => (
              <MobileBillCard
                key={bill.id}
                bill={bill}
                onView={openBillDetails}
              />
            ))}

            <div className="flex justify-center gap-2 py-2">
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={!hasPreviousPage || isLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                ← Prev
              </button>

              <span className="flex items-center text-xs text-slate-500">
                {page} / {Math.max(totalPages, 1)}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      Math.max(totalPages, 1),
                      current + 1
                    )
                  )
                }
                disabled={!hasNextPage || isLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bill detail dialog */}
      {(viewBill || isDetailLoading) && (
        <BillDetailDialog
          bill={viewBill}
          loading={isDetailLoading}
          error={detailError}
          onClose={closeBillDetails}
        />
      )}
    </article>
  )
}
export default BillHistoryPage
