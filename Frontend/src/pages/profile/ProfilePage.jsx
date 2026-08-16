import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineBell,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'

import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Input from '../../components/forms/Input'
import Toggle from '../../components/forms/Toggle'
import Button from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import userService from '../../services/userService'
// ============================================================
// Validation
// ============================================================
const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters'),

  email: z
    .string()
    .email('Enter a valid email'),

  phone: z
    .string()
    .trim()
    .optional(),
})
// ============================================================
// Profile Page
// ============================================================
function ProfilePage() {
  const {
    currentUser,
    updateCurrentUser,
  } = useAuth()

  const [notifEnabled, setNotifEnabled] = useState(true)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')
  // ============================================================
  // Current user information
  // ============================================================
  const name =
    currentUser?.full_name ||
    currentUser?.name ||
    'User'
  const email =
    currentUser?.email ||
    ''
  const role =
    currentUser?.role ||
    'USER'
  const phone =
    currentUser?.phone_number ||
    ''
  // ============================================================
  // Form
  // ============================================================
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name,
      email,
      phone,
    },
  })
  // ============================================================
  // Keep form synchronized with AuthContext
  // ============================================================
  useEffect(() => {
    reset({
      name,
      email,
      phone,
    })
  }, [name, email, phone, reset])
  // ============================================================
  // Save profile
  // ============================================================
  async function onSubmit(data) {
    setServerError('')
    setSaved(false)
    try {
      const response = await userService.updateMe({
        full_name: data.name,
        phone_number: data.phone || null,
      })
      const updatedUser = response?.data
      if (updatedUser) {
        updateCurrentUser(updatedUser)
        reset({
          name:
            updatedUser.full_name ||
            updatedUser.name ||
            data.name,
          email:
            updatedUser.email ||
            data.email,
          phone:
            updatedUser.phone_number ||
            data.phone ||
            '',
        })
      }
      setSaved(true)
      window.setTimeout(() => {
        setSaved(false)
      }, 2500)
    } catch (error) {
      console.error('Profile Update Error:', error)
      const detail =
        error?.response?.data?.detail
      setServerError(
        typeof detail === 'string'
          ? detail
          : 'Failed to update your profile. Please try again.'
      )
    }
  }
  // ============================================================
  // Render
  // ============================================================
  return (
    <article
      aria-label="User Profile"
      className="
        w-full
        max-w-3xl
        mx-auto
        flex
        flex-col
        gap-5
      "
    >
      {/* ======================================================
          Profile Header
         ====================================================== */}

      <section
        aria-labelledby="profile-heading"
        className="
          relative
          overflow-hidden
          bg-gradient-to-br
          from-primary-600
          to-primary-700
          rounded-2xl
          p-6
          sm:p-7
          text-white
        "
      >

        {/* Background decoration */}

        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            bg-[radial-gradient(white_1px,transparent_1px)]
            [background-size:28px_28px]
            opacity-5
            pointer-events-none
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            sm:flex-row
            sm:items-center
            gap-5
          "
        >

          {/* Avatar */}

          <Avatar
            name={name}
            size="xl"
            online
          />

          {/* User information */}

          <div className="min-w-0">

            <p className="text-primary-200 text-xs uppercase tracking-wider font-medium">
              My Profile
            </p>

            <h1
              id="profile-heading"
              className="
                text-2xl
                sm:text-3xl
                font-extrabold
                text-white
                leading-tight
                truncate
              "
            >
              {name}
            </h1>

            <p className="text-primary-200 text-sm mt-1 truncate">
              {email || 'Email not available'}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">

              <Badge
                variant="success"
                size="sm"
                dot
              >
                Active
              </Badge>

              <Badge
                variant="primary"
                size="sm"
              >
                {role.replaceAll('_', ' ')}
              </Badge>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          Personal Information
         ====================================================== */}

      <section
        aria-labelledby="personal-information-heading"
        className="
          bg-white
          rounded-2xl
          border
          border-slate-100
          shadow-sm
          p-5
          sm:p-6
        "
      >

        <div className="mb-5">

          <h2
            id="personal-information-heading"
            className="
              text-base
              font-bold
              text-slate-800
              flex
              items-center
              gap-2
            "
          >
            <HiOutlineUser
              size={18}
              className="text-primary-600"
              aria-hidden="true"
            />

            Personal Information
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Keep your account information up to date.
          </p>

        </div>

        {/* Server error */}

        {serverError && (
          <div
            role="alert"
            className="
              mb-4
              rounded-xl
              border
              border-danger-200
              bg-danger-50
              px-4
              py-3
              text-sm
              text-danger-700
            "
          >
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >

          {/* Name + Email */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Input
              label="Full Name"
              required
              error={errors.name?.message}
              {...register('name')}
              placeholder="Enter your full name"
            />

            <Input
              label="Email Address"
              required
              type="email"
              error={errors.email?.message}
              {...register('email')}
              placeholder="Enter your email address"
              disabled
            />

          </div>

          {/* Phone */}

          <Input
            label="Mobile Number"
            type="tel"
            error={errors.phone?.message}
            {...register('phone')}
            placeholder="Enter your 10-digit mobile number"
          />

          {/* Email explanation */}

          <p className="text-[11px] text-slate-400">
            Email address cannot be changed from this page.
          </p>

          {/* Save */}

          <div className="flex flex-wrap items-center gap-3 pt-1">

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={!isDirty || isSubmitting}
            >
              Save Changes
            </Button>

            {saved && (
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  text-sm
                  font-medium
                  text-success-600
                "
              >
                <HiOutlineCheckCircle
                  size={17}
                  aria-hidden="true"
                />

                Profile updated successfully.
              </div>
            )}

          </div>

        </form>

      </section>

      {/* ======================================================
          Preferences
         ====================================================== */}

      <section
        aria-labelledby="preferences-heading"
        className="
          bg-white
          rounded-2xl
          border
          border-slate-100
          shadow-sm
          p-5
          sm:p-6
        "
      >

        <div className="mb-4">

          <h2
            id="preferences-heading"
            className="
              text-base
              font-bold
              text-slate-800
              flex
              items-center
              gap-2
            "
          >
            <HiOutlineBell
              size={18}
              className="text-primary-600"
              aria-hidden="true"
            />

            Preferences
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Control how you receive medicine-related updates.
          </p>

        </div>

        {/* Notifications */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            py-3
            border-b
            border-slate-100
          "
        >

          <div>

            <p className="text-sm font-semibold text-slate-700">
              Notifications
            </p>

            <p className="text-xs text-slate-400 mt-0.5">
              Medicine availability, recommendations and reminders
            </p>

          </div>

          <Toggle
            size="sm"
            checked={notifEnabled}
            onChange={setNotifEnabled}
            aria-label="Toggle notifications"
          />

        </div>

        {/* Language */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            py-3
          "
        >

          <div>

            <p className="text-sm font-semibold text-slate-700">
              Language
            </p>

            <p className="text-xs text-slate-400 mt-0.5">
              Application display language
            </p>

          </div>

          <Badge
            variant="neutral"
            size="sm"
          >
            English (India)
          </Badge>

        </div>

      </section>

      {/* ======================================================
          Security
         ====================================================== */}

      <section
        aria-labelledby="security-heading"
        className="
          bg-white
          rounded-2xl
          border
          border-slate-100
          shadow-sm
          p-5
          sm:p-6
        "
      >

        <div className="mb-4">

          <h2
            id="security-heading"
            className="
              text-base
              font-bold
              text-slate-800
              flex
              items-center
              gap-2
            "
          >
            <HiOutlineShieldCheck
              size={18}
              className="text-success-600"
              aria-hidden="true"
            />

            Security
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Manage your account security.
          </p>

        </div>

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            rounded-xl
            border
            border-slate-100
            px-4
            py-3
          "
        >

          <div>

            <p className="text-sm font-semibold text-slate-700">
              Password
            </p>

            <p className="text-xs text-slate-400 mt-0.5">
              Change your account password
            </p>

          </div>

          <button
            type="button"
            disabled
            className="
              px-3
              py-2
              rounded-lg
              bg-slate-100
              text-slate-400
              text-xs
              font-semibold
              cursor-not-allowed
            "
            title="Change password API is not connected yet"
          >
            Change Password
          </button>

        </div>

        <p className="text-[11px] text-slate-400 mt-3">
          Password management will be enabled when the corresponding
          backend API is available.
        </p>

      </section>

    </article>
  )
}

export default ProfilePage