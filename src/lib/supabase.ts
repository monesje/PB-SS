import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const auth = supabase.auth

export const signInWithGoogle = () => {
  return auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`
    }
  })
}

export const signInWithEmail = (email: string, password: string) => {
  return auth.signInWithPassword({ email, password })
}

export const signUpWithEmail = (email: string, password: string) => {
  return auth.signUp({ email, password })
}

export const signOut = () => {
  return auth.signOut()
}

export const getCurrentUser = () => {
  return auth.getUser()
}

// Export supabase client for use in scripts
export { supabase }