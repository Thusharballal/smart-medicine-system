/**
 * Component: BillHistoryPage — Phase 5 Bill History Module
 *
 * Route: /pharmacy/bill-history  (ProtectedRoute → PharmacyLayout)
 *
 * Purpose:
 *   Allows pharmacy staff to view previously generated bills with
 *   search, date filters, payment status filters, view dialog,
 *   and export placeholders.
 *
 * ⚠ FRONTEND PLACEHOLDER ONLY — No backend, no API, no database.
 * Future backend integration points:
 *   TODO: GET  /api/v1/pharmacy/billing/history  → Bill History API (paginated)
 *   TODO: GET  /api/v1/pharmacy/billing/:id      → Single bill details
 *   TODO: GET  /api/v1/pharmacy/billing/:id/pdf  → Invoice Download API
 *   TODO: POST /api/v1/pharmacy/billing/:id/print → Print API
 *   TODO: PATCH /api/v1/pharmacy/billing/:id/status → Payment Integration
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineClock, HiOutlineMagnifyingGlass,
  HiOutlineEye, HiOutlinePrinter, HiOutlineArrowDownTray,
  HiOutlineXMark, HiOutlineReceiptRefund,
  HiOutlineCheckCircle, HiOutlineExclamationTriangle,
  HiOutlineCalendarDays,
} from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'
import Badge  from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'

// ── Placeholder bill history data ─────────────────────────────────────────
// TODO: Replace with GET /api/v1/pharmacy/billing/history (Bill History API)
const SAMPLE_BILLS = [
  {
    id: 'b1',  billNo: 'BILL-2026-10032', date: '02 Jul 2026', time: '11:24 AM',
    customer: 'Priya Sharma',    medicines: [
      { name: 'Paracetamol IP 500mg', genericName: 'Acetaminophen', qty: 2, price: 18  },
      { name: 'Cetirizine 10mg',      genericName: 'Cetirizine HCl', qty: 1, price: 8  },
    ],
    total: 44,   status: 'paid',      medicineCount: 2,
  },
  {
    id: 'b2',  billNo: 'BILL-2026-10031', date: '02 Jul 2026', time: '09:10 AM',
    customer: 'Dr. Arjun Mehta', medicines: [
      { name: 'Azithromycin 500mg',   genericName: 'Azithromycin',   qty: 1, price: 45 },
      { name: 'Pantoprazole 40mg',    genericName: 'Pantoprazole',   qty: 2, price: 22 },
    ],
    total: 93.45,status: 'paid',      medicineCount: 2,
  },
  {
    id: 'b3',  billNo: 'BILL-2026-10030', date: '01 Jul 2026', time: '04:52 PM',
    customer: 'Rahul Verma',     medicines: [
      { name: 'Metformin 500mg',      genericName: 'Metformin HCl',  qty: 3, price: 12 },
    ],
    total: 37.8, status: 'pending',   medicineCount: 1,
  },
  {
    id: 'b4',  billNo: 'BILL-2026-10029', date: '01 Jul 2026', time: '02:30 PM',
    customer: '',                medicines: [
      { name: 'Ibuprofen 400mg',      genericName: 'Ibuprofen',      qty: 1, price: 14 },
      { name: 'Vitamin D3 60000 IU',  genericName: 'Cholecalciferol',qty: 1, price: 35 },
    ],
    total: 51.45,status: 'paid',      medicineCount: 2,
  },
  {
    id: 'b5',  billNo: 'BILL-2026-10028', date: '30 Jun 2026', time: '10:05 AM',
    customer: 'Sneha Patil',     medicines: [
      { name: 'Paracetamol Syrup',    genericName: 'Acetaminophen',  qty: 2, price: 28 },
    ],
    total: 58.8, status: 'cancelled', medicineCount: 1,
  },
  {
    id: 'b6',  billNo: 'BILL-2026-10027', date: '30 Jun 2026', time: '08:45 AM',
    customer: 'Kiran Joshi',     medicines: [
      { name: 'Cetirizine 10mg',      genericName: 'Cetirizine HCl', qty: 2, price: 8  },
      { name: 'Metformin 500mg',      genericName: 'Metformin HCl',  qty: 2, price: 12 },
      { name: 'Ibuprofen 400mg',      genericName: 'Ibuprofen',      qty: 1, price: 14 },
    ],
    total: 56.7, status: 'paid',      medicineCount: 3,
  },
  {
    id: 'b7',  billNo: 'BILL-2026-10026', date: '29 Jun 2026', time: '03:12 PM',
    customer: '',                medicines: [
      { name: 'ORS Sachet',           genericName: 'ORS',            qty: 5, price: 5  },
    ],
    total: 26.25,status: 'paid',      medicineCount: 1,
  },
  {
    id: 'b8',  billNo: 'BILL-2026-10025', date: '29 Jun 2026', time: '11:55 AM',
    customer: 'Mohan Singh',     medicines: [
      { name: 'Azithromycin 500mg',   genericName: 'Azithromycin',   qty: 1, price: 45 },
    ],
    total: 47.25,status: 'pending',   medicineCount: 1,
  },
  {
    id: 'b9',  billNo: 'BILL-2026-10024', date: '28 Jun 2026', time: '05:30 PM',
    customer: 'Anita Desai',     medicines: [
      { name: 'Paracetamol IP 500mg', genericName: 'Acetaminophen',  qty: 4, price: 18 },
      { name: 'Pantoprazole 40mg',    genericName: 'Pantoprazole',   qty: 1, price: 22 },
    ],
    total: 97.65,status: 'paid',      medicineCount: 2,
  },
  {
    id: 'b10', billNo: 'BILL-2026-10023', date: '28 Jun 2026', time: '09:40 AM',
    customer: 'Ravi Kumar',      medicines: [
      { name: 'Vitamin D3 60000 IU',  genericName: 'Cholecalciferol',qty: 2, price: 35 },
    ],
    total: 73.5, status: 'cancelled', medicineCount: 1,
  },
  {
    id: 'b11', billNo: 'BILL-2026-10022', date: '27 Jun 2026', time: '02:15 PM',
    customer: 'Sunita Devi',     medicines: [
      { name: 'Cetirizine 10mg',      genericName: 'Cetirizine HCl', qty: 3, price: 8  },
    ],
    total: 25.2, status: 'paid',      medicineCount: 1,
  },
  {
    id: 'b12', billNo: 'BILL-2026-10021', date: '27 Jun 2026', time: '11:00 AM',
    customer: '',                medicines: [
      { name: 'Metformin 500mg',      genericName: 'Metformin HCl',  qty: 2, price: 12 },
      { name: 'Ibuprofen 400mg',      genericName: 'Ibuprofen',      qty: 1, price: 14 },
    ],
    total: 39.9, status: 'paid',      medicineCount: 2,
  },
]

const PAGE_SIZE = 10

const STATUS_CONFIG = {
  paid:      { variant: 'success', label: 'Paid'      },
  pending:   { variant: 'warning', label: 'Pending'   },
  cancelled: { variant: 'danger',  label: 'Cancelled' },
}

const DATE_FILTERS = [
  { value: '',      label: 'All Dates'    },
  { value: 'today', label: 'Today'        },
  { value: 'week',  label: 'This Week'   },
  { value: 'month', label: 'This Month'  },
]

const STATUS_FILTERS = [
  { value: '',          label: 'All Status' },
  { value: 'paid',      label: 'Paid'       },
  { value: 'pending',   label: 'Pending'    },
  { value: 'cancelled', label: 'Cancelled'  },
]

// ── Bill Detail Dialog ────────────────────────────────────────────────────
function BillDetailDialog({ bill, onClose }) {
  const sc  = STATUS_CONFIG[bill.status]
  const gst = bill.total * 5 / 105
  const sub = bill.total - gst

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="bill-detail-title"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 id="bill-detail-title" className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HiOutlineReceiptRefund size={16} className="text-primary-600" aria-hidden="true" />
            Bill Details
          </h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            <HiOutlineXMark size={17} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ['Bill Number', bill.billNo],
              ['Date',        bill.date],
              ['Time',        bill.time],
              ['Customer',    bill.customer || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-slate-400 font-medium">{k}</p>
                <p className="text-slate-900 font-semibold mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Payment Status:</span>
            <Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge>
          </div>

          {/* Medicine list */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">Medicines ({bill.medicines.length})</p>
            <div className="bg-slate-50 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold">Medicine</th>
                    <th className="text-right px-3 py-2 text-slate-500 font-semibold">Qty</th>
                    <th className="text-right px-3 py-2 text-slate-500 font-semibold">Price</th>
                    <th className="text-right px-3 py-2 text-slate-500 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.medicines.map((m, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-800 truncate max-w-[140px]">{m.name}</p>
                        <p className="text-slate-400 text-[10px] truncate">{m.genericName}</p>
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">{m.qty}</td>
                      <td className="px-3 py-2 text-right text-slate-700">₹{m.price}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">₹{(m.qty * m.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>₹ {sub.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST (5% — Placeholder)</span><span>₹ {gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
              <span>Grand Total</span><span className="text-primary-700">₹ {bill.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 shrink-0">
          {/* TODO: POST /api/v1/pharmacy/billing/:id/print — Print API */}
          <button type="button" disabled aria-disabled="true" title="Print available after backend integration"
            className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl border border-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed">
            <HiOutlinePrinter size={13} /> Print
          </button>
          {/* TODO: GET /api/v1/pharmacy/billing/:id/pdf — Invoice Download API */}
          <button type="button" disabled aria-disabled="true" title="Download available after backend integration"
            className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl border border-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed">
            <HiOutlineArrowDownTray size={13} /> Download
          </button>
          <Button type="button" variant="primary" onClick={onClose} className="flex-1 text-xs">Close</Button>
        </div>
      </div>
    </div>
  )
}

// ── Mobile bill card ──────────────────────────────────────────────────────
function MobileBillCard({ bill, onView }) {
  const sc = STATUS_CONFIG[bill.status]
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-900">{bill.billNo}</p>
          <p className="text-xs text-slate-400">{bill.date} · {bill.time}</p>
        </div>
        <Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div><p className="text-slate-400">Customer</p><p className="font-semibold text-slate-700 truncate">{bill.customer || '—'}</p></div>
        <div><p className="text-slate-400">Medicines</p><p className="font-semibold text-slate-700">{bill.medicineCount}</p></div>
        <div><p className="text-slate-400">Total</p><p className="font-extrabold text-primary-700">₹{bill.total}</p></div>
      </div>
      <div className="flex gap-1.5 pt-1">
        <button type="button" onClick={() => onView(bill)} aria-label={`View ${bill.billNo}`}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-primary-200 bg-primary-50 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors">
          <HiOutlineEye size={13} /> View
        </button>
        <button type="button" disabled aria-disabled="true"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-400 cursor-not-allowed">
          <HiOutlinePrinter size={13} /> Print
        </button>
        <button type="button" disabled aria-disabled="true"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-400 cursor-not-allowed">
          <HiOutlineArrowDownTray size={13} /> Download
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
function BillHistoryPage() {
  const [search,      setSearch]      = useState('')
  const [dateFilter,  setDateFilter]  = useState('')
  const [statusFilter,setStatusFilter]= useState('')
  const [page,        setPage]        = useState(1)
  const [viewBill,    setViewBill]    = useState(null)

  // TODO: GET /api/v1/pharmacy/billing/history?page=&status=&dateRange= (Bill History API)
  const filtered = useMemo(() => {
    let data = [...SAMPLE_BILLS]
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(b =>
        b.billNo.toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.medicines.some(m => m.name.toLowerCase().includes(q))
      )
    }
    if (statusFilter) data = data.filter(b => b.status === statusFilter)
    // Date filter is a UI-only placeholder — the mock data has no real dates to compare
    return data
  }, [search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged      = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  const summaryStats = {
    total:     SAMPLE_BILLS.length,
    paid:      SAMPLE_BILLS.filter(b => b.status === 'paid').length,
    pending:   SAMPLE_BILLS.filter(b => b.status === 'pending').length,
    cancelled: SAMPLE_BILLS.filter(b => b.status === 'cancelled').length,
  }

  return (
    <article aria-label="Bill History" className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <HiOutlineClock size={22} className="text-primary-600" aria-hidden="true" />
          Bill History
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">View previously generated customer bills.</p>
      </div>

      {/* Summary mini-cards */}
      {/* TODO: GET /api/v1/pharmacy/billing/history/stats (Bill History API) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total Bills',  value: summaryStats.total,     icon: HiOutlineReceiptRefund,      color:'text-primary-600', bg:'bg-primary-50'  },
          { label:'Paid',         value: summaryStats.paid,      icon: HiOutlineCheckCircle,         color:'text-success-600', bg:'bg-success-50'  },
          { label:'Pending',      value: summaryStats.pending,   icon: HiOutlineClock,               color:'text-warning-600', bg:'bg-warning-50'  },
          { label:'Cancelled',    value: summaryStats.cancelled, icon: HiOutlineExclamationTriangle, color:'text-danger-600',  bg:'bg-danger-50'   },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${s.bg} shrink-0`}>
              <s.icon size={18} className={s.color} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search bill number, customer name or medicine…"
            aria-label="Search bills"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 placeholder:opacity-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
          />
        </div>
        <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1) }}
          aria-label="Filter by date"
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:border-primary-500 outline-none transition">
          {DATE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          aria-label="Filter by payment status"
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:border-primary-500 outline-none transition">
          {STATUS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100">
            <HiOutlineReceiptRefund size={26} className="text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">No bills available</p>
            <p className="text-xs text-slate-400 mt-1">Generated bills will appear here.</p>
          </div>
          <Link to={ROUTES.PHARMACY.BILLING}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            Go to Billing
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop / Tablet table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base" role="grid" aria-label="Bill history">
                <thead>
                  <tr>
                    <th scope="col">Bill Number</th>
                    <th scope="col">Date</th>
                    <th scope="col" className="hidden md:table-cell">Time</th>
                    <th scope="col" className="hidden lg:table-cell">Customer</th>
                    <th scope="col">Medicines</th>
                    <th scope="col">Total</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(bill => {
                    const sc = STATUS_CONFIG[bill.status]
                    return (
                      <tr key={bill.id}>
                        <td className="font-mono text-xs font-semibold text-slate-800">{bill.billNo}</td>
                        <td className="text-xs text-slate-600">{bill.date}</td>
                        <td className="hidden md:table-cell text-xs text-slate-500">{bill.time}</td>
                        <td className="hidden lg:table-cell text-xs text-slate-600">{bill.customer || <span className="text-slate-300 italic">Guest</span>}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <MdMedication size={13} className="text-secondary-500" aria-hidden="true" />
                            <span className="text-xs font-semibold text-slate-700">{bill.medicineCount}</span>
                          </div>
                        </td>
                        <td className="text-xs font-extrabold text-primary-700">₹ {bill.total.toFixed(2)}</td>
                        <td><Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge></td>
                        <td>
                          <div className="flex items-center gap-0.5">
                            <button type="button" onClick={() => setViewBill(bill)} title="View bill" aria-label={`View ${bill.billNo}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500">
                              <HiOutlineEye size={14} aria-hidden="true" />
                            </button>
                            {/* TODO: POST /api/v1/pharmacy/billing/:id/print — Print API */}
                            <button type="button" disabled aria-disabled="true" title="Print — backend pending"
                              className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed">
                              <HiOutlinePrinter size={14} aria-hidden="true" />
                            </button>
                            {/* TODO: GET /api/v1/pharmacy/billing/:id/pdf — Invoice Download API */}
                            <button type="button" disabled aria-disabled="true" title="Download — backend pending"
                              className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed">
                              <HiOutlineArrowDownTray size={14} aria-hidden="true" />
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
                Showing {filtered.length === 0 ? 0 : (page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Prev</button>
                {Array.from({ length: totalPages }).map((_,i) => (
                  <button key={i} type="button" onClick={() => setPage(i+1)} aria-label={`Page ${i+1}`}
                    aria-current={page===i+1 ? 'page' : undefined}
                    className={`w-8 h-7 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${page===i+1 ? 'bg-primary-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    {i+1}
                  </button>
                ))}
                <button type="button" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next →</button>
              </div>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {paged.map(bill => <MobileBillCard key={bill.id} bill={bill} onView={setViewBill} />)}
            <div className="flex justify-center gap-2 py-2">
              <button type="button" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40">← Prev</button>
              <span className="flex items-center text-xs text-slate-500">{page} / {totalPages}</span>
              <button type="button" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40">Next →</button>
            </div>
          </div>
        </>
      )}

      {/* Bill detail dialog */}
      {viewBill && <BillDetailDialog bill={viewBill} onClose={() => setViewBill(null)} />}

    </article>
  )
}

export default BillHistoryPage
