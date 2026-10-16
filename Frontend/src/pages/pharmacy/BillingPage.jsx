import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  HiOutlineReceiptRefund,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineTrash,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'
import axiosClient from '../../config/axiosClient'
import Badge from '../../components/ui/Badge'
import medicineService from '../../services/medicineService'
import batchService from '../../services/batchService'
function BillingPage() {
  // =====================================================
  // Search
  // =====================================================
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  // =====================================================
  // Inventory
  // =====================================================
  const [medicines, setMedicines] = useState([])
  const [batches, setBatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  // =====================================================
  // Cart
  // =====================================================
  const [cart, setCart] = useState([])
  // =====================================================
  // Billing
  // =====================================================
  const [gstPercentage, setGstPercentage] = useState(5)
  const [discount, setDiscount] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [isGeneratingBill, setIsGeneratingBill] = useState(false)
  const [billMessage, setBillMessage] = useState('')
  const [billError, setBillError] = useState('')
  // =====================================================
  // Load inventory
  // =====================================================
  const loadBillingData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const [medicineResponse, batchResponse] =
        await Promise.all([
          medicineService.getAll(),
          batchService.getAll(),
        ])

      const medicineData = Array.isArray(
        medicineResponse.data
      )
        ? medicineResponse.data
        : []

      const batchData = Array.isArray(batchResponse.data)
        ? batchResponse.data
        : []

      setMedicines(medicineData)
      setBatches(batchData)
    } catch (err) {
      console.error(
        'Failed to load billing inventory:',
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

  // =====================================================
  // Medicine catalogue
  // =====================================================

  const medicineCatalogue = useMemo(() => {
    return medicines
      .map((medicine) => {
        const medicineId =
          medicine.id || medicine._id

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

        // Earliest expiry batch
        const sortedBatches = [
          ...activeBatches,
        ].sort(
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

          price: Number(
            selectedBatch?.mrp ??
              medicine.jan_aushadhi_price ??
              medicine.branded_price ??
              0
          ),

          stock: availableStock,

          batchId: selectedBatch
            ? String(
                selectedBatch._id ||
                  selectedBatch.id
              )
            : null,

          batchNumber:
            selectedBatch?.batch_number || '',

          expiryDate:
            selectedBatch?.expiry_date ||
            null,
        }
      })
      .filter(
        (medicine) =>
          medicine.stock > 0
      )
  }, [medicines, batches])

  // =====================================================
  // Search suggestions
  // =====================================================

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return []
    }

    const searchText =
      query.trim().toLowerCase()

    return medicineCatalogue
      .filter(
        (medicine) =>
          medicine.name
            .toLowerCase()
            .includes(searchText) ||
          medicine.genericName
            .toLowerCase()
            .includes(searchText) ||
          medicine.composition
            .toLowerCase()
            .includes(searchText)
      )
      .slice(0, 8)
  }, [query, medicineCatalogue])

  // =====================================================
  // Add medicine
  // =====================================================

  const addToCart = useCallback((medicine) => {
    setCart((previousCart) => {
      const existingItem =
        previousCart.find(
          (item) =>
            String(item.id) ===
            String(medicine.id)
        )

      // Medicine already exists
      if (existingItem) {
        // Do not exceed available stock
        if (
          existingItem.qty >=
          medicine.stock
        ) {
          return previousCart
        }

        return previousCart.map(
          (item) =>
            String(item.id) ===
            String(medicine.id)
              ? {
                  ...item,
                  qty: item.qty + 1,
                }
              : item
        )
      }

      // First time adding medicine
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
  }, [])

  // =====================================================
  // Increase quantity
  // =====================================================

  const increase = useCallback((id) => {
    setCart((previousCart) =>
      previousCart.map((item) => {
        if (
          String(item.id) !==
          String(id)
        ) {
          return item
        }

        // Maximum available stock
        if (item.qty >= item.stock) {
          return item
        }

        return {
          ...item,
          qty: item.qty + 1,
        }
      })
    )
  }, [])

  // =====================================================
  // Decrease quantity
  // =====================================================

  const decrease = useCallback((id) => {
    setCart((previousCart) => {
      const item =
        previousCart.find(
          (cartItem) =>
            String(cartItem.id) ===
            String(id)
        )

      if (!item) {
        return previousCart
      }

      // Remove medicine when quantity reaches 0
      if (item.qty <= 1) {
        return previousCart.filter(
          (cartItem) =>
            String(cartItem.id) !==
            String(id)
        )
      }

      return previousCart.map(
        (cartItem) =>
          String(cartItem.id) ===
          String(id)
            ? {
                ...cartItem,
                qty:
                  cartItem.qty - 1,
              }
            : cartItem
      )
    })
  }, [])

  // =====================================================
  // Remove medicine completely
  // =====================================================

  const remove = useCallback((id) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) =>
          String(item.id) !==
          String(id)
      )
    )
  }, [])

  // =====================================================
  // BILL CALCULATIONS
  // =====================================================

  // Subtotal = Unit Price × Quantity
  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.qty),
      0
    )
  }, [cart])

  // GST = Subtotal × GST% ÷ 100
  const gstAmount = useMemo(() => {
    const gst =
      Number(gstPercentage) || 0

    return (
      subtotal * gst / 100
    )
  }, [subtotal, gstPercentage])

  // Discount cannot exceed subtotal (matches backend validation)
  const discountAmount = useMemo(() => {
    const value =
      Number(discount) || 0

    return Math.min(
      Math.max(value, 0),
      subtotal
    )
  }, [
    discount,
    subtotal,
    gstAmount,
  ])

  // Grand Total = Subtotal + GST - Discount
  const grandTotal = useMemo(() => {
    return (
      subtotal +
      gstAmount -
      discountAmount
    )
  }, [
    subtotal,
    gstAmount,
    discountAmount,
  ])

  // =====================================================
  // Generate Bill
  // =====================================================
const handleGenerateBill = async () => {
  if (cart.length === 0) {
    setBillError('Please add at least one medicine to the bill.')
    setBillMessage('')
    return
  }

  const invalidItem = cart.find(
    (item) => Number(item.qty) > Number(item.stock)
  )

  if (invalidItem) {
    setBillError(
      `${invalidItem.name}: only ${invalidItem.stock} units are available.`
    )
    setBillMessage('')
    return
  }

  setIsGeneratingBill(true)
  setBillMessage('')
  setBillError('')

  try {
    const response = await axiosClient.post(
      '/billing',
      {
        customer_name: customerName.trim() || null,
        customer_phone: customerPhone.trim() || null,
        payment_method: paymentMethod,
        discount: Number(discount) || 0,
        gst_percentage: Number(gstPercentage) || 0,
        items: cart.map((item) => ({
          medicine_id: String(item.id),
          quantity: Number(item.qty),
        })),
      }
    )

    const data = response.data

    setBillMessage(
      `Bill ${data.bill_number} generated successfully.`
    )

    setBillError('')
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setPaymentMethod('CASH')
    setDiscount(0)
    setGstPercentage(5)

    // Refresh inventory so deducted stock is displayed immediately.
    await loadBillingData()

  } catch (err) {
    console.error('Generate bill error:', err)

    setBillError(
      err?.response?.data?.detail ||
      err?.message ||
      'Unable to generate bill.'
    )

    setBillMessage('')

  } finally {
    setIsGeneratingBill(false)
  }
}
  // =====================================================
  // Loading
  // =====================================================

  if (isLoading) {
    return (
      <article className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Loading billing inventory...
          </p>

          <p className="text-xs text-slate-900 mt-1">
            Fetching medicines and available stock.
          </p>
        </div>
      </article>
    )
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <article
      aria-label="Billing Calculation"
      className="flex flex-col gap-5"
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div>
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <HiOutlineReceiptRefund
            size={22}
            className="text-primary-600"
          />

          Billing Calculation
        </h1>

        <p className="text-xs text-slate-700 mt-1">
          Calculate medicine subtotal,
          GST, discount and final amount.
        </p>
      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="p-3 rounded-xl bg-danger-50 border border-danger-100">
          <p className="text-xs font-semibold text-danger-700">
            Inventory Error
          </p>

          <p className="text-xs text-danger-600 mt-1">
            {error}
          </p>
        </div>
      )}

      {/* ================================================= */}
      {/* MAIN GRID */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <div className="flex flex-col gap-5 min-w-0">

          {/* ================================================= */}
          {/* SEARCH MEDICINE */}
          {/* ================================================= */}

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HiOutlineMagnifyingGlass
                size={15}
                className="text-primary-600"
              />

              Search Medicine
            </h2>

            <div className="relative">
              <HiOutlineMagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(
                    event.target.value
                  )
                  setShowDropdown(true)
                }}
                onFocus={() => {
                  if (query) {
                    setShowDropdown(true)
                  }
                }}
                onBlur={() =>
                  setTimeout(
                    () =>
                      setShowDropdown(
                        false
                      ),
                    150
                  )
                }
                placeholder="Search medicine..."
                className="
                  w-full
                  h-11
                  pl-10
                  pr-10
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-sm
                  text-slate-900
                  focus:border-primary-500
                  focus:ring-2
                  focus:ring-primary-500/20
                  outline-none
                "
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setShowDropdown(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <HiOutlineXMark
                    size={15}
                  />
                </button>
              )}

              {/* ================================================= */}
              {/* SEARCH RESULTS */}
              {/* ================================================= */}
              {showDropdown &&
                suggestions.length > 0 && (
                  <div className="
                    absolute
                    top-full
                    left-0
                    right-0
                    z-50
                    mt-1
                    bg-white
                    rounded-xl
                    border
                    border-slate-200
                    shadow-lg
                    overflow-hidden
                    max-h-72
                    overflow-y-auto
                  ">
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
                          className="
                            flex
                            items-center
                            gap-3
                            w-full
                            px-4
                            py-3
                            text-left
                            hover:bg-primary-50
                            border-b
                            border-slate-50
                            last:border-0
                          "
                        >
                          <div className="
                            flex
                            items-center
                            justify-center
                            w-8
                            h-8
                            rounded-lg
                            bg-secondary-50
                            shrink-0
                          ">
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
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-primary-700">
                              ₹
                              {medicine.price.toFixed(
                                2
                              )}
                            </p>
                            <Badge
                              variant="success"
                              size="sm"
                            >
                              {medicine.stock}{' '}
                              in stock
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
                  <div className="
                    absolute
                    top-full
                    left-0
                    right-0
                    z-50
                    mt-1
                    bg-white
                    rounded-xl
                    border
                    border-slate-200
                    shadow-sm
                    px-4
                    py-3
                  ">
                    <p className="text-sm text-slate-500">
                      No available medicines found.
                    </p>
                  </div>
                )}
            </div>
          </section>

          {/* ================================================= */}
          {/* SELECTED MEDICINES */}
          {/* ================================================= */}

          <section className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            shadow-sm
            overflow-hidden
          ">

            {/* Header */}

            <div className="
              flex
              items-center
              justify-between
              px-5
              py-4
              border-b
              border-slate-100
            ">

              <h2 className="text-sm font-bold text-slate-900">
                Selected Medicines
              </h2>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setCart([])
                  }
                  className="
                    text-xs
                    text-danger-500
                    hover:text-danger-700
                    font-medium
                  "
                >
                  Clear All
                </button>
              )}

            </div>

            {/* Empty cart */}

            {cart.length === 0 ? (

              <div className="
                flex
                flex-col
                items-center
                justify-center
                py-14
                text-center
              ">

                <div className="
                  flex
                  items-center
                  justify-center
                  w-14
                  h-14
                  rounded-full
                  bg-slate-100
                ">
                  <HiOutlineReceiptRefund
                    size={26}
                    className="text-slate-300"
                  />
                </div>

                <p className="text-sm font-semibold text-slate-600 mt-3">
                  No medicines selected
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Search and select medicines above.
                </p>

              </div>

            ) : (

              /* ================================================= */
              /* TABLE */
              /* ================================================= */
                <div className="w-full">

                  <table
                    className="w-full table-fixed"
                    aria-label="Selected medicines"
                  >
                  {/* IMPORTANT:
                      Exactly 5 columns.
                      This fixes the previous alignment problem.
                  */}

                  <colgroup>
                    <col className="w-[38%]" />
                    <col className="w-[17%]" />
                    <col className="w-[20%]" />
                    <col className="w-[17%]" />
                    <col className="w-[8%]" />
                  </colgroup>

                  <thead className="bg-slate-50">

                    <tr>

                      {/* Medicine */}

                      <th className="
                        px-4
                        py-3
                        text-left
                        text-[11px]
                        font-bold
                        text-slate-600
                        uppercase
                        tracking-wide
                      ">
                        Medicine
                      </th>

                      {/* Unit Price */}

                      <th className="
                        px-4
                        py-3
                        text-right
                        text-[11px]
                        font-bold
                        text-slate-600
                        uppercase
                        tracking-wide
                        whitespace-nowrap
                      ">
                        Unit Price
                      </th>

                      {/* Quantity */}

                      <th className="
                        px-4
                        py-3
                        text-center
                        text-[11px]
                        font-bold
                        text-slate-600
                        uppercase
                        tracking-wide
                      ">
                        Quantity
                      </th>

                      {/* Total */}

                      <th className="
                        px-4
                        py-3
                        text-right
                        text-[11px]
                        font-bold
                        text-slate-600
                        uppercase
                        tracking-wide
                      ">
                        Total
                      </th>

                      {/* Remove */}

                    <th
                      className="
                        w-[90px]
                        min-w-[90px]
                        px-3
                        py-3
                        text-center
                        text-[11px]
                        font-bold
                        text-slate-600
                        uppercase
                        tracking-wide
                        whitespace-nowrap
                      "
                    >
                      Remove
                    </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const itemTotal =
                        Number(item.price) *
                        Number(item.qty)
                      return (
                        <tr
                          key={item.id}
                          className="
                            border-t
                            border-slate-100
                            hover:bg-slate-50/50
                          "
                        >
                            {/* MEDICINE */}
                            {/* ================================================= */}

                            <td className="
                              px-4
                              py-4
                              align-middle
                              text-left
                            ">
                              <div className="min-w-0">
                                <p className="
                                  text-xs
                                  font-semibold
                                  text-slate-900
                                  truncate
                                ">
                                  {item.name}
                                </p>
                                {item.genericName && (
                                  <p className="
                                    text-[10px]
                                    text-slate-500
                                    truncate
                                    mt-0.5
                                  ">
                                    {item.genericName}
                                  </p>
                                )}
                              </div>
                            </td>

                          {/* ================================================= */}
                          {/* UNIT PRICE */}
                          {/* ================================================= */}

                          <td className="
                            px-4
                            py-4
                            text-right
                            align-middle
                            whitespace-nowrap
                          ">
                            <span className="
                              text-xs
                              font-semibold
                              text-slate-700
                            ">
                              ₹ {Number(item.price).toFixed(2)}
                            </span>

                          </td>

                          {/* ================================================= */}
                          {/* QUANTITY */}
                          {/* ================================================= */}

                          <td className="
                            px-4
                            py-4
                            text-center
                            align-middle
                          ">

                            <div className="
                              flex
                              items-center
                              justify-center
                            ">

                              <div className="
                                inline-flex
                                items-center
                                border
                                border-slate-200
                                rounded-lg
                                bg-white
                                overflow-hidden
                              ">

                                {/* Minus */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    decrease(
                                      item.id
                                    )
                                  }
                                  className="
                                    w-8
                                    h-8
                                    flex
                                    items-center
                                    justify-center
                                    text-slate-600
                                    hover:bg-slate-50
                                  "
                                  aria-label={`Decrease quantity of ${item.name}`}
                                >
                                  <HiOutlineMinus
                                    size={12}
                                  />
                                </button>
                                {/* Quantity */}
                                <span className="
                                  w-10
                                  h-8
                                  flex
                                  items-center
                                  justify-center
                                  text-sm
                                  font-bold
                                  text-slate-900
                                  border-x
                                  border-slate-200
                                ">
                                  {item.qty}
                                </span>

                                {/* Plus */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    increase(
                                      item.id
                                    )
                                  }
                                  disabled={
                                    item.qty >=
                                    item.stock
                                  }
                                  className="
                                    w-8
                                    h-8
                                    flex
                                    items-center
                                    justify-center
                                    text-slate-600
                                    hover:bg-slate-50
                                    disabled:opacity-30
                                    disabled:cursor-not-allowed
                                  "
                                  aria-label={`Increase quantity of ${item.name}`}
                                >
                                  <HiOutlinePlus
                                    size={12}
                                  />
                                </button>

                              </div>

                            </div>

                          </td>

                          {/* ================================================= */}
                          {/* TOTAL */}
                          {/* ================================================= */}

                          <td className="
                            px-4
                            py-4
                            text-right
                            align-middle
                            whitespace-nowrap
                          ">

                            <span className="
                              text-xs
                              font-extrabold
                              text-slate-900
                            ">
                              ₹ {itemTotal.toFixed(2)}
                            </span>

                          </td>

                          {/* ================================================= */}
                          {/* REMOVE */}
                          {/* ================================================= */}
                          <td className="w-[90px] min-w-[90px] px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                remove(item.id)
                              }
                              aria-label={`Remove ${item.name}`}
                              title={`Remove ${item.name}`}
                              className="
                                inline-flex
                                items-center
                                justify-center
                                w-8
                                h-8
                                rounded-lg
                                text-danger-500
                                bg-danger-50
                                hover:bg-danger-100
                                hover:text-danger-600
                                transition-colors
                              "
                            >
                              <HiOutlineTrash
                                size={16}
                              />
                            </button>

                          </td>

                        </tr>
                      )
                    })}

                  </tbody>

                </table>

              </div>
            )}

          </section>

        </div>

        {/* ================================================= */}
        {/* RIGHT SIDE - BILL CALCULATION */}
        {/* ================================================= */}

        <div className="lg:sticky lg:top-16">

          <section className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            shadow-sm
            p-5
          ">

            {/* Header */}

            <h2 className="
              text-sm
              font-bold
              text-slate-900
              mb-4
              flex
              items-center
              gap-2
            ">

              <HiOutlineReceiptRefund
                size={15}
                className="text-primary-600"
              />

              Bill Calculation

            </h2>

            <div className="space-y-3">

              {/* ================================================= */}
              {/* SUBTOTAL */}
              {/* ================================================= */}

              <div className="
                flex
                items-center
                justify-between
                text-sm
              ">

                <span className="text-slate-600">
                  Subtotal
                </span>

                <span className="font-semibold text-slate-900">
                  ₹ {subtotal.toFixed(2)}
                </span>

              </div>

              {/* ================================================= */}
              {/* GST */}
              {/* ================================================= */}

              <div className="
                rounded-xl
                bg-slate-50
                border
                border-slate-100
                p-4
              ">

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-4
                ">

                  <div>

                    <p className="
                      text-sm
                      font-semibold
                      text-slate-700
                    ">
                      GST (%)
                    </p>

                    <p className="
                      text-[11px]
                      text-slate-400
                      mt-0.5
                    ">
                      Applied to subtotal
                    </p>

                  </div>

                  <div className="
                    flex
                    items-center
                    gap-2
                    shrink-0
                  ">

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

                        if (value === '') {
                          setGstPercentage(0)
                          return
                        }

                        const number =
                          Number(value)

                        if (
                          Number.isFinite(
                            number
                          ) &&
                          number >= 0 &&
                          number <= 100
                        ) {
                          setGstPercentage(
                            number
                          )
                        }
                      }}
                      className="
                        w-20
                        h-9
                        px-2
                        text-sm
                        text-right
                        font-bold
                        text-slate-900
                        border
                        border-slate-200
                        rounded-lg
                        bg-white
                        outline-none
                        focus:border-primary-500
                        focus:ring-2
                        focus:ring-primary-500/20
                      "
                    />

                    <span className="
                      text-sm
                      font-semibold
                      text-slate-600
                    ">
                      %
                    </span>

                  </div>

                </div>

                {/* GST Amount */}

                <div className="
                  mt-4
                  pt-3
                  border-t
                  border-slate-200
                ">

                  <div className="
                    flex
                    items-center
                    justify-between
                  ">

                    <span className="
                      text-xs
                      font-medium
                      text-slate-500
                    ">
                      GST Amount
                    </span>

                    <span className="
                      text-sm
                      font-bold
                      text-slate-900
                    ">
                      ₹ {gstAmount.toFixed(2)}
                    </span>

                  </div>

                  <p className="
                    text-[11px]
                    text-slate-400
                    mt-1
                  ">
                    {gstPercentage}% of ₹ {subtotal.toFixed(2)}
                  </p>

                </div>

              </div>

              {/* ================================================= */}
              {/* DISCOUNT */}
              {/* ================================================= */}

              <div className="
                rounded-xl
                bg-slate-50
                border
                border-slate-100
                p-4
              ">

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-4
                ">

                  <div>

                    <p className="
                      text-sm
                      font-semibold
                      text-slate-700
                    ">
                      Discount
                    </p>

                    <p className="
                      text-[11px]
                      text-slate-400
                      mt-0.5
                    ">
                      Amount deducted
                    </p>

                  </div>

                  <div className="
                    flex
                    items-center
                    gap-2
                    shrink-0
                  ">

                    <span className="
                      text-sm
                      font-semibold
                      text-slate-600
                    ">
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
                          Number.isFinite(
                            value
                          ) &&
                          value >= 0
                        ) {
                          setDiscount(value)
                        }
                      }}
                      className="
                        w-24
                        h-9
                        px-2
                        text-sm
                        text-right
                        font-bold
                        text-slate-900
                        border
                        border-slate-200
                        rounded-lg
                        bg-white
                        outline-none
                        focus:border-primary-500
                        focus:ring-2
                        focus:ring-primary-500/20
                      "
                    />

                  </div>

                </div>

              </div>

              {/* ================================================= */}
              {/* CUSTOMER DETAILS */}
              {/* ================================================= */}

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Customer Details
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Optional customer information for the bill.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="customer-name"
                      className="block text-xs font-semibold text-slate-600 mb-1.5"
                    >
                      Customer Name
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(event.target.value)
                      }
                      placeholder="Enter customer name"
                      maxLength={150}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customer-phone"
                      className="block text-xs font-semibold text-slate-600 mb-1.5"
                    >
                      Customer Phone
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(event) =>
                        setCustomerPhone(event.target.value)
                      }
                      placeholder="Enter phone number"
                      maxLength={20}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* PAYMENT METHOD */}
              {/* ================================================= */}

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Payment Method
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select how the customer paid.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'CASH', label: 'Cash' },
                    { value: 'UPI', label: 'UPI' },
                    { value: 'CARD', label: 'Card' },
                  ].map((method) => {
                    const isSelected = paymentMethod === method.value

                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`h-10 rounded-lg border text-xs font-bold transition-colors ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {method.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ================================================= */}
              {/* GRAND TOTAL */}
              {/* ================================================= */}

              <div className="
                border-t
                border-slate-200
                pt-4
                mt-4
                flex
                items-center
                justify-between
                gap-4
              ">

                <span className="
                  text-base
                  font-bold
                  text-slate-900
                ">
                  Grand Total
                </span>

                <span className="
                  text-xl
                  font-extrabold
                  text-primary-700
                  whitespace-nowrap
                ">
                  ₹ {grandTotal.toFixed(2)}
                </span>

              </div>

            </div>

            {/* ================================================= */}
            {/* BILL STATUS */}
            {/* ================================================= */}

            {billMessage && (
              <div className="mt-4 p-3 rounded-xl bg-success-50 border border-success-100">
                <p className="text-xs font-semibold text-success-700">
                  {billMessage}
                </p>
              </div>
            )}

            {billError && (
              <div className="mt-4 p-3 rounded-xl bg-danger-50 border border-danger-100">
                <p className="text-xs font-semibold text-danger-700">
                  {billError}
                </p>
              </div>
            )}
            {/* ================================================= */}
            {/* GENERATE BILL */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={handleGenerateBill}
              disabled={isGeneratingBill || cart.length === 0}
              className="
                w-full
                mt-4
                h-11
                rounded-xl
                bg-primary-600
                text-white
                text-sm
                font-bold
                shadow-sm
                transition-colors
                hover:bg-primary-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary-500
                focus-visible:ring-offset-2
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {isGeneratingBill
                ? 'Generating Bill...'
                : 'Generate Bill'}
            </button>
            {/* ================================================= */}
            {/* FORMULA */}
            {/* ================================================= */}
            <div className="
              mt-4
              pt-3
              border-t
              border-slate-100
            ">
              <p className="
                text-[11px]
                text-slate-500
              ">
                Subtotal = Price × Quantity
              </p>
              <p className="
                text-[11px]
                text-slate-500
                mt-1
              ">
                GST = Subtotal × GST% ÷ 100
              </p>
              <p className="
                text-[11px]
                text-slate-500
                mt-1
              ">
                Grand Total = Subtotal + GST − Discount
              </p>
            </div>
          </section>
        </div>
      </div>
    </article>
  )
}
export default BillingPage