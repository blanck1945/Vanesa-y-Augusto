import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlbumUpload } from '../components/AlbumUpload'
import { CASAMIENTO } from '../content/casamiento'
import { listAlbumItems, mediaUrl, type AlbumItem } from '../data/api'

type FiltroMedia = 'fotos' | 'videos'

function esVideo(item: AlbumItem): boolean {
  return item.mimeType.startsWith('video/')
}

function IconGrid() {
  return (
    <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="7.5" height="7.5" rx="1" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1" />
    </svg>
  )
}

function IconReels() {
  return (
    <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M10 8.5v7l6-3.5-6-3.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function GaleriaPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() || undefined

  const [items, setItems] = useState<AlbumItem[]>([])
  const [filtro, setFiltro] = useState<FiltroMedia>('fotos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activo, setActivo] = useState<AlbumItem | null>(null)

  const cargarItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAlbumItems(200)
      setItems(data.items.filter((it) => it.url))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la galería')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargarItems()
  }, [cargarItems])

  const visibles = useMemo(
    () => items.filter((it) => (filtro === 'fotos' ? !esVideo(it) : esVideo(it))),
    [items, filtro],
  )

  return (
    <div className="invitacion inv-galeria">
      <header className="inv-galeria-header">
        <p className="inv-label">Recuerdos del gran día</p>
        <div className="inv-galeria-upload">
          <AlbumUpload
            label={CASAMIENTO.albumColaborativo.boton}
            token={token}
            onSuccess={() => void cargarItems()}
          />
        </div>
      </header>

      <div className="inv-galeria-tabs" role="tablist" aria-label="Filtrar por tipo">
        <button
          type="button"
          role="tab"
          aria-label="Fotos"
          aria-selected={filtro === 'fotos'}
          className={filtro === 'fotos' ? 'inv-galeria-tab inv-galeria-tab--active' : 'inv-galeria-tab'}
          onClick={() => setFiltro('fotos')}
        >
          <IconGrid />
        </button>
        <button
          type="button"
          role="tab"
          aria-label="Videos"
          aria-selected={filtro === 'videos'}
          className={filtro === 'videos' ? 'inv-galeria-tab inv-galeria-tab--active' : 'inv-galeria-tab'}
          onClick={() => setFiltro('videos')}
        >
          <IconReels />
        </button>
      </div>

      <main className="inv-galeria-main">
        {loading ? <p className="inv-guest-meta inv-galeria-status">Cargando…</p> : null}
        {error ? <p className="inv-guest-meta inv-galeria-status inv-galeria-status--error">{error}</p> : null}
        {!loading && !error && visibles.length === 0 ? (
          <p className="inv-guest-meta inv-galeria-status">
            {filtro === 'fotos' ? 'Todavía no hay fotos' : 'Todavía no hay videos'}
          </p>
        ) : null}

        {!loading && !error && visibles.length > 0 ? (
          <ul
            className={
              filtro === 'videos'
                ? 'inv-galeria-grid inv-galeria-grid--reels'
                : 'inv-galeria-grid inv-galeria-grid--posts'
            }
          >
            {visibles.map((item) => (
              <li key={item.id}>
                <button type="button" className="inv-galeria-card" onClick={() => setActivo(item)}>
                  {esVideo(item) ? (
                    <>
                      <video src={mediaUrl(item.url) ?? undefined} muted playsInline preload="metadata" />
                      <span className="inv-galeria-play" aria-hidden />
                    </>
                  ) : (
                    <img src={mediaUrl(item.url)!} alt={item.originalName} loading="lazy" decoding="async" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </main>

      {activo ? (
        <div className="inv-galeria-lightbox" role="dialog" aria-modal="true" onClick={() => setActivo(null)}>
          <div className="inv-galeria-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="inv-galeria-lightbox-close" onClick={() => setActivo(null)} aria-label="Cerrar">
              ×
            </button>
            {esVideo(activo) ? (
              <video src={mediaUrl(activo.url) ?? undefined} controls autoPlay playsInline />
            ) : (
              <img src={mediaUrl(activo.url)!} alt={activo.originalName} />
            )}
            {activo.invitacionNombre ? (
              <p className="inv-galeria-lightbox-caption">{activo.invitacionNombre}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
