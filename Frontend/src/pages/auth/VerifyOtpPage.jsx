import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  RiMailSendLine,
  RiArrowLeftLine,
  RiCheckboxCircleLine,
  RiTimeLine,
} from 'react-icons/ri'
import Button from '../../components/common/Button'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/common/Toast'
import { verifyOtp, sendOtp } from '../../services/authService'
import { validateOtp } from '../../utils/authValidation'

const DASH = { user: '/dashboard/user', pharmacy_owner: '/dashboard/owner', admin: '/dashboard/admin' }
const RESEND_COOLDOWN = 60 // seconds

function VerifyOtpPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { login } = useAuth()
  const { toast } = useToast()

  const email   = params.get('email') ?? ''
  const purpose = params.get('purpose') ?? 'verify_email'

  // 6 individual digit inputs
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const [success, setSuccess] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  useEffect(() => {
    document.title = 'Verify OTP – JanAushadhi Smart Medicine'
    // Focus first digit on mount
    inputRefs.current[0]?.focus()
    return () => { document.title = 'JanAushadhi Smart Medicine' }
  }, [])

  function handleDigitChange(index, value) {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    setError('')
    if (char && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]; next[index] = ''; setDigits(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && index > 0)  inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...digits]
    pasted.split('').forEach((ch, i) => { if (i < 6) next[i] = ch })
    setDigits(next)
    const focusAt = Math.min(pasted.length, 5)
    inputRefs.current[focusAt]?.focus()
  }

  const otp = digits.join('')

  async function handleVerify(e) {
    e?.preventDefault()
    const err = validateOtp(otp)
    if (err) { setError(err); return }
    setLoading(true)
    setError('')
    try {
      const result = await verifyOtp({ email, otp, purpose })
      setSuccess(true)
      if (purpose === 'verify_email') {
        login(result.user, result.token)
        toast('Email verified! Welcome to JanAushadhi.', { variant: 'success' })
        setTimeout(() => navigate(DASH[result.user.role] ?? '/'), 1500)
      } else {
        // forgot-password flow – navigate to reset with OTP embedded
        toast('OTP verified! Set your new password.', { variant: 'success' })
        setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`), 1000)
      }
    } catch (err2) {
      setError(err2.message ?? 'Invalid OTP. Please try again.')
      // clear digits on error for re-entry
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    setResendLoading(true)
    setError('')
    try {
      await sendOtp({ email, purpose })
      toast('New OTP sent to ' + email, { variant: 'info' })
      setCooldown(RESEND_COOLDOWN)
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err2) {
      toast(err2.message ?? 'Could not resend OTP.', { variant: 'error' })
    } finally {
      setResendLoading(false)
    }
  }

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (otp.length === 6 && !loading && !success) handleVerify()
  }, [otp]) // eslint-disable-line react-hooks/exhaustive-deps

  const maskedEmail = email
    ? email.replace(/(.{2})(.+?)(@.+)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : ''

  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-accent-50 dark:bg-accent-950 flex items-center justify-center">
          <RiCheckboxCircleLine size={36} className="text-accent-600 dark:text-accent-400" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Verified!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {purpose === 'verify_email' ? 'Redirecting to your dashboard…' : 'Redirecting to reset password…'}
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
      >
        <RiArrowLeftLine size={16} aria-hidden="true" />
        Back to Login
      </Link>

      <div className="text-center mb-7">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950 mb-4" aria-hidden="true">
          <RiMailSendLine size={28} className="text-primary-700 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Check your email</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          We sent a 6-digit OTP to{' '}
          <strong className="text-gray-700 dark:text-gray-300">{maskedEmail}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} noValidate aria-label="OTP verification form">
        {/* OTP digit inputs */}
        <div
          className="flex justify-center gap-2.5 mb-4"
          role="group"
          aria-label="6-digit OTP input"
          onPaste={handlePaste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`OTP digit ${i + 1}`}
              className={[
                'h-12 w-11 rounded-xl border-2 text-center text-xl font-bold',
                'text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800',
                'transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary-600',
                error
                  ? 'border-danger-500 dark:border-danger-500'
                  : d
                    ? 'border-primary-500 dark:border-primary-500'
                    : 'border-gray-300 dark:border-gray-600',
              ].join(' ')}
              disabled={loading}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p role="alert" className="text-center text-sm text-danger-600 dark:text-danger-400 mb-3">
            {error}
          </p>
        )}

        {/* Demo hint */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-5">
          Demo OTP: <strong>123456</strong>
        </p>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={otp.length < 6}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </Button>
      </form>

      {/* Resend */}
      <div className="mt-5 text-center">
        {cooldown > 0 ? (
          <p className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <RiTimeLine size={14} aria-hidden="true" />
            Resend in <strong className="text-gray-700 dark:text-gray-300 tabular-nums">{cooldown}s</strong>
          </p>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            loading={resendLoading}
            onClick={handleResend}
          >
            Resend OTP
          </Button>
        )}
      </div>
    </div>
  )
}

export default VerifyOtpPage
