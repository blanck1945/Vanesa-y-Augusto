let fontsPreload: Promise<void> | null = null

/** Evita FOUT en loader y copy de la invitación. */
export function preloadInvitacionFonts(): Promise<void> {
  if (fontsPreload) return fontsPreload

  fontsPreload = (async () => {
    if (typeof document === 'undefined' || !document.fonts?.load) return
    try {
      await Promise.all([
        document.fonts.load('italic 500 16px "Cormorant Garamond"'),
        document.fonts.load('italic 600 16px "Cormorant Garamond"'),
        document.fonts.load('400 16px "Fraunces"'),
        document.fonts.load('300 16px "Outfit"'),
      ])
      await document.fonts.ready
    } catch {
      /* fallback del sistema si falla */
    }
  })()

  return fontsPreload
}
