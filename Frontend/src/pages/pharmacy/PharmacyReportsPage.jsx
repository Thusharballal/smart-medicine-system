/**
 * Component: PharmacyReportsPage — Phase 6 Reports & Analytics Module
 *
 * Route: /pharmacy/reports  (ProtectedRoute → PharmacyLayout)
 *
 * Purpose:
 *   Provides pharmacy owners with a professional overview of pharmacy
 *   performance metrics, inventory reports, top-selling medicines,
 *   and export placeholders.
 *
 * ⚠ FRONTEND PLACEHOLDER ONLY — No backend, no API, no database.
 * Future backend integration points:
 *   TODO: GET /api/v1/pharmacy/reports/stats        → Dashboard Statistics API
 *   TODO: GET /api/v1/pharmacy/reports/sales        → Sales Reports API
 *   TODO: GET /api/v1/pharmacy/reports/inventory    → Inventory Analytics API
 *   TODO: GET /api/v1/pharmacy/reports/top-medicines → Top Selling Medicines API
 *   TODO: POST /api/v1/pharmacy/reports/export?format=pdf|excel|csv → Export API
 */

import { useState } from 'react'
import {
  HiOutlineChartBarSquare, HiOutlineCurrencyRupee, HiOutlineReceiptRefund,
  HiOutlineArchiveBox, HiOutlineExclamationTriangle, HiOutlineClock,
  HiOutlineArrowDownTray, HiOutlineCalendarDays,
  HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown,
  HiOutlineInformationCircle,
} from 'react-icons/hi2'
import { MdMedication, MdAnalytics, MdInventory2, MdBarChart } from 'react-icons/md'
import Badge from '../../components/ui/Badge'
import { INVENTORY } from './data/inventoryData'

// ── Placeholder stats ─────────────────────────────────────────────────────
// TODO: GET /api/v1/pharmacy/reports/stats (Dashboard Statistics API)
const STATS_CARDS = [
  { label: "Today's Sales",    value: '₹ 1,240',   icon: HiOutlineCurrencyRupee,    color: 'text-success-600',  bg: 'bg-success-50',   trend: '+12%', up: true,  desc: 'vs yesterday' },
  { label: 'Weekly Sales',     value: '₹ 8,350',   icon: HiOutlineArrowTrendingUp,  color: 'text-primary-600',  bg: 'bg-primary-50',   trend: '+8%',  up: true,  desc: 'vs last week' },
  { label: 'Monthly Sales',    value: '₹ 32,100',  icon: MdBarChart,                color: 'text-secondary-600',bg: 'bg-secondary-50', trend: '+5%',  up: true,  desc: 'vs last month' },
  { label: 'Total Bills',      value: '42',        icon: HiOutlineReceiptRefund,    color: 'text-accent-600',   bg: 'bg-accent-50',    trend: '12 today', up: true, desc: 'this month' },
  { label: 'Medicines Sold',   value: '186',       icon: MdMedication,              color: 'text-info-600',     bg: 'bg-info-50',      trend: '+23', up: true,  desc: 'units this week' },
  { label: 'Inventory Value',  value: '₹ —',      icon: MdInventory2,              color: 'text-warning-600',  bg: 'bg-warning-50',   trend: 'Placeholder', up: null, desc: 'TODO: /api/v1/pharmacy/reports/inventory' },
]

// ── Placeholder sales chart data (daily) ─────────────────────────────────
// TODO: GET /api/v1/pharmacy/reports/sales?period=daily (Sales Reports API)
const DAILY_SALES = [
  { day: 'Mon', amount: 1240, bills: 8  },
  { day: 'Tue', amount: 980,  bills: 6  },
  { day: 'Wed', amount: 1560, bills: 10 },
  { day: 'Thu', amount: 890,  bills: 5  },
  { day: 'Fri', amount: 2100, bills: 13 },
  { day: 'Sat', amount: 1750, bills: 11 },
  { day: 'Sun', amount: 620,  bills: 4  },
]
const MAX_SALES = Math.max(...DAILY_SALES.map(d => d.amount))

// ── Top selling medicines placeholder ────────────────────────────────────
// TODO: GET /api/v1/pharmacy/reports/top-medicines (Top Selling Medicines API)
const TOP_MEDICINES = [
  { rank:1, name:'Paracetamol IP 500mg', genericName:'Acetaminophen',  unitsSold:48, revenue:864  },
  { rank:2, name:'Metformin 500mg',       genericName:'Metformin HCl',  unitsSold:36, revenue:432  },
  { rank:3, name:'Cetirizine 10mg',       genericName:'Cetirizine HCl', unitsSold:30, revenue:240  },
  { rank:4, name:'Ibuprofen 400mg',       genericName:'Ibuprofen',      unitsSold:22, revenue:308  },
  { rank:5, name:'Vitamin D3 60000 IU',   genericName:'Cholecalciferol',unitsSold:18, revenue:630  },
]

// ── Inventory report cards ────────────────────────────────────────────────
const INV_REPORTS = [
  { label:'Low Stock',        value: INVENTORY.filter(i=>['low','critical'].includes(i.status)).length,  color:'text-warning-700', bg:'bg-warning-50',  border:'border-warning-200', icon:HiOutlineArrowTrendingDown },
  { label:'Near Expiry',      value: INVENTORY.filter(i=>i.status==='expiring').length,                  color:'text-orange-700',  bg:'bg-orange-50',   border:'border-orange-200',  icon:HiOutlineClock },
  { label:'Out of Stock',     value: INVENTORY.filter(i=>i.status==='out').length,                       color:'text-danger-700',  bg:'bg-danger-50',   border:'border-danger-200',  icon:HiOutlineExclamationTriangle },
  { label:'Well Stocked',     value: INVENTORY.filter(i=>i.status==='available').length,                  color:'text-success-700', bg:'bg-success-50',  border:'border-success-200', icon:HiOutlineArchiveBox },
]

// ── Recent reports placeholder ────────────────────────────────────────────
// TODO: GET /api/v1/pharmacy/reports/history (Reports API)
const RECENT_REPORTS = [
  { label:'Daily Report',     period:'02 Jul 2026',   status:'ready', icon:HiOutlineChartBarSquare },
  { label:'Weekly Report',    period:'Week of 30 Jun',status:'ready', icon:MdBarChart },
  { label:'Monthly Report',   period:'June 2026',     status:'ready', icon:HiOutlineArrowTrendingUp },
  { label:'Inventory Report', period:'02 Jul 2026',   status:'ready', icon:MdInventory2 },
  { label:'Sales Report',     period:'June 2026',     status:'ready', icon:HiOutlineCurrencyRupee },
]

const DATE_RANGES = ['Today','This Week','This Month','Custom Date']
const CATEGORIES  = ['All Categories','Analgesic','Antibiotic','Antidiabetic','Antihistamine','Antacid','Supplement','NSAID']

function PharmacyReportsPage() {
  const [period,   setPeriod]   = useState('This Week')
  const [category, setCategory] = useState('All Categories')

  // TODO: POST /api/v1/pharmacy/reports/export?format=pdf|excel|csv (Export API)
  function handleExport(format) {
    alert(`Export functionality (${format}) will be available after backend integration.`)
  }

  return (
    <article aria-label="Reports & Analytics" className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <MdAnalytics size={22} className="text-primary-600" aria-hidden="true" />
            Reports &amp; Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Monitor pharmacy performance and inventory insights.</p>
        </div>
        {/* Export buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {['PDF','Excel','CSV'].map(fmt => (
            <button key={fmt} type="button" onClick={() => handleExport(fmt)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              <HiOutlineArrowDownTray size={13} aria-hidden="true" />
              Export {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Placeholder notice */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-info-50 border border-info-100">
        <HiOutlineInformationCircle size={15} className="text-info-600 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-info-700">
          <span className="font-semibold">Demo Mode:</span> All statistics and charts are frontend placeholders.
          Live data will be available after{' '}
          {/* TODO: All APIs below are future FastAPI integrations */}
          backend integration (FastAPI Reports &amp; Analytics API).
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 flex-wrap" role="group" aria-label="Filter by date range">
          {DATE_RANGES.map(r => (
            <button key={r} type="button" onClick={() => setPeriod(r)} aria-pressed={period===r}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${period===r ? 'bg-primary-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-primary-300'}`}>
              {r}
            </button>
          ))}
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category"
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:border-primary-500 outline-none transition">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="text-[10px] text-slate-400 italic">Filters are UI placeholders — TODO: wire to Reports API</span>
      </div>

      {/* ── Statistics Cards ────────────────────────────────────────── */}
      {/* TODO: GET /api/v1/pharmacy/reports/stats (Dashboard Statistics API) */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest">Performance Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATS_CARDS.map(s => (
            <div key={s.label} className="flex flex-col gap-2 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${s.bg} shrink-0`}>
                <s.icon size={20} className={s.color} aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900 leading-tight">{s.value}</p>
                <p className="text-xs font-semibold text-slate-700 leading-tight mt-0.5">{s.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{s.desc}</p>
              </div>
              {s.up !== null && (
                <span className={`text-[10px] font-semibold ${s.up ? 'text-success-600' : 'text-danger-600'}`}>
                  {s.up ? '↑' : '↓'} {s.trend}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Sales Overview (bar chart placeholder) ──────────────────── */}
      {/* TODO: GET /api/v1/pharmacy/reports/sales?period=daily (Sales Reports API) */}
      <section aria-labelledby="sales-chart-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 id="sales-chart-heading" className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MdBarChart size={16} className="text-primary-600" aria-hidden="true" />
            Sales Overview — Daily
          </h2>
          <Badge variant="neutral" size="sm">Placeholder Data</Badge>
        </div>

        {/* Simple CSS bar chart */}
        <div className="flex items-end gap-2 h-32" role="img" aria-label="Daily sales bar chart — placeholder data">
          {DAILY_SALES.map(d => {
            const pct = Math.round((d.amount / MAX_SALES) * 100)
            return (
              <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] text-slate-500 font-medium">₹{(d.amount/1000).toFixed(1)}k</span>
                <div className="relative w-full flex items-end" style={{ height: '72px' }}>
                  <div
                    className="w-full rounded-t-md bg-primary-500 hover:bg-primary-600 transition-all duration-300"
                    style={{ height: `${pct}%`, minHeight: '4px' }}
                    title={`${d.day}: ₹${d.amount} — ${d.bills} bills`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-3 text-right">TODO: Replace with Recharts / Chart.js after backend integration</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Inventory Reports ────────────────────────────────────── */}
        {/* TODO: GET /api/v1/pharmacy/reports/inventory (Inventory Analytics API) */}
        <section aria-labelledby="inv-report-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 id="inv-report-heading" className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MdInventory2 size={16} className="text-secondary-600" aria-hidden="true" />
            Inventory Reports
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {INV_REPORTS.map(r => (
              <div key={r.label} className={`flex items-center gap-3 p-3 rounded-xl border ${r.bg} ${r.border}`}>
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg bg-white shrink-0 shadow-sm`}>
                  <r.icon size={17} className={r.color} aria-hidden="true" />
                </div>
                <div>
                  <p className={`text-xl font-extrabold ${r.color}`}>{r.value}</p>
                  <p className="text-xs text-slate-600 font-medium leading-tight">{r.label}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Live from existing placeholder inventory data · TODO: GET /api/v1/pharmacy/reports/inventory</p>
        </section>

        {/* ── Recent Reports ───────────────────────────────────────── */}
        {/* TODO: GET /api/v1/pharmacy/reports/history (Reports API) */}
        <section aria-labelledby="recent-reports-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 id="recent-reports-heading" className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <HiOutlineCalendarDays size={16} className="text-accent-600" aria-hidden="true" />
            Recent Reports
          </h2>
          <div className="space-y-2.5">
            {RECENT_REPORTS.map(r => {
              const Icon = r.icon
              return (
                <div key={r.label} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 shrink-0">
                      <Icon size={15} className="text-primary-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{r.label}</p>
                      <p className="text-[10px] text-slate-400">{r.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="success" size="sm">Ready</Badge>
                    <button type="button" onClick={() => handleExport('PDF')} aria-label={`Download ${r.label}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500">
                      <HiOutlineArrowDownTray size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* ── Top Selling Medicines ────────────────────────────────────── */}
      {/* TODO: GET /api/v1/pharmacy/reports/top-medicines (Top Selling Medicines API) */}
      <section aria-labelledby="top-medicines-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 id="top-medicines-heading" className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HiOutlineArrowTrendingUp size={15} className="text-success-600" aria-hidden="true" />
            Top Selling Medicines
          </h2>
          <Badge variant="neutral" size="sm">Placeholder Data</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base" role="grid" aria-label="Top selling medicines">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Medicine Name</th>
                <th scope="col" className="hidden md:table-cell">Generic Name</th>
                <th scope="col">Units Sold</th>
                <th scope="col">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {TOP_MEDICINES.map(m => (
                <tr key={m.rank}>
                  <td>
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${m.rank <= 3 ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.rank}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <MdMedication size={13} className="text-secondary-500 shrink-0" aria-hidden="true" />
                      <p className="text-xs font-semibold text-slate-900 truncate max-w-[160px]">{m.name}</p>
                    </div>
                  </td>
                  <td className="hidden md:table-cell text-xs text-slate-500">{m.genericName}</td>
                  <td className="text-xs font-bold text-slate-900">{m.unitsSold}</td>
                  <td className="text-xs font-extrabold text-primary-700">₹ {m.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 px-5 py-3 border-t border-slate-50">
          TODO: GET /api/v1/pharmacy/reports/top-medicines?period={period}&limit=5 (Top Selling Medicines API)
        </p>
      </section>

    </article>
  )
}

export default PharmacyReportsPage
