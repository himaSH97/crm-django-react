import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireGuest } from '@/components/auth/RouteGuards'
import { LoginPage } from '@/pages/LoginPage'
import { CompaniesPage } from '@/pages/CompaniesPage'
import { CompanyDetailPage } from '@/pages/CompanyDetailPage'
import { ContactDetailPage } from '@/pages/ContactDetailPage'

function App() {
  return (
    <Routes>
      <Route element={<RequireGuest />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to="/companies" replace />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
        <Route path="/contacts/:contactId" element={<ContactDetailPage />} />
        <Route path="*" element={<Navigate to="/companies" replace />} />
      </Route>
    </Routes>
  )
}

export default App