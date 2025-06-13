import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { BarChart3, User, Settings, LogOut } from 'lucide-react'
import DevDropdown from './DevDropdown'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile, signOut, loading } = useAuth()
  const { getThemeColors } = useTheme()
  const location = useLocation()
  const colors = getThemeColors()
  
  const devOverride = import.meta.env.VITE_DEV_OVERRIDE === 'true'

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className={`bg-white shadow-sm border-b border-gray-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <BarChart3 className={`h-8 w-8 text-${colors.primary}`} />
                <span className="text-xl font-bold text-gray-900">
                  PBA Salary Survey
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <DevDropdown />
              
              {(user || devOverride) ? (
                <>
                  {!loading && (
                    <span className="text-sm text-gray-700">
                      {profile?.full_name || user?.email}
                    </span>
                  )}
                  
                  {(profile?.is_admin || devOverride) && (
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/admin'
                          ? `bg-${colors.primary} text-white`
                          : `text-gray-700 hover:bg-${colors.secondary}`
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}

                  {!devOverride && <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>}
                </>
              ) : (
                <Link
                  to="/login"
                  className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium bg-${colors.primary} text-white hover:bg-${colors.primary}/90`}
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}