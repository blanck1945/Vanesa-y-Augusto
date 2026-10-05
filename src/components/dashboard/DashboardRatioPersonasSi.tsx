import type { Invitacion } from '../../data/api'
import { totalesPersonasInvitacion } from '../../lib/dashboardInvitacionDisplay'
import { Card } from '../ui/Card'
import { Text } from '../ui/Text'

type DashboardRatioPersonasSiProps = {
  invitaciones: Invitacion[]
  compact?: boolean
}

/** x/y — personas que confirmaron sí / total de personas invitadas (cupos). */
export function DashboardRatioPersonasSi({ invitaciones, compact }: DashboardRatioPersonasSiProps) {
  const { confirmadasSi, invitadas } = totalesPersonasInvitacion(invitaciones)

  if (compact) {
    return (
      <Text muted className="text-sm">
        Asistencia confirmada:{' '}
        <span className="font-medium text-bp-body">
          {confirmadasSi}/{invitadas}
        </span>{' '}
        personas (sí / total invitadas)
      </Text>
    )
  }

  return (
    <Card className="p-4">
      <Text muted>Asistencia confirmada (personas)</Text>
      <p className="dash-ratio-personas mt-1">
        <span className="dash-ratio-personas-x">{confirmadasSi}</span>
        <span className="dash-ratio-personas-sep">/</span>
        <span className="dash-ratio-personas-y">{invitadas}</span>
      </p>
      <Text muted className="mt-1 text-sm">
        Dijeron que sí / total invitadas (incluye parejas en invitaciones + pareja)
      </Text>
    </Card>
  )
}
