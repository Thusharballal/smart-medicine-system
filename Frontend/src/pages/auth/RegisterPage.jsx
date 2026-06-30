import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiShieldCheckLine,
  RiStoreLine,
} from 'react-icons/ri'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useToast } from '../../components/common/Toast'
import { register as registerApi } from '../../services/authService'
import {
  validateDisplayName,
  validateEmail,
  validateMobile,
  validatePassword,
  validateConfirmPassword,
  validateRole,
  passwordStrength,
} from '../../utils/authValidation'

const ROLES = [
  {
    value: 'user',
    label: 'Patient / User',
    desc: 'Search medicines & find pharmacies',
    Icon: RiUserLine,
  },
  {
    value: 'pharmacy_owner',
    label: 'Pharmacy Owner',
    desc: 'Manage your Jan Aushadhi store',
    Icon: RiStoreLine,
  },
]

/* ── Password strength bar ─────────────────────────────────────────── */
function StrengthBar({ password }) {
  const { score, label, color } = passwordStrength(password)
  if (!password) return null

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? color : 'bg-gray-200 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
        Strength:{' '}
        <span
          className={
            score <= 1 ? 'text-danger-600' :
            score === 2 ? 'text-warning-600' :
            score === 3 ? 'text-warning-400' :
            'text-accent-600'
          }
        >
          {label}
        </span>
      </p>
    </div>
  )
}

function RegisterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    terms: false,
  })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    document.title = 'Create Account – JanAushadhi Smart Medicine'
    return () => { document.title = 'JanAushadhi Smart Medicine' }
  }, [])

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
    setApiError('')
  }

  function validate() {
    const e = {
      displayName:     validateDisplayName(form.displayName),
      email:           validateEmail(form.email),
      mobile:          validateMobile(form.mobile),
      password:        validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
      role:            validateRole(form.role),
      terms:           form.terms ? '' : 'You must accept the terms to continue.',
    }
    setErrors(e)
    return Object.values(e).every((v) => !v)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError('')
    try {
      await registerApi({
        displayName: form.displayName.trim(),
        email:       form.email.trim(),
        mobile:      form.mobile.trim(),
        password:    form.password,
        role:        form.role,
      })
      toast('Account created! Check your email for the OTP.', { variant: 'success' })
      navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim())}&purpose=verify_email`)
    } catch (err) {
      const msg = err.message ?? 'Registration failed. Please try again.'
      if (err.status === 409) {
        setErrors((p) => ({ ...p, email: 'An account with this email already exists.' }))
      } else {
        setApiError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Create your account</h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Free forever · No credit card required
        </p>
      </div>

      {apiError && (
        <div role="alert" className="mb-4 rounded-xl bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 px-4 py-3 text-sm text-danger-700 dark:text-danger-300">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate aria-label="Registration form" className="space-y-4">
        {/* Full name */}
        <Input
          label="Full name"
          id="reg-name"
          type="text"
          autoComplete="name"
          required
          value={form.displayName}
          onChange={(e) => set('displayName', e.target.value)}
          error={errors.displayName}
          leftIcon={<RiUserLine size={16} />}
          placeholder="Priya Sharma"
        />

        {/* Email */}
        <Input
          label="Email address"
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          leftIcon={<RiMailLine size={16} />}
          placeholder="you@example.com"
        />

        {/* Mobile */}
        <Input
          label="Mobile number"
          id="reg-mobile"
          type="tel"
          autoComplete="tel"
          required
          inputMode="numeric"
          maxLength={10}
          value={form.mobile}
          onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
          error={errors.mobile}
          leftIcon={<RiPhoneLine size={16} />}
          placeholder="9876543210"
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            id="reg-password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            leftIcon={<RiLockPasswordLine size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
              >
                {showPw ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            }
            placeholder="Min 8 characters"
          />
          <StrengthBar password={form.password} />
        </div>

        {/* Confirm password */}
        <Input
          label="Confirm password"
          id="reg-confirm"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          onChange={(e) => set('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          leftIcon={<RiLockPasswordLine size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
            >
              {showConfirm ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
            </button>
          }
          placeholder="Re-enter password"
        />

        {/* Role selector */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            I am a <span className="text-danger-600 dark:text-danger-400" aria-hidden="true">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, label, desc, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => set('role', value)}
                aria-pressed={form.role === value}
                className={[
                  'flex flex-col items-start gap-1.5 rounded-xl border-2 p-3 text-left transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                  form.role === value
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                ].join(' ')}
              >
                <Icon
                  size={20}
                  className={form.role === value ? 'text-primary-700 dark:text-primary-400' : 'text-gray-400'}
                  aria-hidden="true"
                />
                <span className={`text-sm font-semibold ${form.role === value ? 'text-primary-900 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{desc}</span>
              </button>
            ))}
          </div>
          {errors.role && (
            <p role="alert" className="mt-1 text-xs text-danger-600 dark:text-danger-400">{errors.role}</p>
          )}
        </fieldset>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => set('terms', e.target.checked)}
              aria-required="true"
              aria-describedby={errors.terms ? 'terms-error' : undefined}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>
            </span>
          </label>
          {errors.terms && (
            <p id="terms-error" role="alert" className="mt-1 ml-6 text-xs text-danger-600 dark:text-danger-400">
              {errors.terms}
            </p>
          )}
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary-600 dark:text-primary-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
