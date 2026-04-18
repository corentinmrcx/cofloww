import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'

const PrivateRoute = () => {
  const { isAuthenticated, isPending } = useAuth()

  if (isPending) return null

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export { PrivateRoute }
