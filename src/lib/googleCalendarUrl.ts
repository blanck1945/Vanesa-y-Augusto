export type GoogleCalendarEvent = {
  title: string
  /** Formato Google: YYYYMMDDTHHmmss (hora local si se usa ctz) */
  start: string
  end: string
  location?: string
  details?: string
  timezone?: string
}

/** Link “Agregar a Google Calendar” — no requiere API ni cuenta GCP. */
export function googleCalendarUrl(event: GoogleCalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${event.start}/${event.end}`,
  })
  if (event.location) params.set('location', event.location)
  if (event.details) params.set('details', event.details)
  if (event.timezone) params.set('ctz', event.timezone)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
