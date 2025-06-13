import React, { useState } from 'react'
import { ChevronDown, User, Shield, Users, UserCheck, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function DevDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut, signInAsAdmin, signInAsFullAccessUser, signInAsOneRoleUser } = useAuth()

  // Only show in development mode
  if (import.meta.env.VITE_DEV_OVERRIDE !== 'true') {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      setIsOpen(false)
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const handleSignInAsAdmin = async () => {
    try {
      await signInAsAdmin()
      toast.success('Signed in as admin')
      setIsOpen(false)
    } catch (error) {
      toast.error('Error signing in as admin')
    }
  }

  const handleSignInAsFullAccess = async () => {
    try {
      await signInAsFullAccessUser()
      toast.success('Signed in as full access user')
      setIsOpen(false)
    } catch (error) {
      toast.error('Error signing in as full access user')
    }
  }

  const handleSignInAsOneRole = async () => {
    try {
      await signInAsOneRoleUser()
      toast.success('Signed in as single role user')
      setIsOpen(false)
    } catch (error) {
      toast.error('Error signing in as single role user')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-300"
      >
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">DEV</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                Development Tools
              </div>
              
              {user && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              )}

              <button
                onClick={handleSignInAsAdmin}
                className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <Shield className="h-4 w-4 text-red-500" />
                <div>
                  <div className="font-medium">Sign in as Admin</div>
                  <div className="text-xs text-gray-500">Full system access</div>
                </div>
              </button>

              <button
                onClick={handleSignInAsFullAccess}
                className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <Users className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-medium">Sign in as Full Access User</div>
                  <div className="text-xs text-gray-500">Access to all roles</div>
                </div>
              </button>

              <button
                onClick={handleSignInAsOneRole}
                className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <UserCheck className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-medium">Sign in as Single Role User</div>
                  <div className="text-xs text-gray-500">Access to one role only</div>
                </div>
              </button>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  )
}