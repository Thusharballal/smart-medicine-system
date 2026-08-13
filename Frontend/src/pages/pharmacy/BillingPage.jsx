import {useState,useMemo,useRef,useCallback,useEffect,} from 'react'
import {
  HiOutlineReceiptRefund,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlinePrinter,
  HiOutlineInformationCircle,
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlinePhone,
} from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/forms/Input'
import batchService from '../../services/batchService'
import medicineService from '../../services/medicineService'
/* -------------------------------------------------------------------------- */
/* Success Dialog                                                             */
/* -------------------------------------------------------------------------- */
function SuccessDialog({
  bill,
  onClose,
  onNewBill,
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bill-success-title"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center gap-5 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success-100">
          <HiOutlineCheckCircle
            size={32}
            className="text-success-600"
            aria-hidden="true"
          />
        </div>
        <div>
          <h2
            id="bill-success-title"
            className="text-lg font-extrabold text-slate-900"
          >
            Bill Generated Successfully!
          </h2>

          {bill.customer_name && (
            <p className="text-sm text-slate-500 mt-1">
              For{' '}
              <span className="font-semibold">
                {bill.customer_name}
              </span>
            </p>
          )}
          <p className="text-2xl font-extrabold text-primary-700 mt-2">
            ₹ {Number(bill.total_amount).toFixed(2)}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {bill.bill_number}
          </p>
        </div>
        <div className="w-full bg-success-50 rounded-xl px-5 py-4 space-y-2 text-left">
          <p className="text-xs font-semibold text-success-700">
            ✓ Bill created successfully
          </p>
          <p className="text-xs font-semibold text-success-700">
            ✓ Inventory stock updated
          </p>
          <p className="text-xs font-semibold text-success-700">
            ✓ Inventory movement recorded
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Payment status: {bill.payment_status}
          </p>
        </div>
        <div className="w-full bg-slate-50 rounded-xl p-4 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">
              Subtotal
            </span>
            <span className="font-semibold text-slate-800">
              ₹ {Number(bill.subtotal).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">
              GST ({Number(bill.gst_percentage ?? 0).toFixed(2)}%)
            </span>
            <span className="font-semibold text-slate-800">
              ₹ {Number(bill.tax).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">
              Discount
            </span>
            <span className="font-semibold text-success-600">
              - ₹ {Number(bill.discount).toFixed(2)}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between">
            <span className="text-sm font-bold text-slate-900">
              Total
            </span>
            <span className="text-sm font-extrabold text-primary-700">
              ₹ {Number(bill.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 italic">
          PDF generation and printing can be connected to the invoice API next.
        </p>
        <div className="flex flex-col gap-2 w-full">
          <Button
            variant="primary"
            fullWidth
            onClick={onNewBill}
          >
            New Bill
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )

/* -------------------------------------------------------------------------- */
/* Mobile Cart Card                                                          */
/* -------------------------------------------------------------------------- */
function CartCardMobile({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">

      <div className="flex items-start justify-between gap-2">

        <div className="flex items-center gap-2 min-w-0">

          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary-50 shrink-0">
            <MdMedication
              size={16}
              className="text-secondary-600"
              aria-hidden="true"
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

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          className="p-1.5 rounded-lg text-slate-300 hover:text-danger-500 hover:bg-danger-50 transition-colors shrink-0"
        >
          <HiOutlineTrash
            size={14}
            aria-hidden="true"
          />
        </button>

      </div>

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 border border-slate-200 rounded-lg overflow-hidden">

          <button
            type="button"
            onClick={() => onDecrease(item.id)}
            aria-label="Decrease quantity"
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-bold"
          >
            <HiOutlineMinus size={11} />
          </button>

          <span className="px-3 text-sm font-bold text-slate-900 min-w-[2rem] text-center">
            {item.qty}
          </span>

          <button
            type="button"
            onClick={() => onIncrease(item.id)}
            aria-label="Increase quantity"
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-bold"
          >
            <HiOutlinePlus size={11} />
          </button>

        </div>

        <div className="text-right">

          <p className="text-[11px] text-slate-400">
            ₹{item.price} × {item.qty}
          </p>

          <p className="text-sm font-extrabold text-slate-900">
            ₹{(item.price * item.qty).toFixed(2)}
          </p>

        </div>

      </div>

    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* MAIN PAGE                                                                  */
/* -------------------------------------------------------------------------- */

function BillingPage() {

  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const [medicines, setMedicines] = useState([])
  const [batches, setBatches] = useState([])

  const [cart, setCart] = useState([])

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const [gstPercentage, setGstPercentage] = useState(5)
  const [discount, setDiscount] = useState(0)

  const [paymentMethod, setPaymentMethod] = useState('CASH')

  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const [error, setError] = useState('')

  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedBill, setGeneratedBill] = useState(null)

  const searchRef = useRef(null)

  /* ------------------------------------------------------------------------ */
  /* Load medicines and batches                                               */
  /* ------------------------------------------------------------------------ */

  const loadBillingData = useCallback(async () => {

    try {

      setIsLoading(true)
      setError('')

      const [
        medicineResponse,
        batchResponse,
      ] = await Promise.all([
        medicineService.getAll(),
        batchService.getAll(),
      ])

      const medicineData = Array.isArray(medicineResponse.data)
        ? medicineResponse.data
        : []

      const batchData = Array.isArray(batchResponse.data)
        ? batchResponse.data
        : []

      setMedicines(medicineData)
      setBatches(batchData)

    } catch (err) {

      console.error(
        'Failed to load billing data:',
        err
      )

      setError(
        err?.response?.data?.detail ||
        'Unable to load medicines and inventory.'
      )

    } finally {

      setIsLoading(false)

    }

  }, [])

  useEffect(() => {
    loadBillingData()
  }, [loadBillingData])

  /* ------------------------------------------------------------------------ */
  /* Build medicine inventory information                                     */
  /* ------------------------------------------------------------------------ */

  const medicineCatalogue = useMemo(() => {

    return medicines
      .map((medicine) => {

        const medicineId =
          medicine.id ||
          medicine._id

        const medicineBatches = batches.filter(
          (batch) =>
            String(batch.medicine_id) ===
            String(medicineId) &&
            batch.is_archived !== true
        )

        const availableStock =
          medicineBatches.reduce(
            (total, batch) =>
              total +
              Number(
                batch.available_quantity || 0
              ),
            0
          )

        const activeBatches =
          medicineBatches.filter(
            (batch) =>
              Number(
                batch.available_quantity || 0
              ) > 0
          )

        /*
         * Display the earliest-expiring active batch.
         * The backend performs the authoritative FEFO
         * selection during bill creation.
         */

        const sortedBatches =
          [...activeBatches].sort(
            (a, b) =>
              new Date(a.expiry_date) -
              new Date(b.expiry_date)
          )

        const selectedBatch =
          sortedBatches[0]

        return {
          id: medicineId,
          name:
            medicine.jan_aushadhi_name ||
            medicine.generic_name ||
            medicine.name ||
            'Unknown Medicine',

          genericName:
            medicine.generic_name ||
            medicine.composition ||
            '',

          composition:
            medicine.composition || '',

          category:
            medicine.category || '',

          price:
            Number(
              selectedBatch?.mrp ??
              medicine.jan_aushadhi_price ??
              medicine.branded_price ??
              0
            ),

          stock: availableStock,

          batchId:
            selectedBatch
              ? String(
                  selectedBatch._id ||
                  selectedBatch.id
                )
              : null,

          batchNumber:
            selectedBatch?.batch_number || '',

          expiryDate:
            selectedBatch?.expiry_date || null,
        }
      })
      .filter(
        (medicine) =>
          medicine.stock > 0
      )

  }, [medicines, batches])

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  const suggestions = useMemo(() => {

    if (!query.trim()) {
      return []
    }

    const q =
      query.trim().toLowerCase()

    return medicineCatalogue
      .filter((medicine) =>
        medicine.name
          .toLowerCase()
          .includes(q) ||
        medicine.genericName
          .toLowerCase()
          .includes(q) ||
        medicine.composition
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 8)

  }, [
    query,
    medicineCatalogue,
  ])

  /* ------------------------------------------------------------------------ */
  /* Cart operations                                                          */
  /* ------------------------------------------------------------------------ */

  const addToCart = useCallback(
    (medicine) => {

      setCart((previousCart) => {

        const existing =
          previousCart.find(
            (item) =>
              item.id === medicine.id
          )

        if (existing) {

          if (
            existing.qty >=
            medicine.stock
          ) {
            return previousCart
          }

          return previousCart.map(
            (item) =>
              item.id === medicine.id
                ? {
                    ...item,
                    qty: item.qty + 1,
                  }
                : item
          )
        }

        return [
          ...previousCart,
          {
            ...medicine,
            qty: 1,
          },
        ]

      })

      setQuery('')
      setShowDropdown(false)

      searchRef.current?.focus()

    },
    []
  )

  const increase = useCallback(
    (id) => {

      setCart((previousCart) =>
        previousCart.map((item) => {

          if (item.id !== id) {
            return item
          }

          if (
            item.qty >=
            item.stock
          ) {
            return item
          }

          return {
            ...item,
            qty: item.qty + 1,
          }

        })
      )

    },
    []
  )

  const decrease = useCallback(
    (id) => {

      setCart((previousCart) => {

        const item =
          previousCart.find(
            (cartItem) =>
              cartItem.id === id
          )

        if (!item) {
          return previousCart
        }

        if (item.qty <= 1) {
          return previousCart.filter(
            (cartItem) =>
              cartItem.id !== id
          )
        }

        return previousCart.map(
          (cartItem) =>
            cartItem.id === id
              ? {
                  ...cartItem,
                  qty: cartItem.qty - 1,
                }
              : cartItem
        )

      })

    },
    []
  )

  const remove = useCallback(
    (id) => {

      setCart((previousCart) =>
        previousCart.filter(
          (item) =>
            item.id !== id
        )
      )

    },
    []
  )

  /* ------------------------------------------------------------------------ */
  /* Calculations                                                             */
  /* ------------------------------------------------------------------------ */

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            Number(item.qty),
        0
      ),
    [cart]
  )

  const gstAmount = useMemo(
    () =>
      subtotal *
      Number(gstPercentage || 0) /
      100,
    [
      subtotal,
      gstPercentage,
    ]
  )

  const discountAmount = useMemo(
    () =>
      Math.min(
        Number(discount || 0),
        subtotal + gstAmount
      ),
    [
      discount,
      subtotal,
      gstAmount,
    ]
  )

  const grandTotal = useMemo(
    () =>
      subtotal +
      gstAmount -
      discountAmount,
    [
      subtotal,
      gstAmount,
      discountAmount,
    ]
  )

  /* ------------------------------------------------------------------------ */
  /* Generate Bill                                                            */
  /* ------------------------------------------------------------------------ */

  async function handleGenerateBill() {

    if (cart.length === 0) {
      return
    }

    setError('')

    if (
      gstPercentage < 0 ||
      gstPercentage > 100
    ) {
      setError(
        'GST percentage must be between 0 and 100.'
      )

      return
    }

    if (discount < 0) {
      setError(
        'Discount cannot be negative.'
      )

      return
    }

    try {

      setIsGenerating(true)

      const payload = {
        customer_name:
          customerName.trim() ||
          null,

        customer_phone:
          customerPhone.trim() ||
          null,

        payment_method:
          paymentMethod,

        discount:
          Number(discount || 0),

        gst_percentage:
          Number(gstPercentage || 0),

        items:
          cart.map((item) => ({
            medicine_id:
              String(item.id),

            quantity:
              Number(item.qty),
          })),
      }

      console.log(
        'Creating bill:',
        payload
      )

      /*
       * Backend performs:
       * - Medicine validation
       * - FEFO batch selection
       * - Stock validation
       * - Price calculation
       * - GST calculation
       * - Bill creation
       * - Stock deduction
       * - Inventory movement
       */

      const response =
        await fetchBilling(payload)

      const bill =
        response.data

      setGeneratedBill(bill)
      setShowSuccess(true)

    } catch (err) {

      console.error(
        'Failed to generate bill:',
        err
      )

      const detail =
        err?.response?.data?.detail

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item) =>
                item.msg ||
                'Validation error'
            )
            .join(', ')
        )
      } else {
        setError(
          detail ||
          'Unable to generate bill.'
        )
      }

    } finally {

      setIsGenerating(false)

    }
  }

  /* ------------------------------------------------------------------------ */
  /* New Bill                                                                 */
  /* ------------------------------------------------------------------------ */

  function handleNewBill() {

    setCart([])

    setCustomerName('')
    setCustomerPhone('')

    setGstPercentage(5)
    setDiscount(0)

    setPaymentMethod('CASH')

    setGeneratedBill(null)
    setShowSuccess(false)
    setError('')

    searchRef.current?.focus()
  }

  /* ------------------------------------------------------------------------ */
  /* Loading state                                                            */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {

    return (
      <article className="flex flex-col gap-5">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">

          <p className="text-sm font-semibold text-slate-600">
            Loading billing inventory...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Fetching medicines and available stock.
          </p>

        </div>

      </article>
    )
  }

  /* ------------------------------------------------------------------------ */
  /* Page                                                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <article
      aria-label="Billing System"
      className="flex flex-col gap-5"
    >

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div>

          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">

            <HiOutlineReceiptRefund
              size={22}
              className="text-primary-600"
              aria-hidden="true"
            />

            Billing System

          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Generate customer bills using your pharmacy inventory.
          </p>

        </div>

        {cart.length > 0 && (
          <Badge
            variant="primary"
            size="md"
            dot
          >
            {cart.length}{' '}
            {cart.length === 1
              ? 'medicine'
              : 'medicines'}{' '}
            in cart
          </Badge>
        )}

      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-danger-50 border border-danger-100">

          <HiOutlineInformationCircle
            size={16}
            className="text-danger-600 shrink-0 mt-0.5"
          />

          <div className="flex-1">

            <p className="text-xs font-semibold text-danger-700">
              Billing Error
            </p>

            <p className="text-xs text-danger-600 mt-0.5">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setError('')}
            className="text-danger-400 hover:text-danger-600"
          >
            <HiOutlineXMark size={16} />
          </button>

        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

        {/* ---------------------------------------------------------------- */}
        {/* LEFT COLUMN                                                       */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex flex-col gap-5">

          {/* Medicine Search */}
          <section
            aria-labelledby="search-heading"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >

            <h2
              id="search-heading"
              className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"
            >

              <HiOutlineMagnifyingGlass
                size={15}
                className="text-primary-600"
              />

              Search Medicine

            </h2>

            <div className="relative">

              <div className="relative">

                <HiOutlineMagnifyingGlass
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(
                      event.target.value
                    )
                    setShowDropdown(true)
                  }}
                  onFocus={() =>
                    query &&
                    setShowDropdown(true)
                  }
                  onBlur={() =>
                    setTimeout(
                      () =>
                        setShowDropdown(false),
                      150
                    )
                  }
                  placeholder="Search medicine..."
                  aria-label="Search medicines to add to bill"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setShowDropdown(false)
                    }}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <HiOutlineXMark size={15} />
                  </button>
                )}

              </div>

              {/* Suggestions */}
              {showDropdown &&
                suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden max-h-72 overflow-y-auto">

                    {suggestions.map(
                      (medicine) => (
                        <button
                          key={medicine.id}
                          type="button"
                          onMouseDown={() =>
                            addToCart(
                              medicine
                            )
                          }
                          className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-slate-50 last:border-0"
                        >

                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-50 shrink-0">

                            <MdMedication
                              size={15}
                              className="text-secondary-600"
                            />

                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {medicine.name}
                            </p>

                            <p className="text-xs text-slate-500 truncate">
                              {medicine.genericName}
                              {medicine.category
                                ? ` · ${medicine.category}`
                                : ''}
                            </p>

                          </div>

                          <div className="text-right shrink-0">

                            <p className="text-sm font-bold text-primary-700">
                              ₹{medicine.price.toFixed(2)}
                            </p>

                            <Badge
                              variant="success"
                              size="sm"
                            >
                              {medicine.stock} in stock
                            </Badge>

                          </div>

                        </button>
                      )
                    )}

                  </div>
                )}

              {showDropdown &&
                query &&
                suggestions.length === 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">

                    <p className="text-sm text-slate-400">
                      No available medicines found for "
                      {query}"
                    </p>

                  </div>
                )}

            </div>

          </section>

          {/* Cart */}
          <section
            aria-labelledby="cart-heading"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

              <h2
                id="cart-heading"
                className="text-sm font-bold text-slate-900 flex items-center gap-2"
              >

                <HiOutlineShoppingCart
                  size={15}
                  className="text-primary-600"
                />

                Cart

              </h2>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setCart([])
                  }
                  className="text-xs text-danger-500 hover:text-danger-700 font-medium"
                >
                  Clear All
                </button>
              )}

            </div>

            {cart.length === 0 ? (

              <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-5">

                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100">

                  <HiOutlineShoppingCart
                    size={26}
                    className="text-slate-300"
                  />

                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-600">
                    No medicines added
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Search medicines above to begin billing.
                  </p>

                </div>

              </div>

            ) : (

              <>

                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">

                  <table
                    className="table-base"
                    role="grid"
                    aria-label="Bill cart"
                  >

                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Remove</th>
                      </tr>
                    </thead>

                    <tbody>

                      {cart.map(
                        (item) => (
                          <tr key={item.id}>

                            <td>

                              <div className="flex items-center gap-2">

                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary-50 shrink-0">

                                  <MdMedication
                                    size={13}
                                    className="text-secondary-600"
                                  />

                                </div>

                                <div>

                                  <p className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">
                                    {item.name}
                                  </p>

                                  <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                    {item.genericName}
                                  </p>

                                </div>

                              </div>

                            </td>

                            <td className="text-xs font-medium text-slate-700">
                              ₹{item.price.toFixed(2)}
                            </td>

                            <td>

                              <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden w-fit">

                                <button
                                  type="button"
                                  onClick={() =>
                                    decrease(
                                      item.id
                                    )
                                  }
                                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-50"
                                >
                                  <HiOutlineMinus
                                    size={11}
                                  />
                                </button>

                                <span className="px-3 text-xs font-bold text-slate-900 min-w-[2rem] text-center">
                                  {item.qty}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    increase(
                                      item.id
                                    )
                                  }
                                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-50"
                                >
                                  <HiOutlinePlus
                                    size={11}
                                  />
                                </button>

                              </div>

                            </td>

                            <td className="text-xs font-extrabold text-slate-900">
                              ₹
                              {(
                                item.price *
                                item.qty
                              ).toFixed(2)}
                            </td>

                            <td>

                              <button
                                type="button"
                                onClick={() =>
                                  remove(
                                    item.id
                                  )
                                }
                                className="p-1.5 rounded-lg text-slate-300 hover:text-danger-500 hover:bg-danger-50"
                              >
                                <HiOutlineTrash
                                  size={14}
                                />
                              </button>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {/* Mobile */}
                <div className="sm:hidden flex flex-col gap-3 p-4">

                  {cart.map(
                    (item) => (
                      <CartCardMobile
                        key={item.id}
                        item={item}
                        onIncrease={
                          increase
                        }
                        onDecrease={
                          decrease
                        }
                        onRemove={
                          remove
                        }
                      />
                    )
                  )}

                </div>

              </>

            )}

          </section>

        </div>

        {/* ---------------------------------------------------------------- */}
        {/* RIGHT COLUMN                                                     */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex flex-col gap-5 lg:sticky lg:top-16">

          {/* Customer */}
          <section
            aria-labelledby="customer-heading"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >

            <h2
              id="customer-heading"
              className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"
            >

              <HiOutlineUser
                size={15}
                className="text-primary-600"
              />

              Customer Information

              <span className="ml-auto text-[10px] font-normal text-slate-400">
                Optional
              </span>

            </h2>

            <div className="space-y-3">

              <Input
                label="Customer Name"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(
                    event.target.value
                  )
                }
                leftIcon={
                  <HiOutlineUser size={15} />
                }
              />

              <Input
                label="Mobile Number"
                type="tel"
                placeholder="Enter mobile number"
                value={customerPhone}
                onChange={(event) =>
                  setCustomerPhone(
                    event.target.value
                  )
                }
                leftIcon={
                  <HiOutlinePhone size={15} />
                }
              />

            </div>

          </section>

          {/* Payment */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">

            <h2 className="text-sm font-bold text-slate-900 mb-4">
              Payment Method
            </h2>

            <select
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(
                  event.target.value
                )
              }
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            >
              <option value="CASH">
                Cash
              </option>

              <option value="CARD">
                Card
              </option>

              <option value="UPI">
                UPI
              </option>
            </select>

          </section>

          {/* Bill Summary */}
          <section
            aria-labelledby="summary-heading"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >

            <h2
              id="summary-heading"
              className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"
            >

              <HiOutlineReceiptRefund
                size={15}
                className="text-primary-600"
              />

              Bill Summary

            </h2>

            <div className="space-y-3">

              {/* Subtotal */}
              <div className="flex justify-between text-slate-600 text-sm">

                <span>
                  Subtotal
                </span>

                <span className="font-semibold text-slate-900">
                  ₹ {subtotal.toFixed(2)}
                </span>

              </div>

              {/* GST */}
              <div className="rounded-xl bg-slate-50 p-3">

                <div className="flex items-center justify-between gap-3">

                  <label
                    htmlFor="gst-percentage"
                    className="text-sm font-medium text-slate-600"
                  >
                    GST (%)
                  </label>

                  <div className="flex items-center gap-2">

                    <input
                      id="gst-percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={gstPercentage}
                      onChange={(event) => {

                        const value =
                          event.target.value

                        if (
                          value === ''
                        ) {
                          setGstPercentage('')
                          return
                        }

                        const number =
                          Number(value)

                        if (
                          number >= 0 &&
                          number <= 100
                        ) {
                          setGstPercentage(
                            number
                          )
                        }

                      }}
                      className="w-20 h-9 px-2 text-sm text-right font-semibold border border-slate-200 rounded-lg bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />

                    <span className="text-sm text-slate-500">
                      %
                    </span>

                  </div>

                </div>

                <div className="flex justify-between mt-2 text-xs">

                  <span className="text-slate-400">
                    GST Amount
                  </span>

                  <span className="font-semibold text-slate-700">
                    ₹ {gstAmount.toFixed(2)}
                  </span>

                </div>

              </div>

              {/* Discount */}
              <div className="rounded-xl bg-slate-50 p-3">

                <div className="flex items-center justify-between gap-3">

                  <label
                    htmlFor="discount"
                    className="text-sm font-medium text-slate-600"
                  >
                    Discount
                  </label>

                  <div className="flex items-center gap-2">

                    <span className="text-sm text-slate-500">
                      ₹
                    </span>

                    <input
                      id="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(event) => {

                        const value =
                          Number(
                            event.target.value
                          )

                        if (
                          value >= 0
                        ) {
                          setDiscount(
                            value
                          )
                        }

                      }}
                      className="w-24 h-9 px-2 text-sm text-right font-semibold border border-slate-200 rounded-lg bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />

                  </div>

                </div>

              </div>

              {/* Grand Total */}
              <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between items-center">

                <span className="text-base font-bold text-slate-900">
                  Grand Total
                </span>

                <span className="text-xl font-extrabold text-primary-700">
                  ₹ {grandTotal.toFixed(2)}
                </span>

              </div>

            </div>

            <p className="text-xs text-slate-400 mt-3 border-t border-slate-50 pt-3">

              {cart.length === 0
                ? 'Cart is empty'
                : `${cart.reduce(
                    (sum, item) =>
                      sum + item.qty,
                    0
                  )} item(s) · ${
                    cart.length
                  } medicine(s)`}

            </p>

          </section>

          {/* Actions */}
          <div className="flex flex-col gap-2">

            <Button
              variant="primary"
              fullWidth
              disabled={
                cart.length === 0 ||
                isGenerating
              }
              onClick={
                handleGenerateBill
              }
              leftIcon={
                <HiOutlineReceiptRefund
                  size={16}
                />
              }
            >

              {isGenerating
                ? 'Generating Bill...'
                : 'Generate Bill'}

            </Button>

            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-400 text-sm font-semibold cursor-not-allowed opacity-70"
            >

              <HiOutlinePrinter
                size={16}
              />

              Print Bill

              <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded ml-1">
                Next
              </span>

            </button>

          </div>

        </div>

      </div>

      {/* Success Dialog */}
      {showSuccess &&
        generatedBill && (
          <SuccessDialog
            bill={generatedBill}
            onClose={() =>
              setShowSuccess(false)
            }
            onNewBill={
              handleNewBill
            }
          />
        )}

    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* Billing API helper                                                        */
/* -------------------------------------------------------------------------- */

/*
 * IMPORTANT:
 * Your axiosClient already has /api/v1 as its base URL.
 *
 * Therefore the request must use:
 *
 *     /billing
 *
 * NOT:
 *
 *     /api/v1/billing
 */

async function fetchBilling(payload) {

  /*
   * Dynamically import axiosClient so this page
   * continues using the same configured API client.
   */

  const module =
    await import(
      '../../config/axiosClient'
    )

  const axiosClient =
    module.default

  return axiosClient.post(
    '/billing',
    payload
  )
}
}
export default BillingPage
