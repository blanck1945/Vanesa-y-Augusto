import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { applyAdminTheme, clearAdminTheme, getStoredAdminTheme, setAdminTheme, type AdminTheme } from '../admin/theme'
import { AdminThemeToggle } from './AdminThemeToggle'
import '../styles/admin.css'

/** Layout mínimo para las páginas admin (login / dashboard). */
export function DashboardLayout() {
  const [theme, setTheme] = useState<AdminTheme>(() => {
    const stored = getStoredAdminTheme()
    applyAdminTheme(stored)
    return stored
  })

  useEffect(() => {
    applyAdminTheme(theme)
    return () => clearAdminTheme()
  }, [theme])

  function onToggleTheme() {
    const next: AdminTheme = theme === 'dark' ? 'light' : 'dark'
    setAdminTheme(next)
    setTheme(next)
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-bp-bg">
      <div className="admin-topbar">
        <AdminThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </div>
    </div>
  )
}
