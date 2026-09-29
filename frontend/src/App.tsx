import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireGuest } from '@/components/auth/RouteGuards'
import { WorkspaceLayout } from '@/components/auth/WorkspaceLayout'
import { LoginPage } from '@/pages/LoginPage'
import { CompaniesPage } from '@/pages/CompaniesPage'
import { CompanyDetailPage } from '@/pages/CompanyDetailPage'
import { ContactDetailPage } from '@/pages/ContactDetailPage'
import { ActivityLogsPage } from '@/pages/ActivityLogsPage'
import { DashboardPage } from '@/pages/DashboardHome'

function App() {
  return (
    <Routes>
      <Route element={<RequireGuest />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<WorkspaceLayout />}>
          <Route path="/" element={<Navigate to="/companies" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
          <Route path="/contacts/:contactId" element={<ContactDetailPage />} />
          <Route path="/activity-logs" element={<ActivityLogsPage />} />
          <Route path="*" element={<Navigate to="/companies" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App