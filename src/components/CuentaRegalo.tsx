import { useState } from 'react'

type CuentaRegaloProps = {
  moneda: string
  alias: string
  cbu: string
  cuenta: string
}

function IconCopy() {
  return (
    <svg className="inv-bank-copy-icon" viewBox="0 0 24 24" width={18} height={18} aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg className="inv-bank-copy-icon" viewBox="0 0 24 24" width={18} height={18} aria-hidden>
      <path d="M5 12.5 9.5 17 19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function copyTextSync(text: string): boolean {
  const value = String(text).trim()
  if (!value) return false

  const ta = document.createElement('textarea')
  ta.value = value
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.top = '0'
  ta.style.left = '0'
  ta.style.width = '1px'
  ta.style.height = '1px'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  ta.setSelectionRange(0, value.length)
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(ta)
  return ok
}

async function copyText(text: string): Promise<boolean> {
  const value = String(text).trim()
  if (!value) return false

  if (copyTextSync(value)) return true

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    return false
  }

  return false
}

/** Tarjeta de cuenta bancaria para regalos, con botón de copiar alias/CBU. */
export function CuentaRegalo({ moneda, alias, cbu, cuenta }: CuentaRegaloProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const fields = [
    { key: 'alias', label: 'Alias', value: alias, copyable: true },
    { key: 'cbu', label: 'CBU', value: cbu, copyable: true },
    { key: 'cuenta', label: 'Cuenta', value: cuenta, copyable: false },
  ] as const

  async function copy(key: string, text: string) {
    const ok = await copyText(text)
    if (!ok) return
    setCopied(key)
    window.setTimeout(() => setCopied(null), 2200)
  }

  return (
    <div className="inv-bank">
      <p className="inv-bank-moneda">{moneda}</p>
      {fields.map((field) => (
        <div
          key={field.key}
          className={field.copyable ? 'inv-bank-row inv-bank-row--copy' : 'inv-bank-row inv-bank-row--plain'}
        >
          <span className="inv-bank-k">{field.label}</span>
          <span className="inv-bank-v">{field.value}</span>
          {field.copyable ? (
            <button
              type="button"
              className={`inv-bank-copy${copied === field.key ? ' inv-bank-copy--done' : ''}`}
              onClick={() => copy(field.key, field.value)}
              aria-label={copied === field.key ? `${field.label} copiado` : `Copiar ${field.label.toLowerCase()}`}
            >
              {copied === field.key ? <IconCheck /> : <IconCopy />}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
