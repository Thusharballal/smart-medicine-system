import React, { useState } from 'react'
import {
  RiSunLine, RiMoonLine, RiComputerLine, RiGlobalLine,
  RiLockPasswordLine, RiShieldCheckLine, RiDeviceLine,
  RiMapPinLine, RiCheckLine, RiEyeLine, RiEyeOffLine,
} from 'react-icons/ri'
import { useTheme } from '../../../contexts/ThemeContext'
import { useToast } from '../../../components/common/Toast'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import { validatePassword, validateConfirmPassword } from '../../../utils/authValidation'
import { MOCK_SETTINGS, MOCK_ACTIVE_SESSIONS } from '../../../mocks/userProfile'

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

function ToggleSwitch({ checked, onChange, id, label }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
          aria-hidden="true"
        />
      </button>
    </label>
  )
}

export default function AccountSettingsPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [settings, setSettings] = useState(MOCK_SETTINGS)
  const [sessions, setSessions] = useState(MOCK_ACTIVE_SESSIONS)
  const [confirmRevokeId, setConfirmRevokeId] = useState(null)

  // Change password form
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwLoading, setPwLoading] = useState(false)
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false })

  function setSetting(key, value) {
    setSettings((p) => ({ ...p, [key]: value }))
  }

  async function handleSavePreferences() {
    await new Promise((r) => setTimeout(r, 500))
    toast('Preferences saved!', { variant: 'success' })
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    const errors = {
      newPw: validatePassword(pwForm.newPw),
      confirm: validateConfirmPassword(pwForm.newPw, pwForm.confirm),
      current: pwForm.current ? '' : 'Current password is required.',
    }
    setPwErrors(errors)
    if (Object.values(errors).some(Boolean)) return
    setPwLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setPwLoading(false)
    setPwForm({ current: '', newPw: '', confirm: '' })
    toast('Password changed successfully!', { variant: 'success' })
  }

  function handleRevoke(id) {
    setSessions((s) => s.filter((ss) => ss.id !== id))
    setConfirmRevokeId(null)
    toast('Session revoked.', { variant: 'info' })
  }

  function timeAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="space-y-6 pb-10 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>

      {/* ── Appearance ── */}
      <SectionCard title="Appearance" icon={RiSunLine}>
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme selection">
          {[
            { value: 'light',  label: 'Light',  Icon: RiSunLine  },
            { value: 'dark',   label: 'Dark',   Icon: RiMoonLine },
            { value: 'system', label: 'System', Icon: RiComputerLine },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={theme === value}
              onClick={() => setTheme(value === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value)}
              className={[
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                theme === value
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
              ].join(' ')}
            >
              <Icon size={22} className={theme === value ? 'text-primary-700 dark:text-primary-400' : 'text-gray-400'} aria-hidden="true" />
              <span className={`text-sm font-medium ${theme === value ? 'text-primary-900 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>{label}</span>
              {theme === value && <RiCheckLine size={14} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── Language ── */}
      <SectionCard title="Language" icon={RiGlobalLine}>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Language selection">
          {[
            { value: 'en', label: 'English' },
            { value: 'hi', label: 'हिन्दी (Hindi)' },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={settings.language === value}
              onClick={() => setSetting('language', value)}
              className={[
                'flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                settings.language === value
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-950 text-primary-900 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300',
              ].join(' ')}
            >
              {settings.language === value && <RiCheckLine size={14} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />}
              {label}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── Change Password ── */}
      <SectionCard title="Security – Change Password" icon={RiLockPasswordLine}>
        <form onSubmit={handlePasswordChange} className="space-y-4" noValidate aria-label="Change password form">
          {(['current', 'newPw', 'confirm'] ).map((field) => {
            const labels = { current: 'Current Password', newPw: 'New Password', confirm: 'Confirm New Password' }
            return (
              <Input
                key={field}
                label={labels[field]}
                type={pwShow[field] ? 'text' : 'password'}
                autoComplete={field === 'current' ? 'current-password' : 'new-password'}
                required
                value={pwForm[field]}
                onChange={(e) => { setPwForm((p) => ({ ...p, [field]: e.target.value })); setPwErrors((p) => ({ ...p, [field]: '' })) }}
                error={pwErrors[field]}
                leftIcon={<RiLockPasswordLine size={15} />}
                rightIcon={
                  <button type="button" onClick={() => setPwShow((p) => ({ ...p, [field]: !p[field] }))} aria-label={pwShow[field] ? 'Hide password' : 'Show password'} className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded">
                    {pwShow[field] ? <RiEyeOffLine size={16} aria-hidden="true" /> : <RiEyeLine size={16} aria-hidden="true" />}
                  </button>
                }
              />
            )
          })}
          <Button type="submit" variant="primary" size="md" loading={pwLoading}>Change Password</Button>
        </form>

        {/* 2FA UI-only */}
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add an extra layer of security to your account</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-300">
              Coming Soon
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ── Active Sessions ── */}
      <SectionCard title="Active Sessions" icon={RiDeviceLine}>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  {s.device}
                  {s.isCurrent && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300">Current</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.location} · {s.ip}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Last active: {timeAgo(s.lastActive)}</p>
              </div>
              {!s.isCurrent && (
                <button
                  type="button"
                  onClick={() => setConfirmRevokeId(s.id)}
                  className="text-xs text-danger-600 dark:text-danger-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger-500 rounded"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Preferences ── */}
      <SectionCard title="Search Preferences" icon={RiMapPinLine}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Default Search Radius: <span className="text-primary-600 dark:text-primary-400 font-semibold">{settings.defaultSearchRadius} km</span>
            </label>
            <input
              type="range" min={1} max={25} step={1}
              value={settings.defaultSearchRadius}
              onChange={(e) => setSetting('defaultSearchRadius', Number(e.target.value))}
              aria-label="Default search radius"
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>1 km</span><span>25 km</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Medicine Type</label>
            <select
              value={settings.defaultMedicineType}
              onChange={(e) => setSetting('defaultMedicineType', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="all">All</option>
              <option value="branded">Branded Only</option>
              <option value="janaushadhi">Jan Aushadhi Only</option>
            </select>
          </div>

          <Button variant="primary" size="md" onClick={handleSavePreferences}>Save Preferences</Button>
        </div>
      </SectionCard>

      <ConfirmDialog
        isOpen={!!confirmRevokeId}
        onClose={() => setConfirmRevokeId(null)}
        onConfirm={() => handleRevoke(confirmRevokeId)}
        title="Revoke session?"
        message="This device will be logged out immediately."
        confirmLabel="Revoke"
        intent="danger"
      />
    </div>
  )
}
