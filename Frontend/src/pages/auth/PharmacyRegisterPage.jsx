import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiAlertCircle } from 'react-icons/fi'
import { pharmacyRegisterSchema } from '../../utils/authSchemas'
import pharmacyService from '../../services/pharmacyService'
import { ROUTES } from '../../constants/routes'
import Input from '../../components/forms/Input'
import PasswordInput from '../../components/forms/PasswordInput'
import Checkbox from '../../components/forms/Checkbox'
import Button from '../../components/ui/Button'
import PasswordStrength from '../../components/forms/PasswordStrength'
function PharmacyRegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(pharmacyRegisterSchema),
    defaultValues: {
      ownerName: '',
      pharmacyName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      drugLicenseNumber: '',
      kendraCode: '',
      gstNumber: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      acceptTerms: false,
    },
  })
  const passwordValue = useWatch({
    control,
    name: 'password',
    defaultValue: '',
  })
const [submitError, setSubmitError] = useState('')
  async function onSubmit(data) {
    setSubmitError('')
    try {
      const payload = {
        owner_name: data.ownerName,
        pharmacy_name: data.pharmacyName,
        email: data.email,
        phone_number: data.mobile,
        password: data.password,
        drug_license_number: data.drugLicenseNumber,
        kendra_code: data.kendraCode,
        gst_number: data.gstNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        pin_code: data.pinCode,
      }
      const response = await pharmacyService.create(payload)
      console.log('Pharmacy registration successful:', response)

      navigate(ROUTES.LOGIN, {
        replace: true,
        state: {
          message:
            'Pharmacy registration submitted successfully. Your account is pending admin approval.',
        },
      })
    } catch (error) {
      console.error('Pharmacy registration failed:', error)

      setSubmitError(
        error?.response?.data?.detail ||
          'Unable to register pharmacy. Please try again.'
      )
    }
  }
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          Register Your Pharmacy
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a pharmacy owner account
        </p>
      </div>
      {/* Error */}
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 mb-4 p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-sm"
        >
          <FiAlertCircle
            size={16}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <span>{submitError}</span>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        {/* Owner Information */}
        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Owner Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Owner Name"
              type="text"
              placeholder="Enter owner's full name"
              required
              autoComplete="name"
              error={errors.ownerName?.message}
              {...register('ownerName')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter pharmacy owner's email"
              required
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              required
              autoComplete="tel"
              error={errors.mobile?.message}
              {...register('mobile')}
            />
          </div>
        </div>
        {/* Pharmacy Information */}
        <div className="pt-2">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Pharmacy Information
          </h2>

          <div className="space-y-4">
            <Input
              label="Pharmacy Name"
              type="text"
              placeholder="Enter pharmacy name"
              required
              error={errors.pharmacyName?.message}
              {...register('pharmacyName')}
            />

            <Input
              label="Drug License Number"
              type="text"
              placeholder="Enter drug license number"
              required
              error={errors.drugLicenseNumber?.message}
              {...register('drugLicenseNumber')}
            />
            <Input
              label="Jan Aushadhi Kendra Code"
              placeholder="e.g. PMBJK00017"
              required
              {...register('kendraCode')}
              error={errors.kendraCode?.message}
            />
            <Input
              label="GST Number"
              type="text"
              placeholder="Enter GST number"
              required
              error={errors.gstNumber?.message}
              {...register('gstNumber')}
            />
          </div>
        </div>

        {/* Address */}
        <div className="pt-2">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Pharmacy Address
          </h2>

          <div className="space-y-4">
            <Input
              label="Address"
              type="text"
              placeholder="Enter pharmacy address"
              required
              error={errors.address?.message}
              {...register('address')}
            />

            <Input
              label="City"
              type="text"
              placeholder="Enter city"
              required
              error={errors.city?.message}
              {...register('city')}
            />

            <Input
              label="State"
              type="text"
              placeholder="Enter state"
              required
              error={errors.state?.message}
              {...register('state')}
            />

            <Input
              label="PIN Code"
              type="text"
              placeholder="Enter 6-digit PIN code"
              required
              maxLength={6}
              inputMode="numeric"
              error={errors.pinCode?.message}
              {...register('pinCode')}
            />
          </div>
        </div>

        {/* Password */}
        <div className="pt-2">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Account Security
          </h2>

          <div className="space-y-4">
            <div>
              <PasswordInput
                label="Password"
                placeholder="Create a strong password"
                required
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />

              <PasswordStrength password={passwordValue} />
            </div>

            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
        </div>

        {/* Terms */}
        <Checkbox
          label="I accept the Terms & Conditions and Privacy Policy"
          required
          error={errors.acceptTerms?.message}
          {...register('acceptTerms')}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          className="mt-2"
        >
          Register Pharmacy
        </Button>
      </form>

      {/* Login */}
      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Sign in
        </Link>
      </p>

      {/* User registration */}
      <p className="text-center text-sm text-slate-500 mt-3">
        Are you a patient/user?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Create a user account
        </Link>
      </p>
    </div>
  )
}
export default PharmacyRegisterPage