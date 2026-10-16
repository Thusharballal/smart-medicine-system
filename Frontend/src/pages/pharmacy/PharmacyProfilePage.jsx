import { useEffect, useState } from 'react'
import {
  HiOutlineBuildingStorefront,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineIdentification,
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
} from 'react-icons/hi2'

import pharmacyService from '../../services/pharmacyService'

function PharmacyProfilePage() {
  const [profile, setProfile] = useState(null)

  const [formData, setFormData] = useState({
    pharmacy_name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    latitude: '',
    longitude: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // ============================================================
  // Load Pharmacy Profile
  // ============================================================

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await pharmacyService.getMyProfile()
      const data = response.data

      setProfile(data)

      setFormData({
        pharmacy_name: data.pharmacy_name || '',
        phone_number: data.phone_number || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pin_code: data.pin_code || '',
        latitude: data.latitude ?? '',
        longitude: data.longitude ?? '',
      })
    } catch (err) {
      console.error('Failed to load pharmacy profile:', err)

      setError(
        err.response?.data?.detail ||
        'Failed to load pharmacy profile.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // Handle Input Changes
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // ============================================================
  // Save Profile
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setMessage('')
      setError('')

      const updateData = {
        pharmacy_name: formData.pharmacy_name,
        phone_number: formData.phone_number,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pin_code: formData.pin_code,
        latitude:
          formData.latitude === ''
            ? null
            : Number(formData.latitude),
        longitude:
          formData.longitude === ''
            ? null
            : Number(formData.longitude),
      }
      const response = await pharmacyService.updateMyProfile(updateData)
      setProfile(response.data)

      setMessage('Pharmacy profile updated successfully.')

    } catch (err) {
      console.error('Failed to update pharmacy profile:', err)

      setError(
        err.response?.data?.detail ||
        'Failed to update pharmacy profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // Get Current Location
  // ============================================================

  const handleGetLocation = () => {
    setMessage('')
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        setFormData((previous) => ({
          ...previous,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }))

        setMessage('Current location detected. Click Save Changes to store it.')
      },
      (locationError) => {
        console.error('Location error:', locationError)

        setError(
          'Unable to get your location. Please allow location access in your browser.'
        )
      }
    )
  }

  // ============================================================
  // Loading
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500">
          <HiOutlineArrowPath
            size={22}
            className="animate-spin"
          />
          <span>Loading pharmacy profile...</span>
        </div>
      </div>
    )
  }

  // ============================================================
  // Error Without Profile
  // ============================================================

  if (!profile) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-danger-100 p-6">
          <p className="text-danger-600">
            {error || 'Pharmacy profile could not be loaded.'}
          </p>
        </div>
      </div>
    )
  }

  // ============================================================
  // Page
  // ============================================================

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ========================================================
          Header
         ======================================================== */}

      <div className="mb-6">
        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <HiOutlineBuildingStorefront
              size={26}
              className="text-primary-600"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Pharmacy Profile
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage your pharmacy information and location.
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================
          Success Message
         ======================================================== */}

      {message && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-success-100 bg-success-50 px-4 py-3 text-sm text-success-700">
          <HiOutlineCheckCircle size={18} />
          {message}
        </div>
      )}

      {/* ========================================================
          Error Message
         ======================================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ======================================================
            Pharmacy Information
           ====================================================== */}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">

          <div className="flex items-center gap-2 mb-5">

            <HiOutlineBuildingStorefront
              size={20}
              className="text-primary-600"
            />

            <h2 className="text-lg font-semibold text-slate-900">
              Pharmacy Information
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pharmacy Name
              </label>

              <input
                type="text"
                name="pharmacy_name"
                value={formData.pharmacy_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Owner Name
              </label>

              <div className="relative">
                <HiOutlineUser
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />

                <input
                  type="text"
                  value={profile.owner_name || ''}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-500"
                />
              </div>

              <p className="text-xs text-slate-400 mt-1">
                Owner name cannot be changed here.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>

              <div className="relative">
                <HiOutlinePhone
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />

                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <div className="relative">
                <HiOutlineEnvelope
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />

                <input
                  type="email"
                  value={profile.email || ''}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-500"
                />
              </div>

              <p className="text-xs text-slate-400 mt-1">
                Email is linked to the pharmacy account.
              </p>
            </div>

          </div>
        </div>

        {/* ======================================================
            Registration Information
           ====================================================== */}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">

          <div className="flex items-center gap-2 mb-5">

            <HiOutlineIdentification
              size={20}
              className="text-primary-600"
            />

            <h2 className="text-lg font-semibold text-slate-900">
              Registration Information
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Drug License Number
              </label>

              <input
                type="text"
                value={profile.drug_license_number || ''}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                GST Number
              </label>

              <input
                type="text"
                value={profile.gst_number || ''}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
              />
            </div>

          </div>

          <p className="text-xs text-slate-400 mt-4">
            Registration details are verified during pharmacy registration
            and cannot be changed from this profile.
          </p>

        </div>

        {/* ======================================================
            Address
           ====================================================== */}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">

          <div className="flex items-center gap-2 mb-5">

            <HiOutlineMapPin
              size={20}
              className="text-primary-600"
            />

            <h2 className="text-lg font-semibold text-slate-900">
              Pharmacy Address
            </h2>

          </div>

          <div className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PIN Code
                </label>

                <input
                  type="text"
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />
              </div>

            </div>

          </div>
        </div>

        {/* ======================================================
            Location
           ====================================================== */}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">

          <div className="flex items-center gap-2 mb-2">

            <HiOutlineMapPin
              size={20}
              className="text-primary-600"
            />

            <h2 className="text-lg font-semibold text-slate-900">
              Pharmacy Location
            </h2>

          </div>

          <p className="text-sm text-slate-500 mb-5">
            This location is used to show your pharmacy on the
            patient's nearby-pharmacy map.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Latitude
              </label>

              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="any"
                placeholder="Example: 13.214300"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="any"
                placeholder="Example: 74.998500"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleGetLocation}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
          >
            <HiOutlineMapPin size={18} />
            Get Current Location
          </button>
          <p className="text-xs text-slate-400 mt-3">
            Your browser will ask for permission to access your current
            location.
          </p>
        </div>
        {/* ======================================================
            Account Status
           ====================================================== */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Account Status
        </h2>

        <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1.5 rounded-full bg-success-50 text-success-700 text-sm font-medium">
            Status: {profile.status}
            </span>
        </div>
        </div>
        {/* ======================================================
            Save
           ====================================================== */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {saving && (
              <HiOutlineArrowPath
                size={18}
                className="animate-spin"
              />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
export default PharmacyProfilePage