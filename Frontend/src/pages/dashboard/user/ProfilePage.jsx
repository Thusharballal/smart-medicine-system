import React, { useState, useRef } from 'react'
import {
  RiUserLine, RiMailLine, RiPhoneLine, RiMapPinLine,
  RiCalendarLine, RiShieldUserLine, RiUpload2Line,
  RiSaveLine, RiCloseLine, RiCheckLine, RiEditLine,
  RiHeartPulseLine,
} from 'react-icons/ri'
import { useAuth } from '../../../contexts/AuthContext'
import { useToast } from '../../../components/common/Toast'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import { validateDisplayName, validateMobile } from '../../../utils/authValidation'
import { MOCK_PROFILE } from '../../../mocks/userProfile'

const ROLE_LABELS = {
  user: 'Patient / User',
  pharmacy_owner: 'Pharmacy Owner',
  admin: 'Administrator',
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 md:p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-5">
        <Icon size={18} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const fileRef = useRef(null)

  // Merge live user with mock extended profile
  const baseProfile = { ...MOCK_PROFILE, ...user }

  const [form, setForm] = useState({
    displayName: baseProfile.displayName ?? '',
    mobile: baseProfile.mobile ?? '',
    address: { ...(baseProfile.address ?? MOCK_PROFILE.address) },
    emergencyContact: { ...(baseProfile.emergencyContact ?? MOCK_PROFILE.emergencyContact) },
    preferredLanguage: baseProfile.preferredLanguage ?? 'en',
  })
  const [errors, setErrors] = useState({})
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(baseProfile.avatarUrl ?? null)

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  function setAddress(field, value) {
    setForm((p) => ({ ...p, address: { ...p.address, [field]: value } }))
  }

  function setEmergency(field, value) {
    setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, [field]: value } }))
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast('Image must be smaller than 5 MB.', { variant: 'error' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  function validate() {
    const e = {
      displayName: validateDisplayName(form.displayName),
      mobile: validateMobile(form.mobile),
    }
    setErrors(e)
    return !e.displayName && !e.mobile
  }

  async function handleSave() {
    if (!validate()) return
    setLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800))
    updateUser({ displayName: form.displayName, mobile: form.mobile, preferredLanguage: form.preferredLanguage })
    setLoading(false)
    setEditing(false)
    toast('Profile updated successfully!', { variant: 'success' })
  }

  function handleCancel() {
    setForm({
      displayName: baseProfile.displayName ?? '',
      mobile: baseProfile.mobile ?? '',
      address: { ...(baseProfile.address ?? MOCK_PROFILE.address) },
      emergencyContact: { ...(baseProfile.emergencyContact ?? MOCK_PROFILE.emergencyContact) },
      preferredLanguage: baseProfile.preferredLanguage ?? 'en',
    })
    setErrors({})
    setEditing(false)
  }

  const initials = (form.displayName || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="space-y-6 pb-10 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        {!editing ? (
          <Button variant="outline" size="md" leftIcon={<RiEditLine size={16} />} onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" size="md" leftIcon={<RiCloseLine size={16} />} onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="md" leftIcon={<RiSaveLine size={16} />} loading={loading} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Avatar + basic info */}
      <SectionCard title="Personal Information" icon={RiUserLine}>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-4 border-primary-100 dark:border-primary-900"
              aria-label="Profile picture"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {editing && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-label="Upload profile picture"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
                >
                  <RiUpload2Line size={12} aria-hidden="true" />
                  Change Photo
                </button>
                <p className="text-xs text-gray-400 text-center">JPEG/PNG · Max 5 MB</p>
              </>
            )}
          </div>

          {/* Fields */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editing ? (
              <>
                <Input
                  label="Full Name"
                  required
                  value={form.displayName}
                  onChange={(e) => set('displayName', e.target.value)}
                  error={errors.displayName}
                  leftIcon={<RiUserLine size={15} />}
                />
                <Input
                  label="Mobile Number"
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobile}
                  onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  error={errors.mobile}
                  leftIcon={<RiPhoneLine size={15} />}
                />
              </>
            ) : (
              <>
                {[
                  ['Full Name', form.displayName, RiUserLine],
                  ['Email Address', baseProfile.email, RiMailLine],
                  ['Mobile Number', form.mobile, RiPhoneLine],
                  ['Preferred Language', form.preferredLanguage === 'en' ? 'English' : 'Hindi', RiUserLine],
                ].map(([label, value, Icon]) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <Icon size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
                      {value || '—'}
                    </p>
                  </div>
                ))}
              </>
            )}

            {/* Read-only fields */}
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <RiMailLine size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
                {baseProfile.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Member Since</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <RiCalendarLine size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
                {new Date(baseProfile.dateJoined).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Account Type</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <RiShieldUserLine size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
                {ROLE_LABELS[baseProfile.role] ?? baseProfile.role}
              </p>
            </div>

            {/* Language preference */}
            {editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Language
                </label>
                <select
                  value={form.preferredLanguage}
                  onChange={(e) => set('preferredLanguage', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Address */}
      <SectionCard title="Address" icon={RiMapPinLine}>
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Address Line 1" value={form.address.line1} onChange={(e) => setAddress('line1', e.target.value)} className="sm:col-span-2" />
            <Input label="Address Line 2" value={form.address.line2} onChange={(e) => setAddress('line2', e.target.value)} className="sm:col-span-2" />
            <Input label="City" value={form.address.city} onChange={(e) => setAddress('city', e.target.value)} />
            <Input label="State" value={form.address.state} onChange={(e) => setAddress('state', e.target.value)} />
            <Input label="PIN Code" inputMode="numeric" maxLength={6} value={form.address.pinCode} onChange={(e) => setAddress('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))} />
          </div>
        ) : (
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
            <p>{form.address.line1}</p>
            {form.address.line2 && <p>{form.address.line2}</p>}
            <p>{form.address.city}, {form.address.state} – {form.address.pinCode}</p>
          </div>
        )}
      </SectionCard>

      {/* Emergency contact */}
      <SectionCard title="Emergency Contact" icon={RiHeartPulseLine}>
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Name" value={form.emergencyContact.name} onChange={(e) => setEmergency('name', e.target.value)} />
            <Input label="Relation" value={form.emergencyContact.relation} onChange={(e) => setEmergency('relation', e.target.value)} />
            <Input label="Mobile" inputMode="numeric" maxLength={10} value={form.emergencyContact.mobile} onChange={(e) => setEmergency('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
            <span><strong>Name:</strong> {form.emergencyContact.name}</span>
            <span><strong>Relation:</strong> {form.emergencyContact.relation}</span>
            <span><strong>Mobile:</strong> {form.emergencyContact.mobile}</span>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
