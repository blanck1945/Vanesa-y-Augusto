import { useEffect } from 'react'
import { CIVIL } from '../content/civil'

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CIVIL.mapsQuery)}`

export function CivilPage() {
  useEffect(() => {
    const prev = document.title
    document.title = `Matrimonio civil — ${CIVIL.novios.ella} y ${CIVIL.novios.el}`
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

      <article className="civil-flyer" aria-label="Flyer matrimonio civil">
        <div className="civil-decor" aria-hidden="true">
          <img
            className="civil-decor-rama civil-decor-rama--izq"
            src="/decor/separadores/hojas-medianas.png?v=4"
            alt=""
          />
          <img
            className="civil-decor-rama civil-decor-rama--der"
            src="/decor/separadores/hojas-medianas.png?v=4"
            alt=""
          />
        </div>

        <div className="civil-flyer-inner">
          <p className="civil-eyebrow">{CIVIL.eyebrow}</p>

          <div className="civil-names">
            <p className="civil-name">{CIVIL.novios.ella}</p>
            <p className="civil-amp" aria-hidden="true">
              y
            </p>
            <p className="civil-name">{CIVIL.novios.el}</p>
          </div>

          <hr className="civil-rule" />

          <div className="civil-meta">
            <p className="civil-date">{CIVIL.fechaLabel}</p>
            <p className="civil-time">{CIVIL.horario}</p>
          </div>

          <p className="civil-place-label">Lugar</p>
          <p className="civil-place">{CIVIL.lugar}</p>
          <p className="civil-address">{CIVIL.direccion}</p>

          <p className="civil-invite">{CIVIL.invitacion}</p>

          <img className="civil-sello" src="/sobre/sello-cera.png" alt="" />
        </div>
      </article>
    </div>
  )
}
