import type { Invitacion } from '../data/api'
import { InvitacionPage } from './InvitacionPage'

function demoInvitacion(): Invitacion {
  const now = new Date().toISOString()
  return {
    id: 0,
    nombre: 'Invitado/a',
    token: 'vista-demo',
    estado: 'pendiente',
    lado: 'vanesa',
    permitePareja: true,
    nombreAcompanante: null,
    email: null,
    emailEnviadoAt: null,
    restriccionesAlimentariasSi: null,
    restriccionesAlimentarias: null,
    respondidoAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
}

/** Vista pública (/vista) — misma invitación que producción, sin depender de API. */
export function VistaPage() {
  return <InvitacionPage invitacionOverride={demoInvitacion()} />
}
