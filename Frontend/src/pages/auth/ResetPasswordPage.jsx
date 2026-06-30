import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowLeftLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useToast } from '../../components/common/Toast'
import { resetPassword } from '../../services/authService'
import {
  validatePassword,
  validateConfirmPassword,
  passwordStrength,
} from '../../utils/authValidation'

/* ── Password strength bar (reusable within this file) ──────────────── */
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

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { toast } = useToast()

  const email = params.get('email') ?? ''
  const otp   = params.get('otp')   ?? ''

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [done, setDone]               = useState(false)

  useEffect(() => {
    document.title = 'Reset Password – JanAushadhi Smart Medicine'
    // Guard: if no email/otp, redirect to forgot-password
    if (!email || !otp) navigate('/forgot-password', { replace: true })
    return () => { document.title = 'JanAushadhi Smart Medicine' }
  }, [email, otp, navigate])

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  function validate() {
    const e = {
      newPassword:     validatePassword(form.newPassword),
      confirmPassword: validateConfirmPassword(form.newPassword, form.confirmPassword),
    }
    setErrors(e)
    return !e.newPassword && !e.confirmPassword
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await resetPassword({ email, otp, newPassword: form.newPassword })
      setDone(true)
      toast('Password reset successfully!', { variant: 'success' })
    } catch (err) {
      toast(err.message ?? 'Password reset failed. Please try again.', { variant: 'error' })
      if (err.status === 400) {
        // OTP expired — send back to forgot-password
        setTimeout(() => navigate('/forgot-password'), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="animate-fade-in flex flex-col items-center text-center gap-5 py-6">
        <div className="h-16 w-16 rounded-full bg-accent-50 dark:bg-accent-950 flex items-center justify-center">
          <RiCheckboxCircleLine size={36} className="text-accent-600 dark:text-accent-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            Password updated!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your password has been reset successfully. You can now sign in.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/login', { replace: true })}
        >
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/forgot-password"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
      >
        <RiArrowLeftLine size={16} aria-hidden="true" />
        Back
      </Link>

      <div className="text-center mb-7">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950 mb-4" aria-hidden="true">
          <RiLockPasswordLine size={28} className="text-primary-700 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Set new password</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Create a strong password for{' '}
          <strong className="text-gray-700 dark:text-gray-300">{email}</strong>
        </p>
      </div>

      {/* Password rules callout */}
      <ul className="mb-5 space-y-1 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
        {[
          'At least 8 characters',
          'At least one uppercase letter',
          'At least one number',
        ].map((rule) => (
          <li key={rule} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <RiCheckboxCircleLine
              size={13}
              className={
                (rule.includes('8') && form.newPassword.length >= 8) ||
                (rule.includes('uppercase') && /[A-Z]/.test(form.newPassword)) ||
                (rule.includes('number') && /[0-9]/.test(form.newPassword))
                  ? 'text-accent-500'
                  : 'text-gray-300 dark:text-gray-600'
              }
              aria-hidden="true"
            />
            {rule}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} noValidate aria-label="Reset password form" className="space-y-4">
        {/* New password */}
        <div>
          <Input
            label="New password"
            id="reset-new"
            type={showNew ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={form.newPassword}
            onChange={(e) => set('newPassword', e.target.value)}
            error={errors.newPassword}
            leftIcon={<RiLockPasswordLine size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
                className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
              >
                {showNew ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            }
            placeholder="Min 8 characters"
          />
          <StrengthBar password={form.newPassword} />
        </div>

        {/* Confirm password */}
        <Input
          label="Confirm new password"
          id="reset-confirm"
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
          placeholder="Re-enter new password"
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          {loading ? 'Resetting…' : 'Reset Password'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Remembered it?{' '}
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

export default ResetPasswordPage
