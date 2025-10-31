"use client"

import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { KYC_REGISTRY_ABI } from '../abi'
import { Address } from 'viem'
import { logError } from '../error-utils'

export enum KYCStatus {
  NONE = 0,
  PENDING = 1,
  APPROVED = 2,
  DENIED = 3,
  EXPIRED = 4
}

export enum InvestorType {
  RETAIL = 0,
  ACCREDITED = 1,
  INSTITUTIONAL = 2
}

export interface KYCRecord {
  status: KYCStatus
  investorType: InvestorType
  approvedAt: bigint
  expiresAt: bigint
  approvedBy: Address
  documentHash: string
  rejectionReason: string
  submittedAt: bigint
  isActive: boolean
}

// Core KYC Status Hooks
export function useKYCStatus(address?: Address) {
  const { data: status, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
    abi: KYC_REGISTRY_ABI,
    functionName: 'getKYCStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    status: status as KYCStatus | undefined,
    refetch
  }
}

export function useKYCApprovalStatus(address?: Address) {
  const { data: isApproved, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
    abi: KYC_REGISTRY_ABI,
    functionName: 'isKYCApproved',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    isApproved: isApproved as boolean | undefined,
    refetch
  }
}

export function useAccreditedInvestorStatus(address?: Address) {
  const { data: isAccredited, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
    abi: KYC_REGISTRY_ABI,
    functionName: 'isAccreditedInvestor',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    isAccredited: isAccredited as boolean | undefined,
    refetch
  }
}

export function useKYCRecord(address?: Address) {
  const { data: record, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
    abi: KYC_REGISTRY_ABI,
    functionName: 'getKYCRecord',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    record: record ? {
      status: record[0] as KYCStatus,
      investorType: record[1] as InvestorType,
      approvedAt: record[2] as bigint,
      expiresAt: record[3] as bigint,
      approvedBy: record[4] as Address,
      documentHash: record[5] as string,
      rejectionReason: record[6] as string,
      submittedAt: record[7] as bigint,
      isActive: record[8] as boolean,
    } : null,
    refetch
  }
}

// User Actions
export function useSubmitKYC() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const submitKYC = async (documentHash: string, investorType: InvestorType) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
        abi: KYC_REGISTRY_ABI,
        functionName: 'submitKYC',
        args: [documentHash, investorType],
      })
    } catch (err) {
      logError('Error submitting KYC', err)
      throw err
    }
  }

  return {
    submitKYC,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Admin Actions
export function useApproveKYC() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const approveKYC = async (userAddress: Address) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
        abi: KYC_REGISTRY_ABI,
        functionName: 'approveKYC',
        args: [userAddress],
      })
    } catch (err) {
      logError('Error approving KYC', err)
      throw err
    }
  }

  return {
    approveKYC,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useDenyKYC() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const denyKYC = async (userAddress: Address, reason: string) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
        abi: KYC_REGISTRY_ABI,
        functionName: 'denyKYC',
        args: [userAddress, reason],
      })
    } catch (err) {
      logError('Error denying KYC', err)
      throw err
    }
  }

  return {
    denyKYC,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useSetAccreditedInvestor() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const setAccreditedInvestor = async (userAddress: Address, status: boolean) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
        abi: KYC_REGISTRY_ABI,
        functionName: 'setAccreditedInvestor',
        args: [userAddress, status],
      })
    } catch (err) {
      logError('Error setting accredited investor status', err)
      throw err
    }
  }

  return {
    setAccreditedInvestor,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Admin Management Hooks
export function usePendingKYCApplications() {
  const [applications, setApplications] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { data: pendingUsers, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
    abi: KYC_REGISTRY_ABI,
    functionName: 'getPendingApplications',
  })

  useEffect(() => {
    if (pendingUsers) {
      setApplications(pendingUsers as Address[])
      setIsLoading(false)
      setError(null)
    } else {
      setIsLoading(false)
    }
  }, [pendingUsers])

  return {
    applications,
    isLoading,
    error,
    refetch
  }
}

export function useApprovedUsers() {
  const { data: approvedUsers, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
    abi: KYC_REGISTRY_ABI,
    functionName: 'getApprovedUsers',
  })

  return {
    approvedUsers: (approvedUsers as Address[]) || [],
    refetch
  }
}

export function useKYCStats() {
  const { data: stats, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
    abi: KYC_REGISTRY_ABI,
    functionName: 'getGlobalStats',
  })

  return {
    stats: stats ? {
      totalSubmissions: stats[0] as bigint,
      totalApproved: stats[1] as bigint,
      totalDenied: stats[2] as bigint,
      totalPending: stats[3] as bigint,
      totalExpired: stats[4] as bigint,
    } : null,
    refetch
  }
}

// Batch Operations
export function useBatchApproveKYC() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const batchApprove = async (users: Address[], investorTypes: InvestorType[]) => {
    if (users.length !== investorTypes.length) {
      throw new Error('Users and investor types arrays must have the same length')
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
        abi: KYC_REGISTRY_ABI,
        functionName: 'batchApprove',
        args: [users, investorTypes],
      })
    } catch (err) {
      logError('Error batch approving KYC', err)
      throw err
    }
  }

  return {
    batchApprove,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Utility hook to check if KYC system is active
export function useKYCSystemStatus() {
  const { data: isActive } = useReadContract({
    address: CONTRACT_ADDRESSES.KYC_REGISTRY as Address,
    abi: KYC_REGISTRY_ABI,
    functionName: 'isKYCSystemActive',
  })

  return { isActive: isActive as boolean | undefined }
}

// Combined hook for complete user KYC status (convenience)
export function useUserKYCStatus(address?: Address) {
  const { status } = useKYCStatus(address)
  const { isApproved } = useKYCApprovalStatus(address)
  const { isAccredited } = useAccreditedInvestorStatus(address)
  const { record } = useKYCRecord(address)

  return {
    status,
    isApproved,
    isAccredited,
    record,
    canPurchase: isApproved && isAccredited,
  }
}