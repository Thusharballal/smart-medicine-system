/**
 * authValidation – pure validation helpers for auth forms.
 * All functions return an error string or empty string.
 */

/** RFC 5322-ish email check */
export function validateEmail(value) {
  if (!value || !value.trim()) return 'Email is required.'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!re.test(value.trim())) return 'Enter a valid email address.'
  return ''
}

/** Password: min 8 chars, 1 uppercase, 1 digit */
export function validatePassword(value) {
  if (!value) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  return ''
}

/** Confirm password match */
export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Please confirm your password.'
  if (password !== confirm) return 'Passwords do not match.'
  return ''
}

/** Display name: required, 2-60 chars */
export function validateDisplayName(value) {
  if (!value || !value.trim()) return 'Full name is required.'
  if (value.trim().length < 2) return 'Name must be at least 2 characters.'
  if (value.trim().length > 60) return 'Name must be 60 characters or fewer.'
  return ''
}

/** Indian mobile: 10 digits, starts with 6-9 */
export function validateMobile(value) {
  if (!value || !value.trim()) return 'Mobile number is required.'
  const re = /^[6-9]\d{9}$/
  if (!re.test(value.trim())) return 'Enter a valid 10-digit Indian mobile number.'
  return ''
}

/** Role selection */
export function validateRole(value) {
  const valid = ['user', 'pharmacy_owner']
  if (!valid.includes(value)) return 'Please select a role.'
  return ''
}

/** 6-digit OTP */
export function validateOtp(value) {
  if (!value || value.length < 6) return 'Enter the 6-digit OTP.'
  if (!/^\d{6}$/.test(value)) return 'OTP must be 6 digits.'
  return ''
}

/**
 * Password strength – returns { score: 0–4, label, color }
 *   0 = very weak, 4 = strong
 */
export function passwordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  // cap at 4 meaningful levels
  const capped = Math.min(score, 4)
  const map = [
    { label: 'Very Weak', color: 'bg-danger-600' },
    { label: 'Weak',      color: 'bg-warning-600' },
    { label: 'Fair',      color: 'bg-warning-400' },
    { label: 'Good',      color: 'bg-accent-500'  },
    { label: 'Strong',    color: 'bg-accent-600'  },
  ]

  return { score: capped, ...map[capped] }
}
