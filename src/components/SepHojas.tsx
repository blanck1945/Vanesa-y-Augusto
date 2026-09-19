const ENREDADERAS = '/decor/enredaderas'

export type SepVariant =
  | 'guirnalda'
  | 'guirnalda-baja'
  | 'racimo'
  | 'enredo-izq'
  | 'enredo-der'
  | 'caida-izq'
  | 'caida-der'
  | 'triple'
  | 'colgante'

type SepImgProps = { src: string; className?: string }

function SepImg({ src, className }: SepImgProps) {
  return <img src={src} alt="" className={className} loading="lazy" decoding="async" />
}

function SepEnredaderas({ variant, desde }: { variant: SepVariant; desde: 'izq' | 'der' }) {
  const esIzq = desde === 'izq'
  const curva = esIzq ? (
    <span className="inv-sep-curva inv-sep-curva--solo-r inv-sep-curva--corta" />
  ) : (
    <span className="inv-sep-curva inv-sep-curva--solo-l inv-sep-curva--corta" />
  )

  if (variant === 'guirnalda' || variant === 'guirnalda-baja') {
    return esIzq ? (
      <>
        <SepImg src={`${ENREDADERAS}/rama-izq.png`} className="inv-sep-enred inv-sep-enred--borde inv-sep-enred--borde-izq" />
        {curva}
      </>
    ) : (
      <>
        {curva}
        <SepImg src={`${ENREDADERAS}/rama-der.png`} className="inv-sep-enred inv-sep-enred--borde inv-sep-enred--borde-der" />
      </>
    )
  }

  if (variant === 'racimo' || variant === 'enredo-izq' || variant === 'enredo-der') {
    return esIzq ? (
      <>
        <SepImg src={`${ENREDADERAS}/racimo.png`} className="inv-sep-enred inv-sep-enred--racimo inv-sep-enred--racimo-izq" />
        {curva}
      </>
    ) : (
      <>
        {curva}
        <SepImg src={`${ENREDADERAS}/racimo.png`} className="inv-sep-enred inv-sep-enred--racimo inv-sep-enred--racimo-der" />
      </>
    )
  }

  if (variant === 'caida-izq' || variant === 'caida-der') {
    const src = esIzq ? `${ENREDADERAS}/rama-der.png` : `${ENREDADERAS}/rama-izq.png`
    const cls = esIzq
      ? 'inv-sep-enred inv-sep-enred--caida inv-sep-enred--caida-izq'
      : 'inv-sep-enred inv-sep-enred--caida inv-sep-enred--caida-der'
    return esIzq ? (
      <>
        <SepImg src={src} className={cls} />
        {curva}
      </>
    ) : (
      <>
        {curva}
        <SepImg src={src} className={cls} />
      </>
    )
  }

  if (variant === 'triple') {
    return esIzq ? (
      <>
        <SepImg src={`${ENREDADERAS}/rama-izq.png`} className="inv-sep-enred inv-sep-enred--triple-izq" />
        <SepImg src={`${ENREDADERAS}/hoja-larga.png`} className="inv-sep-enred inv-sep-enred--centro inv-sep-enred--centro-izq" />
      </>
    ) : (
      <>
        <SepImg src={`${ENREDADERAS}/hoja-larga.png`} className="inv-sep-enred inv-sep-enred--centro inv-sep-enred--centro-der" />
        <SepImg src={`${ENREDADERAS}/rama-der.png`} className="inv-sep-enred inv-sep-enred--triple-der" />
      </>
    )
  }

  if (variant === 'colgante') {
    return esIzq ? (
      <>
        <SepImg src={`${ENREDADERAS}/hoja-larga.png`} className="inv-sep-enred inv-sep-enred--colgante inv-sep-enred--colgante-izq" />
        <SepImg src={`${ENREDADERAS}/rama-izq.png`} className="inv-sep-enred inv-sep-enred--colgante-rama inv-sep-enred--colgante-rama-izq" />
      </>
    ) : (
      <>
        <SepImg src={`${ENREDADERAS}/rama-der.png`} className="inv-sep-enred inv-sep-enred--colgante-rama inv-sep-enred--colgante-rama-der" />
        <SepImg src={`${ENREDADERAS}/hoja-larga.png`} className="inv-sep-enred inv-sep-enred--colgante inv-sep-enred--colgante-der" />
      </>
    )
  }

  return null
}

type SepHojasProps = {
  active?: boolean
  variant?: SepVariant
  overlap?: boolean
  desde?: 'izq' | 'der'
}

function SepHojas({ active = true, variant = 'guirnalda', overlap = false, desde = 'izq' }: SepHojasProps) {
  if (!active) return null
  const cls = [
    `inv-sep-hojas inv-sep-hojas--${variant}`,
    overlap ? 'inv-sep-hojas--overlap inv-sep-hojas--lateral' : '',
    `inv-sep-hojas--desde-${desde}`,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls} aria-hidden>
      <SepEnredaderas variant={variant} desde={desde} />
    </div>
  )
}

type SepSlotProps = {
  active?: boolean
  variant?: SepVariant
  desde?: 'izq' | 'der'
}

/** Separador de hojas posicionado absolutamente arriba de una banda (`inv-band--sep-arriba`). */
export function SepSlot({ active = true, variant = 'guirnalda', desde = 'izq' }: SepSlotProps) {
  if (!active) return null
  return (
    <div className="inv-sep-slot" aria-hidden>
      <SepHojas variant={variant} overlap desde={desde} />
    </div>
  )
}
