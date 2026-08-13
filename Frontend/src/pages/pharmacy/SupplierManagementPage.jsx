/**
 * Component: SupplierManagementPage — Phase 8 Supplier Management Module
 *
 * Route: /pharmacy/suppliers  (ProtectedRoute → PharmacyLayout)
 *
 * Sections (tab-based):
 *   Dashboard  — Stats cards + recent deliveries
 *   Suppliers  — Supplier list table + Add/Edit/Delete/View modals
 *   Orders     — Supplier orders with View/Re-import/Mark Delivered
 *   History    — Full order history with search + filter + pagination
 *
 * ⚠ FRONTEND PLACEHOLDER ONLY — No backend, no APIs.
 * Future backend integration points:
 *   TODO: GET    /api/v1/pharmacy/suppliers               → Supplier CRUD API
 *   TODO: POST   /api/v1/pharmacy/suppliers               → Add supplier
 *   TODO: PUT    /api/v1/pharmacy/suppliers/:id           → Edit supplier
 *   TODO: DELETE /api/v1/pharmacy/suppliers/:id           → Delete supplier
 *   TODO: GET    /api/v1/pharmacy/suppliers/:id/orders    → Purchase Order API
 *   TODO: GET    /api/v1/pharmacy/orders                  → All orders (paginated)
 *   TODO: POST   /api/v1/pharmacy/orders/:id/deliver      → Mark Delivered
 *   TODO: GET    /api/v1/pharmacy/suppliers/analytics     → Supplier Analytics API
 *   TODO: POST   /api/v1/pharmacy/orders/:id/reimport-pdf → PDF Upload API
 *   TODO: PATCH  /api/v1/pharmacy/orders/:id/status       → Inventory Integration API
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineTruck, HiOutlinePlus, HiOutlineXMark,
  HiOutlineEye, HiOutlinePencil, HiOutlineTrash,
  HiOutlineMagnifyingGlass, HiOutlineCheckCircle,
  HiOutlineExclamationTriangle, HiOutlineDocumentArrowUp,
  HiOutlineCurrencyRupee, HiOutlinePhone, HiOutlineEnvelope,
  HiOutlineMapPin, HiOutlineArrowDownTray,
  HiOutlineBuildingOffice2,
} from 'react-icons/hi2'
import { MdLocalShipping, MdInventory2 } from 'react-icons/md'
import Badge  from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input  from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import { ROUTES } from '../../constants/routes'

// ── Placeholder supplier data ─────────────────────────────────────────────
// TODO: Replace with GET /api/v1/pharmacy/suppliers (Supplier CRUD API)
const SAMPLE_SUPPLIERS = [
  { id:'s1', name:'Ramesh Pharma Distributors', company:'Ramesh Pharma Pvt. Ltd.', contact:'Ramesh Kumar',   mobile:'9876543210', email:'ramesh@rpharma.in',    city:'Mumbai',   state:'Maharashtra', pin:'400001', gst:'27AABCR1234P1Z5', license:'MH-DL-2024-001', status:'active',   lastOrder:'02 Jul 2026', orders:14 },
  { id:'s2', name:'National Medicines Supply',  company:'NMS Pharma Co.',           contact:'Sunita Mehta',   mobile:'9123456789', email:'sunita@nmspharma.in',  city:'Pune',     state:'Maharashtra', pin:'411001', gst:'27AABCN5678P2Z6', license:'MH-DL-2024-002', status:'active',   lastOrder:'01 Jul 2026', orders:9  },
  { id:'s3', name:'Jan Aushadhi Wholesale',     company:'BPPI Distributor',         contact:'Anil Sharma',    mobile:'9000011111', email:'anil@janaushadhi.in',  city:'Delhi',    state:'Delhi',       pin:'110001', gst:'07AABCJ2345P3Z7', license:'DL-DL-2024-003', status:'active',   lastOrder:'28 Jun 2026', orders:22 },
  { id:'s4', name:'Sun Pharma Dealer',          company:'Sun Pharmaceuticals Ltd.', contact:'Priya Singh',    mobile:'9988776655', email:'priya@sunpharma.in',   city:'Mumbai',   state:'Maharashtra', pin:'400051', gst:'27AABCS6789P4Z8', license:'MH-DL-2024-004', status:'inactive', lastOrder:'15 Jun 2026', orders:3  },
  { id:'s5', name:'Cipla Direct Supply',        company:'Cipla Limited',            contact:'Kiran Joshi',    mobile:'9111222333', email:'kiran@cipladirect.in', city:'Goa',      state:'Goa',         pin:'403001', gst:'30AABCC3456P5Z9', license:'GA-DL-2024-005', status:'active',   lastOrder:'30 Jun 2026', orders:7  },
]

// ── Placeholder order data ────────────────────────────────────────────────
// TODO: Replace with GET /api/v1/pharmacy/orders (Purchase Order API)
const SAMPLE_ORDERS = [
  { id:'o1', orderNo:'PO-2026-0142', supplierId:'s1', supplier:'Ramesh Pharma',       orderDate:'02 Jul 2026', expected:'05 Jul 2026', status:'processing', medicines:[{name:'Paracetamol IP 500mg',qty:200},{name:'Cetirizine 10mg',qty:100}],  totalQty:300 },
  { id:'o2', orderNo:'PO-2026-0141', supplierId:'s3', supplier:'Jan Aushadhi Wholesale',orderDate:'01 Jul 2026', expected:'04 Jul 2026', status:'shipped',    medicines:[{name:'Metformin 500mg',qty:150},{name:'Ibuprofen 400mg',qty:100}],      totalQty:250 },
  { id:'o3', orderNo:'PO-2026-0140', supplierId:'s2', supplier:'National Medicines',  orderDate:'30 Jun 2026', expected:'03 Jul 2026', status:'pending',    medicines:[{name:'Azithromycin 500mg',qty:50}],                                     totalQty:50  },
  { id:'o4', orderNo:'PO-2026-0139', supplierId:'s5', supplier:'Cipla Direct',        orderDate:'28 Jun 2026', expected:'01 Jul 2026', status:'delivered',  medicines:[{name:'Vitamin D3 60000 IU',qty:80},{name:'Pantoprazole 40mg',qty:60}], totalQty:140 },
  { id:'o5', orderNo:'PO-2026-0138', supplierId:'s1', supplier:'Ramesh Pharma',       orderDate:'25 Jun 2026', expected:'28 Jun 2026', status:'delivered',  medicines:[{name:'Paracetamol Syrup',qty:120}],                                     totalQty:120 },
  { id:'o6', orderNo:'PO-2026-0137', supplierId:'s3', supplier:'Jan Aushadhi Wholesale',orderDate:'22 Jun 2026', expected:'25 Jun 2026', status:'cancelled',  medicines:[{name:'ORS Sachet',qty:200}],                                          totalQty:200 },
  { id:'o7', orderNo:'PO-2026-0136', supplierId:'s2', supplier:'National Medicines',  orderDate:'20 Jun 2026', expected:'23 Jun 2026', status:'delivered',  medicines:[{name:'Cetirizine 10mg',qty:150},{name:'Metformin 500mg',qty:100}],     totalQty:250 },
  { id:'o8', orderNo:'PO-2026-0135', supplierId:'s5', supplier:'Cipla Direct',        orderDate:'18 Jun 2026', expected:'21 Jun 2026', status:'delivered',  medicines:[{name:'Azithromycin 500mg',qty:80}],                                     totalQty:80  },
]

const ORDER_STATUS = {
  pending:    { variant:'warning',   label:'Pending'    },
  processing: { variant:'info',      label:'Processing' },
  shipped:    { variant:'primary',   label:'Shipped'    },
  delivered:  { variant:'success',   label:'Delivered'  },
  cancelled:  { variant:'danger',    label:'Cancelled'  },
}

const SUPPLIER_FILTERS = [
  { value:'',          label:'All Suppliers'    },
  { value:'active',    label:'Active'           },
  { value:'inactive',  label:'Inactive'         },
]

const ORDER_FILTERS = [
  { value:'',          label:'All Orders'   },
  { value:'pending',   label:'Pending'      },
  { value:'processing',label:'Processing'   },
  { value:'shipped',   label:'Shipped'      },
  { value:'delivered', label:'Delivered'    },
  { value:'cancelled', label:'Cancelled'    },
]

const TABS = [
  { id:'dashboard', label:'Dashboard',    icon: HiOutlineBuildingOffice2 },
  { id:'suppliers', label:'Suppliers',    icon: HiOutlineTruck },
  { id:'orders',    label:'Orders',       icon: MdLocalShipping },
  { id:'history',   label:'Order History',icon: MdInventory2 },
]

const BLANK_SUPPLIER = {
  name:'', company:'', contact:'', email:'', mobile:'',
  gst:'', license:'', address:'', city:'', state:'', pin:'', status:'active',
}

const PAGE_SIZE = 6

// ── Shared modal shell ────────────────────────────────────────────────────
function ModalShell({ title, onClose, size = 'lg', children }) {
  const w = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-2xl', xl:'max-w-3xl' }
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="sup-modal-title"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${w[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 id="sup-modal-title" className="text-base font-bold text-slate-900">{title}</h2>
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

// ── Add / Edit Supplier Modal ─────────────────────────────────────────────
function SupplierModal({ supplier, onSave, onClose }) {
  const isEdit = !!supplier
  const [form, setForm] = useState(isEdit ? { ...supplier } : { ...BLANK_SUPPLIER })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: POST /api/v1/pharmacy/suppliers  (add)
    // TODO: PUT  /api/v1/pharmacy/suppliers/:id  (edit)
    onSave(form)
  }

  const stateOptions = ['Maharashtra','Delhi','Gujarat','Karnataka','Tamil Nadu','Goa','Rajasthan','West Bengal'].map(s => ({ value: s, label: s }))
  const statusOptions = [{ value:'active', label:'Active' }, { value:'inactive', label:'Inactive' }]

  return (
    <ModalShell title={isEdit ? 'Edit Supplier' : 'Add Supplier'} onClose={onClose} size="xl">
      <form onSubmit={handleSubmit} noValidate>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Supplier Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input label="Supplier Name" required placeholder="Enter supplier name"
            value={form.name} onChange={e => set('name', e.target.value)} />
          <Input label="Company Name" required placeholder="Enter company name"
            value={form.company} onChange={e => set('company', e.target.value)} />
          <Input label="Contact Person" required placeholder="Enter contact person name"
            value={form.contact} onChange={e => set('contact', e.target.value)} />
          <Input label="Email Address" required type="email" placeholder="Enter email address"
            value={form.email} onChange={e => set('email', e.target.value)} />
          <Input label="Mobile Number" required type="tel" placeholder="Enter mobile number"
            value={form.mobile} onChange={e => set('mobile', e.target.value)} />
          <Input label="GST Number" required placeholder="Enter GST number"
            value={form.gst} onChange={e => set('gst', e.target.value)} />
          <Input label="Drug License Number" placeholder="Enter drug license number (optional)"
            value={form.license} onChange={e => set('license', e.target.value)} />
          <Select label="Status" required options={statusOptions}
            value={form.status} onChange={e => set('status', e.target.value)} />
        </div>

        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-t border-slate-100 pt-4">Address</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Complete Address" required placeholder="Enter complete address"
              value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <Input label="City" required placeholder="Enter your city"
            value={form.city} onChange={e => set('city', e.target.value)} />
          <Select label="State" required options={stateOptions} placeholder="Select your state"
            value={form.state} onChange={e => set('state', e.target.value)} />
          <Input label="PIN Code" required placeholder="Enter PIN code"
            value={form.pin} onChange={e => set('pin', e.target.value)} />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{isEdit ? 'Update Supplier' : 'Save Supplier'}</Button>
        </div>
      </form>
    </ModalShell>
  )
}

// ── Supplier Details Dialog ───────────────────────────────────────────────
function SupplierDetailsDialog({ supplier, onClose }) {
  return (
    <ModalShell title="Supplier Details" onClose={onClose} size="md">
      <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 shrink-0">
          <HiOutlineBuildingOffice2 size={22} className="text-primary-700" aria-hidden="true" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900">{supplier.name}</p>
          <p className="text-xs text-slate-500">{supplier.company}</p>
          <Badge variant={supplier.status === 'active' ? 'success' : 'neutral'} size="sm" dot className="mt-1">
            {supplier.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div className="space-y-0">
        {[
          ['Contact Person', supplier.contact],
          ['Mobile Number',  supplier.mobile],
          ['Email Address',  supplier.email],
          ['GST Number',     supplier.gst],
          ['Drug License',   supplier.license || '—'],
          ['Address',        `${supplier.city}, ${supplier.state} – ${supplier.pin}`],
          ['Total Orders',   `${supplier.orders} orders (placeholder)`],
          ['Last Order',     supplier.lastOrder],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between py-2.5 text-xs border-b border-slate-50 last:border-0">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="text-slate-900 font-semibold text-right max-w-[55%]">{val}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-3">TODO: GET /api/v1/pharmacy/suppliers/:id (Supplier CRUD API)</p>
      <div className="flex justify-end mt-5 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onClose}>Close</Button>
      </div>
    </ModalShell>
  )
}

// ── Order Details Dialog ──────────────────────────────────────────────────
function OrderDetailsDialog({ order, onClose }) {
  const sc = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending
  return (
    <ModalShell title="Order Details" onClose={onClose} size="md">
      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        {[
          ['Order Number', order.orderNo],
          ['Supplier',     order.supplier],
          ['Order Date',   order.orderDate],
          ['Expected',     order.expected],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-slate-400 font-medium">{k}</p>
            <p className="text-slate-900 font-semibold mt-0.5">{v}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500">Status:</span>
        <Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge>
      </div>

      <p className="text-xs font-bold text-slate-700 mb-2">Medicines ({order.medicines.length})</p>
      <div className="bg-slate-50 rounded-xl overflow-hidden mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-3 py-2 text-slate-500 font-semibold">Medicine</th>
              <th className="text-right px-3 py-2 text-slate-500 font-semibold">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {order.medicines.map((m, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 font-semibold text-slate-800">{m.name}</td>
                <td className="px-3 py-2 text-right font-bold text-slate-900">{m.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-1">
        <span>Total Quantity</span>
        <span>{order.totalQty} units</span>
      </div>
      <p className="text-[10px] text-slate-400 mt-3">TODO: GET /api/v1/pharmacy/orders/:id (Purchase Order API)</p>

      <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
        {/* TODO: GET /api/v1/pharmacy/orders/:id/pdf (PDF Upload API) */}
        <button type="button" disabled aria-disabled="true" title="Download — backend pending"
          className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl border border-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed">
          <HiOutlineArrowDownTray size={13} /> Download PDF
        </button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-xs">Close</Button>
      </div>
    </ModalShell>
  )
}

// ── Mobile Supplier Card ──────────────────────────────────────────────────
function SupplierMobileCard({ s, onView, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-900">{s.name}</p>
          <p className="text-xs text-slate-500">{s.company}</p>
        </div>
        <Badge variant={s.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
          {s.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-500"><HiOutlinePhone size={12}/>{s.mobile}</div>
        <div className="flex items-center gap-1 text-slate-500"><HiOutlineMapPin size={12}/>{s.city}</div>
      </div>
      <div className="flex gap-1.5 pt-1">
        <button type="button" onClick={() => onView(s)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-primary-200 bg-primary-50 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors">
          <HiOutlineEye size={13}/> View
        </button>
        <button type="button" onClick={() => onEdit(s)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-secondary-200 bg-secondary-50 text-xs font-semibold text-secondary-700 hover:bg-secondary-100 transition-colors">
          <HiOutlinePencil size={13}/> Edit
        </button>
        <button type="button" onClick={() => onDelete(s)} className="py-1.5 px-2 rounded-lg border border-danger-200 bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors">
          <HiOutlineTrash size={13}/>
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB PANELS
// ══════════════════════════════════════════════════════════════════════════

// 1. Dashboard
function DashboardTab() {
  const total     = SAMPLE_SUPPLIERS.length
  const active    = SAMPLE_SUPPLIERS.filter(s => s.status === 'active').length
  const pending   = SAMPLE_ORDERS.filter(o => ['pending','processing'].includes(o.status)).length
  const delivered = SAMPLE_ORDERS.filter(o => o.status === 'delivered').length

  const statCards = [
    { label:'Total Suppliers',    value: total,     icon: HiOutlineBuildingOffice2, color:'text-primary-600',   bg:'bg-primary-50'   },
    { label:'Active Suppliers',   value: active,    icon: HiOutlineCheckCircle,     color:'text-success-600',   bg:'bg-success-50'   },
    { label:'Pending Orders',     value: pending,   icon: HiOutlineExclamationTriangle,color:'text-warning-600',bg:'bg-warning-50'   },
    { label:'Delivered Orders',   value: delivered, icon: MdLocalShipping,          color:'text-secondary-600', bg:'bg-secondary-50' },
    { label:'Total Purchase',     value:'₹ —',      icon: HiOutlineCurrencyRupee,   color:'text-accent-600',    bg:'bg-accent-50',   },
    { label:'Recent Deliveries',  value: delivered, icon: HiOutlineTruck,           color:'text-info-600',      bg:'bg-info-50'      },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* TODO: GET /api/v1/pharmacy/suppliers/analytics (Supplier Analytics API) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="flex flex-col gap-2 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${s.bg}`}>
              <s.icon size={20} className={s.color} aria-hidden="true" />
            </div>
            <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-xs font-semibold text-slate-600 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent deliveries */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <MdLocalShipping size={16} className="text-secondary-600" aria-hidden="true" />
          Recent Deliveries
        </p>
        <div className="space-y-2">
          {SAMPLE_ORDERS.filter(o => o.status === 'delivered').slice(0,4).map(o => (
            <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-xs font-semibold text-slate-800">{o.orderNo} · {o.supplier}</p>
                <p className="text-[10px] text-slate-400">{o.orderDate} · {o.totalQty} units</p>
              </div>
              <Badge variant="success" size="sm" dot>Delivered</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 2. Supplier List
function SuppliersTab() {
  const [suppliers,  setSuppliers]  = useState(SAMPLE_SUPPLIERS)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('')
  const [modal,      setModal]      = useState(null)

  const filtered = useMemo(() => {
    let data = [...suppliers]
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.mobile.includes(q)
      )
    }
    if (filter) data = data.filter(s => s.status === filter)
    return data
  }, [suppliers, search, filter])

  function handleSave(form) {
    if (modal.item) {
      setSuppliers(p => p.map(s => s.id === modal.item.id ? { ...s, ...form } : s))
    } else {
      setSuppliers(p => [{ ...form, id:`s${Date.now()}`, orders:0, lastOrder:'—' }, ...p])
    }
    setModal(null)
  }

  function handleDelete(id) {
    // TODO: DELETE /api/v1/pharmacy/suppliers/:id (Supplier CRUD API)
    setSuppliers(p => p.filter(s => s.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by supplier name, company, city or mobile…"
            aria-label="Search suppliers"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 placeholder:opacity-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter by status"
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:border-primary-500 outline-none transition">
          {SUPPLIER_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <button type="button" onClick={() => setModal({ type:'add' })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shrink-0">
          <HiOutlinePlus size={15} aria-hidden="true" /> Add Supplier
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100">
            <HiOutlineTruck size={26} className="text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">No suppliers available</p>
            <p className="text-xs text-slate-400 mt-1">Start by adding your first supplier.</p>
          </div>
          <button type="button" onClick={() => setModal({ type:'add' })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">
            <HiOutlinePlus size={16} aria-hidden="true" /> Add Supplier
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base" aria-label="Supplier list">
                <thead>
                  <tr>
                    <th scope="col">Supplier Name</th>
                    <th scope="col" className="hidden lg:table-cell">Company</th>
                    <th scope="col" className="hidden md:table-cell">Contact Person</th>
                    <th scope="col">Mobile</th>
                    <th scope="col" className="hidden lg:table-cell">Email</th>
                    <th scope="col" className="hidden md:table-cell">City</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td className="font-semibold text-slate-900 text-xs">{s.name}</td>
                      <td className="hidden lg:table-cell text-xs text-slate-500 truncate max-w-[140px]">{s.company}</td>
                      <td className="hidden md:table-cell text-xs text-slate-500">{s.contact}</td>
                      <td className="text-xs text-slate-600 font-mono">{s.mobile}</td>
                      <td className="hidden lg:table-cell text-xs text-slate-500 truncate max-w-[140px]">{s.email}</td>
                      <td className="hidden md:table-cell text-xs text-slate-500">{s.city}</td>
                      <td><Badge variant={s.status === 'active' ? 'success' : 'neutral'} size="sm" dot>{s.status === 'active' ? 'Active' : 'Inactive'}</Badge></td>
                      <td>
                        <div className="flex items-center gap-0.5">
                          <button type="button" onClick={() => setModal({ type:'view', item:s })} aria-label={`View ${s.name}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500">
                            <HiOutlineEye size={14} aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => setModal({ type:'edit', item:s })} aria-label={`Edit ${s.name}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-secondary-600 hover:bg-secondary-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary-500">
                            <HiOutlinePencil size={14} aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => handleDelete(s.id)} aria-label={`Delete ${s.name}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger-400">
                            <HiOutlineTrash size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Mobile cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {filtered.map(s => (
              <SupplierMobileCard key={s.id} s={s}
                onView={item => setModal({ type:'view', item })}
                onEdit={item => setModal({ type:'edit', item })}
                onDelete={() => handleDelete(s.id)} />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {modal?.type === 'add'  && <SupplierModal    supplier={null}       onSave={handleSave}       onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <SupplierModal    supplier={modal.item} onSave={handleSave}       onClose={() => setModal(null)} />}
      {modal?.type === 'view' && <SupplierDetailsDialog supplier={modal.item} onClose={() => setModal(null)} />}
    </div>
  )
}

// 3. Orders (current)
function OrdersTab() {
  const [viewOrder, setViewOrder] = useState(null)
  const activeOrders = SAMPLE_ORDERS.filter(o => !['delivered','cancelled'].includes(o.status))

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-400">
        {activeOrders.length} active orders · TODO: GET /api/v1/pharmacy/orders (Purchase Order API)
      </p>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base" aria-label="Supplier orders">
            <thead>
              <tr>
                <th scope="col">Order Number</th>
                <th scope="col">Supplier</th>
                <th scope="col" className="hidden md:table-cell">Order Date</th>
                <th scope="col" className="hidden lg:table-cell">Expected</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ORDERS.map(o => {
                const sc = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending
                return (
                  <tr key={o.id}>
                    <td className="font-mono text-xs font-semibold text-slate-800">{o.orderNo}</td>
                    <td className="text-xs font-medium text-slate-700">{o.supplier}</td>
                    <td className="hidden md:table-cell text-xs text-slate-500">{o.orderDate}</td>
                    <td className="hidden lg:table-cell text-xs text-slate-500">{o.expected}</td>
                    <td><Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setViewOrder(o)} aria-label={`View ${o.orderNo}`}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-primary-50 border border-primary-200 text-primary-700 hover:bg-primary-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500">
                          <HiOutlineEye size={12}/> View
                        </button>
                        {/* Re-import PDF → existing Import Stock page (no duplication) */}
                        <Link to={ROUTES.PHARMACY.IMPORT_STOCK} aria-label="Re-import PDF for this order"
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-secondary-50 border border-secondary-200 text-secondary-700 hover:bg-secondary-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary-500">
                          <HiOutlineDocumentArrowUp size={12}/> Re-import PDF
                        </Link>
                        {/* TODO: PATCH /api/v1/pharmacy/orders/:id/status → Inventory Integration API */}
                        {o.status !== 'delivered' && o.status !== 'cancelled' && (
                          <button type="button" disabled aria-disabled="true" title="Mark Delivered — backend pending"
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed">
                            <HiOutlineCheckCircle size={12}/> Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {viewOrder && <OrderDetailsDialog order={viewOrder} onClose={() => setViewOrder(null)} />}
    </div>
  )
}

// 4. Order History
function HistoryTab() {
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('')
  const [page,    setPage]    = useState(1)
  const [viewOrder, setViewOrder] = useState(null)

  const filtered = useMemo(() => {
    let data = [...SAMPLE_ORDERS]
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(o =>
        o.orderNo.toLowerCase().includes(q) ||
        o.supplier.toLowerCase().includes(q) ||
        o.medicines.some(m => m.name.toLowerCase().includes(q))
      )
    }
    if (filter) data = data.filter(o => o.status === filter)
    return data
  }, [search, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      {/* TODO: GET /api/v1/pharmacy/orders?page=&status=&search= (Purchase Order API) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search order number, supplier or medicine…"
            aria-label="Search order history"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 placeholder:opacity-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }} aria-label="Filter by order status"
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:border-primary-500 outline-none transition">
          {ORDER_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base" aria-label="Order history">
            <thead>
              <tr>
                <th scope="col">Order No.</th>
                <th scope="col">Supplier</th>
                <th scope="col" className="hidden md:table-cell">Date</th>
                <th scope="col" className="hidden lg:table-cell">Medicines</th>
                <th scope="col">Total Qty</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-slate-400">No orders match your search or filter.</td></tr>
              ) : paged.map(o => {
                const sc = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending
                return (
                  <tr key={o.id}>
                    <td className="font-mono text-xs font-semibold text-slate-800">{o.orderNo}</td>
                    <td className="text-xs text-slate-700">{o.supplier}</td>
                    <td className="hidden md:table-cell text-xs text-slate-500">{o.orderDate}</td>
                    <td className="hidden lg:table-cell text-xs text-slate-500">{o.medicines.map(m=>m.name).join(', ').slice(0,40)}…</td>
                    <td className="text-xs font-bold text-slate-900">{o.totalQty}</td>
                    <td><Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge></td>
                    <td>
                      <button type="button" onClick={() => setViewOrder(o)} aria-label={`View ${o.orderNo}`}
                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-primary-50 border border-primary-200 text-primary-700 hover:bg-primary-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500">
                        <HiOutlineEye size={12}/> View
                      </button>
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
              <button key={i} type="button" onClick={() => setPage(i+1)}
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
      {viewOrder && <OrderDetailsDialog order={viewOrder} onClose={() => setViewOrder(null)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
function SupplierManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const PANELS = {
    dashboard: <DashboardTab />,
    suppliers: <SuppliersTab />,
    orders:    <OrdersTab />,
    history:   <HistoryTab />,
  }

  return (
    <article aria-label="Supplier Management" className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <HiOutlineTruck size={22} className="text-primary-600" aria-hidden="true" />
          Supplier Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage medicine suppliers and track purchase orders.
        </p>
      </div>

      {/* Tab navigation */}
      <nav aria-label="Supplier management sections">
        <div className="flex gap-1 flex-wrap">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
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

export default SupplierManagementPage
