import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a mock client if environment variables are not set (for development)
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not set. Using mock client for development.')
    // Return a minimal mock client for development
    return null as any
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Create Supabase client with TypeScript support
export const supabase = createSupabaseClient()

// Client-side only functions
export const getUser = () => {
  if (typeof window === 'undefined' || !supabase) {
    return null
  }
  return supabase.auth.getUser()
}

export const getSession = () => {
  if (typeof window === 'undefined' || !supabase) {
    return null
  }
  return supabase.auth.getSession()
}