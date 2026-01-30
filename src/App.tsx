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
import { EmployeesPage } from './pages/EmployeesPage'
import { RequireAdmin } from './components/RequireAdmin'
import { SpotPage } from './pages/SpotPage'
import { ArticlesPage } from './pages/ArticlesPage'
import { NewsPage } from './pages/NewsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/*"
        element={
          <RequireAuth>
            <CrmProvider>
              <AppLayout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/visits" element={<VisitsPage />} />
                  <Route path="/finance" element={<FinancePage />} />
                  <Route path="/spot" element={<SpotPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/articles" element={<ArticlesPage />} />
                  <Route
                    path="/employees"
                    element={
                      <RequireAdmin>
                        <EmployeesPage />
                      </RequireAdmin>
                    }
                  />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </CrmProvider>
          </RequireAuth>
        }
      />
    </Routes>
  )
}
