/**
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.htmlFor]
 * @param {boolean} [props.required]
 * @param {string} [props.helperText]
 * @param {string} [props.error]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */

function FormField({
  label,
  htmlFor,
  required,
  helperText,
  error,
  className = '',
  children,
}) {
  const errorId = htmlFor
    ? `${htmlFor}-error`
    : undefined

  const helperId = htmlFor
    ? `${htmlFor}-helper`
    : undefined

  return (
    <div
      className={`
        flex
        flex-col
        gap-1.5
        ${className}
      `}
    >

      {/* =====================================================
          Label
         ===================================================== */}
      {label && (
        <label
          htmlFor={htmlFor}
          className="
            text-sm
            font-semibold
            text-slate-800
            leading-tight
          "
        >
          {label}

          {required && (
            <span
              aria-hidden="true"
              className="
                ml-1
                text-danger-500
                font-bold
              "
            >
              *
            </span>
          )}
        </label>
      )}

      {/* =====================================================
          Input / Child
         ===================================================== */}
      {children}

      {/* =====================================================
          Helper Text
         ===================================================== */}
      {helperText && !error && (
        <p
          id={helperId}
          className="
            text-xs
            text-slate-500
            leading-snug
          "
        >
          {helperText}
        </p>
      )}

      {/* =====================================================
          Error Message
         ===================================================== */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="
            text-xs
            text-danger-600
            font-medium
            flex
            items-center
            gap-1
            leading-snug
          "
        >
          {error}
        </p>
      )}

    </div>
  )
}
export default FormField