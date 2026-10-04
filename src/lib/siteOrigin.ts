/** URL canónica del sitio en producción (sin barra final). */
export const SITE_PUBLIC_ORIGIN = 'https://casamientovanesayaugusto.com'

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i

/** Base pública para links y OG: dominio actual en prod, fallback en dev/build. */
export function resolveSitePublicOrigin(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/+$/, '')
    if (!LOCAL_ORIGIN.test(origin)) return origin
  }
  const fromEnv =
    import.meta.env.VITE_INVITE_PUBLIC_BASE_URL?.trim() || import.meta.env.VITE_SITE_ORIGIN?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  return SITE_PUBLIC_ORIGIN
}
