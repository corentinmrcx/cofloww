import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'

const GuestRoute = () => {
  const { isAuthenticated, isPending } = useAuth()

  if (isPending) return null

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}

export default GuestRoute
