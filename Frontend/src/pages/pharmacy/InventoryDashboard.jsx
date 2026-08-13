/**
 * Component: InventoryDashboard
 *
 * Purpose:
 *   Pharmacy Inventory Dashboard — a dedicated overview screen
 *   giving pharmacy owners a quick summary of inventory health,
 *   stock levels, expiry alerts, quick actions, and recent activity.
 *
 * Route: /pharmacy/inventory-dashboard  (ProtectedRoute → PharmacyLayout)
 *
 * Sections:
 *   1. Statistics Cards   — Total, Stock Units, Low, OOS, Near Expiry, Sales
 *   2. Quick Actions      — Add Medicine, Import Stock, Generate Bill, View Inventory
 *   3. Inventory Health   — Colored health status indicators
 *   4. Recent Activity    — Activity timeline with icons and timestamps
 *
 * Backend readiness (all placeholder — replace with TanStack Query calls):
 *   TODO: GET /api/v1/pharmacy/inventory/stats  → dashboard statistics
 *   TODO: GET /api/v1/pharmacy/analytics/health → inventory health score
 *   TODO: GET /api/v1/pharmacy/activity         → recent activity logs
 *   TODO: GET /api/v1/pharmacy/sales/today       → today's sales
 *   TODO: GET /api/v1/pharmacy/sales/month       → monthly sales
 */

import { Link }   from 'react-router-dom'
import {
  HiOutlineArchiveBox, HiOutlineExclamationTriangle,
  HiOutlineClock, HiOutlineCurrencyRupee, HiOutlinePlus,
  HiOutlineArrowDownTray, HiOutlineDocumentArrowUp,
  HiOutlineReceiptRefund, HiOutlineCheckCircle,
  HiOutlineShoppingCart, HiOutlineChartBarSquare,
  HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown,
} from 'react-icons/hi2'
import { MdInventory2, MdMedication, MdLocalPharmacy, MdAnalytics } from 'react-icons/md'
import InfoCard from '../../components/cards/InfoCard'
import Badge    from '../../components/ui/Badge'
import { ROUTES } from '../../constants/routes'
import { INVENTORY, STATUS_CONFIG } from './data/inventoryData'

// ── Derived statistics from placeholder inventory data ────────────────────
// TODO: Replace with GET /api/v1/pharmacy/inventory/stats
const totalMedicines  = INVENTORY.length
const totalStockUnits = INVENTORY.reduce((sum, i) => sum + i.qty, 0)
const lowStock        = INVENTORY.filter(i => i.status === 'low' || i.status === 'critical').length
const outOfStock      = INVENTORY.filter(i => i.status === 'out').length
const nearExpiry      = INVENTORY.filter(i => i.status === 'expiring').length

const STATS = [
  {
    label:    'Total Medicines',
    value:    totalMedicines,
    icon:     <MdMedication size={20} />,
    variant:  'primary',
    subtitle: 'In catalogue',
    // TODO: GET /api/v1/pharmacy/inventory/stats → data.totalMedicines
  },
  {
    label:    'Total Stock Units',
    value:    totalStockUnits.toLocaleString(),
    icon:     <HiOutlineArchiveBox size={20} />,
    variant:  'secondary',
    subtitle: 'Across all medicines',
    // TODO: GET /api/v1/pharmacy/inventory/stats → data.totalUnits
  },
  {
    label:    'Low Stock',
    value:    lowStock,
    icon:     <HiOutlineArrowTrendingDown size={20} />,
    variant:  'warning',
    subtitle: lowStock > 0 ? 'Needs reorder' : 'All good',
    // TODO: GET /api/v1/pharmacy/inventory/stats → data.lowStock
  },
  {
    label:    'Out of Stock',
    value:    outOfStock,
    icon:     <HiOutlineExclamationTriangle size={20} />,
    variant:  'danger',
    subtitle: outOfStock > 0 ? 'Urgent reorder' : 'None',
    // TODO: GET /api/v1/pharmacy/inventory/stats → data.outOfStock
  },
  {
    label:    'Near Expiry',
    value:    nearExpiry,
    icon:     <HiOutlineClock size={20} />,
    variant:  'warning',
    subtitle: 'Within 30 days',
    // TODO: GET /api/v1/pharmacy/inventory/stats → data.nearExpiry
  },
  {
    label:    "Today's Sales",
    value:    '₹ —',
    icon:     <HiOutlineShoppingCart size={20} />,
    variant:  'success',
    subtitle: 'TODO: /api/v1/pharmacy/sales/today',
    // TODO: GET /api/v1/pharmacy/sales/today → data.amount
  },
  {
    label:    'Monthly Sales',
    value:    '₹ —',
    icon:     <HiOutlineCurrencyRupee size={20} />,
    variant:  'default',
    subtitle: 'TODO: /api/v1/pharmacy/sales/month',
    // TODO: GET /api/v1/pharmacy/sales/month → data.amount
  },
]

// ── Quick actions ──────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    id:     'add',
    icon:   HiOutlinePlus,
    emoji:  '➕',
    label:  'Add Medicine',
    desc:   'Add a new medicine to your inventory',
    color:  'bg-primary-100 text-primary-700',
    border: 'border-primary-200 hover:border-primary-400 hover:bg-primary-50',
    to:     ROUTES.PHARMACY.INVENTORY_ADD,
  },
  {
    id:     'import',
    icon:   HiOutlineDocumentArrowUp,
    emoji:  '📄',
    label:  'Import Stock',
    desc:   'Bulk import inventory via PDF or CSV',
    color:  'bg-secondary-100 text-secondary-700',
    border: 'border-secondary-200 hover:border-secondary-400 hover:bg-secondary-50',
    to:     ROUTES.PHARMACY.IMPORT_STOCK,
  },
  {
    id:     'bill',
    icon:   HiOutlineReceiptRefund,
    emoji:  '🧾',
    label:  'Generate Bill',
    desc:   'Create a patient medicine bill',
    color:  'bg-success-100 text-success-700',
    border: 'border-success-200 hover:border-success-400 hover:bg-success-50',
    to:     null, // TODO: /pharmacy/billing — Phase 2
  },
  {
    id:     'inventory',
    icon:   MdInventory2,
    emoji:  '📦',
    label:  'View Inventory',
    desc:   'Browse and manage full stock list',
    color:  'bg-accent-100 text-accent-700',
    border: 'border-accent-200 hover:border-accent-400 hover:bg-accent-50',
    to:     ROUTES.PHARMACY.INVENTORY,
  },
]

// ── Inventory health items ─────────────────────────────────────────────────
// TODO: GET /api/v1/pharmacy/analytics/health
const HEALTH_ITEMS = [
  {
    label:  'Healthy Stock',
    count:  INVENTORY.filter(i => i.status === 'available').length,
    color:  'bg-success-100 border-success-200',
    dot:    'bg-success-500',
    text:   'text-success-700',
    badge:  'success',
  },
  {
    label:  'Low Stock Warning',
    count:  INVENTORY.filter(i => i.status === 'low').length,
    color:  'bg-warning-100 border-warning-200',
    dot:    'bg-warning-500',
    text:   'text-warning-700',
    badge:  'warning',
  },
  {
    label:  'Critical Stock',
    count:  INVENTORY.filter(i => i.status === 'critical').length,
    color:  'bg-orange-100 border-orange-200',
    dot:    'bg-orange-500',
    text:   'text-orange-700',
    badge:  'warning',
  },
  {
    label:  'Near Expiry',
    count:  INVENTORY.filter(i => i.status === 'expiring').length,
    color:  'bg-warning-50 border-warning-200',
    dot:    'bg-warning-400',
    text:   'text-warning-600',
    badge:  'warning',
  },
  {
    label:  'Out of Stock Alert',
    count:  INVENTORY.filter(i => i.status === 'out').length,
    color:  'bg-danger-100 border-danger-200',
    dot:    'bg-danger-500',
    text:   'text-danger-700',
    badge:  'danger',
  },
]

// ── Recent activity placeholder ────────────────────────────────────────────
// TODO: GET /api/v1/pharmacy/activity → data.activities
const RECENT_ACTIVITY = [
  { id: 'a1', icon: HiOutlinePlus,             iconBg: 'bg-primary-100',   iconColor: 'text-primary-600',  action: 'Medicine Added',      detail: 'Ibuprofen 400mg added to inventory',              time: '10 min ago',  status: 'success' },
  { id: 'a2', icon: HiOutlineArrowTrendingUp,  iconBg: 'bg-success-100',   iconColor: 'text-success-600',  action: 'Inventory Updated',   detail: 'Paracetamol IP 500mg — qty updated to 480',       time: '1 hour ago',  status: 'success' },
  { id: 'a3', icon: HiOutlineDocumentArrowUp,  iconBg: 'bg-secondary-100', iconColor: 'text-secondary-600',action: 'PDF Imported',         detail: 'Bulk stock import from supplier invoice PDF',     time: '2 hours ago', status: 'success' },
  { id: 'a4', icon: HiOutlineReceiptRefund,    iconBg: 'bg-accent-100',    iconColor: 'text-accent-600',   action: 'Bill Generated',       detail: 'Bill #INV-2025-042 generated for patient',        time: '3 hours ago', status: 'success' },
  { id: 'a5', icon: HiOutlineExclamationTriangle,iconBg: 'bg-warning-100', iconColor: 'text-warning-600',  action: 'Low Stock Alert',      detail: 'Cetirizine 10mg — only 15 units remaining',       time: '4 hours ago', status: 'warning' },
  { id: 'a6', icon: HiOutlineClock,            iconBg: 'bg-orange-100',    iconColor: 'text-orange-600',   action: 'Expiry Alert',         detail: 'Pantoprazole 40mg (BAT-2025-007) expires in 4 days',time: '5 hours ago', status: 'warning' },
]

const STATUS_BADGE = {
  success: 'success',
  warning: 'warning',
  danger:  'danger',
}

// ─────────────────────────────────────────────────────────────────────────────
function InventoryDashboard() {
  return (
    <article aria-label="Inventory Dashboard" className="flex flex-col gap-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <MdAnalytics size={26} className="text-primary-600" aria-hidden="true" />
            Inventory Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {/* TODO: pharmacy name from GET /api/v1/pharmacy/profile */}
            Jan Aushadhi Kendra — Andheri West · Overview &amp; Analytics
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={ROUTES.PHARMACY.INVENTORY_ADD}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <HiOutlinePlus size={15} aria-hidden="true" />
            Add Medicine
          </Link>
          <Link
            to={ROUTES.PHARMACY.INVENTORY}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <MdInventory2 size={15} aria-hidden="true" />
            View Inventory
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          1. STATISTICS CARDS
          TODO: GET /api/v1/pharmacy/inventory/stats for all live values
          ══════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="inv-stats-heading">
        <h2 id="inv-stats-heading" className="sr-only">Inventory Statistics</h2>

        {/* Top row — 4 core stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.slice(0, 4).map(s => (
            <InfoCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              variant={s.variant}
              subtitle={s.subtitle}
            />
          ))}
        </div>

        {/* Bottom row — expiry + sales placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {STATS.slice(4).map(s => (
            <InfoCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              variant={s.variant}
              subtitle={s.subtitle}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. QUICK ACTIONS
          ══════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <HiOutlineChartBarSquare size={16} className="text-primary-600" aria-hidden="true" />
          Quick Actions
        </h2>
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          role="list"
          aria-label="Quick action shortcuts"
        >
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon
            const card = (
              <div
                className={[
                  'flex flex-col gap-3 p-5 rounded-2xl bg-white border-2 h-full',
                  'shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200',
                  action.border,
                ].join(' ')}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${action.color} shrink-0`}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{action.emoji} {action.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{action.desc}</p>
                </div>
                {!action.to && (
                  <Badge variant="neutral" size="sm" className="w-fit">Coming Soon</Badge>
                )}
              </div>
            )

            return (
              <div key={action.id} role="listitem">
                {action.to
                  ? (
                    <Link
                      to={action.to}
                      aria-label={action.label}
                      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-2xl"
                    >
                      {card}
                    </Link>
                  )
                  : (
                    <button
                      type="button"
                      aria-label={`${action.label} — Coming Soon`}
                      disabled
                      className="block w-full h-full text-left cursor-not-allowed opacity-70"
                    >
                      {card}
                    </button>
                  )
                }
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3 & 4. INVENTORY HEALTH + RECENT ACTIVITY (two-column)
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

        {/* ── 3. Inventory Health ───────────────────────────────────────── */}
        <section aria-labelledby="inv-health-heading">
          <h2
            id="inv-health-heading"
            className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"
          >
            <MdLocalPharmacy size={16} className="text-secondary-600" aria-hidden="true" />
            Inventory Health
          </h2>

          {/* Health status grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {HEALTH_ITEMS.map(h => (
              <div
                key={h.label}
                className={`flex items-center gap-3 p-4 rounded-xl border ${h.color}`}
              >
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${h.dot}`}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${h.text} truncate`}>{h.label}</p>
                  <p className="text-[10px] text-slate-500">
                    {/* TODO: GET /api/v1/pharmacy/analytics/health */}
                    {h.count} medicine{h.count !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className={`text-2xl font-extrabold ${h.text} shrink-0`}>{h.count}</span>
              </div>
            ))}
          </div>

          {/* Low stock items preview */}
          {INVENTORY.filter(i => ['low','critical','out','expiring'].includes(i.status)).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-800">Attention Required</p>
                <Link
                  to={ROUTES.PHARMACY.INVENTORY}
                  className="text-xs font-medium text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-2">
                {INVENTORY
                  .filter(i => ['low','critical','out','expiring'].includes(i.status))
                  .slice(0, 5)
                  .map(item => {
                    const cfg = STATUS_CONFIG[item.status]
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0"
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${cfg.bg} shrink-0`}>
                          <MdMedication size={14} className={cfg.text} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.manufacturer}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-extrabold ${cfg.text}`}>{item.qty} units</p>
                          <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          )}
        </section>

        {/* ── 4. Recent Activity ───────────────────────────────────────── */}
        <section aria-labelledby="inv-activity-heading">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2
              id="inv-activity-heading"
              className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"
            >
              <HiOutlineCheckCircle size={16} className="text-success-600" aria-hidden="true" />
              Recent Activity
            </h2>

            {/* Timeline */}
            <ol aria-label="Recent inventory activity" className="relative">
              {RECENT_ACTIVITY.map((log, i) => {
                const Icon = log.icon
                return (
                  <li key={log.id} className="flex gap-3 pb-4 last:pb-0">
                    {/* Connector line */}
                    <div className="flex flex-col items-center shrink-0 w-9">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-full ${log.iconBg}`}>
                        <Icon size={15} className={log.iconColor} aria-hidden="true" />
                      </div>
                      {i < RECENT_ACTIVITY.length - 1 && (
                        <div className="w-0.5 flex-1 mt-1 bg-slate-100" aria-hidden="true" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-slate-800">{log.action}</p>
                        <Badge variant={STATUS_BADGE[log.status] ?? 'neutral'} size="sm">
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{log.detail}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{log.time}</p>
                    </div>
                  </li>
                )
              })}
            </ol>

            {/* TODO: GET /api/v1/pharmacy/activity — load more activity */}
            <p className="text-[10px] text-slate-400 text-center mt-3 border-t border-slate-100 pt-3">
              Placeholder data — live activity from backend coming soon.
            </p>
          </div>
        </section>
      </div>

    </article>
  )
}

export default InventoryDashboard
