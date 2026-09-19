type SeparadorHojasLargasProps = {
  /** hero: superpuesto al borde hero→countdown · overlap: entre secciones, encima de ambas */
  variant?: 'hero' | 'overlap'
  active?: boolean
}

export function SeparadorHojasLargas({ variant = 'overlap', active = true }: SeparadorHojasLargasProps) {
  if (!active) return null

  return (
    <div
      className={
        variant === 'hero'
          ? 'inv-sep-foto inv-sep-foto--hero-countdown'
          : 'inv-sep-foto inv-sep-foto--overlap'
      }
      aria-hidden
    >
      <img
        src="/decor/separadores/hojas-largas.png?v=6"
        alt=""
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
