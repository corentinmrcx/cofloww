import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './views/DashboardPage'
import SettingsPage from './views/SettingsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,       element: <DashboardPage /> },
      { path: 'settings',  element: <SettingsPage />  },
      { path: '*',         element: <Navigate to="/" replace /> },
    ],
  },
])

const App = () => <RouterProvider router={router} />

export default App
