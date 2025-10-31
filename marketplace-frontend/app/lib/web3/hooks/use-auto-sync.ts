"use client"

import { useEffect, useCallback, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Address } from 'viem'
import { CONTRACT_ADDRESSES } from '../addresses'
import { ACCESS_CONTROL_ABI, OWNERSHIP_REGISTRY_ABI } from '../abi'
import { useUserProfile } from '@/app/lib/supabase/hooks/use-user-profile'
import { logError } from '../error-utils'

/**
 * Auto-Sync Hook
 *
 * Automatically synchronizes blockchain data when wallet connects:
 * - Fetches KYC status from AccessControl contract
 * - Fetches token holdings from OwnershipRegistry
 * - Creates/updates Supabase user profile
 * - Caches data for fast access
 *
 * Usage: Call once in Web3Provider or root layout
 */

export interface SyncStatus {
  isSyncing: boolean
  lastSyncedAt: Date | null
  error: string | null
  kycStatus: 'pending' | 'approved' | 'rejected' | 'expired' | null
  totalHoldings: number
}

export function useAutoSync() {
  const { address, isConnected } = useAccount()
  const { profile, createOrUpdateProfile, isLoading: isProfileLoading } = useUserProfile()

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
    kycStatus: null,
    totalHoldings: 0,
  })

  // -------------------------------------------------------------------------
  // READ: KYC Status from AccessControl
  // -------------------------------------------------------------------------
  const {
    data: isKYCVerified,
    refetch: refetchKYC,
    isLoading: isLoadingKYC,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.ACCESS_CONTROL,
    abi: ACCESS_CONTROL_ABI,
    functionName: 'isUserKYCed',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected),
    },
  })

  // -------------------------------------------------------------------------
  // READ: Token Holdings from OwnershipRegistry
  // -------------------------------------------------------------------------
  const {
    data: userProperties,
    refetch: refetchHoldings,
    isLoading: isLoadingHoldings,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getUserProperties',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected),
    },
  })

  // -------------------------------------------------------------------------
  // Sync Function: Update Supabase Profile
  // -------------------------------------------------------------------------
  const syncProfile = useCallback(async () => {
    if (!address || !isConnected) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Wallet not connected',
      }))
      return
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      // Determine KYC status
      let kycStatus: 'pending' | 'approved' | 'rejected' | 'expired' = 'pending'
      if (isKYCVerified === true) {
        kycStatus = 'approved'
      } else if (isKYCVerified === false && profile?.kyc_status !== 'pending') {
        kycStatus = 'rejected'
      }

      // Calculate total holdings
      const holdings = userProperties as Address[] | undefined
      const totalHoldings = holdings?.length || 0

      // Create or update Supabase profile
      await createOrUpdateProfile({
        wallet_address: address.toLowerCase(),
        kyc_status: kycStatus,
        // Preserve existing name and email if they exist
        name: profile?.name || null,
        email: profile?.email || null,
      })

      setSyncStatus({
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
        kycStatus,
        totalHoldings,
      })

      console.log(`✓ Auto-sync completed for ${address}`, {
        kycStatus,
        totalHoldings,
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown sync error'
      logError('Auto-sync failed', err)

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: errorMessage,
      }))
    }
  }, [address, isConnected, isKYCVerified, userProperties, profile, createOrUpdateProfile])

  // -------------------------------------------------------------------------
  // Manual Refresh
  // -------------------------------------------------------------------------
  const refresh = useCallback(async () => {
    if (!address || !isConnected) return

    try {
      // Refetch blockchain data
      await Promise.all([
        refetchKYC(),
        refetchHoldings(),
      ])

      // Then sync to Supabase
      await syncProfile()
    } catch (err) {
      logError('Manual refresh failed', err)
    }
  }, [address, isConnected, refetchKYC, refetchHoldings, syncProfile])

  // -------------------------------------------------------------------------
  // Auto-Sync on Wallet Connect
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (isConnected && address) {
      // Wait for blockchain data to load
      if (!isLoadingKYC && !isLoadingHoldings && !isProfileLoading) {
        syncProfile()
      }
    } else {
      // Reset sync status when wallet disconnects
      setSyncStatus({
        isSyncing: false,
        lastSyncedAt: null,
        error: null,
        kycStatus: null,
        totalHoldings: 0,
      })
    }
  }, [isConnected, address, isLoadingKYC, isLoadingHoldings, isProfileLoading, syncProfile])

  // -------------------------------------------------------------------------
  // Re-sync when KYC status or holdings change
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (isConnected && address && !isLoadingKYC && !isLoadingHoldings) {
      // Only sync if we have actual data changes
      const currentKYC = isKYCVerified === true ? 'approved' : 'pending'
      const currentHoldings = (userProperties as Address[] | undefined)?.length || 0

      if (
        currentKYC !== syncStatus.kycStatus ||
        currentHoldings !== syncStatus.totalHoldings
      ) {
        syncProfile()
      }
    }
  }, [
    isConnected,
    address,
    isKYCVerified,
    userProperties,
    isLoadingKYC,
    isLoadingHoldings,
    syncStatus.kycStatus,
    syncStatus.totalHoldings,
    syncProfile,
  ])

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    // Sync status
    ...syncStatus,
    isLoading: isLoadingKYC || isLoadingHoldings || isProfileLoading,

    // Blockchain data
    isKYCVerified: Boolean(isKYCVerified),
    userProperties: (userProperties as Address[] | undefined) || [],

    // Actions
    refresh,
    syncProfile,
  }
}

/**
 * Hook for just checking if auto-sync is ready
 * Useful for showing loading states in UI
 */
export function useAutoSyncStatus() {
  const { isSyncing, isLoading, lastSyncedAt, error } = useAutoSync()

  return {
    isReady: !isSyncing && !isLoading && Boolean(lastSyncedAt),
    isSyncing: isSyncing || isLoading,
    error,
    lastSyncedAt,
  }
}
