export type EstadoInvitacion = 'pendiente' | 'si' | 'no' | 'aun_no_lo_se'
export type LadoInvitacion = 'vanesa' | 'augusto'

export type Invitacion = {
  id: number
  nombre: string
  token: string
  estado: EstadoInvitacion
  lado: LadoInvitacion | null
  permitePareja: boolean
  nombreAcompanante: string | null
  restriccionesAlimentariasSi: boolean | null
  restriccionesAlimentarias: string | null
  email: string | null
  emailEnviadoAt: string | null
  respondidoAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ImportacionCsvResultado = {
  creados: Invitacion[]
  errores: { fila: number; mensaje: string }[]
  resumen: { ok: number; fallidos: number }
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

type ApiInvitationStatus = 'pending' | 'yes' | 'no' | 'unsure'

type ApiInvitation = {
  id: number
  name: string
  token: string
  status: ApiInvitationStatus
  guestSide: LadoInvitacion | null
  allowsPlusOne: boolean
  plusOneName: string | null
  hasDietaryRestrictions: boolean | null
  dietaryRestrictions: string | null
  email: string | null
  emailSentAt: string | null
  respondedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

type ApiBulkImportResult = {
  created: ApiInvitation[]
  errors: { row: number; message: string }[]
  summary: { ok: number; failed: number }
}

const STATUS_FROM_API: Record<ApiInvitationStatus, EstadoInvitacion> = {
  pending: 'pendiente',
  yes: 'si',
  no: 'no',
  unsure: 'aun_no_lo_se',
}

const STATUS_TO_API: Record<EstadoInvitacion, ApiInvitationStatus> = {
  pendiente: 'pending',
  si: 'yes',
  no: 'no',
  aun_no_lo_se: 'unsure',
}

function mapInvitation(row: ApiInvitation): Invitacion {
  return {
    id: row.id,
    nombre: row.name,
    token: row.token,
    estado: STATUS_FROM_API[row.status] ?? 'pendiente',
    lado: row.guestSide === 'vanesa' || row.guestSide === 'augusto' ? row.guestSide : null,
    permitePareja: row.allowsPlusOne,
    nombreAcompanante: row.plusOneName,
    restriccionesAlimentariasSi: row.hasDietaryRestrictions,
    restriccionesAlimentarias: row.dietaryRestrictions,
    email: row.email,
    emailEnviadoAt: row.emailSentAt,
    respondidoAt: row.respondedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

/** En dev siempre vacío → fetch relativo + proxy Vite a :3400 (evita CORS / Railway caído). */
export const API_BASE_URL: string = import.meta.env.DEV
  ? ''
  : (import.meta.env.API_BASE_URL?.trim() ?? '')

function apiPath(path: string): string {
  return `${API_BASE_URL}${path}`
}

export function isApiConfigured(): boolean {
  return API_BASE_URL.length > 0 || !import.meta.env.PROD
}

function apiMisconfiguredMessage(): string {
  return 'La galería no está conectada a la API. Falta configurar API_BASE_URL en Vercel y volver a desplegar.'
}

function apiUnreachableMessage(): string {
  if (import.meta.env.PROD) {
    return 'No se pudo conectar con la API. Configurá API_BASE_URL en Vercel (URL del backend en Railway).'
  }
  return 'No se pudo conectar con la API. ¿Está corriendo el backend? En otra terminal: cd backend-bridge && npm run start:dev (puerto 3400).'
}

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch {
    throw new Error(apiUnreachableMessage())
  }
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
  const rows = await parseResponse<ApiInvitation[]>(await fetch(apiPath('/api/invitations')))
  return rows.map(mapInvitation)
}

export async function createInvitacion(
  nombre: string,
  permitePareja: boolean,
  lado: LadoInvitacion,
): Promise<Invitacion> {
  const row = await parseResponse<ApiInvitation>(
    await fetch(apiPath('/api/invitations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nombre, allowsPlusOne: permitePareja, guestSide: lado }),
    }),
  )
  return mapInvitation(row)
}

export async function updateInvitacion(
  id: number,
  nombre: string,
  permitePareja: boolean,
  lado: LadoInvitacion,
  email?: string | null,
): Promise<Invitacion> {
  const body: Record<string, unknown> = {
    name: nombre,
    allowsPlusOne: permitePareja,
    guestSide: lado,
  }
  if (email !== undefined) body.email = email?.trim() || null
  const row = await parseResponse<ApiInvitation>(
    await fetch(apiPath(`/api/invitations/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )
  return mapInvitation(row)
}

export async function importInvitacionesCsv(file: File): Promise<ImportacionCsvResultado> {
  const form = new FormData()
  form.append('file', file)
  const data = await parseResponse<ApiBulkImportResult>(
    await fetch(apiPath('/api/invitations/bulk'), {
      method: 'POST',
      body: form,
    }),
  )
  return {
    creados: data.created.map(mapInvitation),
    errores: data.errors.map((e) => ({ fila: e.row, mensaje: e.message })),
    resumen: { ok: data.summary.ok, fallidos: data.summary.failed },
  }
}

export async function sendInvitacionEmail(id: number): Promise<Invitacion> {
  const row = await parseResponse<ApiInvitation>(
    await fetch(apiPath(`/api/invitations/${id}/send-email`), { method: 'POST' }),
  )
  return mapInvitation(row)
}

export async function sendInvitacionesPendientes(): Promise<{
  enviados: { id: number; email: string }[]
  errores: { id: number; mensaje: string }[]
  resumen: { ok: number; fallidos: number }
}> {
  const data = await parseResponse<{
    sent: { id: number; email: string }[]
    errors: { id: number; message: string }[]
    summary: { ok: number; failed: number }
  }>(await fetch(apiPath('/api/invitations/send-email/pending'), { method: 'POST' }))
  return {
    enviados: data.sent,
    errores: data.errors.map((e) => ({ id: e.id, mensaje: e.message })),
    resumen: { ok: data.summary.ok, fallidos: data.summary.failed },
  }
}

export const CSV_PLANTILLA_INVITADOS = 'nombre,email,lado,invita\nMaría López,maria@example.com,vanesa,si\nJuan Pérez,juan@example.com,augusto,no\n'

export async function deleteInvitacion(id: number): Promise<{ ok: true }> {
  return parseResponse(await fetch(apiPath(`/api/invitations/${id}`), { method: 'DELETE' }))
}

export async function getInvitacionByToken(token: string): Promise<Invitacion> {
  const row = await parseResponse<ApiInvitation>(
    await fetch(apiPath(`/api/invitations/by-token/${encodeURIComponent(token)}`)),
  )
  return mapInvitation(row)
}

export async function rsvpInvitacion(
  token: string,
  input: RsvpInput,
): Promise<Invitacion> {
  const row = await parseResponse<ApiInvitation>(
    await fetch(apiPath(`/api/invitations/by-token/${encodeURIComponent(token)}/rsvp`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: STATUS_TO_API[input.estado],
        plusOneName: input.nombreAcompanante,
        hasDietaryRestrictions: input.restriccionesAlimentariasSi,
        dietaryRestrictions: input.restriccionesAlimentarias,
      }),
    }),
  )
  return mapInvitation(row)
}

// ---- Usuarios (login del dashboard) ----

export async function loginUsuario(email: string, password: string): Promise<UsuarioAdmin> {
  const data = await parseResponse<{ user: { id: number; name: string; email: string } }>(
    await apiFetch(apiPath('/api/users/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  )
  return { id: data.user.id, nombre: data.user.name, email: data.user.email }
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

type ApiAlbumItem = {
  id: number
  invitationId: number | null
  invitationName: string | null
  originalName: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  createdAt: string
  url: string | null
}

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

function mapAlbumItem(row: ApiAlbumItem): AlbumItem {
  return {
    id: row.id,
    invitacionId: row.invitationId,
    invitacionNombre: row.invitationName,
    originalName: row.originalName,
    storageKey: row.storageKey,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    createdAt: row.createdAt,
    url: row.url,
  }
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
    res = await fetch(apiPath(`/api/album-photos?limit=${limit}`))
  } catch {
    throw new Error('No se pudo conectar con el servidor de la galería.')
  }

  const data = await parseResponse<{ items?: ApiAlbumItem[] }>(res)
  if (!Array.isArray(data.items)) {
    throw new Error('La galería respondió con un formato inesperado.')
  }

  return { items: data.items.map(mapAlbumItem) }
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
    res = await fetch(apiPath('/api/album-photos/upload'), {
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
