"use client"

import { useState, useCallback, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { Address, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { CONTRACT_ADDRESSES } from '../addresses'
import { ACCESS_CONTROL_ABI } from '../abi'
import { hederaTestnet } from '../config'
import { logError } from '../error-utils'
import { useUserProfile } from '@/app/lib/supabase/hooks/use-user-profile'

/**
 * Auto-KYC Approval Hook
 *
 * For MVP only: Automatically approves KYC after user submission
 *
 * SECURITY WARNING: This uses an admin private key stored in env variables.
 * In production, KYC approval should go through a secure backend service
 * with proper verification workflows.
 *
 * Flow:
 * 1. User submits KYC with document URLs
 * 2. Transaction confirms
 * 3. Automatically approve using admin wallet
 * 4. Update Supabase profile
 */

export interface SubmitKYCParams {
  documentHashes: string[] // IPFS hashes or Supabase URLs
  investorType: 'RETAIL' | 'ACCREDITED' | 'INSTITUTIONAL'
}

export interface AutoKYCStatus {
  isSubmitting: boolean
  isApproving: boolean
  isComplete: boolean
  error: string | null
  submitTxHash: string | null
  approveTxHash: string | null
}

export function useAutoKYC() {
  const publicClient = usePublicClient()
  const { createOrUpdateProfile } = useUserProfile()

  const [status, setStatus] = useState<AutoKYCStatus>({
    isSubmitting: false,
    isApproving: false,
    isComplete: false,
    error: null,
    submitTxHash: null,
    approveTxHash: null,
  })

  // -------------------------------------------------------------------------
  // STEP 1: User Submits KYC
  // -------------------------------------------------------------------------
  const {
    writeContract: submitKYCWrite,
    data: submitHash,
    isPending: isSubmitPending,
    error: submitError,
  } = useWriteContract()

  const {
    isLoading: isSubmitConfirming,
    isSuccess: isSubmitSuccess,
  } = useWaitForTransactionReceipt({
    hash: submitHash,
  })

  // -------------------------------------------------------------------------
  // STEP 2: Admin Auto-Approves (using private key)
  // -------------------------------------------------------------------------
  const autoApproveKYC = useCallback(async (userAddress: Address) => {
    // Check if admin private key is configured
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY

    if (!adminPrivateKey) {
      throw new Error(
        'Auto-KYC approval not configured. Please set ADMIN_PRIVATE_KEY in .env.local. ' +
        'For production, implement a secure backend approval workflow.'
      )
    }

    if (!adminPrivateKey.startsWith('0x')) {
      throw new Error('ADMIN_PRIVATE_KEY must start with 0x')
    }

    setStatus(prev => ({ ...prev, isApproving: true, error: null }))

    try {
      // Create admin account from private key
      const adminAccount = privateKeyToAccount(adminPrivateKey as `0x${string}`)

      // Create wallet client with admin account
      const adminWalletClient = createWalletClient({
        account: adminAccount,
        chain: hederaTestnet,
        transport: http(process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL),
      })

      // Call setKYCStatus to approve user
      const approveTxHash = await adminWalletClient.writeContract({
        address: CONTRACT_ADDRESSES.ACCESS_CONTROL,
        abi: ACCESS_CONTROL_ABI,
        functionName: 'setKYCStatus',
        args: [userAddress, true], // true = approved
      })

      setStatus(prev => ({ ...prev, approveTxHash }))

      // Wait for approval confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: approveTxHash })
      }

      // Update Supabase profile
      await createOrUpdateProfile({
        wallet_address: userAddress.toLowerCase(),
        kyc_status: 'approved',
      })

      setStatus(prev => ({
        ...prev,
        isApproving: false,
        isComplete: true,
      }))

      console.log(`✓ KYC auto-approved for ${userAddress}`)

      return approveTxHash

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Auto-approval failed'
      logError('Auto-approve KYC failed', err)

      setStatus(prev => ({
        ...prev,
        isApproving: false,
        error: errorMessage,
      }))

      throw err
    }
  }, [publicClient, createOrUpdateProfile])

  // -------------------------------------------------------------------------
  // Complete KYC Flow: Submit + Auto-Approve
  // -------------------------------------------------------------------------
  const submitAndApproveKYC = useCallback(
    async (userAddress: Address, params: SubmitKYCParams) => {
      if (CONTRACT_ADDRESSES.ACCESS_CONTROL === '0x0000000000000000000000000000000000000000') {
        throw new Error('AccessControl contract not configured')
      }

      setStatus({
        isSubmitting: true,
        isApproving: false,
        isComplete: false,
        error: null,
        submitTxHash: null,
        approveTxHash: null,
      })

      try {
        // Validate inputs
        if (!params.documentHashes || params.documentHashes.length === 0) {
          throw new Error('At least one document is required')
        }

        // Map investor type to enum
        const investorTypeMap = {
          RETAIL: 0,
          ACCREDITED: 1,
          INSTITUTIONAL: 2,
        }
        const investorTypeValue = investorTypeMap[params.investorType]

        // STEP 1: Submit KYC (user wallet signs)
        submitKYCWrite({
          address: CONTRACT_ADDRESSES.ACCESS_CONTROL,
          abi: ACCESS_CONTROL_ABI,
          functionName: 'submitKYC',
          args: [params.documentHashes, investorTypeValue],
        })

        // Note: The rest of the flow continues in the useEffect below
        // when isSubmitSuccess becomes true

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'KYC submission failed'
        logError('Submit KYC failed', err)

        setStatus(prev => ({
          ...prev,
          isSubmitting: false,
          error: errorMessage,
        }))

        throw err
      }
    },
    [submitKYCWrite]
  )

  // -------------------------------------------------------------------------
  // Auto-Approve After Successful Submission
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (isSubmitSuccess && submitHash && !status.isApproving && !status.isComplete) {
      // Extract user address from the transaction
      // In a real app, we'd parse the transaction to get the user address
      // For now, we'll need to pass it as a parameter
      // This will be handled in the component that calls this hook

      setStatus(prev => ({
        ...prev,
        isSubmitting: false,
        submitTxHash: submitHash,
      }))
    }
  }, [isSubmitSuccess, submitHash, status.isApproving, status.isComplete])

  // -------------------------------------------------------------------------
  // Simplified Auto-Approve Flow (for use in components)
  // -------------------------------------------------------------------------
  const autoApproveAfterSubmit = useCallback(
    async (userAddress: Address) => {
      if (isSubmitSuccess && !status.isComplete) {
        await autoApproveKYC(userAddress)
      }
    },
    [isSubmitSuccess, status.isComplete, autoApproveKYC]
  )

  // -------------------------------------------------------------------------
  // Reset Function
  // -------------------------------------------------------------------------
  const reset = useCallback(() => {
    setStatus({
      isSubmitting: false,
      isApproving: false,
      isComplete: false,
      error: null,
      submitTxHash: null,
      approveTxHash: null,
    })
  }, [])

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    // Status
    ...status,
    isLoading: status.isSubmitting || status.isApproving,

    // Submit KYC (step 1)
    submitKYCWrite,
    submitHash,
    isSubmitPending,
    isSubmitConfirming,
    isSubmitSuccess,
    submitError,

    // Actions
    submitAndApproveKYC, // Complete flow (submit + auto-approve)
    autoApproveKYC, // Manual approval (admin only)
    autoApproveAfterSubmit, // Auto-approve after submit success
    reset,
  }
}

/**
 * Simpler hook for just auto-approving existing KYC submissions
 * (Admin use only)
 */
export function useAdminKYCApproval() {
  const publicClient = usePublicClient()
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approveKYC = useCallback(
    async (userAddress: Address) => {
      const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY

      if (!adminPrivateKey) {
        throw new Error('ADMIN_PRIVATE_KEY not configured')
      }

      setIsApproving(true)
      setError(null)

      try {
        const adminAccount = privateKeyToAccount(adminPrivateKey as `0x${string}`)
        const adminWalletClient = createWalletClient({
          account: adminAccount,
          chain: hederaTestnet,
          transport: http(process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL),
        })

        const txHash = await adminWalletClient.writeContract({
          address: CONTRACT_ADDRESSES.ACCESS_CONTROL,
          abi: ACCESS_CONTROL_ABI,
          functionName: 'setKYCStatus',
          args: [userAddress, true],
        })

        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: txHash })
        }

        setIsApproving(false)
        return txHash
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Approval failed'
        setError(errorMessage)
        setIsApproving(false)
        throw err
      }
    },
    [publicClient]
  )

  const denyKYC = useCallback(
    async (userAddress: Address) => {
      const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY

      if (!adminPrivateKey) {
        throw new Error('ADMIN_PRIVATE_KEY not configured')
      }

      setIsApproving(true)
      setError(null)

      try {
        const adminAccount = privateKeyToAccount(adminPrivateKey as `0x${string}`)
        const adminWalletClient = createWalletClient({
          account: adminAccount,
          chain: hederaTestnet,
          transport: http(process.env.NEXT_PUBLIC_HEDERA_TESTNET_RPC_URL),
        })

        const txHash = await adminWalletClient.writeContract({
          address: CONTRACT_ADDRESSES.ACCESS_CONTROL,
          abi: ACCESS_CONTROL_ABI,
          functionName: 'setKYCStatus',
          args: [userAddress, false],
        })

        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: txHash })
        }

        setIsApproving(false)
        return txHash
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Denial failed'
        setError(errorMessage)
        setIsApproving(false)
        throw err
      }
    },
    [publicClient]
  )

  return {
    approveKYC,
    denyKYC,
    isApproving,
    error,
  }
}
