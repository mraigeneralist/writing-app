import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg text-ui text-text-3">
        loading…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }

  return <Outlet />
}
