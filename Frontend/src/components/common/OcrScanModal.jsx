import { useState, useCallback, useRef } from 'react'
import axios from 'axios'
import {
  HiOutlineCamera,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineArrowUpTray,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'

// =====================================================
// Prescription OCR API
// =====================================================
// Change this URL if your FastAPI backend runs elsewhere.
//
// Expected backend endpoint:
// POST /api/v1/ocr/prescription
//
// Request:
// multipart/form-data
// image: prescription image
//
// Expected response:
// {
//   "success": true,
//   "medicines": [
//     {
//       "name": "Paracetamol",
//       "dosage": "500mg",
//       "frequency": "2 times daily",
//       "duration": "5 days"
//     }
//   ]
// }
// =====================================================

const OCR_API_URL = 'http://localhost:8000/api/v1/ocr/prescription'

// =====================================================
// Component
// =====================================================

function OcrScanModal({ isOpen, onClose, onDetected }) {
  const [phase, setPhase] = useState('upload')
  // upload | scanning | results

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [detectedMedicines, setDetectedMedicines] = useState([])
  const [error, setError] = useState('')

  const fileInputRef = useRef(null)

  // =====================================================
  // Reset modal
  // =====================================================

  function resetModal() {
    setPhase('upload')
    setImageFile(null)
    setImagePreview('')
    setDetectedMedicines([])
    setError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function resetAndClose() {
    resetModal()
    onClose?.()
  }

  // =====================================================
  // Handle image selection
  // =====================================================

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setError('')

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Please select a JPG, JPEG, PNG, or WEBP prescription image.'
      )
      return
    }

    // 10 MB limit
    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      setError('Image size must be less than 10 MB.')
      return
    }

    setImageFile(file)

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    setPhase('upload')
  }, [])

  // =====================================================
  // Open file selector
  // =====================================================

  function handleChooseImage() {
    fileInputRef.current?.click()
  }

  // =====================================================
  // Drag & Drop
  // =====================================================

  function handleDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
  }

  function handleDrop(event) {
    event.preventDefault()
    event.stopPropagation()

    const file = event.dataTransfer.files?.[0]

    if (!file) {
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Please drop a JPG, JPEG, PNG, or WEBP prescription image.'
      )
      return
    }

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      setError('Image size must be less than 10 MB.')
      return
    }

    setError('')
    setImageFile(file)

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  // =====================================================
  // Scan prescription
  // =====================================================

  const handleScan = useCallback(async () => {
    if (!imageFile) {
      setError('Please select a prescription image first.')
      return
    }

    setPhase('scanning')
    setError('')
    setDetectedMedicines([])

    try {
      const formData = new FormData()

      formData.append('image', imageFile)

      console.log(
        '[OCR] Sending prescription to:',
        OCR_API_URL
      )

      const response = await axios.post(
        OCR_API_URL,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },

          // 2 minute timeout because ML OCR can take time
          timeout: 120000,
        }
      )

      console.log('[OCR] Response:', response.data)

      const medicines =
        response.data?.medicines || []

      if (!Array.isArray(medicines)) {
        throw new Error(
          'Invalid response received from OCR server.'
        )
      }

      // Remove invalid results
      const validMedicines = medicines.filter(
        medicine =>
          medicine &&
          typeof medicine === 'object' &&
          medicine.name &&
          String(medicine.name).trim()
      )

      setDetectedMedicines(validMedicines)

      setPhase('results')
    } catch (err) {
      console.error('[OCR] Prescription processing failed:', err)

      let message =
        'Unable to process the prescription. Please try again.'

      // Backend returned an error
      if (err.response) {
        const backendDetail =
          err.response.data?.detail

        if (typeof backendDetail === 'string') {
          message = backendDetail
        } else if (
          Array.isArray(backendDetail)
        ) {
          message = backendDetail
            .map(item => item.msg)
            .filter(Boolean)
            .join(', ')
        }
      }

      // Backend is not running
      else if (err.code === 'ERR_NETWORK') {
        message =
          'Cannot connect to the OCR server. Please make sure the FastAPI backend is running.'
      }

      // Request timed out
      else if (err.code === 'ECONNABORTED') {
        message =
          'OCR processing took too long. Please try again with a clearer image.'
      }

      // General error
      else if (err.message) {
        message = err.message
      }

      setError(message)
      setPhase('upload')
    }
  }, [imageFile])

  // =====================================================
  // Search detected medicines
  // =====================================================

  function handleSearchAll() {
    const medicineNames = detectedMedicines
      .map(medicine => medicine.name)
      .filter(Boolean)
      .map(name => String(name).trim())

    if (medicineNames.length === 0) {
      setError('No medicines were detected.')
      return
    }

    console.log(
      '[OCR] Detected medicines:',
      medicineNames
    )

    onDetected?.(medicineNames)

    resetAndClose()
  }

  // =====================================================
  // Rescan
  // =====================================================

  function handleRescan() {
    setPhase('upload')
    setDetectedMedicines([])
    setError('')
  }

  // =====================================================
  // Don't render when closed
  // =====================================================

  if (!isOpen) {
    return null
  }

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ocr-modal-title"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
    >
      {/* =================================================
          Backdrop
      ================================================= */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={resetAndClose}
        aria-hidden="true"
      />
      {/* =================================================
          Modal
      ================================================= */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* =================================================
            Close button
        ================================================= */}
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Close prescription scan"
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <HiOutlineXMark
            size={18}
            aria-hidden="true"
          />
        </button>
        {/* =================================================
            Title
        ================================================= */}
        <div>
          <h2
            id="ocr-modal-title"
            className="text-base font-bold text-slate-900 flex items-center gap-2"
          >
            <HiOutlineCamera
              size={18}
              className="text-secondary-600"
              aria-hidden="true"
            />
            Scan Prescription
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload a prescription image to detect medicines automatically
          </p>
        </div>
        {/* =================================================
            Error
        ================================================= */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3"
          >
            <p className="text-xs font-semibold text-danger-700">
              {error}
            </p>
          </div>
        )}
        {/* =================================================
            UPLOAD PHASE
        ================================================= */}
        {phase === 'upload' && (
          <>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {/* =================================================
                Image preview
            ================================================= */}
            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={imagePreview}
                  alt="Selected prescription"
                  className="w-full max-h-64 object-contain"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview('')
                    setError('')

                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-white/90 text-xs font-semibold text-slate-600 shadow hover:bg-white"
                >
                  Remove
                </button>
              </div>
            )}

            {/* =================================================
                Drag & Drop area
            ================================================= */}
            {!imagePreview && (
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 bg-slate-50 hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Click to upload prescription image"
                onClick={handleChooseImage}
                onKeyDown={event => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault()
                    handleChooseImage()
                  }
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm">
                  <HiOutlineArrowUpTray
                    size={24}
                    className="text-slate-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    Choose Image
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    or drag &amp; drop here
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>PNG</span>
                  <span>·</span>
                  <span>JPG</span>
                  <span>·</span>
                  <span>WEBP</span>
                </div>
              </div>
            )}
            {/* =================================================
                Selected file
            ================================================= */}
            {imageFile && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary-100 shrink-0">
                  <HiOutlineCamera
                    size={20}
                    className="text-secondary-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">
                    {imageFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleChooseImage}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  Change
                </button>
              </div>
            )}

            {/* =================================================
                OR divider
            ================================================= */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">
                OR
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            {/* =================================================
                Camera
            ================================================= */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary-100 shrink-0">
                <HiOutlineCamera
                  size={20}
                  className="text-secondary-600"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-700">
                  Use Camera
                </p>
                <p className="text-[11px] text-slate-400">
                  Camera capture — coming soon
                </p>
              </div>
            </div>
            {/* =================================================
                Scan button
            ================================================= */}
            <button
              type="button"
              onClick={handleScan}
              disabled={!imageFile}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 ${
                imageFile
                  ? 'bg-secondary-600 hover:bg-secondary-700'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <HiOutlineCamera
                size={16}
                aria-hidden="true"
              />
              Scan Prescription
            </button>
          </>
        )}
        {/* =================================================
            SCANNING PHASE
        ================================================= */}
        {phase === 'scanning' && (
          <div className="flex flex-col items-center gap-5 py-8">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full border-4 border-secondary-200 border-t-secondary-600 animate-spin"
                aria-hidden="true"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <MdMedication
                  size={28}
                  className="text-secondary-600"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">
                Scanning…
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Detecting medicines from prescription
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                This may take a few seconds.
              </p>
            </div>
          </div>
        )}
        {/* =================================================
            RESULTS PHASE
        ================================================= */}
        {phase === 'results' && (
          <>
            {detectedMedicines.length > 0 ? (
              <div className="bg-success-50 border border-success-200 rounded-xl p-4">

                <p className="text-xs font-bold text-success-700 mb-3 flex items-center gap-1.5">
                  <HiOutlineCheckCircle
                    size={14}
                    aria-hidden="true"
                  />
                  Detected Medicines
                </p>
                <ul
                  className="space-y-3"
                  aria-label="Detected medicines from prescription"
                >
                  {detectedMedicines.map(
                    (medicine, index) => (
                      <li
                        key={
                          medicine.id ||
                          `${medicine.name}-${index}`
                        }
                        className="flex items-start gap-2 text-sm text-slate-800"
                      >
                        <HiOutlineCheckCircle
                          size={14}
                          className="text-success-600 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-semibold">
                            {medicine.name}
                          </p>
                          {medicine.dosage && (
                            <p className="text-xs text-slate-500">
                              Dosage: {medicine.dosage}
                            </p>
                          )}
                          {medicine.frequency && (
                            <p className="text-xs text-slate-500">
                              Frequency: {medicine.frequency}
                            </p>
                          )}
                          {medicine.duration && (
                            <p className="text-xs text-slate-500">
                              Duration: {medicine.duration}
                            </p>
                          )}
                          {medicine.composition && (
                            <p className="text-xs text-slate-500">
                              Composition: {medicine.composition}
                            </p>
                          )}
                          {medicine.confidence !==
                            undefined && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Confidence:{' '}
                              {typeof medicine.confidence ===
                              'number'
                                ? `${(
                                    medicine.confidence * 100
                                  ).toFixed(1)}%`
                                : medicine.confidence}
                            </p>
                          )}
                        </div>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ) : (
              <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-warning-700">
                  No medicines detected
                </p>

                <p className="text-xs text-warning-600 mt-1">
                  Please try a clearer prescription image.
                </p>
              </div>
            )}
            {/* =================================================
                Result buttons
            ================================================= */}
            <div className="flex gap-2">
              {detectedMedicines.length > 0 && (
                <button
                  type="button"
                  onClick={handleSearchAll}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <HiOutlineMagnifyingGlass
                    size={15}
                    aria-hidden="true"
                  />
                  Search Detected Medicines
                </button>
              )}
              <button
                type="button"
                onClick={handleRescan}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Rescan
              </button>
            </div>
          </>
        )}
        {/* =================================================
            Footer
        ================================================= */}
        <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
          📷 Prescription images are processed by the
          Smart Medicine System OCR service.
        </p>
      </div>
    </div>
  )
}
export default OcrScanModal