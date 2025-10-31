import { supabase } from './client'
import type { User } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  fullName: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthError {
  message: string
  code?: string
}

/**
 * Sign up a new user with email and password
 */
export async function signUp({ email, password, fullName }: SignUpData) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) {
      return { user: null, error: { message: authError.message, code: authError.code } }
    }

    if (!authData.user) {
      return { user: null, error: { message: 'Failed to create user' } }
    }

    // Create user profile in users table
    // Note: wallet_address is required, using a placeholder for email-only signups
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          wallet_address: '0x0000000000000000000000000000000000000000', // Placeholder until wallet connected
          email: authData.user.email,
          name: fullName,
          kyc_status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail signup if profile creation fails
      // User can still authenticate
    }

    return { user: authData.user, error: null }
  } catch (error) {
    console.error('Signup error:', error)
    return {
      user: null,
      error: { message: error instanceof Error ? error.message : 'Signup failed' },
    }
  }
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInData) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error: { message: error.message, code: error.code } }
    }

    return { user: data.user, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return {
      user: null,
      error: { message: error instanceof Error ? error.message : 'Sign in failed' },
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: { message: error.message } }
    }
    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      error: { message: error instanceof Error ? error.message : 'Sign out failed' },
    }
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}
