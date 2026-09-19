import type { SelectHTMLAttributes } from 'react'

type Option = { value: string; label: string }

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  options: Option[]
  error?: string
  placeholder?: string
  className?: string
}

export function Select({
  label,
  options,
  error,
  placeholder,
  className = '',
  id,
  ...rest
}: SelectProps) {
  const fieldId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="bp-field">
      {label ? (
        <label className="bp-label" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <select
        id={fieldId}
        className={`bp-select${error ? ' bp-input--error' : ''}${className ? ` ${className}` : ''}`}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <span className="bp-error-msg">{error}</span> : null}
    </div>
  )
}
