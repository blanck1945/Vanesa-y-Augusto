/** Detecta móvil para abrir la app de Google Maps en lugar de la pestaña web. */
export function isMobileMapsDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/** URL web de Google Maps (escritorio / fallback). */
export function googleMapsWebUrl(query: string): string {
  const params = new URLSearchParams({ api: '1', query })
  return `https://www.google.com/maps/search/?${params.toString()}`
}

/** URL que en móvil abre la app de Google Maps si está instalada. */
export function googleMapsMobileUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}`
}

export function openGoogleMaps(query: string): void {
  const mobile = isMobileMapsDevice()
  const url = mobile ? googleMapsMobileUrl(query) : googleMapsWebUrl(query)
  if (mobile) {
    window.location.assign(url)
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
