import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  RiMailLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiGoogleLine,
  RiMedicineBottleLine,
  RiShieldCheckLine,
} from 'react-icons/ri'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/common/Toast'
import { login as loginApi, googleSignIn } from '../../services/authService'
import { validateEmail, validatePassword } from '../../utils/authValidation'

/* ── Dash paths per role ─────────────────────────────────────────────── */
const DASH = { user: '/dashboard/user', pharmacy_owner: '/dashboard/owner', admin: '/dashboard/admin' }

function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { login, isAuthenticated, role } = useAuth()
  const { toast } = useToast()

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // Redirect already-authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = params.get('redirect')
      navigate(redirect ? decodeURIComponent(redirect) : (DASH[role] ?? '/'), { replace: true })
    }
  }, [isAuthenticated, role, navigate, params])

  useEffect(() => {
    document.title = 'Login – JanAushadhi Smart Medicine'
    return () => { document.title = 'JanAushadhi Smart Medicine' }
  }, [])

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
    setApiError('')
  }

  function validate() {
    const e = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }
    setErrors(e)
    return !e.email && !e.password
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError('')
    try {
      const { user, token } = await loginApi({
        email: form.email.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      })
      login(user, token, form.rememberMe)
      toast('Welcome back, ' + user.displayName + '!', { variant: 'success' })
      const redirect = params.get('redirect')
      navigate(redirect ? decodeURIComponent(redirect) : (DASH[user.role] ?? '/'), { replace: true })
    } catch (err) {
      const msg = err.message ?? 'Login failed. Please try again.'
      if (err.status === 401) {
        setErrors({ password: 'Invalid email or password.' })
      } else if (err.status === 403) {
        setErrors({ password: 'Please verify your email before logging in.' })
      } else {
        setApiError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Welcome back</h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Sign in to your JanAushadhi account
        </p>
      </div>

      {/* Demo credentials hint */}
      <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 px-4 py-3">
        <RiShieldCheckLine size={16} className="text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-primary-700 dark:text-primary-300">
          <strong>Demo:</strong> user@demo.com · pharmacy@demo.com · admin@demo.com
          <br />Password: <strong>Demo@1234</strong>
        </p>
      </div>

      {/* API-level error */}
      {apiError && (
        <div role="alert" className="mb-4 rounded-xl bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 px-4 py-3 text-sm text-danger-700 dark:text-danger-300">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate aria-label="Login form" className="space-y-4">
        {/* Email */}
        <Input
          label="Email address"
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          leftIcon={<RiMailLine size={16} />}
          placeholder="you@example.com"
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            id="login-password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            leftIcon={<RiLockPasswordLine size={16} />}
            rightIcon={
              <button
                type="button"
                tabIndex={0}
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
              >
                {showPw ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            }
            placeholder="••••••••"
          />
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) => set('rememberMe', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700"
              aria-label="Remember me for 30 days"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400">or continue with</span>
        </div>
      </div>

      {/* Google SSO placeholder */}
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        onClick={googleSignIn}
        leftIcon={<RiGoogleLine size={18} />}
        className="border border-gray-300 dark:border-gray-600"
      >
        Continue with Google
      </Button>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-primary-600 dark:text-primary-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
        >
          Create one free
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
