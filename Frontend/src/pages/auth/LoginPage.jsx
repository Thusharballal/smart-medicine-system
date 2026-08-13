/**
 * Login Page
 *
 * Route     : /login (inside AuthLayout → PublicRoute)
 * Purpose   : Authenticates existing users.
 *
 * Features:
 *   - Email + password login
 *   - Show/hide password
 *   - Remember me
 *   - Forgot password link
 *   - Validation (Zod + React Hook Form)
 *   - Loading state
 *   - Error state
 *   - Accessible form
 *
 * On success → navigates to role-appropriate dashboard.
 * On failure → displays inline error from AuthContext.
 *
 * Authentication:
 *   - Uses the real FastAPI backend authentication.
 *   - No demo authentication is used.
 */
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { loginSchema } from '../../utils/authSchemas'
import { ROUTES } from '../../constants/routes'
import { USER_ROLES } from '../../constants/app'
import Input from '../../components/forms/Input'
import PasswordInput from '../../components/forms/PasswordInput'
import Checkbox from '../../components/forms/Checkbox'
import Button from '../../components/ui/Button'
function LoginPage() {
  const { login, isLoading, authError, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname
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
  function roleRedirect(role) {
    switch (role) {
      case USER_ROLES.ADMIN:
        return navigate(ROUTES.ADMIN.DASHBOARD, { replace: true })
      case USER_ROLES.PHARMACY_OWNER:
        return navigate(ROUTES.PHARMACY.DASHBOARD, { replace: true })
      case USER_ROLES.USER:
      default:
        return navigate(ROUTES.USER.DASHBOARD, { replace: true })
    }
  }
  async function onSubmit(data) {
    clearError()
    try {
      const user = await login(data)
      roleRedirect(user.role)
    } catch {
      // Error is already handled by AuthContext.
    }
  }
  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Sign in to your account to continue
        </p>
      </div>
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex items-center justify-between gap-3">
          <Checkbox
            label="Remember me"
            {...register('rememberMe')}
          />
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          className="mt-2"
        >
          Sign In
        </Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        >
          Create account
        </Link>
      </p>
    </div>
  )
}
export default LoginPage