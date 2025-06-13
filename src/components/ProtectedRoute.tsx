import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  
  const devOverride = import.meta.env.VITE_DEV_OVERRIDE === 'true'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // In dev mode, allow access to non-admin routes without authentication
  if (devOverride && !requireAdmin) {
    return <>{children}</>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // In dev mode, allow admin access
  if (requireAdmin && !profile?.is_admin && !devOverride) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}