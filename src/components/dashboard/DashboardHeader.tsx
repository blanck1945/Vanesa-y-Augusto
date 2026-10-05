import { NavLink, useLocation } from 'react-router-dom'
import type { AdminTheme } from '../../admin/theme'
import { DASHBOARD_APP_NAME, DASHBOARD_APP_TAGLINE } from '../../config/dashboardBrand'
import { clearSesionAdmin, getSesionAdmin } from '../../data/api'
import { AdminThemeToggle } from '../AdminThemeToggle'

function tabClass({ isActive }: { isActive: boolean }) {
  return `dash-navbar-tab${isActive ? ' dash-navbar-tab--active' : ''}`
}

type DashboardHeaderProps = {
  theme: AdminTheme
  onToggleTheme: () => void
}

export function DashboardHeader({ theme, onToggleTheme }: DashboardHeaderProps) {
  const location = useLocation()
  const enDashboard = location.pathname.startsWith('/dashboard')
  const usuario = getSesionAdmin()

  return (
    <header className="dash-navbar">
      <div className="dash-navbar-brand">
        <NavLink to={usuario ? '/dashboard' : '/login'} className="dash-navbar-title">
          {DASHBOARD_APP_NAME}
        </NavLink>
        <span className="dash-navbar-tagline">{DASHBOARD_APP_TAGLINE}</span>
      </div>

      {enDashboard && usuario ? (
        <nav className="dash-navbar-tabs" aria-label="Secciones del dashboard">
          <NavLink to="/dashboard" end className={tabClass}>
            Invitaciones
          </NavLink>
          <NavLink to="/dashboard/historial" className={tabClass}>
            Historial
          </NavLink>
        </nav>
      ) : (
        <div className="dash-navbar-tabs dash-navbar-tabs--placeholder" aria-hidden />
      )}

      <div className="dash-navbar-actions">
        {usuario ? (
          <span className="dash-navbar-user" title={usuario.email}>
            {usuario.nombre}
          </span>
        ) : null}
        <AdminThemeToggle theme={theme} onToggle={onToggleTheme} />
        {enDashboard && usuario ? (
          <button
            type="button"
            className="dash-navbar-logout"
            onClick={() => {
              clearSesionAdmin()
              window.location.href = '/login'
            }}
          >
            Salir
          </button>
        ) : null}
      </div>
    </header>
  )
}
