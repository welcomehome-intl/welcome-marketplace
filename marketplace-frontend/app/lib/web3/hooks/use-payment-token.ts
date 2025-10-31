"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { PAYMENT_TOKEN_ABI } from '../abi'
import { Address } from 'viem'
import { useCallback } from 'react'

// TypeScript interfaces for payment token data
export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
}

export interface PaymentAllowance {
  owner: Address
  spender: Address
  allowance: bigint
}

// Hook for basic payment token information
export function usePaymentTokenInfo() {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
    abi: PAYMENT_TOKEN_ABI,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
    abi: PAYMENT_TOKEN_ABI,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
    abi: PAYMENT_TOKEN_ABI,
    functionName: 'decimals',
  })

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
    abi: PAYMENT_TOKEN_ABI,
    functionName: 'totalSupply',
  })

  const tokenInfo: TokenInfo | null = (name && symbol && decimals !== undefined && totalSupply !== undefined) ? {
    name: name as string,
    symbol: symbol as string,
    decimals: decimals as number,
    totalSupply: totalSupply as bigint,
  } : null

  return {
    tokenInfo,
    refetchTotalSupply
  }
}

// Hook for payment token balance
export function usePaymentTokenBalance(address?: Address) {
  const { data: balance, refetch, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
    abi: PAYMENT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000, // Refetch every 30 seconds for real-time balance
    },
  })

  return {
    balance: balance as bigint | undefined,
    isLoading,
    error,
    refetch
  }
}

// Hook for payment token allowance
export function usePaymentTokenAllowance(owner?: Address, spender?: Address) {
  const { data: allowance, refetch, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
    abi: PAYMENT_TOKEN_ABI,
    functionName: 'allowance',
    args: (owner && spender) ? [owner, spender] : undefined,
    query: {
      enabled: !!(owner && spender),
    },
  })

  return {
    allowance: allowance as bigint | undefined,
    isLoading,
    error,
    refetch
  }
}

// Hook for approving payment token spending
export function useApprovePaymentToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = useCallback((spender: Address, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
      abi: PAYMENT_TOKEN_ABI,
      functionName: 'approve',
      args: [spender, amount],
    })
  }, [writeContract])

  // Convenience function for infinite approval
  const approveMax = useCallback((spender: Address) => {
    const maxAmount = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935') // 2^256 - 1
    approve(spender, maxAmount)
  }, [approve])

  return {
    approve,
    approveMax,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Hook for transferring payment tokens
export function useTransferPaymentToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const transfer = useCallback((to: Address, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
      abi: PAYMENT_TOKEN_ABI,
      functionName: 'transfer',
      args: [to, amount],
    })
  }, [writeContract])

  return {
    transfer,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Hook for minting payment tokens (admin functionality)
export function useMintPaymentToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const mint = useCallback((to: Address, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PAYMENT_TOKEN as Address,
      abi: PAYMENT_TOKEN_ABI,
      functionName: 'mint',
      args: [to, amount],
    })
  }, [writeContract])

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Combined hook for payment token approval flow (for token purchases)
export function usePaymentTokenApprovalFlow(userAddress?: Address, spenderAddress?: Address) {
  const { balance } = usePaymentTokenBalance(userAddress)
  const { allowance, refetch: refetchAllowance } = usePaymentTokenAllowance(userAddress, spenderAddress)
  const approval = useApprovePaymentToken()

  // Check if user has sufficient balance
  const hasSufficientBalance = useCallback((requiredAmount: bigint): boolean => {
    return balance ? balance >= requiredAmount : false
  }, [balance])

  // Check if allowance is sufficient
  const hasSufficientAllowance = useCallback((requiredAmount: bigint): boolean => {
    return allowance ? allowance >= requiredAmount : false
  }, [allowance])

  // Check if approval is needed
  const needsApproval = useCallback((requiredAmount: bigint): boolean => {
    return !hasSufficientAllowance(requiredAmount)
  }, [hasSufficientAllowance])

  // Approve exact amount needed
  const approveAmount = useCallback((amount: bigint) => {
    if (!spenderAddress) {
      throw new Error('Spender address is required for approval')
    }
    approval.approve(spenderAddress, amount)
  }, [approval, spenderAddress])

  // Approve maximum amount for gas efficiency
  const approveMax = useCallback(() => {
    if (!spenderAddress) {
      throw new Error('Spender address is required for approval')
    }
    approval.approveMax(spenderAddress)
  }, [approval, spenderAddress])

  return {
    // Data
    balance,
    allowance,

    // Status checks
    hasSufficientBalance,
    hasSufficientAllowance,
    needsApproval,

    // Actions
    approveAmount,
    approveMax,

    // Transaction states
    isApproving: approval.isPending,
    isApprovingConfirming: approval.isConfirming,
    isApprovalConfirmed: approval.isConfirmed,
    approvalHash: approval.hash,
    approvalError: approval.error,

    // Refetch functions
    refetchAllowance,
  }
}

// Hook for complete payment token purchase flow
export function usePaymentTokenPurchaseFlow(
  userAddress?: Address,
  tokenHandlerAddress?: Address,
  purchaseAmount?: bigint
) {
  const tokenInfo = usePaymentTokenInfo()
  const approvalFlow = usePaymentTokenApprovalFlow(userAddress, tokenHandlerAddress)

  const canPurchase = userAddress &&
                     tokenHandlerAddress &&
                     purchaseAmount &&
                     approvalFlow.hasSufficientBalance(purchaseAmount)

  const requiresApproval = purchaseAmount && approvalFlow.needsApproval(purchaseAmount)

  // Get user's payment readiness status
  const getPurchaseStatus = useCallback(() => {
    if (!userAddress || !tokenHandlerAddress || !purchaseAmount) {
      return { ready: false, reason: 'Missing required parameters' }
    }

    if (!approvalFlow.hasSufficientBalance(purchaseAmount)) {
      return { ready: false, reason: 'Insufficient payment token balance' }
    }

    if (requiresApproval) {
      return { ready: false, reason: 'Approval required', needsApproval: true }
    }

    return { ready: true, reason: 'Ready to purchase' }
  }, [userAddress, tokenHandlerAddress, purchaseAmount, approvalFlow, requiresApproval])

  return {
    // Token information
    tokenInfo: tokenInfo.tokenInfo,

    // Purchase readiness
    canPurchase,
    requiresApproval,
    getPurchaseStatus,

    // All approval flow functionality
    ...approvalFlow,
  }
}

// Utility functions for payment token operations
export const formatPaymentTokenAmount = (amount: bigint, decimals: number = 18): string => {
  const divisor = BigInt(10 ** decimals)
  const whole = amount / divisor
  const fractional = amount % divisor

  if (fractional === 0n) {
    return whole.toString()
  }

  const fractionalStr = fractional.toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${whole}.${fractionalStr}`
}

export const parsePaymentTokenAmount = (amount: string, decimals: number = 18): bigint => {
  const [whole = '0', fractional = '0'] = amount.split('.')
  const fractionalPadded = fractional.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(fractionalPadded)
}

// Combined hook that provides everything needed for payment token operations
export function usePaymentTokenOperations(userAddress?: Address) {
  const tokenInfo = usePaymentTokenInfo()
  const balance = usePaymentTokenBalance(userAddress)
  const transfer = useTransferPaymentToken()
  const mint = useMintPaymentToken()

  return {
    // Token information
    tokenInfo: tokenInfo.tokenInfo,

    // Balance information
    balance: balance.balance,
    isLoadingBalance: balance.isLoading,
    refetchBalance: balance.refetch,

    // Transfer functionality
    transfer: transfer.transfer,
    isTransferring: transfer.isPending,
    isTransferConfirming: transfer.isConfirming,
    isTransferConfirmed: transfer.isConfirmed,
    transferHash: transfer.hash,
    transferError: transfer.error,

    // Mint functionality (admin)
    mint: mint.mint,
    isMinting: mint.isPending,
    isMintConfirming: mint.isConfirming,
    isMintConfirmed: mint.isConfirmed,
    mintHash: mint.hash,
    mintError: mint.error,

    // Utility functions
    formatAmount: (amount: bigint) => formatPaymentTokenAmount(amount, tokenInfo.tokenInfo?.decimals),
    parseAmount: (amount: string) => parsePaymentTokenAmount(amount, tokenInfo.tokenInfo?.decimals),
  }
}