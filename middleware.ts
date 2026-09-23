import { rewrite } from '@vercel/edge'

/** User-agents explícitos de redes / mensajería. */
const SOCIAL_CRAWLER =
  /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Applebot|Pinterestbot|Googlebot/i

export const config = {
  matcher: ['/i/:token'],
}

/** Crawlers y “unfurl” (iMessage, herramientas de preview) suelen ir sin Sec-Fetch-*. */
function wantsLinkPreviewHtml(request: Request): boolean {
  if (request.method !== 'GET') return false
  const ua = request.headers.get('user-agent') ?? ''
  if (SOCIAL_CRAWLER.test(ua)) return true
  const secFetchMode = request.headers.get('sec-fetch-mode')
  const secFetchDest = request.headers.get('sec-fetch-dest')
  if (secFetchMode != null || secFetchDest != null) return false
  return true
}

export default function middleware(request: Request) {
  if (!wantsLinkPreviewHtml(request)) return

  const { pathname, origin } = new URL(request.url)
  const token = pathname.replace(/^\/i\//, '').split('/')[0]?.trim()
  if (!token) return

  const previewUrl = new URL('/api/invite-preview', origin)
  previewUrl.searchParams.set('token', token)
  return rewrite(previewUrl.toString())
}
