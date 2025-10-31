"use client"

import { useState, useEffect, useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../config'
import { OWNERSHIP_REGISTRY_ABI } from '../abi'
import { Address } from 'viem'
import { logError } from '../error-utils'

export interface UserOwnership {
  tokenContract: Address
  propertyId: bigint
  balance: bigint
  lastUpdated: bigint
  isActive: boolean
}

export interface UserPortfolio {
  propertyIds: bigint[]
  totalProperties: bigint
  totalValue: bigint
  totalTokens: bigint
  averageReturn: bigint
}

export interface PropertyStats {
  tokenContract: Address
  handlerContract: Address
  totalHolders: bigint
  totalTokens: bigint
  totalValue: bigint
  averageHolding: bigint
  isActive: boolean
}

export interface GlobalStats {
  totalProperties: bigint
  totalUsers: bigint
  totalValue: bigint
}

// User Portfolio Hooks
export function useUserPortfolio(address?: Address) {
  const { data: portfolioData, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getUserPortfolio',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    portfolio: portfolioData ? {
      propertyIds: portfolioData[0] as bigint[],
      totalProperties: portfolioData[1] as bigint,
      totalValue: portfolioData[2] as bigint,
      totalTokens: portfolioData[3] as bigint,
      averageReturn: portfolioData[4] as bigint,
    } : null,
    refetch
  }
}

export function useUserProperties(address?: Address) {
  const { data: propertyIds, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getUserProperties',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Memoize the empty array to prevent infinite loops
  const memoizedPropertyIds = useMemo(() =>
    (propertyIds as bigint[]) || [],
    [propertyIds]
  )

  return {
    propertyIds: memoizedPropertyIds,
    refetch
  }
}

export function useUserOwnership(address?: Address, propertyId?: number) {
  const { data: ownershipData, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getUserOwnership',
    args: address && propertyId !== undefined ? [address, BigInt(propertyId)] : undefined,
    query: {
      enabled: !!address && propertyId !== undefined,
    },
  })

  return {
    ownership: ownershipData ? {
      tokenContract: ownershipData[0] as Address,
      propertyId: ownershipData[1] as bigint,
      balance: ownershipData[2] as bigint,
      lastUpdated: ownershipData[3] as bigint,
      isActive: ownershipData[4] as boolean,
    } : null,
    refetch
  }
}

export function useUserBalance(address?: Address, propertyId?: number) {
  const { data: balance, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getUserBalance',
    args: address && propertyId !== undefined ? [address, BigInt(propertyId)] : undefined,
    query: {
      enabled: !!address && propertyId !== undefined,
    },
  })

  return {
    balance: balance as bigint | undefined,
    refetch
  }
}

export function useOwnsProperty(address?: Address, propertyId?: number) {
  const { data: owns, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'ownsProperty',
    args: address && propertyId !== undefined ? [address, BigInt(propertyId)] : undefined,
    query: {
      enabled: !!address && propertyId !== undefined,
    },
  })

  return {
    owns: owns as boolean | undefined,
    refetch
  }
}

// Property Information Hooks
export function usePropertyStats(propertyId?: number) {
  const { data: statsData, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getPropertyStats',
    args: propertyId !== undefined ? [BigInt(propertyId)] : undefined,
    query: {
      enabled: propertyId !== undefined,
    },
  })

  return {
    stats: statsData ? {
      tokenContract: statsData[0] as Address,
      handlerContract: statsData[1] as Address,
      totalHolders: statsData[2] as bigint,
      totalTokens: statsData[3] as bigint,
      totalValue: statsData[4] as bigint,
      averageHolding: statsData[5] as bigint,
      isActive: statsData[6] as boolean,
    } : null,
    refetch
  }
}

export function usePropertyHolders(propertyId?: number) {
  const { data: holders, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getPropertyHolders',
    args: propertyId !== undefined ? [BigInt(propertyId)] : undefined,
    query: {
      enabled: propertyId !== undefined,
    },
  })

  return {
    holders: (holders as Address[]) || [],
    refetch
  }
}

// Global Statistics
export function useGlobalStats() {
  const { data: statsData, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.OWNERSHIP_REGISTRY as Address,
    abi: OWNERSHIP_REGISTRY_ABI,
    functionName: 'getGlobalStats',
  })

  return {
    stats: statsData ? {
      totalProperties: statsData[0] as bigint,
      totalUsers: statsData[1] as bigint,
      totalValue: statsData[2] as bigint,
    } : null,
    refetch
  }
}

// Combined Portfolio Hook (convenience)
export function useCompleteUserPortfolio(address?: Address) {
  const [portfolioData, setPortfolioData] = useState<{
    portfolio: UserPortfolio | null
    properties: bigint[]
    ownerships: { [propertyId: string]: UserOwnership }
    isLoading: boolean
    error: string | null
  }>({
    portfolio: null,
    properties: [],
    ownerships: {},
    isLoading: true,
    error: null
  })

  const { portfolio, refetch: refetchPortfolio } = useUserPortfolio(address)
  const { propertyIds, refetch: refetchProperties } = useUserProperties(address)

  // Create stable dependencies to prevent infinite loops
  const propertyIdsKey = useMemo(() =>
    propertyIds.length > 0 ? propertyIds.map(id => id.toString()).join(',') : '',
    [propertyIds]
  )

  const portfolioKey = useMemo(() =>
    portfolio ? `${portfolio.totalProperties}-${portfolio.totalValue}` : '',
    [portfolio]
  )

  useEffect(() => {
    if (!address) {
      setPortfolioData({
        portfolio: null,
        properties: [],
        ownerships: {},
        isLoading: false,
        error: null
      })
      return
    }

    async function fetchCompletePortfolio() {
      if (propertyIds.length === 0) {
        setPortfolioData({
          portfolio,
          properties: [],
          ownerships: {},
          isLoading: false,
          error: null
        })
        return
      }

      setPortfolioData(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const ownerships: { [propertyId: string]: UserOwnership } = {}

        // Fetch ownership details for each property
        // Note: This would be optimized with a batch call in production
        for (const propertyId of propertyIds) {
          try {
            // This would normally be done through the useUserOwnership hook
            // but we need to batch the calls here
            const propertyIdNum = Number(propertyId)
            // In a real implementation, we'd make a batch call here
          } catch (err) {
            console.warn(`Failed to fetch ownership for property ${propertyId}:`, err)
          }
        }

        setPortfolioData({
          portfolio,
          properties: propertyIds,
          ownerships,
          isLoading: false,
          error: null
        })

      } catch (err) {
        logError('Error fetching complete portfolio', err)
        setPortfolioData(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch portfolio'
        }))
      }
    }

    fetchCompletePortfolio()
  }, [address, propertyIdsKey, portfolioKey])

  const refetchAll = async () => {
    await Promise.all([
      refetchPortfolio(),
      refetchProperties()
    ])
  }

  return {
    ...portfolioData,
    refetch: refetchAll
  }
}