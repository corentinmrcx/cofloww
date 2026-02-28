import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './views/DashboardPage'
import SettingsPage from './views/SettingsPage'
import LoginPage from './views/LoginPage'
import RegisterPage from './views/RegisterPage'
import ForgotPasswordPage from './views/ForgotPasswordPage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,      element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage />  },
      { path: '*',        element: <Navigate to="/" replace /> },
    ],
  },
])

const App = () => <RouterProvider router={router} />

export default App
