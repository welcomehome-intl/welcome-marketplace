"use client"

import { useState, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, parseEther, maxUint256 } from 'viem'
import { ERC20_ABI } from '../abi'
import { logError } from '../error-utils'

/**
 * Auto Token Approval Hook
 *
 * Automatically approves ERC20 tokens for spending before transactions.
 * Checks current allowance and only approves if insufficient.
 *
 * Usage:
 * ```tsx
 * const { autoApprove, isApproving, needsApproval } = useAutoApprove()
 *
 * // Before purchase
 * if (needsApproval(paymentToken, propertyFactory, totalCost)) {
 *   await autoApprove(paymentToken, propertyFactory, totalCost)
 * }
 * // Then proceed with purchase
 * ```
 */

export interface ApproveParams {
  tokenAddress: Address
  spender: Address
  amount: string // Amount in token units (e.g., "100" for 100 tokens)
  useMax?: boolean // If true, approve max uint256 instead of exact amount
}

export function useAutoApprove() {
  const { address } = useAccount()
  const [currentApproval, setCurrentApproval] = useState<ApproveParams | null>(null)

  // -------------------------------------------------------------------------
  // READ: Check Current Allowance
  // -------------------------------------------------------------------------
  const {
    data: currentAllowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: currentApproval?.tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && currentApproval ? [address, currentApproval.spender] : undefined,
    query: {
      enabled: Boolean(address && currentApproval),
    },
  })

  // -------------------------------------------------------------------------
  // WRITE: Approve Token
  // -------------------------------------------------------------------------
  const {
    writeContract: approveWrite,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract()

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveSuccess,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // -------------------------------------------------------------------------
  // Check if Approval is Needed
  // -------------------------------------------------------------------------
  const needsApproval = useCallback(
    (tokenAddress: Address, spender: Address, amount: string): boolean => {
      if (!address) return false

      try {
        const requiredAmount = parseEther(amount)
        const current = currentAllowance as bigint | undefined

        // If we have current allowance data for this token/spender
        if (
          current !== undefined &&
          currentApproval?.tokenAddress === tokenAddress &&
          currentApproval?.spender === spender
        ) {
          return current < requiredAmount
        }

        // If we don't have data yet, assume approval is needed
        return true
      } catch (err) {
        logError('Error checking approval', err)
        return true
      }
    },
    [address, currentAllowance, currentApproval]
  )

  // -------------------------------------------------------------------------
  // Get Current Allowance
  // -------------------------------------------------------------------------
  const getCurrentAllowance = useCallback(
    async (tokenAddress: Address, spender: Address): Promise<bigint> => {
      // Set current approval params to trigger allowance fetch
      setCurrentApproval({ tokenAddress, spender, amount: '0' })

      // Refetch to get latest allowance
      const result = await refetchAllowance()

      return (result.data as bigint | undefined) || 0n
    },
    [refetchAllowance]
  )

  // -------------------------------------------------------------------------
  // Auto-Approve Function
  // -------------------------------------------------------------------------
  const autoApprove = useCallback(
    async (params: ApproveParams): Promise<void> => {
      if (!address) {
        throw new Error('Wallet not connected')
      }

      try {
        // Validate inputs
        if (!params.tokenAddress || params.tokenAddress === '0x0000000000000000000000000000000000000000') {
          throw new Error('Invalid token address')
        }

        if (!params.spender || params.spender === '0x0000000000000000000000000000000000000000') {
          throw new Error('Invalid spender address')
        }

        // Store current approval params
        setCurrentApproval(params)

        // Check if approval is actually needed
        const current = await getCurrentAllowance(params.tokenAddress, params.spender)
        const required = parseEther(params.amount)

        if (current >= required) {
          console.log('✓ Sufficient allowance already exists')
          return
        }

        // Determine approval amount
        const approvalAmount = params.useMax ? maxUint256 : required

        console.log(`Approving ${params.amount} tokens for ${params.spender}...`)

        // Call approve on the token contract
        approveWrite({
          address: params.tokenAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [params.spender, approvalAmount],
        })

        // Note: Caller should wait for isApproveSuccess before proceeding

      } catch (err) {
        logError('Auto-approve failed', err)
        throw err
      }
    },
    [address, approveWrite, getCurrentAllowance]
  )

  // -------------------------------------------------------------------------
  // Approve Exact Amount
  // -------------------------------------------------------------------------
  const approveExact = useCallback(
    async (tokenAddress: Address, spender: Address, amount: string) => {
      await autoApprove({
        tokenAddress,
        spender,
        amount,
        useMax: false,
      })
    },
    [autoApprove]
  )

  // -------------------------------------------------------------------------
  // Approve Maximum Amount (recommended for better UX)
  // -------------------------------------------------------------------------
  const approveMax = useCallback(
    async (tokenAddress: Address, spender: Address) => {
      await autoApprove({
        tokenAddress,
        spender,
        amount: '0', // Amount doesn't matter when useMax is true
        useMax: true,
      })
    },
    [autoApprove]
  )

  // -------------------------------------------------------------------------
  // Reset Approval (revoke)
  // -------------------------------------------------------------------------
  const revokeApproval = useCallback(
    async (tokenAddress: Address, spender: Address) => {
      if (!address) {
        throw new Error('Wallet not connected')
      }

      try {
        approveWrite({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [spender, 0n],
        })
      } catch (err) {
        logError('Revoke approval failed', err)
        throw err
      }
    },
    [address, approveWrite]
  )

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    // Status
    isApproving: isApprovePending || isApproveConfirming,
    isApprovePending,
    isApproveConfirming,
    isApproveSuccess,
    approveError,
    approveHash,

    // Current state
    currentAllowance: currentAllowance as bigint | undefined,
    currentApproval,

    // Actions
    autoApprove, // Main function with params object
    approveExact, // Approve exact amount
    approveMax, // Approve max (recommended)
    revokeApproval, // Reset to 0

    // Utilities
    needsApproval,
    getCurrentAllowance,
    refetchAllowance,
  }
}

/**
 * Simplified hook for one-time approval operations
 * Use when you don't need to track approval state
 */
export function useQuickApprove() {
  const { autoApprove, isApproving, isApproveSuccess, approveError } = useAutoApprove()

  const approve = useCallback(
    async (tokenAddress: Address, spender: Address, amount: string) => {
      await autoApprove({
        tokenAddress,
        spender,
        amount,
        useMax: false,
      })

      // Return a promise that resolves when approval is complete
      return new Promise<void>((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (isApproveSuccess) {
            clearInterval(checkInterval)
            resolve()
          } else if (approveError) {
            clearInterval(checkInterval)
            reject(approveError)
          }
        }, 100)

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(checkInterval)
          reject(new Error('Approval timeout'))
        }, 120000)
      })
    },
    [autoApprove, isApproveSuccess, approveError]
  )

  return {
    approve,
    isApproving,
  }
}
