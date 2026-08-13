/**
 * Component: AdvancedInventoryPage — Phase 7 Advanced Inventory Management
 *
 * Route: /pharmacy/inventory/advanced  (ProtectedRoute → PharmacyLayout)
 * Access: "Advanced View" button on the existing InventoryPage header
 *
 * Sections (tab-based):
 *   Health    — Inventory Health Summary cards + score
 *   Batches   — Batch Management table with View/Edit/Delete per batch
 *   LowStock  — Low Stock Alerts table
 *   Expiry    — Near Expiry + Expired medicines
 *   Movement  — Stock Movement History log
 *   Timeline  — Inventory activity timeline
 *
 * ⚠ FRONTEND PLACEHOLDER ONLY — No backend, no APIs.
 * Future backend integration points:
 *   TODO: GET    /api/v1/pharmacy/inventory/batches           → Batch CRUD API
 *   TODO: POST   /api/v1/pharmacy/inventory/batches           → Add batch
 *   TODO: PUT    /api/v1/pharmacy/inventory/batches/:id       → Edit batch
 *   TODO: DELETE /api/v1/pharmacy/inventory/batches/:id       → Delete batch
 *   TODO: GET    /api/v1/pharmacy/inventory/movement-history  → Stock Movement API
 *   TODO: GET    /api/v1/pharmacy/inventory/expiry-alerts     → Expiry Monitoring API
 *   TODO: GET    /api/v1/pharmacy/inventory/health            → Inventory Health API
 *   TODO: GET    /api/v1/pharmacy/inventory/alerts            → Alert API
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineArrowLeft, HiOutlineXMark,
  HiOutlineEye, HiOutlinePencil, HiOutlineTrash,
  HiOutlineArchiveBox, HiOutlineExclamationTriangle,
  HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown,
  HiOutlinePlusCircle, HiOutlineCalendarDays,
  HiOutlineChartBarSquare, HiOutlineSignal,
} from 'react-icons/hi2'
import { MdMedication, MdInventory2 } from 'react-icons/md'
import Badge  from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'
import { INVENTORY } from './data/inventoryData'

// ── Tab definitions ───────────────────────────────────────────────────────
const TABS = [
  { id: 'health',   label: 'Health Summary',   icon: HiOutlineChartBarSquare },
  { id: 'batches',  label: 'Batch Management', icon: HiOutlineArchiveBox },
  { id: 'lowstock', label: 'Low Stock Alerts', icon: HiOutlineArrowTrendingDown },
  { id: 'expiry',   label: 'Expiry Alerts',    icon: HiOutlineClock },
  { id: 'movement', label: 'Stock Movement',   icon: HiOutlineSignal },
  { id: 'timeline', label: 'Timeline',         icon: HiOutlineArrowTrendingUp },
]

// ── Extended batch data ───────────────────────────────────────────────────
// TODO: GET /api/v1/pharmacy/inventory/batches (Batch CRUD API)
const BATCHES = INVENTORY.flatMap(item => [
  {
    batchId: `${item.id}-b1`, medicineId: item.id,
    name: item.name, genericName: item.genericName,
    manufacturer: item.manufacturer,
    batch: item.batch, mfgDate: item.mfgDate, expiry: item.expiry,
    qty: item.qty, status: item.status,
  },
  ...(item.qty > 50 ? [{
    batchId: `${item.id}-b2`, medicineId: item.id,
    name: item.name, genericName: item.genericName,
    manufacturer: item.manufacturer,
    batch: item.batch.replace('025', '024'), mfgDate: '2024-06-01', expiry: '2026-05-31',
    qty: Math.floor(item.qty * 0.4), status: 'available',
  }] : []),
])

// ── Low stock data (min threshold = 25) ──────────────────────────────────
const MIN_THRESHOLD = 25
// TODO: GET /api/v1/pharmacy/inventory/alerts?type=low_stock (Alert API)
const LOW_STOCK_ITEMS = INVENTORY
  .filter(i => i.qty <= MIN_THRESHOLD)
  .map(i => ({ ...i, minRequired: MIN_THRESHOLD }))

// ── Expiry data ───────────────────────────────────────────────────────────
// TODO: GET /api/v1/pharmacy/inventory/expiry-alerts (Expiry Monitoring API)
function daysUntilExpiry(dateStr) {
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
const EXPIRY_ITEMS = INVENTORY
  .map(i => ({ ...i, daysLeft: daysUntilExpiry(i.expiry) }))
  .filter(i => i.daysLeft <= 90)
  .sort((a, b) => a.daysLeft - b.daysLeft)

const EXPIRED_ITEMS = INVENTORY.filter(i => daysUntilExpiry(i.expiry) <= 0)
const NEAR_EXPIRY   = EXPIRY_ITEMS.filter(i => i.daysLeft > 0)

// ── Stock movement history ────────────────────────────────────────────────
// TODO: GET /api/v1/pharmacy/inventory/movement-history (Stock Movement API)
const MOVEMENT_HISTORY = [
  { id:'m1', date:'02 Jul 2026', medicine:'Paracetamol IP 500mg', action:'Medicine Added',    qty:'+480', by:'Admin User',     remark:'Initial stock entry'              },
  { id:'m2', date:'02 Jul 2026', medicine:'Cetirizine 10mg',      action:'Manual Adjustment', qty:'-5',   by:'Admin User',     remark:'Damaged units removed'            },
  { id:'m3', date:'01 Jul 2026', medicine:'Azithromycin 500mg',   action:'Stock Imported',    qty:'+85',  by:'Import (PDF)',   remark:'Supplier: ABC Pharma PDF import'  },
  { id:'m4', date:'01 Jul 2026', medicine:'Metformin 500mg',      action:'Stock Sold',        qty:'-12',  by:'Billing System', remark:'Bill #BILL-2026-10031'            },
  { id:'m5', date:'30 Jun 2026', medicine:'Ibuprofen 400mg',      action:'Medicine Updated',  qty:'390',  by:'Admin User',     remark:'Price updated to ₹14'             },
  { id:'m6', date:'30 Jun 2026', medicine:'Pantoprazole 40mg',    action:'Stock Sold',        qty:'-8',   by:'Billing System', remark:'Bill #BILL-2026-10028'            },
  { id:'m7', date:'29 Jun 2026', medicine:'Vitamin D3 60000 IU',  action:'Stock Imported',    qty:'+60',  by:'Import (PDF)',   remark:'Monthly restock from supplier'    },
  { id:'m8', date:'28 Jun 2026', medicine:'Amoxicillin 500mg',    action:'Medicine Added',    qty:'+0',   by:'Admin User',     remark:'Out of stock — pending delivery'  },
]

const MOVEMENT_BADGE = {
  'Medicine Added':    { variant: 'success', label: 'Added'    },
  'Stock Sold':        { variant: 'primary', label: 'Sold'     },
  'Stock Imported':    { variant: 'info',    label: 'Imported' },
  'Medicine Updated':  { variant: 'warning', label: 'Updated'  },
  'Manual Adjustment': { variant: 'warning', label: 'Adjusted' },
}

// ── Inventory timeline ────────────────────────────────────────────────────
// TODO: GET /api/v1/pharmacy/inventory/activity-timeline (Inventory Health API)
const TIMELINE = [
  { id:'t1', icon:HiOutlinePlusCircle,       iconBg:'bg-success-100',   iconColor:'text-success-600',   action:'Medicine Added',    detail:'Ibuprofen 400mg (390 units) added to inventory',    time:'02 Jul 2026 · 10:15 AM' },
  { id:'t2', icon:HiOutlineCalendarDays,     iconBg:'bg-warning-100',   iconColor:'text-warning-600',   action:'Batch Updated',     detail:'Pantoprazole 40mg — batch BAT-2025-007 qty updated', time:'02 Jul 2026 · 09:30 AM' },
  { id:'t3', icon:HiOutlineArrowTrendingUp,  iconBg:'bg-secondary-100', iconColor:'text-secondary-600', action:'Stock Increased',   detail:'Metformin 500mg — restocked to 320 units',           time:'01 Jul 2026 · 04:50 PM' },
  { id:'t4', icon:HiOutlineArrowTrendingDown,iconBg:'bg-primary-100',   iconColor:'text-primary-600',   action:'Stock Reduced',     detail:'Azithromycin 500mg sold via Bill #10031',             time:'01 Jul 2026 · 02:15 PM' },
  { id:'t5', icon:HiOutlineArchiveBox,       iconBg:'bg-accent-100',    iconColor:'text-accent-600',    action:'PDF Imported',      detail:'Bulk import from supplier invoice — 3 medicines',    time:'01 Jul 2026 · 11:00 AM' },
  { id:'t6', icon:HiOutlineCheckCircle,      iconBg:'bg-success-100',   iconColor:'text-success-600',   action:'Bill Generated',    detail:'Bill #BILL-2026-10031 · ₹93.45 · Dr. Arjun Mehta',  time:'01 Jul 2026 · 09:10 AM' },
  { id:'t7', icon:HiOutlinePencil,           iconBg:'bg-info-100',      iconColor:'text-info-600',      action:'Batch Updated',     detail:'Cetirizine 10mg — manufacturing date corrected',     time:'30 Jun 2026 · 05:20 PM' },
  { id:'t8', icon:HiOutlineExclamationTriangle,iconBg:'bg-danger-100',  iconColor:'text-danger-600',    action:'Low Stock Alert',   detail:'Cetirizine 10mg below minimum threshold (15 units)', time:'30 Jun 2026 · 03:00 PM' },
]

// ── Expiry badge helper ───────────────────────────────────────────────────
function expiryBadge(days) {
  if (days <= 0)   return { variant: 'danger',  label: 'Expired'        }
  if (days <= 7)   return { variant: 'danger',  label: 'Expires in 7d'  }
  if (days <= 15)  return { variant: 'warning', label: 'Expires in 15d' }
  if (days <= 30)  return { variant: 'warning', label: 'Expires in 30d' }
  return              { variant: 'neutral', label: `${days}d left`    }
}

// ── Shared modal shell ────────────────────────────────────────────────────
function ModalShell({ title, onClose, children, size = 'md' }) {
  const w = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-2xl' }
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="adv-modal-title"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${w[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 id="adv-modal-title" className="text-base font-bold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            <HiOutlineXMark size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Batch Detail Dialog ───────────────────────────────────────────────────
function BatchDetailDialog({ batch, onClose }) {
  const rows = [
    ['Medicine',          batch.name],
    ['Generic Name',      batch.genericName],
    ['Manufacturer',      batch.manufacturer],
    ['Batch Number',      batch.batch],
    ['Manufacturing Date',batch.mfgDate],
    ['Expiry Date',       batch.expiry],
    ['Available Quantity',`${batch.qty} units`],
  ]
  const days = daysUntilExpiry(batch.expiry)
  const eb   = expiryBadge(days)
  return (
    <ModalShell title="Batch Details" onClose={onClose} size="md">
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary-100 shrink-0">
          <MdMedication size={20} className="text-secondary-600" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{batch.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={eb.variant} size="sm">{eb.label}</Badge>
            <span className="text-lg font-extrabold text-slate-900">{batch.qty}</span>
            <span className="text-xs text-slate-400">units</span>
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {rows.map(([label, val]) => (
          <div key={label} className="flex justify-between py-2.5 text-xs">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="text-slate-900 font-semibold text-right">{val}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-5 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onClose}>Close</Button>
      </div>
    </ModalShell>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB PANELS
// ══════════════════════════════════════════════════════════════════════════

// 1. Health Summary
function HealthTab() {
  const total     = INVENTORY.length
  const healthy   = INVENTORY.filter(i => i.status === 'available').length
  const low       = INVENTORY.filter(i => ['low','critical'].includes(i.status)).length
  const nearExpiry= NEAR_EXPIRY.length
  const expired   = EXPIRED_ITEMS.length
  const score     = Math.round(((healthy - low * 0.5 - nearExpiry * 0.3 - expired) / total) * 100)

  const cards = [
    { label:'Healthy Medicines',   value: healthy,   icon: HiOutlineCheckCircle,         color:'text-success-700', bg:'bg-success-50',  border:'border-success-200'  },
    { label:'Low Stock Medicines', value: low,        icon: HiOutlineArrowTrendingDown,   color:'text-warning-700', bg:'bg-warning-50',  border:'border-warning-200'  },
    { label:'Near Expiry',         value: nearExpiry, icon: HiOutlineClock,               color:'text-orange-700',  bg:'bg-orange-50',   border:'border-orange-200'   },
    { label:'Expired Medicines',   value: expired,    icon: HiOutlineExclamationTriangle, color:'text-danger-700',  bg:'bg-danger-50',   border:'border-danger-200'   },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Score card */}
      {/* TODO: GET /api/v1/pharmacy/inventory/health (Inventory Health API) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-50 shrink-0">
          <span className="text-3xl font-extrabold text-primary-700">{Math.max(0, score)}%</span>
        </div>
        <div>
          <p className="text-base font-bold text-slate-900">Inventory Health Score</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {score >= 80 ? '✅ Your inventory is in good shape.' : score >= 60 ? '⚠ Some items need attention.' : '❗ Immediate action required.'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Placeholder score — TODO: GET /api/v1/pharmacy/inventory/health</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`flex flex-col gap-2 p-4 rounded-xl border ${c.bg} ${c.border}`}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm shrink-0">
              <c.icon size={20} className={c.color} aria-hidden="true" />
            </div>
            <p className={`text-2xl font-extrabold ${c.color}`}>{c.value}</p>
            <p className="text-xs font-semibold text-slate-700 leading-tight">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Medicine detail extension note */}
      <div className="p-4 rounded-xl bg-info-50 border border-info-100 text-xs text-info-700">
        <span className="font-semibold">Medicine Details Extension (Phase 7.9):</span> Batch information, stock history,
        expiry details, and movement history are available in each medicine&apos;s detail view via the
        Inventory Management page. This panel provides a high-level summary.
      </div>
    </div>
  )
}

// 2. Batch Management
function BatchesTab() {
  const [viewBatch, setViewBatch] = useState(null)
  // TODO: GET /api/v1/pharmacy/inventory/batches (Batch CRUD API)
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-900">{BATCHES.length} batches across {INVENTORY.length} medicines</p>
        <p className="text-[10px] text-slate-400">TODO: POST /api/v1/pharmacy/inventory/batches (Add batch)</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base" role="grid" aria-label="Batch management">
            <thead>
              <tr>
                <th scope="col">Medicine Name</th>
                <th scope="col" className="hidden md:table-cell">Batch No.</th>
                <th scope="col" className="hidden lg:table-cell">Mfg Date</th>
                <th scope="col">Expiry Date</th>
                <th scope="col">Qty</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {BATCHES.map(b => {
                const days = daysUntilExpiry(b.expiry)
                const eb   = expiryBadge(days)
                return (
                  <tr key={b.batchId}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary-50 shrink-0">
                          <MdMedication size={13} className="text-secondary-600" aria-hidden="true" />
                        </div>
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">{b.name}</p>
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-xs font-mono text-slate-500">{b.batch}</td>
                    <td className="hidden lg:table-cell text-xs text-slate-500">{b.mfgDate}</td>
                    <td className={`text-xs font-semibold ${days <= 30 ? 'text-orange-600' : 'text-slate-600'}`}>{b.expiry}</td>
                    <td className="text-xs font-bold text-slate-900">{b.qty}</td>
                    <td><Badge variant={eb.variant} size="sm">{eb.label}</Badge></td>
                    <td>
                      <div className="flex gap-0.5">
                        <button type="button" onClick={() => setViewBatch(b)} aria-label={`View batch ${b.batch}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500">
                          <HiOutlineEye size={14} aria-hidden="true" />
                        </button>
                        {/* TODO: PUT /api/v1/pharmacy/inventory/batches/:id (Edit batch) */}
                        <button type="button" aria-label={`Edit batch ${b.batch}`} title="Edit — backend pending"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-secondary-600 hover:bg-secondary-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary-500">
                          <HiOutlinePencil size={14} aria-hidden="true" />
                        </button>
                        {/* TODO: DELETE /api/v1/pharmacy/inventory/batches/:id (Delete batch) */}
                        <button type="button" aria-label={`Delete batch ${b.batch}`} title="Delete — backend pending"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-danger-500 hover:bg-danger-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger-400">
                          <HiOutlineTrash size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {viewBatch && <BatchDetailDialog batch={viewBatch} onClose={() => setViewBatch(null)} />}
    </div>
  )
}

// 3. Low Stock Alerts
function LowStockTab() {
  // TODO: GET /api/v1/pharmacy/inventory/alerts?type=low_stock (Alert API)
  return (
    <div>
      <div className="mb-4 p-3 rounded-xl bg-warning-50 border border-warning-200 text-xs text-warning-800">
        <span className="font-semibold">⚠ {LOW_STOCK_ITEMS.length} medicines</span> are below the minimum threshold of {MIN_THRESHOLD} units.
        Restock is recommended. {/* TODO: GET /api/v1/pharmacy/inventory/alerts (Alert API) */}
      </div>
      {LOW_STOCK_ITEMS.length === 0 ? (
        <div className="text-center py-10 text-sm text-slate-400">All medicines are above the minimum threshold. ✅</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base" aria-label="Low stock alerts">
              <thead>
                <tr>
                  <th scope="col">Medicine</th>
                  <th scope="col">Available Qty</th>
                  <th scope="col">Min Required</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {LOW_STOCK_ITEMS.map(item => (
                  <tr key={item.id}>
                    <td>
                      <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.genericName}</p>
                    </td>
                    <td className="text-lg font-extrabold text-danger-600">{item.qty}</td>
                    <td className="text-xs font-semibold text-slate-600">{item.minRequired}</td>
                    <td><Badge variant={item.qty === 0 ? 'danger' : 'warning'} size="sm" dot>{item.qty === 0 ? 'Out of Stock' : 'Low Stock'}</Badge></td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning-700 bg-warning-50 border border-warning-200 px-2 py-1 rounded-lg">
                        Restock Recommended
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// 4. Near Expiry + Expired
function ExpiryTab() {
  // TODO: GET /api/v1/pharmacy/inventory/expiry-alerts (Expiry Monitoring API)
  return (
    <div className="flex flex-col gap-6">
      {/* Near Expiry */}
      <section aria-labelledby="near-exp-heading">
        <h2 id="near-exp-heading" className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <HiOutlineClock size={15} className="text-warning-500" aria-hidden="true" />
          Near Expiry ({NEAR_EXPIRY.length})
        </h2>
        {NEAR_EXPIRY.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No medicines expiring within 90 days. ✅</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base" aria-label="Near expiry medicines">
                <thead><tr>
                  <th scope="col">Medicine</th>
                  <th scope="col" className="hidden sm:table-cell">Batch</th>
                  <th scope="col">Expiry Date</th>
                  <th scope="col">Days Remaining</th>
                  <th scope="col">Status</th>
                </tr></thead>
                <tbody>
                  {NEAR_EXPIRY.map(item => {
                    const eb = expiryBadge(item.daysLeft)
                    return (
                      <tr key={item.id}>
                        <td>
                          <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.genericName}</p>
                        </td>
                        <td className="hidden sm:table-cell text-xs text-slate-400 font-mono">{item.batch}</td>
                        <td className="text-xs font-semibold text-orange-600">{item.expiry}</td>
                        <td className={`text-xs font-extrabold ${item.daysLeft <= 7 ? 'text-danger-600' : item.daysLeft <= 30 ? 'text-warning-600' : 'text-orange-500'}`}>
                          {item.daysLeft} days
                        </td>
                        <td><Badge variant={eb.variant} size="sm">{eb.label}</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Expired */}
      <section aria-labelledby="expired-heading">
        <h2 id="expired-heading" className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <HiOutlineExclamationTriangle size={15} className="text-danger-500" aria-hidden="true" />
          Expired Medicines ({EXPIRED_ITEMS.length})
        </h2>
        {EXPIRED_ITEMS.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No expired medicines. ✅</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base" aria-label="Expired medicines">
                <thead><tr>
                  <th scope="col">Medicine</th>
                  <th scope="col" className="hidden sm:table-cell">Batch</th>
                  <th scope="col">Expiry Date</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr></thead>
                <tbody>
                  {EXPIRED_ITEMS.map(item => (
                    <tr key={item.id}>
                      <td>
                        <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.genericName}</p>
                      </td>
                      <td className="hidden sm:table-cell text-xs font-mono text-slate-400">{item.batch}</td>
                      <td className="text-xs font-semibold text-danger-600">{item.expiry}</td>
                      <td className="text-xs font-bold text-slate-700">{item.qty}</td>
                      <td><Badge variant="danger" size="sm" dot>Expired</Badge></td>
                      <td>
                        {/* TODO: POST /api/v1/pharmacy/inventory/:id/archive (Archive API) */}
                        <button type="button" aria-label={`Archive ${item.name}`}
                          className="text-[11px] font-semibold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                          Archive
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

// 5. Stock Movement History
function MovementTab() {
  // TODO: GET /api/v1/pharmacy/inventory/movement-history (Stock Movement API)
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base" aria-label="Stock movement history">
          <thead><tr>
            <th scope="col">Date</th>
            <th scope="col">Medicine</th>
            <th scope="col">Action</th>
            <th scope="col">Quantity</th>
            <th scope="col" className="hidden md:table-cell">Performed By</th>
            <th scope="col" className="hidden lg:table-cell">Remarks</th>
          </tr></thead>
          <tbody>
            {MOVEMENT_HISTORY.map(m => {
              const bc = MOVEMENT_BADGE[m.action] ?? { variant:'neutral', label:m.action }
              return (
                <tr key={m.id}>
                  <td className="text-xs text-slate-500 whitespace-nowrap">{m.date}</td>
                  <td className="text-xs font-semibold text-slate-900">{m.medicine}</td>
                  <td><Badge variant={bc.variant} size="sm">{bc.label}</Badge></td>
                  <td className={`text-xs font-extrabold ${m.qty.startsWith('+') ? 'text-success-600' : m.qty.startsWith('-') ? 'text-danger-600' : 'text-slate-700'}`}>{m.qty}</td>
                  <td className="hidden md:table-cell text-xs text-slate-500">{m.by}</td>
                  <td className="hidden lg:table-cell text-xs text-slate-400 max-w-[200px] truncate">{m.remark}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400 px-5 py-3 border-t border-slate-50">
        TODO: GET /api/v1/pharmacy/inventory/movement-history (Stock Movement API) — paginated, filterable
      </p>
    </div>
  )
}

// 6. Inventory Timeline
function TimelineTab() {
  // TODO: GET /api/v1/pharmacy/inventory/activity-timeline (Inventory Health API)
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <ol aria-label="Inventory activity timeline" className="relative">
        {TIMELINE.map((event, i) => {
          const Icon = event.icon
          return (
            <li key={event.id} className="flex gap-3 pb-5 last:pb-0">
              <div className="flex flex-col items-center shrink-0 w-10">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${event.iconBg}`}>
                  <Icon size={17} className={event.iconColor} aria-hidden="true" />
                </div>
                {i < TIMELINE.length - 1 && <div className="w-0.5 flex-1 mt-1.5 bg-slate-100" aria-hidden="true" />}
              </div>
              <div className="flex-1 min-w-0 pt-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="text-xs font-bold text-slate-800">{event.action}</p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{event.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{event.detail}</p>
              </div>
            </li>
          )
        })}
      </ol>
      <p className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-slate-100 text-center">
        Placeholder data — TODO: GET /api/v1/pharmacy/inventory/activity-timeline (Inventory Health API)
      </p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
function AdvancedInventoryPage() {
  const [activeTab, setActiveTab] = useState('health')

  const PANELS = {
    health:   <HealthTab />,
    batches:  <BatchesTab />,
    lowstock: <LowStockTab />,
    expiry:   <ExpiryTab />,
    movement: <MovementTab />,
    timeline: <TimelineTab />,
  }

  return (
    <article aria-label="Advanced Inventory Management" className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.PHARMACY.INVENTORY} aria-label="Back to Inventory"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            <HiOutlineArrowLeft size={16} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <HiOutlineChartBarSquare size={22} className="text-primary-600" aria-hidden="true" />
              Advanced Inventory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Batch management, alerts, stock movement and inventory health.
            </p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <nav aria-label="Advanced inventory sections">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700',
                ].join(' ')}
              >
                <Icon size={13} aria-hidden="true" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Tab panel */}
      <div role="tabpanel" aria-label={TABS.find(t => t.id === activeTab)?.label}>
        {PANELS[activeTab]}
      </div>

    </article>
  )
}

export default AdvancedInventoryPage
