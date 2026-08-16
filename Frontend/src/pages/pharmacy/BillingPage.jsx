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
  // One medicine = ONE bill line
  // Quantity changes inside the same line
  // =====================================================

  const [cart, setCart] = useState([])

  // =====================================================
  // Billing calculation
  // =====================================================

  const [gstPercentage, setGstPercentage] = useState(5)
  const [discount, setDiscount] = useState(0)

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

      const medicineData = Array.isArray(medicineResponse.data)
        ? medicineResponse.data
        : []

      const batchData = Array.isArray(batchResponse.data)
        ? batchResponse.data
        : []

      setMedicines(medicineData)
      setBatches(batchData)
    } catch (err) {
      console.error('Failed to load billing inventory:', err)

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
  // ADD MEDICINE
  //
  // IMPORTANT:
  // If medicine already exists in cart,
  // increase quantity.
  //
  // NEVER create a second line for the
  // same medicine.
  // =====================================================

  const addToCart = useCallback((medicine) => {
    setCart((previousCart) => {
      const existingItem =
        previousCart.find(
          (item) =>
            String(item.id) ===
            String(medicine.id)
        )

      // Same medicine already exists
      if (existingItem) {
        // Do not exceed stock
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
        if (
          item.qty >= item.stock
        ) {
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

      // Remove line when quantity reaches 0
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
  // CALCULATIONS
  // =====================================================

  // Subtotal = price × quantity
  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.qty),
      0
    )
  }, [cart])

  // GST = subtotal × GST percentage / 100
  const gstAmount = useMemo(() => {
    const gst =
      Number(gstPercentage) || 0

    return (
      subtotal * gst / 100
    )
  }, [subtotal, gstPercentage])

  // Discount cannot exceed subtotal + GST
  const discountAmount = useMemo(() => {
    const value =
      Number(discount) || 0

    return Math.min(
      Math.max(value, 0),
      subtotal + gstAmount
    )
  }, [
    discount,
    subtotal,
    gstAmount,
  ])

  // Grand Total = subtotal + GST - discount
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
  // Loading
  // =====================================================

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

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <article
      aria-label="Billing Calculation"
      className="flex flex-col gap-5"
    >
      {/* Header */}

      <div>
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <HiOutlineReceiptRefund
            size={22}
            className="text-primary-600"
          />

          Billing Calculation
        </h1>

        <p className="text-xs text-slate-500 mt-1">
          Calculate medicine subtotal,
          GST, discount and final amount.
        </p>
      </div>

      {/* Error */}

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

      {/* Main */}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

        {/* ================================================= */}
        {/* LEFT */}
        {/* ================================================= */}

        <div className="flex flex-col gap-5">

          {/* Search */}

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
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setShowDropdown(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <HiOutlineXMark
                    size={15}
                  />
                </button>
              )}

              {/* Search results */}

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
                          className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-primary-50 border-b border-slate-50 last:border-0"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-50">
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

                          <div className="text-right">
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
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
                    <p className="text-sm text-slate-400">
                      No available medicines found.
                    </p>
                  </div>
                )}

            </div>
          </section>

          {/* ================================================= */}
          {/* CART */}
          {/* ================================================= */}

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

              <h2 className="text-sm font-bold text-slate-900">
                Selected Medicines
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
              <div className="flex flex-col items-center justify-center py-14 text-center">

                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100">
                  <HiOutlineReceiptRefund
                    size={26}
                    className="text-slate-300"
                  />
                </div>

                <p className="text-sm font-semibold text-slate-600 mt-3">
                  No medicines selected
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Search and select medicines above.
                </p>

              </div>
            ) : (

              <div className="overflow-x-auto">

                <table
                  className="table-base w-full"
                  aria-label="Selected medicines"
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

                          {/* Medicine */}

                          <td>
                            <div className="flex items-center gap-2">

                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary-50">
                                <MdMedication
                                  size={13}
                                  className="text-secondary-600"
                                />
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-slate-900">
                                  {item.name}
                                </p>

                                <p className="text-[10px] text-slate-400">
                                  {item.genericName}
                                </p>
                              </div>

                            </div>
                          </td>

                          {/* Unit Price */}

                          <td className="text-xs font-medium text-slate-700">
                            ₹
                            {item.price.toFixed(
                              2
                            )}
                          </td>

                          {/* Quantity */}

                          <td>

                            <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden w-fit">

                              <button
                                type="button"
                                onClick={() =>
                                  decrease(
                                    item.id
                                  )
                                }
                                className="px-2.5 py-1 hover:bg-slate-50"
                              >
                                <HiOutlineMinus
                                  size={11}
                                />
                              </button>

                              <span className="px-3 text-xs font-bold min-w-[2rem] text-center">
                                {item.qty}
                              </span>

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
                                className="px-2.5 py-1 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <HiOutlinePlus
                                  size={11}
                                />
                              </button>

                            </div>

                          </td>

                          {/* Line total */}

                          <td className="text-xs font-extrabold text-slate-900">
                            ₹
                            {(
                              item.price *
                              item.qty
                            ).toFixed(2)}
                          </td>

                          {/* Remove */}

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
            )}

          </section>
        </div>

        {/* ================================================= */}
        {/* RIGHT - CALCULATION */}
        {/* ================================================= */}

        <div className="lg:sticky lg:top-16">

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">

            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HiOutlineReceiptRefund
                size={15}
                className="text-primary-600"
              />

              Bill Calculation
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
                          Number.isFinite(
                            value
                          ) &&
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

            {/* Formula */}

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">

              <p className="text-[11px] text-slate-400">
                Subtotal = Price × Quantity
              </p>

              <p className="text-[11px] text-slate-400">
                GST = Subtotal × GST% ÷ 100
              </p>

              <p className="text-[11px] text-slate-400">
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