export const SOBRE_SELLO_SRC = '/sobre/sello-cera.png'

let selloPreload: Promise<void> | null = null

/** Precarga el sello de cera para que el sobre no aparezca sin él. */
export function preloadSelloCera(): Promise<void> {
  if (selloPreload) return selloPreload

  selloPreload = new Promise((resolve) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = SOBRE_SELLO_SRC
    document.head.appendChild(link)

    const img = new Image()
    img.fetchPriority = 'high'
    img.decoding = 'sync'
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = SOBRE_SELLO_SRC
  })

  return selloPreload
}
