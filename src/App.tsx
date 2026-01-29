import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { CustomersPage } from './pages/CustomersPage'
import { OrdersPage } from './pages/OrdersPage'
import { VisitsPage } from './pages/VisitsPage'
import { FinancePage } from './pages/FinancePage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RequireAuth } from './components/RequireAuth'
import { CrmProvider } from './store/CrmProvider'

export default function App() {
  return (
    <CrmProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/*"
          element={
            <RequireAuth>
              <AppLayout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/visits" element={<VisitsPage />} />
                  <Route path="/finance" element={<FinancePage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </RequireAuth>
          }
        />
      </Routes>
    </CrmProvider>
  )
}
