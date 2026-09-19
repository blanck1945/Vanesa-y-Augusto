import { googleMapsMobileUrl, googleMapsWebUrl, isMobileMapsDevice } from '../lib/googleMapsUrl'

type BotonMapaProps = {
  query: string
  label?: string
}

export function BotonMapa({ query, label = 'Ver mapa' }: BotonMapaProps) {
  const handleClick = () => {
    if (isMobileMapsDevice()) {
      window.location.assign(googleMapsMobileUrl(query))
      return
    }

    const url = googleMapsWebUrl(query)
    const tab = window.open(url, '_blank', 'noopener,noreferrer')
    if (!tab) {
      window.location.assign(url)
    }
  }

  return (
    <button type="button" className="inv-mapa-btn inv-album-btn" onClick={handleClick}>
      {label}
    </button>
  )
}
