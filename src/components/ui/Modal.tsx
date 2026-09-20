import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="dash-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="dash-modal-title" onClick={onClose}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dash-modal-header">
          <h2 id="dash-modal-title" className="dash-modal-title">
            {title}
          </h2>
          <button type="button" className="dash-modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="dash-modal-body">{children}</div>
        {footer ? <div className="dash-modal-footer">{footer}</div> : null}
      </div>
    </div>
  )
}
