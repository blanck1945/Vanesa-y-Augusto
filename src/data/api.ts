export type EstadoInvitacion = 'pendiente' | 'si' | 'no' | 'aun_no_lo_se'

export type Invitacion = {
  id: number
  nombre: string
  token: string
  estado: EstadoInvitacion
  permitePareja: boolean
  nombreAcompanante: string | null
  restriccionesAlimentariasSi: boolean | null
  restriccionesAlimentarias: string | null
  respondidoAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type RsvpInput = {
  estado: EstadoInvitacion
  nombreAcompanante?: string | null
  restriccionesAlimentariasSi: boolean
  restriccionesAlimentarias?: string | null
}

export type MuestraComentario = {
  id: number
  sectionId: string
  sectionLabel: string
  texto: string
  xPct: number
  yPct: number
  createdAt: string
}

export type UsuarioAdmin = {
  id: number
  nombre: string
  email: string
}

export const API_BASE_URL: string =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_API_BASE_URL?.trim() ?? ''

export function isApiConfigured(): boolean {
  return API_BASE_URL.length > 0 || !import.meta.env.PROD
}

function apiMisconfiguredMessage(): string {
  return 'La galería no está conectada a la API. Falta configurar VITE_API_BASE_URL en Vercel y volver a desplegar.'
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? ''
  const text = await res.text()
  let data: unknown = null

  if (text) {
    const looksJson =
      contentType.includes('json') ||
      text.trimStart().startsWith('{') ||
      text.trimStart().startsWith('[')
    if (looksJson) {
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('La API respondió con JSON inválido.')
      }
    }
  }

  if (!res.ok) {
    const message =
      typeof data === 'object' && data && 'message' in data && (data as { message?: unknown }).message
        ? String((data as { message?: unknown }).message)
        : `Error ${res.status}`
    throw new Error(message)
  }

  if (data === null && /^\s*</.test(text)) {
    throw new Error(apiMisconfiguredMessage())
  }

  return data as T
}

// ---- Invitaciones ----

export async function listInvitaciones(): Promise<Invitacion[]> {
  return parseResponse(await fetch(`${API_BASE_URL}/api/invitaciones`))
}

export async function createInvitacion(
  nombre: string,
  permitePareja: boolean,
): Promise<Invitacion> {
  return parseResponse(
    await fetch(`${API_BASE_URL}/api/invitaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, permitePareja }),
    }),
  )
}

export async function deleteInvitacion(id: number): Promise<{ ok: true }> {
  return parseResponse(
    await fetch(`${API_BASE_URL}/api/invitaciones/${id}`, { method: 'DELETE' }),
  )
}

export async function getInvitacionByToken(token: string): Promise<Invitacion> {
  return parseResponse(
    await fetch(`${API_BASE_URL}/api/invitaciones/por-token/${encodeURIComponent(token)}`),
  )
}

export async function rsvpInvitacion(
  token: string,
  input: RsvpInput,
): Promise<Invitacion> {
  return parseResponse(
    await fetch(
      `${API_BASE_URL}/api/invitaciones/por-token/${encodeURIComponent(token)}/rsvp`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
    ),
  )
}

// ---- Usuarios (login del dashboard) ----

export async function loginUsuario(email: string, password: string): Promise<UsuarioAdmin> {
  const data = await parseResponse<{ usuario: UsuarioAdmin }>(
    await fetch(`${API_BASE_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  )
  return data.usuario
}

export function invitacionLinkFor(token: string): string {
  return `${window.location.origin}/i/${token}`
}

// ---- Muestra / comentarios de testing ----

export async function listMuestraComentarios(): Promise<MuestraComentario[]> {
  return parseResponse(await fetch(`${API_BASE_URL}/api/muestra-comentarios`))
}

export async function createMuestraComentario(input: {
  sectionId: string
  sectionLabel: string
  texto: string
  xPct: number
  yPct: number
}): Promise<MuestraComentario> {
  return parseResponse(
    await fetch(`${API_BASE_URL}/api/muestra-comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  )
}

export async function deleteMuestraComentario(id: number): Promise<{ ok: true }> {
  return parseResponse(
    await fetch(`${API_BASE_URL}/api/muestra-comentarios/${id}`, { method: 'DELETE' }),
  )
}

export async function clearMuestraComentarios(): Promise<{ ok: true }> {
  return parseResponse(
    await fetch(`${API_BASE_URL}/api/muestra-comentarios`, { method: 'DELETE' }),
  )
}

// ---- Álbum colaborativo ----

export type AlbumItem = {
  id: number
  invitacionId: number | null
  invitacionNombre: string | null
  originalName: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  createdAt: string
  url: string | null
}

export function mediaUrl(url: string | null): string | null {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `${API_BASE_URL}${url}`
}

export async function listAlbumItems(limit = 200): Promise<{ items: AlbumItem[] }> {
  if (import.meta.env.PROD && !API_BASE_URL) {
    throw new Error(apiMisconfiguredMessage())
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/api/album-fotos?limit=${limit}`)
  } catch {
    throw new Error('No se pudo conectar con el servidor de la galería.')
  }

  const data = await parseResponse<{ items?: AlbumItem[] }>(res)
  if (!Array.isArray(data.items)) {
    throw new Error('La galería respondió con un formato inesperado.')
  }

  return { items: data.items }
}

export async function uploadAlbumFoto(
  file: File,
  token?: string,
): Promise<{ ok: true; id: number; originalName: string }> {
  if (import.meta.env.PROD && !API_BASE_URL) {
    throw new Error(apiMisconfiguredMessage())
  }

  const form = new FormData()
  form.append('file', file)
  if (token && token.trim()) form.append('token', token.trim())
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/api/album-fotos/upload`, {
      method: 'POST',
      body: form,
    })
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor. ¿Está corriendo la API en el puerto 3400?',
    )
  }
  return parseResponse(res)
}

// ---- Sesión admin (localStorage, sin SDK externo) ----

const ADMIN_STORAGE_KEY = 'casamiento_admin_usuario'

export function getSesionAdmin(): UsuarioAdmin | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UsuarioAdmin) : null
  } catch {
    return null
  }
}

export function setSesionAdmin(usuario: UsuarioAdmin): void {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(usuario))
}

export function clearSesionAdmin(): void {
  localStorage.removeItem(ADMIN_STORAGE_KEY)
}
