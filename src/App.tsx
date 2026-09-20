import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'
import { GaleriaPage } from './pages/GaleriaPage'
import { InvitacionPage } from './pages/InvitacionPage'
import { LoginPage } from './pages/LoginPage'
import { VistaPage } from './pages/VistaPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/vista" replace />} />
      <Route path="/vista" element={<VistaPage />} />
      <Route path="/galeria" element={<GaleriaPage />} />
      <Route path="/i/:token" element={<InvitacionPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/vista" replace />} />
    </Routes>
  )
}
