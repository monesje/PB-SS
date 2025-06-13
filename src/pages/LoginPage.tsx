import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Mail, Lock, Chrome, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { user, signIn, signUp, signInWithGoogle, createDevUsers } = useAuth()
  const { getThemeColors } = useTheme()
  const colors = getThemeColors()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [creatingDevUsers, setCreatingDevUsers] = useState(false)

  const devOverride = import.meta.env.VITE_DEV_OVERRIDE === 'true'

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // Check password strength
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters long')
          setLoading(false)
          return
        }
        
        await signUp(email, password)
        
        const bypassEmailVerification = import.meta.env.VITE_BYPASS_EMAIL_VERIFICATION === 'true'
        
        if (bypassEmailVerification) {
          toast.success('Account created and verified! You can now sign in.')
        } else {
          toast.success('Account created! Please check your email for a verification link before signing in.')
        }
      } else {
        await signIn(email, password)
        toast.success('Signed in successfully!')
      }
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials or create an account.')
      } else {
        toast.error(error.message || 'An error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    }
  }

  const handleCreateDevUsers = async () => {
    setCreatingDevUsers(true)
    try {
      const results = await createDevUsers()
      const created = results.filter(r => r.status === 'created').length
      const existing = results.filter(r => r.status === 'already_exists').length
      const errors = results.filter(r => r.status === 'error').length
      
      if (created > 0) {
        toast.success(`Created ${created} development user(s)`)
      }
      if (existing > 0) {
        toast.success(`${existing} development user(s) already exist`)
      }
      if (errors > 0) {
        toast.error(`Failed to create ${errors} user(s)`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create development users')
    } finally {
      setCreatingDevUsers(false)
    }
  }

  // Reset confirm password when switching between sign in/up
  const handleToggleMode = () => {
    setIsSignUp(!isSignUp)
    setPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignUp 
              ? 'Join the PBA Salary Survey Portal' 
              : 'Access the PBA Salary Survey Portal'
            }
          </p>
        </div>

        {devOverride && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Development Mode</h3>
                <p className="text-xs text-blue-600 mt-1">Create development users to get started</p>
              </div>
              <button
                onClick={handleCreateDevUsers}
                disabled={creatingDevUsers}
                className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <Users className="h-3 w-3 mr-1" />
                {creatingDevUsers ? 'Creating...' : 'Create Dev Users'}
              </button>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder={isSignUp ? "Password (min. 6 characters)" : "Password"}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-${colors.primary} hover:bg-${colors.primary}/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${colors.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Sign in with Google
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleToggleMode}
              className={`text-${colors.primary} hover:text-${colors.primary}/80 font-medium`}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}