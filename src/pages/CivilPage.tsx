import { useEffect } from 'react'
import { CIVIL } from '../content/civil'

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CIVIL.mapsQuery)}`

const HOJAS_CORTAS = '/decor/separadores/hojas-cortas.png?v=2'
const DIVISOR = '/decor/separadores/divisor-hojas-separador.png?v=2'

export function CivilPage() {
  useEffect(() => {
    const prev = document.title
    document.title = `${CIVIL.novios.ella} y ${CIVIL.novios.el} — Registro Civil`
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <div className="civil-page">
      <div className="civil-toolbar" role="group" aria-label="Acciones">
        <button type="button" onClick={() => window.print()}>
          Imprimir / PDF
        </button>
        <a href={mapsHref} target="_blank" rel="noopener noreferrer">
          Abrir mapa
        </a>
      </div>

      <article className="civil-flyer" aria-label="Flyer Registro Civil">
        <div className="civil-flyer-inner">
          <div className="civil-names">
            <p className="civil-name">{CIVIL.novios.ella}</p>
            <p className="civil-amp" aria-hidden="true">
              y
            </p>
            <p className="civil-name">{CIVIL.novios.el}</p>
          </div>

          <img className="civil-sep" src={DIVISOR} alt="" />

          <div className="civil-meta">
            <p className="civil-date">{CIVIL.fechaLabel}</p>
            <p className="civil-time">{CIVIL.horario}</p>
          </div>

          <img className="civil-sep civil-sep--sm" src={HOJAS_CORTAS} alt="" />

          <p className="civil-place">{CIVIL.lugar}</p>
          <p className="civil-address">{CIVIL.calle}</p>
          <p className="civil-city">{CIVIL.ciudad}</p>

          <img className="civil-sep" src={DIVISOR} alt="" />

          <p className="civil-invite">{CIVIL.invitacion}</p>

          <img className="civil-sello" src="/sobre/sello-cera.png" alt="" />
        </div>
      </article>
    </div>
  )
}
