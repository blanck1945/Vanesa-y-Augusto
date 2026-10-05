import { NavLink } from 'react-router-dom'
import { clearSesionAdmin, getSesionAdmin } from '../../data/api'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `dash-nav-link${isActive ? ' dash-nav-link--active' : ''}`
}

export function DashboardNav() {
  const usuario = getSesionAdmin()
  if (!usuario) return null

  return (
    <nav className="dash-nav" aria-label="Secciones del dashboard">
      <NavLink to="/dashboard" end className={navLinkClass}>
        Invitaciones
      </NavLink>
      <NavLink to="/dashboard/historial" className={navLinkClass}>
        Historial
      </NavLink>
      <button
        type="button"
        className="dash-nav-link dash-nav-link--ghost"
        onClick={() => {
          clearSesionAdmin()
          window.location.href = '/login'
        }}
      >
        Salir
      </button>
    </nav>
  )
}
