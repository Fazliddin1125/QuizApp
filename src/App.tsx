import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from '@/pages/Landing'
import JoinByCode from '@/pages/JoinByCode'
import StudentTest from '@/pages/StudentTest'
import AdminLogin from '@/pages/AdminLogin'
import AdminRegister from '@/pages/AdminRegister'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminTestNew from '@/pages/AdminTestNew'
import AdminTestDetail from '@/pages/AdminTestDetail'
import AdminResults from '@/pages/AdminResults'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/join/:code" element={<JoinByCode />} />
        <Route path="/student/test" element={<StudentTest />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tests/new" element={<AdminTestNew />} />
        <Route path="/admin/tests/:id" element={<AdminTestDetail />} />
        <Route path="/admin/tests/:id/results" element={<AdminResults />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
