import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiMailLine,
  RiArrowLeftLine,
  RiCheckboxCircleLine,
  RiShieldKeyholeLine,
} from 'react-icons/ri'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { forgotPassword } from '../../services/authService'
import { validateEmail } from '../../utils/authValidation'

function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)

  useEffect(() => {
    document.title = 'Forgot Password – JanAushadhi Smart Medicine'
    return () => { document.title = 'JanAushadhi Smart Medicine' }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validateEmail(email)
    if (err) { setEmailError(err); return }

    setLoading(true)
    setEmailError('')
    try {
      await forgotPassword({ email: email.trim() })
      setSent(true)
    } catch {
      // Always show success to prevent user enumeration (Req 5.12)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="animate-fade-in flex flex-col items-center text-center gap-5 py-4">
        <div className="h-16 w-16 rounded-full bg-accent-50 dark:bg-accent-950 flex items-center justify-center">
          <RiCheckboxCircleLine size={36} className="text-accent-600 dark:text-accent-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">Check your inbox</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            If <strong className="text-gray-700 dark:text-gray-300">{email}</strong> is registered, you will receive a password-reset OTP shortly.
          </p>
        </div>
        <div className="w-full flex flex-col gap-2 mt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(email)}&purpose=forgot_password`)}
          >
            Enter OTP
          </Button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={() => { setSent(false); setEmail('') }}
          >
            Use a different email
          </Button>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
        >
          <RiArrowLeftLine size={15} aria-hidden="true" />
          Back to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
      >
        <RiArrowLeftLine size={16} aria-hidden="true" />
        Back to Login
      </Link>

      <div className="text-center mb-7">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950 mb-4" aria-hidden="true">
          <RiShieldKeyholeLine size={28} className="text-primary-700 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Forgot your password?</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          No problem. Enter the email linked to your account and we'll send you a reset OTP.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate aria-label="Forgot password form" className="space-y-5">
        <Input
          label="Email address"
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
          error={emailError}
          leftIcon={<RiMailLine size={16} />}
          placeholder="you@example.com"
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          {loading ? 'Sending OTP…' : 'Send Reset OTP'}
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

export default ForgotPasswordPage
