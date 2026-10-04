const AR_TZ = 'America/Argentina/Buenos_Aires'

/** Fechas guardadas en la API como `YYYY-MM-DD HH:MM:SS` (hora Argentina). */
export function parseApiDateTime(value: string): Date {
  const s = value.trim()
  if (!s) return new Date(Number.NaN)
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s)

  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (m) {
    return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] ?? '00'}-03:00`)
  }

  return new Date(s.replace(' ', 'T'))
}

export function formatDateTimeArgentina(value: string | null | undefined): string {
  if (!value) return '—'
  const d = parseApiDateTime(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('es-AR', {
    timeZone: AR_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
