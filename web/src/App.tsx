import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { PrivateRoute } from './components/PrivateRoute'
import { GuestRoute } from './components/GuestRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Skeleton } from './components/ui/skeleton'

const DashboardPage      = lazy(() => import('./views/DashboardPage').then(m => ({ default: m.DashboardPage })))
const SettingsPage       = lazy(() => import('./views/SettingsPage').then(m => ({ default: m.SettingsPage })))
const WalletPage         = lazy(() => import('./views/WalletPage').then(m => ({ default: m.WalletPage })))
const WalletDetailPage   = lazy(() => import('./views/WalletDetailPage').then(m => ({ default: m.WalletDetailPage })))
const TransactionsPage   = lazy(() => import('./views/TransactionsPage').then(m => ({ default: m.TransactionsPage })))
const RecurringRulesPage = lazy(() => import('./views/RecurringRulesPage').then(m => ({ default: m.RecurringRulesPage })))
const BudgetPage         = lazy(() => import('./views/BudgetPage').then(m => ({ default: m.BudgetPage })))
const InvestmentPage     = lazy(() => import('./views/InvestmentPage').then(m => ({ default: m.InvestmentPage })))
const StatsPage          = lazy(() => import('./views/StatsPage').then(m => ({ default: m.StatsPage })))
const LoginPage          = lazy(() => import('./views/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage       = lazy(() => import('./views/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./views/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))

const PageLoader = () => (
  <div className="flex flex-col gap-4 p-4">
    <Skeleton className="h-12 w-full rounded-xl" />
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-40 w-full rounded-xl" />
  </div>
)

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login',           element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
          { path: '/register',        element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense> },
          { path: '/forgot-password', element: <Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense> },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true,               element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
          { path: 'settings',          element: <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense> },
          { path: 'wallets',           element: <Suspense fallback={<PageLoader />}><WalletPage /></Suspense> },
          { path: 'wallets/:id',       element: <Suspense fallback={<PageLoader />}><WalletDetailPage /></Suspense> },
          { path: 'transactions',      element: <Suspense fallback={<PageLoader />}><TransactionsPage /></Suspense> },
          { path: 'recurring-rules',   element: <Suspense fallback={<PageLoader />}><RecurringRulesPage /></Suspense> },
          { path: 'budget',            element: <Suspense fallback={<PageLoader />}><BudgetPage /></Suspense> },
          { path: 'investments',       element: <Suspense fallback={<PageLoader />}><InvestmentPage /></Suspense> },
          { path: 'stats',             element: <Suspense fallback={<PageLoader />}><StatsPage /></Suspense> },
          { path: '*',                 element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])

const App = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
)

export { App }
