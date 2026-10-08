import { forwardRef, useState, type InputHTMLAttributes } from 'react'

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  error?: string
  className?: string
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg className="bp-password-toggle-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
        <path
          fill="currentColor"
          d="M12 5c-5.5 0-9.5 5-10 7  .5 2 4.5 7 10 7s9.5-5 10-7c-.5-2-4.5-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
        />
      </svg>
    )
  }
  return (
    <svg className="bp-password-toggle-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M2.3 1.7 1 3l3.1 3.1C2.8 7.8 1.6 9.4.7 11c.5 2 4.5 7 10 7 1.8 0 3.5-.4 5-1.1l3.3 3.3 1.3-1.3L2.3 1.7zM12 17c-4.1 0-7.6-3.4-8.9-5.2l2.1-2.1A5 5 0 0 0 12 16a4.9 4.9 0 0 0 2.8-.9l2 2A9.2 9.2 0 0 1 12 17zm8.2-2.2-1.5-1.5a9.8 9.8 0 0 0 1.5-3.3c-.5-2-4.5-7-10-7-.9 0-1.7.1-2.5.3L3.6 3.4C5.4 2.5 7.6 2 10 2c5.5 0 9.5 5 10 7-.4 1.4-1.4 3.3-2.8 5.8z"
      />
    </svg>
  )
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { label, error, className = '', id, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false)
  const fieldId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="bp-field">
      {label ? (
        <label className="bp-label" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <div className="bp-input-wrap">
        <input
          ref={ref}
          id={fieldId}
          type={visible ? 'text' : 'password'}
          className={`bp-input bp-input--with-toggle${error ? ' bp-input--error' : ''}${className ? ` ${className}` : ''}`}
          {...rest}
        />
        <button
          type="button"
          className="bp-password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
        >
          <EyeIcon hidden={!visible} />
        </button>
      </div>
      {error ? <span className="bp-error-msg">{error}</span> : null}
    </div>
  )
})
