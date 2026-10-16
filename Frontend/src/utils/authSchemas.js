import { z } from 'zod'

// ── Reusable field definitions ─────────────────────────────────────────────

const emailField = z
  .string()
  .min(1, 'Email address is required.')
  .email('Please enter a valid email address.')

const passwordField = z
  .string()
  .min(8, 'Password must contain at least 8 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')

const mobileField = z
  .string()
  .min(1, 'Mobile number is required.')
  .regex(
    /^(\+91)?[6-9]\d{9}$/,
    'Please enter a valid 10-digit Indian mobile number.'
  )

const nameField = z
  .string()
  .min(2, 'Full name must be at least 2 characters.')
  .max(60, 'Full name must not exceed 60 characters.')
  .regex(
    /^[a-zA-Z\s]+$/,
    'Full name can only contain letters and spaces.'
  )

// ── Login schema ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,

  password: z
    .string()
    .min(1, 'Password is required.'),

  rememberMe: z.boolean().optional(),
})

// ── Patient / User Registration schema ─────────────────────────────────────

export const registerSchema = z
  .object({
    fullName: nameField,

    email: emailField,

    mobile: mobileField,

    password: passwordField,

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password.'),

    acceptTerms: z.literal(true, {
      errorMap: () => ({
        message:
          'You must accept the Terms & Conditions to continue.',
      }),
    }),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message:
        'Passwords do not match. Please re-enter your password.',
      path: ['confirmPassword'],
    }
  )

// ── Pharmacy Owner Registration schema ─────────────────────────────────────

export const pharmacyRegisterSchema = z
  .object({
    ownerName: z
      .string()
      .min(2, 'Owner name must be at least 2 characters.')
      .max(100, 'Owner name must not exceed 100 characters.'),

    pharmacyName: z
      .string()
      .min(3, 'Pharmacy name must be at least 3 characters.')
      .max(150, 'Pharmacy name must not exceed 150 characters.'),

    email: emailField,

    mobile: mobileField,

    password: passwordField,

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password.'),

    drugLicenseNumber: z
      .string()
      .min(1, 'Drug license number is required.'),
    kendraCode: z
        .string()
        .trim()
        .min(1, 'Kendra Code is required.')
        .regex(
          /^PMBJK\d{5}$/,
          'Enter a valid Kendra Code (e.g., PMBJK00017).'
      ),

    gstNumber: z
      .string()
      .min(1, 'GST number is required.'),

    address: z
      .string()
      .min(5, 'Address must be at least 5 characters.'),

    city: z
      .string()
      .min(2, 'City is required.'),

    state: z
      .string()
      .min(2, 'State is required.'),

    pinCode: z
      .string()
      .length(
        6,
        'PIN code must be exactly 6 digits.'
      )
      .regex(
        /^\d{6}$/,
        'PIN code must contain only digits.'
      ),

    acceptTerms: z.literal(true, {
      errorMap: () => ({
        message:
          'You must accept the Terms & Conditions to continue.',
      }),
    }),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message:
        'Passwords do not match. Please re-enter your password.',
      path: ['confirmPassword'],
    }
  )

// ── OTP schema ─────────────────────────────────────────────────────────────

export const otpSchema = z.object({
  otp: z
    .string()
    .length(
      6,
      'Verification code must be exactly 6 digits.'
    )
    .regex(
      /^\d{6}$/,
      'Verification code must contain only digits.'
    ),
})

// ── Forgot password schema ─────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: emailField,
})

// ── Reset password schema ──────────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    password: passwordField,

    confirmPassword: z
      .string()
      .min(
        1,
        'Please confirm your new password.'
      ),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message:
        'Passwords do not match. Please re-enter your new password.',
      path: ['confirmPassword'],
    }
  )