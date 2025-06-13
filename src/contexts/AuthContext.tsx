import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../types'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInAsAdmin: () => Promise<void>
  signInAsFullAccessUser: () => Promise<void>
  signInAsOneRoleUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '')
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email || '')
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile(data)
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            is_admin: checkIsAdmin(userEmail)
          })
          .select()
          .single()

        if (createError) throw createError
        setProfile(newProfile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const checkIsAdmin = (email: string): boolean => {
    const adminDomain = import.meta.env.VITE_ADMIN_DOMAIN
    const devOverride = import.meta.env.VITE_DEV_OVERRIDE === 'true'
    
    if (devOverride) return true
    if (!adminDomain) return false
    
    return email.endsWith(`@${adminDomain}`)
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const bypassEmailVerification = import.meta.env.VITE_BYPASS_EMAIL_VERIFICATION === 'true'
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: bypassEmailVerification ? {
        emailRedirectTo: undefined,
        data: {
          email_confirm: true
        }
      } : undefined
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    if (error) throw error
  }

  const signInAsAdmin = async () => {
    const email = import.meta.env.VITE_DEV_ADMIN_EMAIL
    const password = import.meta.env.VITE_DEV_ADMIN_PASSWORD
    
    if (!email || !password) {
      throw new Error('Dev admin credentials not configured')
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signInAsFullAccessUser = async () => {
    const email = import.meta.env.VITE_DEV_FULL_ACCESS_EMAIL
    const password = import.meta.env.VITE_DEV_FULL_ACCESS_PASSWORD
    
    if (!email || !password) {
      throw new Error('Dev full access user credentials not configured')
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signInAsOneRoleUser = async () => {
    const email = import.meta.env.VITE_DEV_ONE_ROLE_EMAIL
    const password = import.meta.env.VITE_DEV_ONE_ROLE_PASSWORD
    
    if (!email || !password) {
      throw new Error('Dev single role user credentials not configured')
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInAsAdmin,
    signInAsFullAccessUser,
    signInAsOneRoleUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}