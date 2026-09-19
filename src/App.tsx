import { Navigate, Route, Routes } from 'react-router-dom'
import { GaleriaPage } from './pages/GaleriaPage'
import { InvitacionPage } from './pages/InvitacionPage'
import { VistaPage } from './pages/VistaPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/vista" replace />} />
      <Route path="/vista" element={<VistaPage />} />
      <Route path="/galeria" element={<GaleriaPage />} />
      <Route path="/i/:token" element={<InvitacionPage />} />
      <Route path="*" element={<Navigate to="/vista" replace />} />
    </Routes>
  )
}
