import { forwardRef, useId } from 'react'
import FormField from './FormField'
const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    placeholder,
    helperText,
    error,
    required,
    disabled,
    leftIcon,
    rightIcon,
    className = '',
    id: idProp,
    ...rest
  },
  ref,
) {
  const autoId = useId()
  const id = idProp || autoId
  const inputClasses = [
    // Base appearance
    'w-full',
    'h-11',
    'rounded-xl',
    'border',
    'bg-white',
    // IMPORTANT: visible text
    'text-slate-900',
    'placeholder:text-slate-400',
    // Border
    error
      ? 'border-danger-500'
      : 'border-slate-300',
    // Spacing
    leftIcon ? 'pl-10' : 'pl-3',
    rightIcon ? 'pr-10' : 'pr-3',
    // Focus
    'outline-none',
    'transition-all',
    'focus:border-primary-500',
    'focus:ring-2',
    'focus:ring-primary-500/20',
    // Disabled
    disabled
      ? 'bg-slate-100 text-slate-500 cursor-not-allowed opacity-70'
      : '',

    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <FormField
      label={label}
      htmlFor={id}
      required={required}
      helperText={helperText}
      error={error}
    >
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <span
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-500
              pointer-events-none
              z-10
            "
          >
            {leftIcon}
          </span>
        )}
        {/* Input */}
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${id}-error`
              : helperText
                ? `${id}-helper`
                : undefined
          }
          className={inputClasses}
          {...rest}
        />
        {/* Right icon */}
        {rightIcon && (
          <span
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-slate-500
              pointer-events-none
              z-10
            "
          >
            {rightIcon}
          </span>
        )}
      </div>
    </FormField>
  )
})
export default Input