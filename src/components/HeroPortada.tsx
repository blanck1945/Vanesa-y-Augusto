import { useCallback, useEffect, useRef, useState } from 'react'

function isMobileViewport(): boolean {
  return window.matchMedia('(max-width: 699px)').matches
}

type Rect = { top: number; left: number; width: number; height: number }

function fitRect(container: HTMLDivElement, img: HTMLImageElement): Rect | null {
  if (!img.naturalWidth || !img.naturalHeight) return null
  const cw = container.clientWidth
  const ch = container.clientHeight
  if (!cw || !ch) return null
  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  return { top: (ch - h) / 2, left: (cw - w) / 2, width: w, height: h }
}

type HeroPortadaProps = {
  image: string
  novia: string
  novio: string
  active?: boolean
}

/** Foto de portada con overlay de nombres (formato distinto en mobile vs. web). */
export function HeroPortada({ image, novia, novio, active = true }: HeroPortadaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [mobile, setMobile] = useState(isMobileViewport)
  const [rect, setRect] = useState<Rect | null>(null)

  const recompute = useCallback(() => {
    const isMobile = isMobileViewport()
    setMobile(isMobile)
    if (isMobile) {
      setRect(null)
      return
    }
    const container = containerRef.current
    const img = imgRef.current
    if (!container || !img) return
    setRect(fitRect(container, img))
  }, [])

  useEffect(() => {
    if (!active || !image) return
    const preload = new Image()
    preload.src = image
  }, [active, image])

  useEffect(() => {
    if (!active) return
    recompute()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(recompute)
    ro.observe(el)
    const mq = window.matchMedia('(max-width: 699px)')
    mq.addEventListener('change', recompute)
    window.addEventListener('resize', recompute)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', recompute)
      window.removeEventListener('resize', recompute)
    }
  }, [active, image, recompute])

  if (!active || !image) return null

  const overlayStyle = !mobile && rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : undefined
  const showOverlay = mobile || !!rect

  return (
    <div
      ref={containerRef}
      className={`inv-hero-portada${mobile ? ' inv-hero-portada--mobile' : ' inv-hero-portada--web'}`}
      role="img"
      aria-label={`${novia} y ${novio}`}
    >
      <img
        ref={imgRef}
        src={image}
        alt=""
        className="inv-hero-portada-photo"
        loading="eager"
        decoding="async"
        onLoad={recompute}
      />
      {showOverlay ? (
        <div
          className={mobile ? 'inv-hero-portada-overlay inv-hero-portada-overlay--full' : 'inv-hero-portada-overlay'}
          style={overlayStyle}
          aria-hidden
        >
          <div className="inv-hero-portada-scrim" />
          <div className="inv-hero-portada-names">
            <span className="inv-hero-portada-name">{novia}</span>
            <span className="inv-hero-portada-y">y</span>
            <span className="inv-hero-portada-name">{novio}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
