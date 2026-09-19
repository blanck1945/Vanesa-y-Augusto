import { useEffect, useState } from 'react'

type CarruselFiestaProps = {
  images: string[]
  intervalMs?: number
  photoLabel?: string
  dotsOutside?: boolean | 'mobile'
}

function useDotsOutside(mode: boolean | 'mobile' | undefined): boolean {
  const [mobileMatch, setMobileMatch] = useState(() =>
    mode === 'mobile' ? window.matchMedia('(max-width: 859px)').matches : false,
  )
  useEffect(() => {
    if (mode !== 'mobile') return
    const mq = window.matchMedia('(max-width: 859px)')
    const onChange = () => setMobileMatch(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])
  if (mode === true) return true
  if (mode === 'mobile') return mobileMatch
  return false
}

/** Carrusel de fotos con fade automático y bolitas indicadoras (usado en historia y fiesta). */
export function CarruselFiesta({ images, intervalMs = 5200, photoLabel = 'Foto', dotsOutside = false }: CarruselFiestaProps) {
  const [active, setActive] = useState(0)
  const total = images.length
  const outside = useDotsOutside(dotsOutside)

  useEffect(() => {
    if (total <= 1) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % total), intervalMs)
    return () => window.clearInterval(id)
  }, [total, intervalMs])

  if (!total) return null

  const dots =
    total > 1 ? (
      <div className="inv-carrusel-dots" role="tablist" aria-label="Fotos">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Ir a foto ${i + 1}`}
            className={i === active ? 'inv-carrusel-dot inv-carrusel-dot--active' : 'inv-carrusel-dot'}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    ) : null

  return (
    <div className={outside ? 'inv-carrusel inv-carrusel--dots-outside' : 'inv-carrusel'} aria-roledescription="carrusel">
      <div className="inv-carrusel-viewport">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${photoLabel}, foto ${i + 1} de ${total}`}
            className={i === active ? 'inv-carrusel-img inv-carrusel-img--active' : 'inv-carrusel-img'}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
        {outside ? null : dots}
      </div>
      {outside ? dots : null}
    </div>
  )
}
