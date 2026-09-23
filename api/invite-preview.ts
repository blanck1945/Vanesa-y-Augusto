import { buildInvitePreviewHtml } from '../src/lib/invitePreviewDocument'

export const config = {
  runtime: 'edge',
}

async function fetchGuestName(token: string): Promise<string | null> {
  const apiBase = process.env.API_BASE_URL?.trim().replace(/\/+$/, '')
  if (!apiBase) return null
  try {
    const res = await fetch(`${apiBase}/api/invitations/by-token/${encodeURIComponent(token)}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { name?: string }
    const name = data.name?.trim()
    return name || null
  } catch {
    return null
  }
}

export default async function handler(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token')?.trim() ?? ''
  if (!token) {
    return new Response('Missing token', { status: 400 })
  }

  const guestName = await fetchGuestName(token)
  const html = buildInvitePreviewHtml({ token, guestName })

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
