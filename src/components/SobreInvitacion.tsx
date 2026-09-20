import { useEffect, useRef, useState } from 'react'
import { SOBRE_SELLO_SRC, preloadSelloCera } from '../lib/sobreAssets'

const AUTO_OPEN_MS = 5000
const ABRIENDO_MS = 2800

type Estado = 'cerrado' | 'abriendo' | 'listo'

export type ComentarioPlace = {
  sectionId: string
  sectionLabel: string
  xPct: number
  yPct: number
}

type SobreInvitacionProps = {
  nombreInvitado?: string
  permitePareja?: boolean
  onListo?: () => void
  /** Si está en true, el sobre queda fijo cerrado (usado por /muestra para comentar sobre el sobre). */
  freeze?: boolean
  commentMode?: boolean
  onCommentPlace?: (place: ComentarioPlace) => void
}

function quitarSufijoPareja(nombre: string): string {
  return nombre.replace(/\s+pareja\s*$/i, '').trim()
}

/** Animación de sobre de papel que se abre solo (o al toque) y revela la invitación. */
export function SobreInvitacion({
  nombreInvitado,
  permitePareja = false,
  onListo,
  freeze = false,
  commentMode = false,
  onCommentPlace,
}: SobreInvitacionProps) {
  const [estado, setEstado] = useState<Estado>('cerrado')
  const [visualListo, setVisualListo] = useState(false)
  const abriendoRef = useRef(false)
  const listoNotificadoRef = useRef(false)
  const rootRef = useRef<HTMLDivElement>(null)

  function abrir() {
    if (freeze || abriendoRef.current) return
    abriendoRef.current = true
    window.scrollTo(0, 0)
    if (!listoNotificadoRef.current) {
      listoNotificadoRef.current = true
      onListo?.()
    }
    setEstado('abriendo')
  }

  useEffect(() => {
    let cancelled = false
    void preloadSelloCera().then(() => {
      if (!cancelled) setVisualListo(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (freeze) {
      abriendoRef.current = false
      listoNotificadoRef.current = false
      setEstado('cerrado')
    }
  }, [freeze])

  useEffect(() => {
    if (freeze || estado !== 'cerrado' || !visualListo) return
    const id = window.setTimeout(abrir, AUTO_OPEN_MS)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, freeze, visualListo])

  useEffect(() => {
    if (estado !== 'abriendo') return
    const id = window.setTimeout(() => setEstado('listo'), ABRIENDO_MS)
    return () => window.clearTimeout(id)
  }, [estado])

  useEffect(() => {
    if (estado !== 'cerrado') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [estado])

  function onHit(e: React.MouseEvent<HTMLButtonElement>) {
    if (freeze && commentMode && onCommentPlace) {
      e.preventDefault()
      e.stopPropagation()
      const el = rootRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const w = rect.width || 1
      const h = rect.height || 1
      onCommentPlace({
        sectionId: 'sobre',
        sectionLabel: 'Sobre',
        xPct: Math.min(100, Math.max(0, ((e.clientX - rect.left) / w) * 100)),
        yPct: Math.min(100, Math.max(0, ((e.clientY - rect.top) / h) * 100)),
      })
      return
    }
    abrir()
  }

  if (estado === 'listo') return null

  const cls = [
    'inv-sobre',
    !visualListo ? 'inv-sobre--preparando' : '',
    estado === 'abriendo' ? 'inv-sobre--abriendo' : '',
    freeze ? 'inv-sobre--freeze' : '',
    freeze && commentMode ? 'inv-sobre--commentable' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={rootRef}
      className={cls}
      role="presentation"
      data-inv-section="sobre"
      data-inv-label="Sobre"
    >
      <button
        type="button"
        className="inv-sobre-hit"
        onClick={onHit}
        aria-label={freeze && commentMode ? 'Click para comentar en el sobre' : 'Abrir invitación'}
      >
        <div className="inv-sobre-cuerpo">
          {nombreInvitado ? (
            <>
              <p className="inv-sobre-para">{quitarSufijoPareja(nombreInvitado)}</p>
              <p className="inv-sobre-personas">{permitePareja ? '2 personas' : '1 persona'}</p>
            </>
          ) : (
            <p className="inv-sobre-para">Para vos</p>
          )}
        </div>
        <div className="inv-sobre-solapa" aria-hidden>
          <div className="inv-sobre-solapa-cara" />
          <span className="inv-sobre-sello" aria-hidden>
            <img
              className="inv-sobre-sello-img"
              src={SOBRE_SELLO_SRC}
              alt=""
              width={280}
              height={280}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
            />
          </span>
          <svg className="inv-sobre-plegues" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <line x1="0" y1="0" x2="50" y2="100" />
            <line x1="100" y1="0" x2="50" y2="100" />
          </svg>
        </div>
        <p className="inv-sobre-hint">
          {freeze && commentMode
            ? 'Click para dejar un comentario'
            : estado === 'cerrado'
              ? 'Tocá para abrir'
              : '\u00A0'}
        </p>
      </button>
    </div>
  )
}
