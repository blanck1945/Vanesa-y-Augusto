import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { BotonMapa } from '../components/BotonMapa'
import { CarruselFiesta } from '../components/CarruselFiesta'
import { CuentaRegalo } from '../components/CuentaRegalo'
import { DecorFloral } from '../components/DecorFloral'
import { InvReveal } from '../components/InvReveal'
import { HeroPortada } from '../components/HeroPortada'
import { Reloj } from '../components/Reloj'
import { Section } from '../components/Section'
import { SepSlot } from '../components/SepHojas'
import { SobreInvitacion } from '../components/SobreInvitacion'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Select } from '../components/ui/Select'
import { CASAMIENTO } from '../content/casamiento'
import {
  type EstadoInvitacion,
  type Invitacion,
  getInvitacionByToken,
  rsvpInvitacion,
} from '../data/api'
import { applyInvitacionState, quitarSufijoPareja, whatsappHref } from '../lib/invitacionState'

type InvitacionPageProps = {
  invitacionOverride?: Invitacion
  skipSobre?: boolean
  freezeSobre?: boolean
}

export function InvitacionPage({
  invitacionOverride,
  skipSobre = false,
  freezeSobre = false,
}: InvitacionPageProps) {
  const { token: tokenFromRoute = '' } = useParams()
  const token = invitacionOverride?.token ?? tokenFromRoute
  const isDemo = !!invitacionOverride

  const [inv, setInv] = useState<Invitacion | null>(invitacionOverride ?? null)
  const [loading, setLoading] = useState(!invitacionOverride)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [estado, setEstado] = useState<EstadoInvitacion>('si')
  const [modoAsistencia, setModoAsistencia] = useState<'solo' | 'pareja'>('solo')
  const [nombreAcompanante, setNombreAcompanante] = useState('')
  const [restriccionesSi, setRestriccionesSi] = useState<'si' | 'no'>('no')
  const [done, setDone] = useState(false)
  const [sobreListo, setSobreListo] = useState(skipSobre || freezeSobre)

  useEffect(() => {
    document.title = isDemo
      ? `${CASAMIENTO.novios} · Vista`
      : `${CASAMIENTO.novios} · Casamiento`
    window.scrollTo(0, 0)
    const root = document.documentElement
    const prevGutter = root.style.scrollbarGutter
    const prevOverflow = root.style.overflowY
    root.style.scrollbarGutter = 'stable'
    root.style.overflowY = 'scroll'
    return () => {
      root.style.scrollbarGutter = prevGutter
      root.style.overflowY = prevOverflow
    }
  }, [isDemo])

  useEffect(() => {
    if (!invitacionOverride) return
    applyInvitacionState(invitacionOverride, {
      setInv,
      setEstado,
      setDone,
      setNombreAcompanante,
      setModoAsistencia,
      setRestriccionesAlimentariasSi: setRestriccionesSi,
    })
    setLoading(false)
    setError(null)
    setSobreListo(skipSobre || freezeSobre)
  }, [invitacionOverride, skipSobre, freezeSobre])

  useEffect(() => {
    if (invitacionOverride || !token) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getInvitacionByToken(token)
        if (cancelled) return
        applyInvitacionState(data, {
          setInv,
          setEstado,
          setDone,
          setNombreAcompanante,
          setModoAsistencia,
          setRestriccionesAlimentariasSi: setRestriccionesSi,
        })
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, invitacionOverride])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token && !isDemo) return

    const conPareja = estado === 'si' && !!inv?.permitePareja && modoAsistencia === 'pareja'
    const nombrePareja = nombreAcompanante.trim()
    if (conPareja && !nombrePareja) {
      setError('Si venís en pareja, indicá el nombre de tu acompañante')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (isDemo && inv) {
        const updated: Invitacion = {
          ...inv,
          estado,
          nombreAcompanante: conPareja ? nombrePareja : null,
          restriccionesAlimentariasSi: restriccionesSi === 'si',
          restriccionesAlimentarias: null,
          respondidoAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setInv(updated)
        setModoAsistencia(updated.nombreAcompanante ? 'pareja' : 'solo')
        setNombreAcompanante(updated.nombreAcompanante || '')
        setDone(true)
        return
      }

      const updated = await rsvpInvitacion(token, {
        estado,
        nombreAcompanante: conPareja ? nombrePareja : null,
        restriccionesAlimentariasSi: restriccionesSi === 'si',
        restriccionesAlimentarias: null,
      })
      setInv(updated)
      setModoAsistencia(updated.nombreAcompanante ? 'pareja' : 'solo')
      setNombreAcompanante(updated.nombreAcompanante || '')
      setRestriccionesSi(updated.restriccionesAlimentariasSi ? 'si' : 'no')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="invitacion inv-loading">
        <p>Cargando invitación…</p>
      </div>
    )
  }

  if (error && !inv) {
    return (
      <div className="invitacion inv-error-page">
        <p className="inv-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="invitacion min-h-svh w-full">
      {skipSobre ? null : (
        <SobreInvitacion
          nombreInvitado={inv?.nombre}
          permitePareja={inv?.permitePareja}
          onListo={() => setSobreListo(true)}
          freeze={freezeSobre}
        />
      )}

      <section
        className={`inv-hero inv-hero--portada${sobreListo ? ' inv-hero--revealed' : ''}`}
        data-inv-section="portada"
        data-inv-label="Portada"
        aria-label="Portada"
      >
        <DecorFloral />
        {sobreListo ? (
          <HeroPortada image={CASAMIENTO.sobreFotos[0]} novia="Vanesa" novio="Augusto" active={sobreListo} />
        ) : null}
      </section>

      <section
        className={`inv-band inv-band--tall inv-band--pearl inv-hero-intro inv-band--sep-abajo${
          sobreListo ? ' inv-hero-intro--revealed' : ''
        }`}
        data-inv-section="hero"
        data-inv-label="Presentación"
      >
        <div className="inv-band-inner inv-hero-inner">
          <InvReveal active={sobreListo}>
            <p className="inv-eyebrow">¡Nos casamos!</p>
          </InvReveal>
          <InvReveal active={sobreListo} delay={1}>
            <div className="inv-names">
              <h1 className="inv-name">Vanesa</h1>
              <span className="inv-amp" aria-hidden>
                &amp;
              </span>
              <h1 className="inv-name">Augusto</h1>
            </div>
          </InvReveal>
          <InvReveal active={sobreListo} delay={2}>
            <p className="inv-date">{CASAMIENTO.fechaLabel}</p>
          </InvReveal>
          {inv ? (
            <InvReveal active={sobreListo} delay={3}>
              <div className="inv-guest">
                <p className="inv-guest-hello">{quitarSufijoPareja(inv.nombre)}</p>
                <p className="inv-guest-meta">Queremos que formes parte de este momento</p>
              </div>
            </InvReveal>
          ) : null}
        </div>
        {sobreListo ? (
          <div className="inv-sep-foto inv-sep-foto--hero-countdown" aria-hidden>
            <img
              src="/decor/separadores/hojas-largas.png?v=4"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
      </section>

      <main>
        <Section
          tone="leaf"
          align="center"
          label="Cuenta regresiva"
          revealActive={sobreListo}
          flores="both"
          sectionId="countdown"
          sepAbajo
        >
          <Reloj fechaIso={CASAMIENTO.fechaIso} />
        </Section>

        <section
          className="inv-band inv-band--tall inv-band--pearl inv-band--fiesta inv-band--fiesta-bg inv-band--sep-arriba inv-band--sep-abajo"
          data-inv-section="historia"
          data-inv-label="Nuestra historia"
        >
          <SepSlot active={sobreListo} variant="racimo" desde="der" />
          <div className="inv-decor inv-decor--section" aria-hidden>
            <img className="inv-decor-sprig inv-decor-sprig--section-r" src="/decor/floral-sprig.png" alt="" loading="lazy" />
          </div>
          <div className="inv-fiesta-layout">
            <InvReveal active={sobreListo} className="inv-reveal-media">
              <CarruselFiesta images={CASAMIENTO.historia.fotos} photoLabel="Vanesa y Augusto" dotsOutside="mobile" />
            </InvReveal>
            <div className="inv-fiesta-info">
              <InvReveal active={sobreListo}>
                <p className="inv-label">Nuestra historia</p>
              </InvReveal>
              <InvReveal active={sobreListo} delay={1}>
                <div className="inv-historia-copy">
                  {CASAMIENTO.historia.parrafos.map((p) => (
                    <p key={p} className="inv-copy">
                      {p}
                    </p>
                  ))}
                </div>
              </InvReveal>
            </div>
          </div>
        </section>

        <Section
          tone="pearl"
          align="center"
          label="El día"
          className="inv-band--itinerario"
          revealActive={sobreListo}
          flores="left"
          sectionId="itinerario"
          sepArriba="colgante"
          sepDesde="izq"
          sepAbajo
        >
          <ol className="inv-itinerario">
            {CASAMIENTO.itinerario.items.map((item, index) => (
              <li
                key={`${item.hora}-${item.titulo}`}
                className={`inv-itinerario-item ${
                  index % 2 === 1 ? 'inv-itinerario-item--right' : 'inv-itinerario-item--left'
                }`}
              >
                <div className="inv-itinerario-content">
                  <div className="inv-itinerario-media">
                    <img src={item.imagen} alt={item.imagenAlt} loading="lazy" decoding="async" />
                  </div>
                  <div className="inv-itinerario-body">
                    <p className="inv-itinerario-titulo">{item.titulo}</p>
                    <time className="inv-itinerario-hora">{item.hora}</time>
                  </div>
                </div>
                <span className="inv-itinerario-node" aria-hidden />
              </li>
            ))}
          </ol>
        </Section>

        <section
          className="inv-band inv-band--tall inv-band--mist inv-band--fiesta inv-band--fiesta-bg inv-band--iglesia inv-band--sep-arriba inv-band--sep-abajo"
          data-inv-section="iglesia"
          data-inv-label="Ceremonia"
        >
          <SepSlot active={sobreListo} variant="caida-izq" desde="izq" />
          <div className="inv-fiesta-layout">
            <div className="inv-fiesta-info">
              <InvReveal active={sobreListo}>
                <p className="inv-label">Ceremonia</p>
              </InvReveal>
              <InvReveal active={sobreListo} delay={1}>
                <p className="inv-meta">
                  {CASAMIENTO.iglesia.horario} · {CASAMIENTO.iglesia.lugar}
                </p>
                <p className="inv-meta inv-meta--lugar">{CASAMIENTO.iglesia.direccion}</p>
              </InvReveal>
              <InvReveal active={sobreListo} delay={2}>
                <BotonMapa query={CASAMIENTO.iglesia.mapsQuery} />
              </InvReveal>
            </div>
            <div className="inv-iglesia-spacer" aria-hidden />
          </div>
        </section>

        <section
          className="inv-band inv-band--tall inv-band--pearl inv-band--fiesta inv-band--fiesta-bg inv-band--sep-arriba inv-band--sep-abajo"
          data-inv-section="fiesta"
          data-inv-label="Celebración"
        >
          <SepSlot active={sobreListo} variant="triple" desde="der" />
          <div className="inv-fiesta-layout">
            <InvReveal active={sobreListo} className="inv-reveal-media">
              <CarruselFiesta images={CASAMIENTO.fiesta.fotos} photoLabel="Milión" dotsOutside="mobile" />
            </InvReveal>
            <div className="inv-fiesta-info">
              <InvReveal active={sobreListo} delay={1}>
                <p className="inv-label">Celebración</p>
              </InvReveal>
              <InvReveal active={sobreListo} delay={2}>
                <p className="inv-meta">
                  {CASAMIENTO.fiesta.horario} · {CASAMIENTO.fiesta.lugar}
                </p>
                <p className="inv-meta inv-meta--lugar">{CASAMIENTO.fiesta.direccion}</p>
              </InvReveal>
              <InvReveal active={sobreListo} delay={3}>
                <BotonMapa query={CASAMIENTO.fiesta.mapsQuery} />
              </InvReveal>
            </div>
          </div>
        </section>

        <Section
          tone="mist"
          align="center"
          label="Dress code"
          revealActive={sobreListo}
          flores="right"
          sectionId="vestimenta"
          sepArriba="colgante"
          sepDesde="izq"
          sepAbajo
        >
          <div className="inv-vestimenta">
            <div className="inv-vestimenta-siluetas">
              <div className="inv-vestimenta-silueta">
                <img
                  src="/vestimenta/hombre.png?v=2"
                  alt={CASAMIENTO.vestimenta.hombreAlt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="inv-vestimenta-silueta inv-vestimenta-silueta--mujer">
                <img
                  src="/vestimenta/mujer.png?v=2"
                  alt={CASAMIENTO.vestimenta.mujerAlt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <p className="inv-vestimenta-elegante">{CASAMIENTO.vestimenta.elegante}</p>
            <p className="inv-vestimenta-nota">{CASAMIENTO.vestimenta.notaNovia}</p>
          </div>
        </Section>

        <Section
          tone="pearl"
          align="center"
          label="Información"
          className="inv-band--tips"
          revealActive={sobreListo}
          flores="left"
          sectionId="tips"
          sepArriba="enredo-der"
          sepDesde="der"
          sepAbajo
        >
          <ul className="inv-tips-list">
            {CASAMIENTO.tips.items.map((tip) => (
              <li key={tip.titulo} className="inv-tip">
                <p className="inv-tip-title">{tip.titulo}</p>
                <p className="inv-copy">{tip.texto}</p>
                {tip.lista?.length ? (
                  <ul className="inv-tip-list">
                    {tip.lista.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>

        <Section
          tone="mist"
          align="center"
          label={CASAMIENTO.albumColaborativo.titulo}
          revealActive={sobreListo}
          flores="right"
          sectionId="album"
          sepArriba="colgante"
          sepDesde="der"
          sepAbajo
        >
          <div className="inv-album">
            <p className="inv-guest-meta">{CASAMIENTO.albumColaborativo.descripcion}</p>
            <p className="inv-guest-meta">{CASAMIENTO.albumColaborativo.nota}</p>
            {CASAMIENTO.albumColaborativo.url ? (
              <a
                className="inv-album-btn"
                href={CASAMIENTO.albumColaborativo.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {CASAMIENTO.albumColaborativo.boton}
              </a>
            ) : (
              <a
                href={token ? `/galeria?token=${encodeURIComponent(token)}` : '/galeria'}
                className="inv-album-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                {CASAMIENTO.albumColaborativo.boton}
              </a>
            )}
          </div>
        </Section>

        <Section
          tone="pearl"
          align="center"
          label="Con cariño"
          className="inv-band--regalos"
          revealActive={sobreListo}
          flores="both"
          sectionId="regalos"
          sepArriba="guirnalda-baja"
          sepDesde="izq"
          sepAbajo
        >
          <p className="inv-guest-meta">{CASAMIENTO.regalos.detalle}</p>
          <div className="inv-cuentas">
            {CASAMIENTO.regalos.cuentas.map((cuenta) => (
              <CuentaRegalo key={cuenta.moneda} {...cuenta} />
            ))}
          </div>
        </Section>

        <section
          className="inv-rsvp inv-band--tall inv-band--rsvp-summer inv-band--sep-arriba"
          id="confirmar"
          data-inv-section="rsvp"
          data-inv-label="RSVP"
        >
          <SepSlot active={sobreListo} variant="enredo-izq" desde="izq" />
          <div className="inv-rsvp-inner">
            <InvReveal active={sobreListo}>
              <p className="inv-label">RSVP</p>
            </InvReveal>
            <InvReveal active={sobreListo} delay={1}>
              <div className="inv-rsvp-copy">
                <p className="inv-guest-meta">{CASAMIENTO.rsvp.mensaje}</p>
                <p className="inv-guest-meta">{CASAMIENTO.rsvp.pregunta}</p>
                <p className="inv-guest-meta">{CASAMIENTO.rsvp.plazo}</p>
              </div>
            </InvReveal>

            {done && inv ? (
              <InvReveal active={sobreListo} delay={1}>
                <p className="inv-rsvp-ok">
                  {inv.estado === 'si'
                    ? inv.nombreAcompanante
                      ? `¡Gracias! Confirmamos 2 personas: ${inv.nombre} y ${inv.nombreAcompanante}`
                      : '¡Gracias! Confirmamos tu asistencia (1 persona)'
                    : 'Registramos que no vas a poder asistir — te vamos a extrañar'}
                </p>
              </InvReveal>
            ) : null}

            <InvReveal active={sobreListo} delay={2} className="inv-reveal-form">
              <form onSubmit={onSubmit} className="inv-form">
                <Select
                  label="Confirmar"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoInvitacion)}
                  options={[
                    { value: 'si', label: 'Si' },
                    { value: 'no', label: 'No' },
                  ]}
                />

                {estado === 'si' && inv?.permitePareja ? (
                  <>
                    <Select
                      label="¿Cómo venís?"
                      value={modoAsistencia}
                      onChange={(e) =>
                        setModoAsistencia(e.target.value === 'pareja' ? 'pareja' : 'solo')
                      }
                      options={[
                        { value: 'solo', label: 'Solo (1 persona)' },
                        { value: 'pareja', label: 'En pareja (2 personas)' },
                      ]}
                    />
                    {modoAsistencia === 'pareja' ? (
                      <Field
                        label="Nombre de tu pareja"
                        value={nombreAcompanante}
                        onChange={(e) => setNombreAcompanante(e.target.value)}
                        placeholder="Nombre y apellido"
                        required
                      />
                    ) : null}
                  </>
                ) : null}

                <Select
                  label="Restricciones alimentarias"
                  value={restriccionesSi}
                  onChange={(e) => setRestriccionesSi(e.target.value === 'si' ? 'si' : 'no')}
                  options={[
                    { value: 'no', label: 'No' },
                    { value: 'si', label: 'Sí' },
                  ]}
                />

                {restriccionesSi === 'si' ? (
                  <div className="inv-rsvp-restricciones">
                    <p className="inv-guest-meta">{CASAMIENTO.rsvp.restriccionesContacto}</p>
                    <a
                      className="inv-album-btn inv-whatsapp-btn"
                      href={whatsappHref(
                        CASAMIENTO.rsvp.restriccionesWhatsapp.telefono,
                        CASAMIENTO.rsvp.restriccionesWhatsapp.mensaje,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="inv-whatsapp-icon" viewBox="0 0 24 24" width={18} height={18} aria-hidden>
                        <path
                          fill="currentColor"
                          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                        />
                      </svg>
                      {CASAMIENTO.rsvp.restriccionesWhatsapp.boton}
                    </a>
                  </div>
                ) : null}

                {error ? <p className="inv-error">{error}</p> : null}

                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Enviando…' : done ? 'Actualizar respuesta' : 'Enviar confirmación'}
                </Button>
              </form>
            </InvReveal>
          </div>
        </section>
      </main>
    </div>
  )
}
