import type { EstadoInvitacion, Invitacion } from '../data/api'

export type InvitacionFormState = {
  setInv: (inv: Invitacion | null) => void
  setEstado: (estado: EstadoInvitacion) => void
  setDone: (done: boolean) => void
  setNombreAcompanante: (nombre: string) => void
  setModoAsistencia: (modo: 'solo' | 'pareja') => void
  setRestriccionesAlimentariasSi: (value: 'si' | 'no') => void
}

export function applyInvitacionState(inv: Invitacion, state: InvitacionFormState) {
  state.setInv(inv)
  if (inv.estado === 'si' || inv.estado === 'no' || inv.estado === 'aun_no_lo_se') {
    state.setEstado(inv.estado)
    state.setDone(true)
  } else {
    state.setEstado('si')
    state.setDone(false)
  }
  state.setNombreAcompanante(inv.nombreAcompanante || '')
  state.setModoAsistencia(inv.nombreAcompanante ? 'pareja' : 'solo')
  state.setRestriccionesAlimentariasSi(inv.restriccionesAlimentariasSi === true ? 'si' : 'no')
}

export function quitarSufijoPareja(nombre: string): string {
  return nombre.replace(/\s+pareja\s*$/i, '').trim()
}

export function whatsappHref(telefono: string, mensaje: string): string {
  return `https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`
}
