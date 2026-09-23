import { rewrite } from '@vercel/edge'

/** User-agents que piden preview al compartir links (WhatsApp, iMessage a veces, etc.). */
const SOCIAL_CRAWLER =
  /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Applebot|Pinterestbot|Googlebot/i

export const config = {
  matcher: ['/i/:token'],
}

export default function middleware(request: Request) {
  const ua = request.headers.get('user-agent') ?? ''
  if (!SOCIAL_CRAWLER.test(ua)) return

  const { pathname, origin } = new URL(request.url)
  const token = pathname.replace(/^\/i\//, '').split('/')[0]?.trim()
  if (!token) return

  const previewUrl = new URL('/api/invite-preview', origin)
  previewUrl.searchParams.set('token', token)
  return rewrite(previewUrl.toString())
}
