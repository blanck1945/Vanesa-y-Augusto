import { googleCalendarUrl, type GoogleCalendarEvent } from '../lib/googleCalendarUrl'

type BotonAgendarEventoProps = {
  event: GoogleCalendarEvent
  label: string
}

export function BotonAgendarEvento({ event, label }: BotonAgendarEventoProps) {
  const handleClick = () => {
    const url = googleCalendarUrl(event)
    const tab = window.open(url, '_blank', 'noopener,noreferrer')
    if (!tab) {
      window.location.assign(url)
    }
  }

  return (
    <button type="button" className="inv-mapa-btn inv-album-btn" onClick={handleClick}>
      {label}
    </button>
  )
}
