/** Segmento de URL pública `/i/...` (slug del invitado). */
export function invitacionPathSegment(inv: { slug: string; token?: string }): string {
  const raw = inv.slug?.trim() || inv.token?.trim() || ''
  return encodeURIComponent(raw)
}

export function invitacionPath(inv: { slug: string; token?: string }): string {
  const segment = invitacionPathSegment(inv)
  return segment ? `/i/${segment}` : '/i'
}
