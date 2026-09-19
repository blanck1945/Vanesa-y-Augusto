import { useEffect, useState } from 'react'
import { CASAMIENTO } from '../content/casamiento'

type Restante = {
  dias: number
  horas: number
  minutos: number
  segundos: number
  terminado: boolean
}

function calcularRestante(fechaIso: string, ahora: Date = new Date()): Restante {
  const objetivo = new Date(fechaIso).getTime()
  const diffMs = Math.max(0, objetivo - ahora.getTime())
  const totalSeg = Math.floor(diffMs / 1000)
  return {
    dias: Math.floor(totalSeg / 86400),
    horas: Math.floor((totalSeg % 86400) / 3600),
    minutos: Math.floor((totalSeg % 3600) / 60),
    segundos: totalSeg % 60,
    terminado: diffMs <= 0,
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Cuenta regresiva en vivo hasta la fecha del casamiento. */
export function Reloj({ fechaIso }: { fechaIso: string }) {
  const [restante, setRestante] = useState(() => calcularRestante(fechaIso))

  useEffect(() => {
    const tick = () => setRestante(calcularRestante(fechaIso))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [fechaIso])

  if (restante.terminado) {
    return (
      <div className="inv-reloj">
        <p className="inv-reloj-hoy">¡Es el gran día!</p>
        <p className="inv-count-unit">{CASAMIENTO.fechaLabel}</p>
      </div>
    )
  }

  const celdas = [
    { valor: String(restante.dias), label: 'Días' },
    { valor: pad2(restante.horas), label: 'Horas' },
    { valor: pad2(restante.minutos), label: 'Minutos' },
    { valor: pad2(restante.segundos), label: 'Segundos' },
  ]

  return (
    <div className="inv-reloj">
      <div className="inv-reloj-grid" aria-live="polite">
        {celdas.map((c) => (
          <div className="inv-reloj-celda" key={c.label}>
            <span className="inv-reloj-num">{c.valor}</span>
            <span className="inv-reloj-label">{c.label}</span>
          </div>
        ))}
      </div>
      <p className="inv-count-unit">para el {CASAMIENTO.fechaLabel}</p>
    </div>
  )
}
