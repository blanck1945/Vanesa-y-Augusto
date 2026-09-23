/** Vista previa al compartir `/i/:token` (WhatsApp, iMessage, etc.). */
export const INVITE_SHARE = {
  publicOrigin: 'https://casamiento-vanesa-augusto.vercel.app',
  title: 'Invitación Vanesa y Augusto',
  description: '19 de diciembre de 2026 · Abrí el link para ver la invitación y confirmar asistencia.',
  imagePath: '/sobre/01.jpg',
  imageAlt: 'Vanesa y Augusto',
} as const

export function inviteShareImageUrl(): string {
  return `${INVITE_SHARE.publicOrigin}${INVITE_SHARE.imagePath}`
}

export function inviteShareTitle(guestName?: string | null): string {
  const name = guestName?.trim()
  if (name) return `${name} · Invitación Vanesa y Augusto`
  return INVITE_SHARE.title
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Refuerza OG/Twitter en runtime (og:url con el path actual). */
export function applyInviteShareMeta(guestName?: string | null): void {
  const image = inviteShareImageUrl()
  const pageUrl = `${INVITE_SHARE.publicOrigin}${window.location.pathname}`
  const title = inviteShareTitle(guestName)

  upsertMeta('name', 'description', INVITE_SHARE.description)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', 'Vanesa y Augusto')
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', INVITE_SHARE.description)
  upsertMeta('property', 'og:url', pageUrl)
  upsertMeta('property', 'og:image', image)
  upsertMeta('property', 'og:image:secure_url', image)
  upsertMeta('property', 'og:image:alt', INVITE_SHARE.imageAlt)
  upsertMeta('property', 'og:locale', 'es_AR')
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', INVITE_SHARE.description)
  upsertMeta('name', 'twitter:image', image)
}
