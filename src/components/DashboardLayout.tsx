import { Outlet } from 'react-router-dom'

/** Layout mínimo para las páginas admin (login / dashboard). */
export function DashboardLayout() {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-bp-bg">
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </div>
    </div>
  )
}
