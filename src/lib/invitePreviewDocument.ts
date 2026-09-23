import { INVITE_SHARE, inviteShareImageUrl, inviteShareTitle } from './inviteShareMeta'

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** HTML mínimo para crawlers (WhatsApp, etc.) — no ejecuta la SPA. */
export function buildInvitePreviewHtml(input: { token: string; guestName?: string | null }): string {
  const title = inviteShareTitle(input.guestName)
  const description = INVITE_SHARE.description
  const image = inviteShareImageUrl()
  const pageUrl = `${INVITE_SHARE.publicOrigin}/i/${encodeURIComponent(input.token)}`
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeImage = escapeHtml(image)
  const safePageUrl = escapeHtml(pageUrl)
  const safeImageAlt = escapeHtml(INVITE_SHARE.imageAlt)

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${safeDescription}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Vanesa y Augusto" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${safePageUrl}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:secure_url" content="${safeImage}" />
  <meta property="og:image:alt" content="${safeImageAlt}" />
  <meta property="og:locale" content="es_AR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />
  <title>${safeTitle}</title>
</head>
<body><p>${safeTitle}</p></body>
</html>`
}
