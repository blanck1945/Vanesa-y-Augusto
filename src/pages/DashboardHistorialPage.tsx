import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  getSesionAdmin,
  listInvitaciones,
  sortInvitaciones,
  type Invitacion,
  type InvitacionSortDir,
  type InvitacionSortKey,
} from '../data/api'
import { formatDateTimeArgentina } from '../lib/fechaArgentina'
import {
  DashSortHeader,
  estadoClass,
  estadoLabel,
  ladoLabel,
  personasEnTabla,
} from '../lib/dashboardInvitacionDisplay'
import { DashboardRatioPersonasSi } from '../components/dashboard/DashboardRatioPersonasSi'
import { Card } from '../components/ui/Card'
import { Text } from '../components/ui/Text'

export function DashboardHistorialPage() {
  const [usuario] = useState(() => getSesionAdmin())
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historialSortDir, setHistorialSortDir] = useState<InvitacionSortDir>('desc')

  useEffect(() => {
    if (!usuario) return
    let cancelado = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listInvitaciones()
        if (!cancelado) setInvitaciones(data)
      } catch (err) {
        if (!cancelado) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelado) setLoading(false)
      }
    })()
    return () => {
      cancelado = true
    }
  }, [usuario])

  const historialRespuestas = useMemo(() => {
    const conRespuesta = invitaciones.filter((i) => i.estado !== 'pendiente')
    return sortInvitaciones(conRespuesta, 'respondidoAt', historialSortDir)
  }, [invitaciones, historialSortDir])

  const onHistorialSort = (_key: InvitacionSortKey) => {
    void _key
    setHistorialSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
  }

  if (!usuario) return <Navigate to="/login" replace />

  return (
    <div className="dash-panel mx-auto flex flex-col gap-6">
      <div>
        <Text as="h1" className="text-2xl text-bp-body">
          Historial de respuestas
        </Text>
        <Text muted className="mt-1">
          Hola, {usuario.nombre}. Quienes ya respondieron el RSVP, del más reciente al más antiguo.
        </Text>
        {!loading && invitaciones.length > 0 ? (
          <div className="mt-2">
            <DashboardRatioPersonasSi invitaciones={invitaciones} compact />
          </div>
        ) : null}
      </div>

      {error ? <Text className="text-red-700">{error}</Text> : null}

      {loading ? (
        <Text muted>Cargando…</Text>
      ) : historialRespuestas.length === 0 ? (
        <Text muted>Todavía no hay respuestas.</Text>
      ) : (
        <Card className="overflow-x-auto p-0">
          <div className="border-b border-bp-border px-4 py-3">
            <Text muted className="text-sm">
              {historialRespuestas.length}{' '}
              {historialRespuestas.length === 1 ? 'respuesta' : 'respuestas'}. Tocá la columna fecha para
              invertir el orden.
            </Text>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Respuesta</th>
                <th>Lado</th>
                <th className="dash-table-num">Personas</th>
                <th>Pareja</th>
                <DashSortHeader
                  label="Respondió"
                  sortKey="respondidoAt"
                  activeKey="respondidoAt"
                  dir={historialSortDir}
                  onSort={onHistorialSort}
                />
              </tr>
            </thead>
            <tbody>
              {historialRespuestas.map((inv, index) => (
                <tr key={inv.id}>
                  <td className="text-bp-muted">{index + 1}</td>
                  <td>
                    <span className="font-medium text-bp-body">{inv.nombre}</span>
                  </td>
                  <td>
                    <span className={estadoClass(inv.estado)}>{estadoLabel(inv.estado)}</span>
                  </td>
                  <td>{ladoLabel(inv.lado)}</td>
                  <td className="dash-table-num">{personasEnTabla(inv)}</td>
                  <td>{(inv.permitePareja && inv.nombreAcompanante) || '—'}</td>
                  <td>{formatDateTimeArgentina(inv.respondidoAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
