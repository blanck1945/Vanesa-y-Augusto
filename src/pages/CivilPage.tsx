import { useEffect } from 'react'
import { CIVIL } from '../content/civil'

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CIVIL.mapsQuery)}`

const HOJAS_MED = '/decor/separadores/hojas-medianas.png?v=4'
const HOJAS_LARGAS = '/decor/separadores/hojas-largas.png?v=6'
const HOJAS_CORTAS = '/decor/separadores/hojas-cortas.png?v=2'
const DIVISOR = '/decor/separadores/divisor-hojas-separador.png?v=2'
const RAMA_IZQ = '/decor/enredaderas/rama-izq.png'
const RAMA_DER = '/decor/enredaderas/rama-der.png'

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
        <div className="civil-decor" aria-hidden="true">
          <img className="civil-decor-band civil-decor-band--top" src={HOJAS_LARGAS} alt="" />
          <img className="civil-decor-band civil-decor-band--top-soft" src={HOJAS_MED} alt="" />

          <img className="civil-decor-rama civil-decor-rama--izq" src={HOJAS_MED} alt="" />
          <img className="civil-decor-rama civil-decor-rama--der" src={HOJAS_MED} alt="" />
          <img className="civil-decor-rama civil-decor-rama--izq-alta" src={HOJAS_MED} alt="" />
          <img className="civil-decor-rama civil-decor-rama--der-alta" src={HOJAS_MED} alt="" />
          <img className="civil-decor-rama civil-decor-rama--izq-baja" src={HOJAS_MED} alt="" />
          <img className="civil-decor-rama civil-decor-rama--der-baja" src={HOJAS_MED} alt="" />

          <img className="civil-decor-vine civil-decor-vine--tl" src={RAMA_IZQ} alt="" />
          <img className="civil-decor-vine civil-decor-vine--tr" src={RAMA_DER} alt="" />
          <img className="civil-decor-vine civil-decor-vine--bl" src={RAMA_IZQ} alt="" />
          <img className="civil-decor-vine civil-decor-vine--br" src={RAMA_DER} alt="" />

          <img className="civil-decor-band civil-decor-band--bottom" src={HOJAS_LARGAS} alt="" />
          <img className="civil-decor-band civil-decor-band--bottom-soft" src={HOJAS_MED} alt="" />
        </div>

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
          <p className="civil-address">{CIVIL.direccion}</p>

          <img className="civil-sep" src={DIVISOR} alt="" />

          <p className="civil-invite">{CIVIL.invitacion}</p>

          <img className="civil-sello" src="/sobre/sello-cera.png" alt="" />
        </div>
      </article>
    </div>
  )
}
