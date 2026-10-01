import { Routes, Route } from 'react-router'
import VenuePage from './VenuePage.jsx'
import AdminPage from './admin/AdminPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<VenuePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<VenuePage />} />
    </Routes>
  )
}
