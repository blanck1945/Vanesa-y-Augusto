import { forwardRef, type InputHTMLAttributes } from 'react'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  className?: string
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, className = '', id, ...rest },
  ref,
) {
  const fieldId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="bp-field">
      {label ? (
        <label className="bp-label" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={fieldId}
        className={`bp-input${error ? ' bp-input--error' : ''}${className ? ` ${className}` : ''}`}
        {...rest}
      />
      {error ? <span className="bp-error-msg">{error}</span> : null}
    </div>
  )
})
