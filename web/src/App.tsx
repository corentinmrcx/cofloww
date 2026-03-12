import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/layout/AuthLayout'
import PrivateRoute from './components/PrivateRoute'
import GuestRoute from './components/GuestRoute'
import DashboardPage from './views/DashboardPage'
import SettingsPage from './views/SettingsPage'
import WalletPage from './views/WalletPage'
import LoginPage from './views/LoginPage'
import RegisterPage from './views/RegisterPage'
import ForgotPasswordPage from './views/ForgotPasswordPage'

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login',           element: <LoginPage /> },
          { path: '/register',        element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
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
          { index: true,        element: <DashboardPage /> },
          { path: 'settings',   element: <SettingsPage />  },
          { path: 'wallets',    element: <WalletPage />    },
          { path: '*',        element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])

const App = () => <RouterProvider router={router} />

export default App
