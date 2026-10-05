import type { InvitacionSortDir, InvitacionSortKey, Invitacion } from '../data/api'

export function estadoLabel(estado: Invitacion['estado']): string {
  if (estado === 'si') return 'Confirmó que sí'
  if (estado === 'no') return 'Confirmó que no'
  if (estado === 'aun_no_lo_se') return 'Aún no lo sabe'
  return 'Sin respuesta'
}

export function estadoClass(estado: Invitacion['estado']): string {
  if (estado === 'si') return 'dash-estado dash-estado--si'
  if (estado === 'no') return 'dash-estado dash-estado--no'
  if (estado === 'aun_no_lo_se') return 'dash-estado dash-estado--talvez'
  return 'dash-estado dash-estado--pendiente'
}

export function ladoLabel(lado: Invitacion['lado']): string {
  if (lado === 'vanesa') return 'Vanesa'
  if (lado === 'augusto') return 'Augusto'
  if (lado === 'patricia') return 'Patricia'
  return '—'
}

export function invitaLabel(inv: Invitacion): string {
  return inv.permitePareja ? 'Invitado + pareja' : 'Solo invitado'
}

export function restriccionesLabel(inv: Invitacion): string {
  if (inv.restriccionesAlimentariasSi == null) return '—'
  if (!inv.restriccionesAlimentariasSi) return 'No'
  return inv.restriccionesAlimentarias ? `Sí · ${inv.restriccionesAlimentarias}` : 'Sí'
}

export function personasInvitadas(inv: Invitacion): number {
  return inv.permitePareja ? 2 : 1
}

export function personasConfirmadas(inv: Invitacion): number {
  if (inv.estado !== 'si') return 0
  return inv.nombreAcompanante ? 2 : 1
}

export function personasEnTabla(inv: Invitacion): string {
  if (inv.estado === 'si') return String(personasConfirmadas(inv))
  return String(personasInvitadas(inv))
}

export function DashSortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string
  sortKey: InvitacionSortKey
  activeKey: InvitacionSortKey
  dir: InvitacionSortDir
  onSort: (key: InvitacionSortKey) => void
}) {
  const active = activeKey === sortKey
  const indicator = !active ? '↕' : dir === 'asc' ? '↑' : '↓'
  return (
    <th scope="col" aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className={`dash-table-sort${active ? ' dash-table-sort--active' : ''}`}
        onClick={() => onSort(sortKey)}
        aria-label={`Ordenar por ${label}${active ? (dir === 'asc' ? ', ascendente' : ', descendente') : ''}`}
      >
        <span className="dash-table-sort-label">{label}</span>
        <span className="dash-table-sort-icon" aria-hidden>
          {indicator}
        </span>
      </button>
    </th>
  )
}
