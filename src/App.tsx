import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout } from '@/components/layout/MainLayout'

// Pages
import DashboardPage from '@/pages/Dashboard'
import TransactionsPage from '@/pages/Transactions'
import BillsPage from '@/pages/Bills'
import ParcelasPage from '@/pages/Parcelas'
import SalaryPage from '@/pages/Salary'
import BudgetPage from '@/pages/Budget'
import GoalsPage from '@/pages/Goals'
import InvestmentsPage from '@/pages/Investments'
import TaxPage from '@/pages/Tax'
import AIPage from '@/pages/AI'
import SettingsPage from '@/pages/Settings'
import OnboardingPage from '@/pages/Onboarding'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Onboarding — fullscreen, no sidebar */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Main app with sidebar layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/parcelas" element={<ParcelasPage />} />
            <Route path="/salary" element={<SalaryPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/tax" element={<TaxPage />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
