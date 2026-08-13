/**
 * Admin Login Page
 *
 * Route: /admin/login
 * Purpose: Dedicated entry point for platform administrators.
 *
 * Uses real FastAPI backend authentication.
 */
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiAlertCircle } from 'react-icons/fi'
import { HiOutlineShieldCheck } from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'
import { loginSchema } from '../../utils/authSchemas'
import { ROUTES } from '../../constants/routes'
import { USER_ROLES, APP_NAME } from '../../constants/app'
import Input from '../../components/forms/Input'
import PasswordInput from '../../components/forms/PasswordInput'
import Button from '../../components/ui/Button'
function AdminLoginPage() {
  const { login, isLoading, authError, clearError } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })
  function goToDashboard() {
    navigate(ROUTES.ADMIN.DASHBOARD, { replace: true })
  }
  async function onSubmit(data) {
    clearError()
    try {
      const user = await login(data)
      if (user.role === USER_ROLES.ADMIN) {
        goToDashboard()
      }
    } catch {
      // Error is already handled by AuthContext
    }
  }
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ── Brand header ────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-4 shadow-lg">
            <MdMedication
              size={28}
              className="text-white"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            {APP_NAME}
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-danger-900/60 border border-danger-700">
            <HiOutlineShieldCheck
              size={12}
              className="text-danger-400"
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold text-danger-300 uppercase tracking-widest">
              Administrator Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Authorized Personnel Only
          </p>
        </div>
        {/* ── Login card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Card heading */}
          <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
            <HiOutlineShieldCheck
              size={16}
              className="text-primary-600"
              aria-hidden="true"
            />
            Administrator Login
          </h2>
          {/* Error */}
          {authError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 mb-4 p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-sm"
            >
              <FiAlertCircle
                size={16}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              {authError}
            </div>
          )}
          {/* Login form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your administrator email"
              required
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Enter your administrator password"
              required
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              Login to Administrator Portal
            </Button>
          </form>
        </div>
        {/* ── Back link ───────────────────────────────────────────────── */}
        <p className="text-center mt-6">
          <Link
            to={ROUTES.HOME}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded"
          >
            ← Back to Home
          </Link>
        </p>

      </div>
    </div>
  )
}
export default AdminLoginPage