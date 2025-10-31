"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '../client'
import { User, UserInsert } from '../types'
import { logError } from '../../web3/error-utils'

export interface UserProfile extends Omit<User, 'id'> {
  id?: string
}

export function useUserProfile() {
  const { address, isConnected } = useAccount()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch or create user profile based on wallet address
  const fetchProfile = useCallback(async () => {
    if (!address || !isConnected) {
      setProfile(null)
      return
    }

    // Skip if Supabase is not configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping user profile fetch')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First try to get existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw fetchError
      }

      if (existingUser) {
        setProfile(existingUser)
      } else {
        // Create new user profile
        const newUser: UserInsert = {
          wallet_address: address.toLowerCase(),
          kyc_status: 'pending',
        }

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert(newUser)
          .select()
          .single()

        if (createError) {
          // Handle duplicate key constraint error (user already exists)
          if (createError.code === '23505') {
            // User already exists, try to fetch them again
            const { data: retryUser, error: retryError } = await supabase
              .from('users')
              .select('*')
              .eq('wallet_address', address.toLowerCase())
              .single()

            if (retryError) {
              throw new Error(`User exists but cannot be retrieved: ${retryError.message}`)
            }

            setProfile(retryUser)
          } else {
            throw createError
          }
        } else {
          setProfile(createdUser)
        }
      }
    } catch (err) {
      logError('Error managing user profile', err, {
        address: address,
        isConnected: isConnected,
        type: typeof err,
        hasAddress: !!address,
        errorCode: err instanceof Error && 'code' in err ? (err as any).code : 'unknown',
      })

      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to load profile. Please check your wallet connection and network.'

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected])

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!address || !profile || !supabase) return null

    setIsLoading(true)
    setError(null)

    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updates)
        .eq('wallet_address', address.toLowerCase())
        .select()
        .single()

      if (error) throw error

      setProfile(updatedUser)
      return updatedUser
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, profile])

  // Update KYC status
  const updateKYCStatus = useCallback(async (status: 'pending' | 'approved' | 'rejected' | 'expired') => {
    return updateProfile({ kyc_status: status })
  }, [updateProfile])

  // Check if user is accredited (for admin dashboard usage)
  const isAccredited = profile?.kyc_status === 'approved'

  // Fetch profile when wallet connects
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    isLoading,
    error,
    isAccredited,
    updateProfile,
    updateKYCStatus,
    refetchProfile: fetchProfile,
  }
}

// Hook for checking user roles and permissions
export function useUserPermissions() {
  const { profile, isAccredited } = useUserProfile()
  const { address } = useAccount()

  const canViewAdmin = isAccredited && address // Basic check - could be enhanced
  const canManageProperties = isAccredited && address
  const canAccessGovernance = !!address // Any wallet can participate in governance

  return {
    profile,
    isAccredited,
    canViewAdmin,
    canManageProperties,
    canAccessGovernance,
  }
}