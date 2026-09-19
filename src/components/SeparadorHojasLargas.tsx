type SeparadorHojasLargasProps = {
  /** hero: intro→countdown · medianas: portada→intro · overlap: entre secciones */
  variant?: 'hero' | 'medianas' | 'overlap'
  active?: boolean
}

const SEPARADORES = {
  hero: {
    className: 'inv-sep-foto inv-sep-foto--hero-countdown',
    src: '/decor/separadores/hojas-largas.png?v=6',
  },
  medianas: {
    className: 'inv-sep-foto inv-sep-foto--medianas',
    src: '/decor/separadores/hojas-medianas.png?v=4',
  },
  overlap: {
    className: 'inv-sep-foto inv-sep-foto--overlap',
    src: '/decor/separadores/hojas-largas.png?v=6',
  },
} as const

export function SeparadorHojasLargas({ variant = 'overlap', active = true }: SeparadorHojasLargasProps) {
  if (!active) return null

  if (variant === 'medianas') {
    const src = SEPARADORES.medianas.src
    return (
      <div className={SEPARADORES.medianas.className} aria-hidden>
        <div className="inv-sep-medianas-pair">
          <img className="inv-sep-medianas__rama inv-sep-medianas__rama--izq" src={src} alt="" loading="eager" decoding="async" />
          <img className="inv-sep-medianas__rama inv-sep-medianas__rama--der" src={src} alt="" loading="eager" decoding="async" />
        </div>
      </div>
    )
  }

  const sep = SEPARADORES[variant]

  return (
    <div className={sep.className} aria-hidden>
      <img src={sep.src} alt="" loading="lazy" decoding="async" />
    </div>
  )
}
