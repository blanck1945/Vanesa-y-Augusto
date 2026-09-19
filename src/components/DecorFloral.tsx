/** Florales decorativos de fondo (esquinas, ramitas) usados en el hero y en bandas de sección. */
export function DecorFloral() {
  return (
    <div className="inv-decor" aria-hidden>
      <img className="inv-decor-corner inv-decor-corner--tl" src="/decor/floral-corner.png" alt="" loading="eager" decoding="async" />
      <img className="inv-decor-corner inv-decor-corner--br" src="/decor/floral-corner.png" alt="" loading="eager" decoding="async" />
      <img className="inv-decor-line inv-decor-line--tr" src="/decor/floral-line-corner.png" alt="" loading="eager" decoding="async" />
      <img className="inv-decor-sprig inv-decor-sprig--l-top" src="/decor/floral-sprig.png" alt="" loading="lazy" decoding="async" />
      <img className="inv-decor-pressed inv-decor-pressed--l-mid" src="/decor/floral-pressed.png" alt="" loading="lazy" decoding="async" />
      <img className="inv-decor-line inv-decor-line--l" src="/decor/floral-line-corner.png" alt="" loading="lazy" decoding="async" />
      <img className="inv-decor-pressed inv-decor-pressed--bl" src="/decor/floral-pressed.png" alt="" loading="lazy" decoding="async" />
      <img className="inv-decor-sprig inv-decor-sprig--bl" src="/decor/floral-sprig.png" alt="" loading="lazy" decoding="async" />
      <img className="inv-decor-line inv-decor-line--bl" src="/decor/floral-line-corner.png" alt="" loading="lazy" decoding="async" />
      <img className="inv-decor-sprig inv-decor-sprig--r" src="/decor/floral-sprig.png" alt="" loading="lazy" decoding="async" />
      <img className="inv-decor-pressed inv-decor-pressed--tr" src="/decor/floral-pressed.png" alt="" loading="lazy" decoding="async" />
      <span className="inv-decor-petalo inv-decor-petalo--1" />
      <span className="inv-decor-petalo inv-decor-petalo--2" />
      <span className="inv-decor-petalo inv-decor-petalo--3" />
      <span className="inv-decor-petalo inv-decor-petalo--4" />
    </div>
  )
}

type DecorSideProps = { side?: 'left' | 'right' | 'both' }

/** Florales más sutiles para bandas de sección (izquierda / derecha / ambas). */
export function DecorSeccion({ side = 'both' }: DecorSideProps) {
  return (
    <div className="inv-decor inv-decor--section" aria-hidden>
      {side === 'left' || side === 'both' ? (
        <>
          <img className="inv-decor-sprig inv-decor-sprig--section-l" src="/decor/floral-sprig.png" alt="" loading="lazy" decoding="async" />
          <img className="inv-decor-pressed inv-decor-pressed--section-l" src="/decor/floral-pressed.png" alt="" loading="lazy" decoding="async" />
          <img className="inv-decor-corner inv-decor-corner--section-tl" src="/decor/floral-corner.png" alt="" loading="lazy" decoding="async" />
        </>
      ) : null}
      {side === 'right' || side === 'both' ? (
        <>
          <img className="inv-decor-sprig inv-decor-sprig--section-r" src="/decor/floral-sprig.png" alt="" loading="lazy" decoding="async" />
          <img className="inv-decor-line inv-decor-line--section-r" src="/decor/floral-line-corner.png" alt="" loading="lazy" decoding="async" />
          <img className="inv-decor-corner inv-decor-corner--section-br" src="/decor/floral-corner.png" alt="" loading="lazy" decoding="async" />
        </>
      ) : null}
    </div>
  )
}
